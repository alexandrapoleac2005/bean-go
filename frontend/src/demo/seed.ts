import {
  LOYALTY_RULES,
  type CoffeeShopDetails,
  type DayOfWeek,
  type Facility,
  type MenuItem,
  type OperatingHours,
  type PointTransaction,
  type Review,
  type Role,
} from '../api/types'
import { badgeForPoints } from '../lib/loyalty'

// Deterministic demo dataset. Invented café and people names; coordinates are
// spread around central Cluj-Napoca (Piața Unirii) so the map has something to show.

export interface DemoUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role: Role
  lifetimePoints: number
}

export interface DemoShop {
  details: CoffeeShopDetails
  merchantId: number
  approved: boolean
}

export interface DemoReview extends Review {
  shopId: number
  userId: number
}

export interface DemoVoucher {
  id: number
  code: string
  userId: number
  shopId: number
  issuedAt: number
  expiresAt: number
  usedAt: number | null
}

export interface DemoDb {
  version: number
  seededAt: number
  users: DemoUser[]
  shops: DemoShop[]
  reviews: DemoReview[]
  favorites: Array<{ id: number; userId: number; shopId: number }>
  wallets: Array<{ userId: number; shopId: number; points: number }>
  vouchers: DemoVoucher[]
  transactions: PointTransaction[]
  nextId: number
}

export const DEMO_DB_VERSION = 7

// Same list the backend seeds in V10__seed_facilities.sql
export const DEMO_FACILITIES = (): Facility[] => FACILITIES.map((f) => ({ ...f }))

// ---------- helpers ----------
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const DAY = 86_400_000
const pad = (n: number) => String(n).padStart(2, '0')
// LocalDateTime string (no zone), like the backend sends
export function toLocal(t: number): string {
  const d = new Date(t)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

// ---------- static content ----------
const FACILITIES: Facility[] = [
  { id: 1, name: 'Wi-Fi', icon: 'wifi' },
  { id: 2, name: 'Power outlets', icon: 'plug' },
  { id: 3, name: 'Terrace', icon: 'terrace' },
  { id: 4, name: 'Pet friendly', icon: 'dog' },
  { id: 5, name: 'Vegan options', icon: 'leaf' },
  { id: 6, name: 'Laptop friendly', icon: 'laptop' },
  { id: 7, name: 'Wheelchair access', icon: 'accessible' },
  { id: 8, name: 'Takeaway', icon: 'takeaway' },
  { id: 9, name: 'Parking', icon: 'parking' },
]

const SHOPS: Array<{ name: string; address: string; lat: number; lng: number; quality: number; blurb: string }> = [
  { name: 'Cupola Roasters', address: 'Piața Unirii 18', lat: 46.77, lng: 23.5893, quality: 4.7, blurb: 'Light roasts under a glass dome. The V60 is the point.' },
  { name: 'Linden & Lace', address: 'Str. Universității 7', lat: 46.7677, lng: 23.5905, quality: 4.4, blurb: 'Lace curtains, linden tea, and a very serious flat white.' },
  { name: 'Strada Espresso', address: 'Bd. Eroilor 14', lat: 46.7703, lng: 23.5935, quality: 4.1, blurb: 'Standing bar, one-euro espresso energy, fast hands.' },
  { name: 'Moka Lab', address: 'Str. Memorandumului 21', lat: 46.7693, lng: 23.5835, quality: 4.5, blurb: 'Stovetop experiments and single-origin flights.' },
  { name: 'The Quiet Pour', address: 'Piața Muzeului 4', lat: 46.7725, lng: 23.5878, quality: 4.8, blurb: 'Phones face down. Pour-overs only. Bring a book.' },
  { name: 'Cortado Club', address: 'Bd. 21 Decembrie 1989 54', lat: 46.7716, lng: 23.5978, quality: 4.2, blurb: 'Members of the cortado appreciation society, welcome.' },
  { name: 'Satin Bean', address: 'Str. Napoca 10', lat: 46.7685, lng: 23.5872, quality: 4.6, blurb: 'Silky milk, satin-finish cups, a brunch worth queueing for.' },
  { name: 'Hearth Coffee House', address: 'Str. Horea 18', lat: 46.7765, lng: 23.586, quality: 3.9, blurb: 'Fireplace in winter, terrace in summer, cinnamon buns always.' },
  { name: 'Atelier Filtru', address: 'Str. Avram Iancu 22', lat: 46.7665, lng: 23.5975, quality: 4.3, blurb: 'Batch brew done properly, in a former bookbinder’s shop.' },
  { name: 'Little Kettle', address: 'Str. Iuliu Maniu 12', lat: 46.7697, lng: 23.5862, quality: 4.0, blurb: 'Tiny, warm, and the kettle is always on.' },
  { name: 'Roastery No. 9', address: 'Calea Dorobanților 9', lat: 46.7745, lng: 23.601, quality: 4.5, blurb: 'Roasting on site every Tuesday. The whole street smells of it.' },
  { name: 'Piața Brew Bar', address: 'Piața Mihai Viteazul 6', lat: 46.7737, lng: 23.594, quality: 3.8, blurb: 'Market-side brew bar with the best people-watching.' },
  { name: 'Sunday Grind', address: 'Str. Clinicilor 22', lat: 46.765, lng: 23.5815, quality: 4.4, blurb: 'Every day feels like Sunday. Pancakes until 3pm.' },
  { name: 'Ember & Oat', address: 'Str. Mihail Kogălniceanu 5', lat: 46.7671, lng: 23.5918, quality: 4.2, blurb: 'Oat milk by default, ember-roasted beans, no fuss.' },
]

const MENU: Array<[string, string, number, string | null]> = [
  ['Espresso', 'Espresso', 9, 'Double shot, house blend.'],
  ['Espresso', 'Cortado', 12, null],
  ['Espresso', 'Flat white', 15, 'Silky milk, two ristretto shots.'],
  ['Espresso', 'Cappuccino', 14, null],
  ['Espresso', 'Iced latte', 17, 'Over slow-melting ice.'],
  ['Filter', 'V60 pour-over', 18, 'Rotating single origin.'],
  ['Filter', 'Batch brew', 11, null],
  ['Filter', 'Cold brew', 16, 'Steeped for 18 hours.'],
  ['Tea & more', 'Matcha latte', 17, 'Ceremonial grade, oat milk.'],
  ['Tea & more', 'Hot chocolate', 15, null],
  ['Pastry', 'Cinnamon bun', 12, 'Baked every morning.'],
  ['Pastry', 'Almond croissant', 13, null],
  ['Pastry', 'Banana bread', 11, 'With salted butter.'],
  ['Brunch', 'Avocado toast', 32, 'Sourdough, chili, lime.'],
  ['Brunch', 'Shakshuka', 36, null],
]

const FIRST = ['Ana', 'Radu', 'Ioana', 'Mihai', 'Elena', 'Andrei', 'Maria', 'Vlad', 'Irina', 'Tudor', 'Bianca', 'Matei', 'Sofia', 'Luca', 'Daria', 'Victor', 'Alexia', 'Cosmin', 'Teodora', 'Paul', 'Diana', 'Stefan', 'Carla', 'Bogdan', 'Ilinca', 'Sorin', 'Oana', 'Dragoș', 'Livia', 'Horia', 'Petra', 'Emil', 'Nora', 'Gabriel', 'Mira', 'Toma']
const LAST = ['Popescu', 'Ionescu', 'Dumitru', 'Stoica', 'Matei', 'Constantin', 'Marin', 'Tudor', 'Florea', 'Rusu', 'Munteanu', 'Barbu', 'Lungu', 'Neagu', 'Ene', 'Moldovan', 'Preda', 'Dobre']

const COMMENTS: Record<number, string[]> = {
  5: ['Best flat white in the city, no contest.', 'Perfect pour-over, lovely staff, I’ll be back tomorrow.', 'Quiet, warm, and the beans are exceptional.', 'The barista remembered my order on the second visit.', 'Cinnamon bun + V60 is my new Saturday.'],
  4: ['Great coffee, a little crowded at lunch.', 'Solid espresso and a nice terrace.', 'Lovely space, pastries could be fresher.', 'Good beans, friendly team, slightly pricey.'],
  3: ['Decent cup, nothing memorable.', 'Coffee was fine, service was slow.', 'Okay for a quick takeaway.'],
  2: ['Milk was burnt, espresso sour.', 'Too loud to stay long.'],
  1: ['Waited 20 minutes for a lukewarm latte.'],
}

const WEEK: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

// ---------- generator ----------
export function seedDemoDb(now = Date.now()): DemoDb {
  const r = rng(20261105)
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)]
  let nextId = 1000

  // Users: admin, merchants, customers (Ana and Radu are personas)
  const users: DemoUser[] = [
    { id: 1, firstName: 'Admin', lastName: 'BeanGo', email: 'admin@demo.beango', role: 'ADMIN', lifetimePoints: 0 },
  ]
  const merchants = [
    ['Mara', 'Stan'],
    ['Ovidiu', 'Lazăr'],
    ['Simona', 'Pavel'],
    ['Costin', 'Badea'],
    ['Raluca', 'Iordache'],
  ].map(([f, l], i): DemoUser => ({
    id: 10 + i,
    firstName: f,
    lastName: l,
    email: i === 0 ? 'mara.stan@demo.beango' : `${f.toLowerCase()}.${l.toLowerCase().replace('ă', 'a')}@demo.beango`,
    role: 'MERCHANT',
    lifetimePoints: 0,
  }))
  users.push(...merchants)

  const customers: DemoUser[] = FIRST.map((first, i) => {
    const last = i === 0 ? 'Popescu' : i === 1 ? 'Ionescu' : LAST[(i * 7) % LAST.length]
    const slug = `${first}.${last}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    return { id: 100 + i, firstName: first, lastName: last, email: `${slug}@demo.beango`, role: 'USER', lifetimePoints: 0 }
  })
  users.push(...customers)
  const ANA = customers[0]
  const RADU = customers[1]

  // Shops (two extra pending ones so approvals have something to do)
  const shops: DemoShop[] = SHOPS.map((s, i) => {
    const late = i % 5 === 2
    const closedSunday = i % 6 === 4
    const schedule: OperatingHours[] = WEEK.filter((d) => !(closedSunday && d === 'SUNDAY')).map((d) => {
      const weekend = d === 'SATURDAY' || d === 'SUNDAY'
      return {
        dayOfWeek: d,
        openTime: weekend ? '09:00:00' : i % 2 ? '07:30:00' : '08:00:00',
        closeTime: late ? '22:00:00' : weekend ? '18:00:00' : '20:00:00',
      }
    })
    const facilities = FACILITIES.filter((f) => (i * 3 + f.id * 5) % 7 < 4 || f.id === 8)
    const menu: MenuItem[] = MENU.filter((_, k) => (k + i) % 5 !== 0).map(([category, name, price, description], k) => ({
      id: i * 100 + k + 1,
      category,
      name,
      price: Math.round((price + (i % 3) - 1) * 100) / 100,
      description,
    }))
    const owner = merchants[i % merchants.length]
    return {
      merchantId: owner.id,
      approved: true,
      details: {
        id: i + 1,
        name: s.name,
        description: s.blurb,
        address: s.address,
        contactEmail: owner.email,
        contactPhone: `+40 721 ${String(100 + i * 37).padStart(3, '0')} ${String(400 + i * 11).padStart(3, '0')}`,
        averageRating: null,
        reviewCount: 0,
        latitude: s.lat,
        longitude: s.lng,
        facilities,
        menu,
        schedule,
      },
    }
  })
  for (const [k, name] of ['Fern & Filter', 'Night Owl Espresso'].entries()) {
    shops.push({
      merchantId: merchants[k + 1].id,
      approved: false,
      details: {
        id: 50 + k,
        name,
        description: k
          ? 'Late-night espresso bar for the after-hours crowd.'
          : 'Plants on every shelf and slow filter coffee by the window.',
        address: k ? 'Str. Moților 40' : 'Str. Regele Ferdinand 20',
        contactEmail: merchants[k + 1].email,
        contactPhone: k ? null : '+40 721 555 014',
        averageRating: null,
        reviewCount: 0,
        latitude: 46.773 - k * 0.004,
        longitude: 23.5915 - k * 0.0145,
        facilities: [FACILITIES[0], FACILITIES[7]],
        // The first request is filled in; the second was sent with no menu or hours.
        menu: k
          ? []
          : MENU.slice(0, 8).map(([category, name, price, description], n) => ({
              id: 5000 + n,
              category,
              name,
              price,
              description,
            })),
        schedule: k
          ? []
          : WEEK.filter((day) => day !== 'SUNDAY').map((day) => ({
              dayOfWeek: day,
              openTime: '08:00:00',
              closeTime: day === 'SATURDAY' ? '16:00:00' : '19:00:00',
            })),
      },
    })
  }
  // One more request from the demo merchant herself (Mara), so her "Your cafés"
  // list shows a café that is still waiting next to the live ones.
  shops.push({
    merchantId: merchants[0].id,
    approved: false,
    details: {
      id: 52,
      name: 'Second Crack',
      description: 'A small roastery corner with a tasting bar.',
      address: 'Str. Memorandumului 12',
      contactEmail: merchants[0].email,
      contactPhone: '+40 721 555 027',
      averageRating: null,
      reviewCount: 0,
      latitude: 46.7702,
      longitude: 23.5856,
      facilities: [FACILITIES[0]],
      menu: MENU.slice(0, 4).map(([category, name, price, description], n) => ({
        id: 5100 + n,
        category,
        name,
        price,
        description,
      })),
      schedule: [],
    },
  })
  const approved = shops.filter((s) => s.approved)

  // Point transactions over the last 120 days, growing towards today
  const transactions: PointTransaction[] = []
  const wallets = new Map<string, number>()
  const vouchers: DemoVoucher[] = []
  const START = now - 120 * DAY

  const awardAt = (user: DemoUser, shop: DemoShop, points: number, at: number) => {
    const merchant = users.find((u) => u.id === shop.merchantId)!
    transactions.push({
      id: nextId++,
      createdAt: toLocal(at),
      points,
      merchantId: merchant.id,
      merchantEmail: merchant.email,
      customerId: user.id,
      customerEmail: user.email,
      coffeeShopId: shop.details.id,
      coffeeShopName: shop.details.name,
    })
    user.lifetimePoints += points
    const key = `${user.id}:${shop.details.id}`
    let wallet = (wallets.get(key) ?? 0) + points
    const activeAt = (t: number) =>
      vouchers.filter((v) => v.userId === user.id && v.shopId === shop.details.id && v.issuedAt <= t && (v.usedAt === null || v.usedAt > t) && v.expiresAt > t).length
    while (wallet >= LOYALTY_RULES.pointsForVoucher && activeAt(at) < LOYALTY_RULES.maxActiveVouchersPerShop) {
      wallet -= LOYALTY_RULES.pointsForVoucher
      const expiresAt = at + 91 * DAY
      // Most vouchers get used within a few weeks, if that's already in the past
      const useAt = at + (3 + r() * 25) * DAY
      const used = r() < 0.68 && useAt < now
      vouchers.push({
        id: nextId++,
        code: Array.from({ length: 10 }, () => CODE_ALPHABET[Math.floor(r() * CODE_ALPHABET.length)]).join(''),
        userId: user.id,
        shopId: shop.details.id,
        issuedAt: at,
        expiresAt,
        usedAt: used ? useAt : null,
      })
    }
    wallets.set(key, wallet)
  }

  // Each customer has 1–3 favourite cafés and a visit rate
  const habits = customers.map((c, i) => ({
    user: c,
    shops: c === ANA ? [approved[0], approved[4], approved[6]] : [pick(approved), pick(approved), pick(approved)].slice(0, 1 + (i % 3)),
    rate: c === RADU ? 0 : c === ANA ? 0.9 : 0.04 + r() * 0.22,
  }))
  for (let t = START; t < now - DAY / 2; t += DAY) {
    const growth = 0.55 + 0.45 * ((t - START) / (now - START))
    const weekday = new Date(t).getDay()
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.25 : 1
    for (const h of habits) {
      if (r() < h.rate * growth * weekendBoost) {
        const at = t + (7.5 + r() * 11) * 3_600_000
        awardAt(h.user, pick(h.shops), [5, 10, 10, 15, 15, 20, 25, 30, 40][Math.floor(r() * 9)], at)
      }
    }
  }
  // Radu: a handful of points, no voucher yet
  awardAt(RADU, approved[4], 15, now - 6 * DAY)
  awardAt(RADU, approved[4], 20, now - 2 * DAY)

  // Reviews
  const reviews: DemoReview[] = []
  approved.forEach((shop, i) => {
    const q = SHOPS[i].quality
    const count = 4 + Math.floor(r() * 22)
    const reviewers = [...customers].sort(() => r() - 0.5).slice(0, count)
    for (const u of reviewers) {
      const rating = Math.max(1, Math.min(5, Math.round(q + (r() - 0.55) * 2.2)))
      reviews.push({
        id: nextId++,
        shopId: shop.details.id,
        userId: u.id,
        rating,
        comment: r() < 0.8 ? pick(COMMENTS[rating]) : undefined,
        createdAt: toLocal(now - Math.floor(r() * 110) * DAY - Math.floor(r() * 10) * 3_600_000),
        userFirstName: u.firstName,
        userLastName: u.lastName,
        coffeeShopName: shop.details.name,
      })
    }
  })

  const favorites = [approved[0], approved[4], approved[6], approved[10]].map((s) => ({
    id: nextId++,
    userId: ANA.id,
    shopId: s.details.id,
  }))

  const db: DemoDb = {
    version: DEMO_DB_VERSION,
    seededAt: now,
    users,
    shops,
    reviews,
    favorites,
    wallets: [...wallets.entries()].map(([k, points]) => {
      const [userId, shopId] = k.split(':').map(Number)
      return { userId, shopId, points }
    }),
    vouchers,
    transactions: transactions.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    nextId,
  }
  refreshShopRatings(db)
  return db
}

export function refreshShopRatings(db: DemoDb) {
  for (const shop of db.shops) {
    const rs = db.reviews.filter((r) => r.shopId === shop.details.id)
    shop.details.reviewCount = rs.length
    shop.details.averageRating = rs.length
      ? Math.round((rs.reduce((s, r) => s + r.rating, 0) / rs.length) * 10) / 10
      : 0
  }
}

export const badgeOf = (u: DemoUser) => badgeForPoints(u.lifetimePoints)
export { DAY }
