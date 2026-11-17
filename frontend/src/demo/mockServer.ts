import { DAYS_OF_WEEK, LOYALTY_RULES, type MenuItem, type MenuItemRequest, type OperatingHours, type Role, type UserProfile, type Voucher } from '../api/types'
import { distanceMeters } from '../lib/geo'
import { badgeForPoints } from '../lib/loyalty'
import { makeDemoToken } from './config'
import { DAY, DEMO_DB_VERSION, DEMO_FACILITIES, refreshShopRatings, seedDemoDb, toLocal, type DemoDb, type DemoUser, type DemoVoucher } from './seed'

// In-browser stand-in for the Spring backend, used only in demo mode.
// Mirrors the real routes, role rules, paging shape and error format, so the
// app code above the HTTP client is identical in demo and live mode.

export class MockHttpError extends Error {
  readonly status: number
  readonly error: string
  constructor(status: number, error: string, message: string) {
    super(message)
    this.status = status
    this.error = error
  }
}

const STORE_KEY = 'beango.demo.db'
let db: DemoDb | null = null

function load(): DemoDb {
  if (db) return db
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DemoDb
      if (parsed.version === DEMO_DB_VERSION) return (db = parsed)
    }
  } catch {
    // fall through to a fresh seed
  }
  db = seedDemoDb()
  save()
  return db
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(db))
  } catch {
    // quota: keep in memory only
  }
}

export function resetDemoDb() {
  localStorage.removeItem(STORE_KEY)
  db = null
  load()
}

// ---------- errors & helpers ----------
const notFound = (m: string) => new MockHttpError(404, 'Not Found', m)
const forbidden = (m = 'Access Denied') => new MockHttpError(403, 'Forbidden', m)
const unauthorized = (m = 'Authentication is required to access this resource.') => new MockHttpError(401, 'Unauthorized', m)
const badRequest = (m: string) => new MockHttpError(400, 'Bad Request', m)
const conflict = (m: string) => new MockHttpError(409, 'Conflict', m)

type Query = Record<string, string | number | boolean | null | undefined>

function paged<T>(list: T[], query: Query | undefined, defSize = 10, maxSize = 50) {
  const page = Math.max(0, Number(query?.page ?? 0))
  const size = Math.min(maxSize, Math.max(1, Number(query?.size ?? defSize)))
  const totalPages = Math.max(1, Math.ceil(list.length / size))
  return {
    content: list.slice(page * size, page * size + size),
    number: page,
    size,
    totalElements: list.length,
    totalPages,
    first: page === 0,
    last: page >= totalPages - 1,
  }
}

function currentUser(d: DemoDb, token: string | null): DemoUser | null {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as {
      sub: string
      exp: number
    }
    if (payload.exp * 1000 < Date.now()) throw unauthorized('The token has expired. Please log in again.')
    const user = d.users.find((u) => u.email === payload.sub)
    if (!user) throw unauthorized('The token is invalid.')
    return user
  } catch (e) {
    if (e instanceof MockHttpError) throw e
    throw unauthorized('The token is invalid.')
  }
}

function need(user: DemoUser | null, ...roles: Role[]): DemoUser {
  if (!user) throw unauthorized()
  if (roles.length && !roles.includes(user.role)) throw forbidden()
  return user
}

const shopById = (d: DemoDb, id: number, approvedOnly = true) => {
  const s = d.shops.find((x) => x.details.id === id && (!approvedOnly || x.approved))
  if (!s) throw notFound(`Coffee shop with ID ${id} not found!`)
  return s
}

// Same checks as CoffeeShopService.findOwnedCoffeeShop: 404 if missing, 403 if someone else's
function ownedShop(d: DemoDb, id: number, merchant: DemoUser) {
  const shop = shopById(d, id, false)
  if (shop.merchantId !== merchant.id) throw forbidden('You do not have permission to modify this coffee shop!')
  return shop
}

function menuItemFrom(b: MenuItemRequest, id: number): MenuItem {
  const errors: string[] = []
  if (!b.category?.trim()) errors.push('category: Category is required')
  if (!b.name?.trim()) errors.push('name: Product name is required')
  if (!(Number(b.price) > 0)) errors.push('price: Price must be greater than 0')
  if (errors.length) throw badRequest(errors.join(', '))
  return { id, category: b.category.trim(), name: b.name.trim(), price: Number(b.price), description: b.description?.trim() || null }
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function voucherDto(d: DemoDb, v: DemoVoucher): Voucher {
  return {
    id: v.id,
    code: v.code,
    coffeeShopName: d.shops.find((s) => s.details.id === v.shopId)?.details.name ?? '',
    status: v.usedAt ? 'USED' : 'ACTIVE',
    generatedAt: toLocal(v.issuedAt),
    expiresAt: toLocal(v.expiresAt),
    discountPercentage: LOYALTY_RULES.voucherDiscountPercentage,
  }
}

const profileDto = (u: DemoUser): UserProfile => ({
  id: u.id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  lifetimePoints: u.lifetimePoints,
  badge: badgeForPoints(u.lifetimePoints),
})

const usable = (v: DemoVoucher, now: number) => v.usedAt === null && v.expiresAt > now

// Same rules as LoyaltyPointService.addPointsAfterPurchase
export function awardPoints(d: DemoDb, merchantId: number, userId: number, shopId: number, points: number, now = Date.now()) {
  const shop = shopById(d, shopId)
  if (shop.merchantId !== merchantId) throw forbidden('You can only give points for your own coffee shop!')
  const user = d.users.find((u) => u.id === userId && u.role === 'USER')
  if (!user) throw notFound('Customer not found')
  if (points < 1 || points > LOYALTY_RULES.maxPointsPerTransaction) throw badRequest('pointsToAdd: must be between 1 and 1000')

  user.lifetimePoints += points
  let wallet = d.wallets.find((w) => w.userId === userId && w.shopId === shopId)
  if (!wallet) d.wallets.push((wallet = { userId, shopId, points: 0 }))
  wallet.points += points
  let active = d.vouchers.filter((v) => v.userId === userId && v.shopId === shopId && usable(v, now)).length
  let issued = 0
  while (wallet.points >= LOYALTY_RULES.pointsForVoucher && active < LOYALTY_RULES.maxActiveVouchersPerShop) {
    wallet.points -= LOYALTY_RULES.pointsForVoucher
    active++
    issued++
    d.vouchers.push({
      id: d.nextId++,
      code: Array.from({ length: 10 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join(''),
      userId,
      shopId,
      issuedAt: now,
      expiresAt: now + 91 * DAY,
      usedAt: null,
    })
  }
  const merchant = d.users.find((u) => u.id === merchantId)!
  d.transactions.unshift({
    id: d.nextId++,
    createdAt: toLocal(now),
    points,
    merchantId,
    merchantEmail: merchant.email,
    customerId: user.id,
    customerEmail: user.email,
    coffeeShopId: shopId,
    coffeeShopName: shop.details.name,
  })
  return {
    customerName: `${user.firstName} ${user.lastName}`,
    customerEmail: user.email,
    coffeeShopName: shop.details.name,
    pointsAdded: points,
    walletPoints: wallet.points,
    vouchersIssued: issued,
  }
}

// ---------- demo-only actions (the role switcher's buttons) ----------
export function simulatePurchase(email: string): string {
  const d = load()
  const user = d.users.find((u) => u.email === email)
  if (!user || user.role !== 'USER') throw new Error('Pick a customer persona first.')
  const visited = d.wallets.filter((w) => w.userId === user.id).map((w) => w.shopId)
  const shopId = visited.length ? visited[Math.floor(Math.random() * visited.length)] : d.shops.find((s) => s.approved)!.details.id
  const shop = shopById(d, shopId)
  const points = [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)]
  awardPoints(d, shop.merchantId, user.id, shopId, points)
  save()
  return `+${points} pts at ${shop.details.name}`
}

export function simulateRedeem(email: string): string {
  const d = load()
  const user = d.users.find((u) => u.email === email)
  const now = Date.now()
  const v = d.vouchers.filter((x) => x.userId === user?.id && usable(x, now)).sort((a, b) => a.expiresAt - b.expiresAt)[0]
  if (!v) throw new Error('No active voucher to redeem.')
  v.usedAt = now
  save()
  return `Redeemed ${v.code}`
}

// ---------- router ----------
interface Req {
  query?: Query
  body?: unknown
  token: string | null
}

type Handler = (m: RegExpMatchArray, req: Req, d: DemoDb, me: DemoUser | null) => unknown

const routes: Array<[string, RegExp, Handler]> = [
  // Auth
  ['POST', /^\/api\/auth\/login$/, (_m, { body }, d) => {
    const { email } = body as { email: string }
    const user = d.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!user) throw unauthorized('Invalid email or password.')
    return { token: makeDemoToken(user) }
  }],
  ['POST', /^\/api\/auth\/register$/, (_m, { body }, d) => {
    const b = body as { firstName: string; lastName: string; email: string }
    const email = b.email.trim().toLowerCase()
    if (d.users.some((u) => u.email === email)) throw conflict('The email is already used')
    const user: DemoUser = { id: d.nextId++, firstName: b.firstName, lastName: b.lastName, email, role: 'USER', lifetimePoints: 0 }
    d.users.push(user)
    return { token: makeDemoToken(user) }
  }],

  // Coffee shops
  ['GET', /^\/api\/v1\/coffee-shops\/nearby$/, (_m, { query }, d) => {
    const lat = Number(query?.lat)
    const lng = Number(query?.lng)
    const radius = Math.min(Math.max(Number(query?.radius ?? 5000), 1), 50_000)
    return d.shops
      .filter((s) => s.approved)
      .map((s) => ({ s, dist: distanceMeters({ lat, lng }, { lat: s.details.latitude, lng: s.details.longitude }) }))
      .filter((x) => x.dist <= radius)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 50)
      .map(({ s }) => ({ id: s.details.id, name: s.details.name, address: s.details.address, latitude: s.details.latitude, longitude: s.details.longitude }))
  }],
  ['GET', /^\/api\/v1\/coffee-shops$/, (_m, { query }, d) =>
    paged(
      d.shops.filter((s) => s.approved).map((s) => ({ id: s.details.id, name: s.details.name, address: s.details.address, latitude: s.details.latitude, longitude: s.details.longitude })),
      query,
    )],
  ['GET', /^\/api\/v1\/coffee-shops\/(\d+)$/, (m, _r, d) => shopById(d, Number(m[1])).details],
  ['PATCH', /^\/api\/v1\/coffee-shops\/(\d+)\/approve$/, (m, _r, d, me) => {
    need(me, 'ADMIN')
    shopById(d, Number(m[1]), false).approved = true
    return undefined
  }],

  // Reviews
  ['GET', /^\/api\/v1\/coffee-shops\/(\d+)\/reviews$/, (m, { query }, d) =>
    paged(d.reviews.filter((r) => r.shopId === Number(m[1])).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), query)],
  ['POST', /^\/api\/v1\/coffee-shops\/(\d+)\/reviews$/, (m, { body }, d, me) => {
    const user = need(me, 'USER')
    const shop = shopById(d, Number(m[1]))
    if (d.reviews.some((r) => r.shopId === shop.details.id && r.userId === user.id)) throw conflict('You have already reviewed this coffee shop.')
    const b = body as { rating: number; comment?: string }
    d.reviews.push({
      id: d.nextId++, shopId: shop.details.id, userId: user.id, rating: b.rating, comment: b.comment,
      createdAt: toLocal(Date.now()), userFirstName: user.firstName, userLastName: user.lastName, coffeeShopName: shop.details.name,
    })
    refreshShopRatings(d)
    return undefined
  }],
  ['GET', /^\/api\/v1\/reviews\/me$/, (_m, { query }, d, me) => {
    const user = need(me, 'USER')
    return paged(d.reviews.filter((r) => r.userId === user.id), query)
  }],
  ['GET', /^\/api\/v1\/users\/(\d+)\/reviews$/, (m, { query }, d, me) => {
    need(me)
    return paged(d.reviews.filter((r) => r.userId === Number(m[1])), query)
  }],

  // Favorites
  ['GET', /^\/api\/v1\/favorites$/, (_m, { query }, d, me) => {
    const user = need(me)
    const list = d.favorites
      .filter((f) => f.userId === user.id)
      .sort((a, b) => b.id - a.id)
      .map((f) => {
        const s = d.shops.find((x) => x.details.id === f.shopId)!
        return { id: f.id, coffeeShopId: f.shopId, coffeeShopName: s.details.name, coffeeShopAddress: s.details.address }
      })
    return paged(list, query)
  }],
  ['POST', /^\/api\/v1\/favorites\/(\d+)$/, (m, _r, d, me) => {
    const user = need(me, 'USER')
    const shopId = shopById(d, Number(m[1])).details.id
    if (d.favorites.some((f) => f.userId === user.id && f.shopId === shopId)) throw conflict('The coffee shop is already in the wishlist')
    d.favorites.push({ id: d.nextId++, userId: user.id, shopId })
    return undefined
  }],
  ['DELETE', /^\/api\/v1\/favorites\/(\d+)$/, (m, _r, d, me) => {
    const user = need(me)
    const fav = d.favorites.find((f) => f.id === Number(m[1]))
    if (!fav) throw notFound('Favorite not found')
    if (fav.userId !== user.id) throw forbidden('You do not have permission to delete this record.')
    d.favorites = d.favorites.filter((f) => f !== fav)
    return undefined
  }],

  // Users & loyalty
  ['GET', /^\/api\/v1\/users\/(\d+)\/profile$/, (m, _r, d, me) => {
    const user = need(me)
    const id = Number(m[1])
    if (user.id !== id && user.role !== 'ADMIN') throw forbidden()
    const target = d.users.find((u) => u.id === id)
    if (!target) throw notFound(`User with ID: ${id} was not found.`)
    return profileDto(target)
  }],
  ['GET', /^\/api\/v1\/users\/(\d+)\/loyalty-points$/, (m, _r, d, me) => {
    const user = need(me)
    const id = Number(m[1])
    if (user.id !== id && user.role !== 'ADMIN') throw forbidden()
    return d.wallets
      .filter((w) => w.userId === id)
      .map((w) => ({ coffeeShopId: w.shopId, coffeeShopName: d.shops.find((s) => s.details.id === w.shopId)?.details.name ?? '', points: w.points }))
  }],
  ['POST', /^\/api\/v1\/loyalty-points\/transactions$/, (_m, { body }, d, me) => {
    const merchant = need(me, 'MERCHANT')
    const b = body as { userId?: number; customerEmail?: string; coffeeShopId: number; pointsToAdd: number }
    let userId = b.userId
    if (userId == null) {
      const email = (b.customerEmail ?? '').trim().toLowerCase()
      const customer = d.users.find((u) => u.email.toLowerCase() === email && u.role === 'USER')
      if (!customer) throw notFound('No customer account with that email.')
      userId = customer.id
    }
    if (userId === merchant.id) throw forbidden('You cannot award points to yourself!')
    return awardPoints(d, merchant.id, userId, b.coffeeShopId, b.pointsToAdd)
  }],

  // Vouchers
  ['GET', /^\/api\/v1\/vouchers\/active$/, (_m, _r, d, me) => {
    const user = need(me)
    const now = Date.now()
    return d.vouchers.filter((v) => v.userId === user.id && usable(v, now)).map((v) => voucherDto(d, v))
  }],
  ['POST', /^\/api\/v1\/vouchers\/redeem$/, (_m, { body }, d, me) => {
    const merchant = need(me, 'MERCHANT')
    const code = String((body as { code: string }).code).trim().toUpperCase()
    const v = d.vouchers.find((x) => x.code === code)
    if (!v) throw notFound('The voucher was not found.')
    if (shopById(d, v.shopId, false).merchantId !== merchant.id) throw forbidden('This voucher cannot be redeemed at your coffee shop.')
    if (v.usedAt) throw conflict('This voucher was already used')
    if (v.expiresAt <= Date.now()) throw badRequest('This voucher has expired.')
    v.usedAt = Date.now()
    return voucherDto(d, v)
  }],

  // Merchant
  ['GET', /^\/api\/v1\/merchant\/coffee-shops$/, (_m, _r, d, me) => {
    const merchant = need(me, 'MERCHANT')
    return d.shops
      .filter((s) => s.merchantId === merchant.id)
      .sort((a, b) => a.details.id - b.details.id)
      .map((s) => ({
        id: s.details.id,
        name: s.details.name,
        address: s.details.address,
        latitude: s.details.latitude,
        longitude: s.details.longitude,
        approved: s.approved,
      }))
  }],
  ['GET', /^\/api\/v1\/merchant\/coffee-shops\/(\d+)$/, (m, _r, d, me) =>
    ownedShop(d, Number(m[1]), need(me, 'MERCHANT')).details],
  ['PUT', /^\/api\/v1\/merchant\/coffee-shops\/(\d+)$/, (m, { body }, d, me) => {
    const shop = ownedShop(d, Number(m[1]), need(me, 'MERCHANT'))
    const b = body as {
      name: string; address: string; description?: string; contactEmail: string; contactPhone?: string
      lat: number; lng: number; facilityIds: number[]
    }
    if (!b.name?.trim() || !b.address?.trim()) throw badRequest('name: Coffee shop name is required')
    const all = DEMO_FACILITIES()
    const ids = [...new Set(b.facilityIds ?? [])]
    const facilities = all.filter((f) => ids.includes(f.id))
    if (facilities.length !== ids.length) throw notFound('One or more facilities not found!')
    Object.assign(shop.details, {
      name: b.name.trim(),
      address: b.address.trim(),
      description: b.description?.trim() || null,
      contactEmail: b.contactEmail.trim(),
      contactPhone: b.contactPhone?.trim() || null,
      latitude: b.lat,
      longitude: b.lng,
      facilities,
    })
    return shop.details
  }],
  ['GET', /^\/api\/v1\/merchant\/facilities$/, (_m, _r, _d, me) => {
    need(me, 'MERCHANT')
    return DEMO_FACILITIES().sort((a, b) => a.name.localeCompare(b.name))
  }],
  ['POST', /^\/api\/v1\/coffee-shops\/(\d+)\/menu$/, (m, { body }, d, me) => {
    const shop = ownedShop(d, Number(m[1]), need(me, 'MERCHANT'))
    shop.details.menu.push(menuItemFrom(body as MenuItemRequest, d.nextId++))
    return shop.details
  }],
  ['PUT', /^\/api\/v1\/coffee-shops\/(\d+)\/menu\/(\d+)$/, (m, { body }, d, me) => {
    const shop = ownedShop(d, Number(m[1]), need(me, 'MERCHANT'))
    const index = shop.details.menu.findIndex((i) => i.id === Number(m[2]))
    if (index < 0) throw notFound(`Menu item with ID ${m[2]} not found in this coffee shop!`)
    shop.details.menu[index] = menuItemFrom(body as MenuItemRequest, Number(m[2]))
    return shop.details
  }],
  ['DELETE', /^\/api\/v1\/coffee-shops\/(\d+)\/menu\/(\d+)$/, (m, _r, d, me) => {
    const shop = ownedShop(d, Number(m[1]), need(me, 'MERCHANT'))
    if (!shop.details.menu.some((i) => i.id === Number(m[2]))) throw notFound(`Menu item with ID ${m[2]} not found in this coffee shop!`)
    shop.details.menu = shop.details.menu.filter((i) => i.id !== Number(m[2]))
    return undefined
  }],
  ['PUT', /^\/api\/v1\/coffee-shops\/(\d+)\/schedule$/, (m, { body }, d, me) => {
    const shop = ownedShop(d, Number(m[1]), need(me, 'MERCHANT'))
    const list = body as OperatingHours[]
    const seen = new Set<string>()
    for (const h of list) {
      if (seen.has(h.dayOfWeek)) throw badRequest(`Duplicate schedule entry for ${h.dayOfWeek}`)
      seen.add(h.dayOfWeek)
      if (toMinutes(h.closeTime) <= toMinutes(h.openTime)) throw badRequest(`Close time must be after open time for ${h.dayOfWeek}`)
    }
    const norm = (t: string) => (t.length === 5 ? `${t}:00` : t)
    shop.details.schedule = [...list]
      .sort((a, b) => DAYS_OF_WEEK.indexOf(a.dayOfWeek) - DAYS_OF_WEEK.indexOf(b.dayOfWeek))
      .map((h) => ({ dayOfWeek: h.dayOfWeek, openTime: norm(h.openTime), closeTime: norm(h.closeTime) }))
    return shop.details.schedule
  }],
  ['POST', /^\/api\/v1\/coffee-shops$/, (_m, { body }, d, me) => {
    const merchant = need(me, 'MERCHANT')
    const b = body as { name: string; address: string; description?: string; contactEmail?: string; contactPhone?: string; lat: number; lng: number }
    if (!b.name?.trim() || !b.address?.trim()) throw badRequest('name: Coffee shop name is required')
    const details = {
      id: d.nextId++,
      name: b.name.trim(),
      description: b.description?.trim() || null,
      address: b.address.trim(),
      contactEmail: b.contactEmail?.trim() || merchant.email,
      contactPhone: b.contactPhone?.trim() || null,
      averageRating: 0,
      reviewCount: 0,
      latitude: b.lat,
      longitude: b.lng,
      facilities: [],
      menu: [],
      schedule: [],
    }
    d.shops.push({ details, merchantId: merchant.id, approved: false })
    return details
  }],

  // Admin
  ['GET', /^\/api\/v1\/admin\/coffee-shops\/pending$/, (_m, { query }, d, me) => {
    need(me, 'ADMIN')
    const list = d.shops
      .filter((s) => !s.approved)
      .map((s) => {
        const owner = d.users.find((u) => u.id === s.merchantId)
        return {
          id: s.details.id,
          name: s.details.name,
          address: s.details.address,
          description: s.details.description ?? null,
          latitude: s.details.latitude,
          longitude: s.details.longitude,
          contactEmail: s.details.contactEmail ?? owner?.email ?? null,
          contactPhone: s.details.contactPhone ?? null,
          merchantId: s.merchantId,
          merchantName: owner ? `${owner.firstName} ${owner.lastName}` : null,
          merchantEmail: owner?.email ?? '',
        }
      })
    return paged(list, query, 20, 100)
  }],
  ['GET', /^\/api\/v1\/admin\/coffee-shops\/pending\/(\d+)$/, (m, _r, d, me) => {
    need(me, 'ADMIN')
    const shop = shopById(d, Number(m[1]), false)
    if (shop.approved) throw notFound(`Pending coffee shop with ID ${m[1]} not found!`)
    return shop.details
  }],
  ['DELETE', /^\/api\/v1\/admin\/coffee-shops\/pending\/(\d+)$/, (m, _r, d, me) => {
    need(me, 'ADMIN')
    const shop = shopById(d, Number(m[1]), false)
    if (shop.approved) throw conflict(`Coffee shop with ID ${m[1]} is already approved and can't be denied.`)
    d.shops = d.shops.filter((s) => s !== shop)
    return undefined
  }],
  ['GET', /^\/api\/v1\/admin\/point-transactions$/, (_m, { query }, d, me) => {
    need(me, 'ADMIN')
    const fullName = (id: number) => {
      const u = d.users.find((x) => x.id === id)
      return u ? `${u.firstName} ${u.lastName}` : null
    }
    const n = (k: string) => (query?.[k] != null && query[k] !== '' ? Number(query[k]) : null)
    const from = query?.from ? String(query.from) : null
    const to = query?.to ? String(query.to) : null
    const list = d.transactions.filter(
      (t) =>
        (n('merchantId') === null || t.merchantId === n('merchantId')) &&
        (n('customerId') === null || t.customerId === n('customerId')) &&
        (n('coffeeShopId') === null || t.coffeeShopId === n('coffeeShopId')) &&
        (!from || t.createdAt >= from) &&
        (!to || t.createdAt < to),
    )
    const page = paged(list, query, 20, 100)
    return {
      ...page,
      content: page.content.map((t) => ({ ...t, customerName: fullName(t.customerId), merchantName: fullName(t.merchantId) })),
    }
  }],
  // Proposed endpoint (not in the Spring backend yet): voucher counts by status
  ['GET', /^\/api\/v1\/admin\/vouchers\/stats$/, (_m, _r, d, me) => {
    need(me, 'ADMIN')
    const now = Date.now()
    const used = d.vouchers.filter((v) => v.usedAt !== null).length
    const expired = d.vouchers.filter((v) => v.usedAt === null && v.expiresAt <= now).length
    return { issued: d.vouchers.length, active: d.vouchers.length - used - expired, used, expired }
  }],
]

export async function mockFetch(method: string, path: string, req: Req): Promise<unknown> {
  // A little latency so loading states are visible, like a real network
  await new Promise((r) => setTimeout(r, 140 + Math.random() * 280))
  const d = load()
  const me = currentUser(d, req.token)
  for (const [verb, pattern, handler] of routes) {
    if (verb !== method) continue
    const match = path.match(pattern)
    if (!match) continue
    const result = handler(match, req, d, me)
    if (method !== 'GET') save()
    // Hand out copies so callers can't mutate the store
    return result === undefined ? undefined : JSON.parse(JSON.stringify(result))
  }
  throw notFound(`No mock route for ${method} ${path}`)
}
