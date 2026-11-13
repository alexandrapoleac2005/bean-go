import {
  LOYALTY_RULES,
  USER_BADGES,
  type CoffeeShopDetails,
  type LoyaltyWallet,
  type PointTransaction,
  type UserBadge,
} from '../../api/types'
import { parseLocal } from '../../lib/loyalty'

// Everything here is computed in the browser from the admin ledger
// (GET /admin/point-transactions) plus profile/wallet/shop reads: the backend
// has no statistics endpoints.

const DAY = 86_400_000

export type RangeKey = '7d' | '30d' | '90d' | 'all'

export const RANGES: Array<{ key: RangeKey; label: string; days: number | null }> = [
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: '90d', label: 'Last 90 days', days: 90 },
  { key: 'all', label: 'All time', days: null },
]

export interface Window {
  from: number | null // inclusive; null = beginning of data
  to: number // exclusive
  prevFrom: number | null // same-length window just before, for deltas
  prevTo: number | null
  bucket: 'day' | 'week'
}

const startOfDay = (t: number) => {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function windowFor(key: RangeKey, now: number): Window {
  const days = RANGES.find((r) => r.key === key)!.days
  const to = startOfDay(now) + DAY // through the end of today
  if (days === null) return { from: null, to, prevFrom: null, prevTo: null, bucket: 'week' }
  const from = to - days * DAY
  return { from, to, prevFrom: from - days * DAY, prevTo: from, bucket: 'day' }
}

export interface Tx {
  at: number
  points: number
  customerId: number
  shopId: number
  shopName: string
}

export function toTx(list: PointTransaction[]): Tx[] {
  return list
    .map((t) => ({
      at: parseLocal(t.createdAt) ?? 0,
      points: t.points,
      customerId: t.customerId,
      shopId: t.coffeeShopId,
      shopName: t.coffeeShopName,
    }))
    .sort((a, b) => a.at - b.at)
}

const inWindow = (t: Tx, from: number | null, to: number) => (from === null || t.at >= from) && t.at < to

export interface Kpi {
  value: number
  previous: number | null // null when there's no comparable window
}

export interface Kpis {
  points: Kpi
  transactions: Kpi
  customers: Kpi
  avgPoints: Kpi
}

function summarize(txs: Tx[]) {
  const points = txs.reduce((s, t) => s + t.points, 0)
  const customers = new Set(txs.map((t) => t.customerId)).size
  return { points, transactions: txs.length, customers, avgPoints: txs.length ? points / txs.length : 0 }
}

export function kpis(all: Tx[], w: Window): Kpis {
  const cur = summarize(all.filter((t) => inWindow(t, w.from, w.to)))
  const prev = w.prevTo === null ? null : summarize(all.filter((t) => inWindow(t, w.prevFrom, w.prevTo!)))
  return {
    points: { value: cur.points, previous: prev?.points ?? null },
    transactions: { value: cur.transactions, previous: prev?.transactions ?? null },
    customers: { value: cur.customers, previous: prev?.customers ?? null },
    avgPoints: { value: cur.avgPoints, previous: prev?.avgPoints ?? null },
  }
}

// Relative change, or null when it can't be computed
export function delta(k: Kpi): number | null {
  if (k.previous === null || k.previous === 0) return null
  return (k.value - k.previous) / k.previous
}

export interface Bucket {
  start: number
  points: number
  transactions: number
}

// Zero-filled time series (days for bounded ranges, weeks for all time).
export function volumeSeries(all: Tx[], w: Window): Bucket[] {
  const size = w.bucket === 'day' ? DAY : 7 * DAY
  const first = w.from ?? (all.length ? startOfDay(all[0].at) : w.to - 12 * size)
  const start = w.bucket === 'week' ? w.to - Math.ceil((w.to - first) / size) * size : first
  const buckets: Bucket[] = []
  for (let t = start; t < w.to; t += size) buckets.push({ start: t, points: 0, transactions: 0 })
  for (const tx of all) {
    if (!inWindow(tx, start, w.to)) continue
    const i = Math.floor((tx.at - start) / size)
    if (buckets[i]) {
      buckets[i].points += tx.points
      buckets[i].transactions++
    }
  }
  return buckets
}

export function badgeDistribution(badges: UserBadge[]): Array<{ badge: UserBadge; count: number; share: number }> {
  const total = badges.length || 1
  return USER_BADGES.map((badge) => {
    const count = badges.filter((b) => b === badge).length
    return { badge, count, share: count / total }
  })
}

export interface ShopRank {
  id: number
  name: string
  rating: number
  reviews: number
  points: number // awarded at this shop within the window
}

// Highest-rated approved shops with enough reviews to mean something.
export function topShops(shops: CoffeeShopDetails[], all: Tx[], w: Window, n = 6, minReviews = 3): ShopRank[] {
  const points = new Map<number, number>()
  for (const t of all) if (inWindow(t, w.from, w.to)) points.set(t.shopId, (points.get(t.shopId) ?? 0) + t.points)
  return shops
    .filter((s) => (s.reviewCount ?? 0) >= minReviews && s.averageRating)
    .map((s) => ({ id: s.id, name: s.name, rating: s.averageRating!, reviews: s.reviewCount ?? 0, points: points.get(s.id) ?? 0 }))
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, n)
}

// Vouchers issued, reconstructed: every 50 points that left a wallet became a
// voucher. earned (ledger, all time) − still in wallet = converted points.
export function vouchersIssued(all: Tx[], walletsByCustomer: Map<number, LoyaltyWallet[]>): number {
  const earned = new Map<string, number>()
  for (const t of all) earned.set(`${t.customerId}:${t.shopId}`, (earned.get(`${t.customerId}:${t.shopId}`) ?? 0) + t.points)
  let issued = 0
  for (const [customerId, wallets] of walletsByCustomer) {
    for (const w of wallets) {
      const converted = (earned.get(`${customerId}:${w.coffeeShopId}`) ?? 0) - w.points
      if (converted > 0) issued += Math.floor(converted / LOYALTY_RULES.pointsForVoucher)
    }
  }
  return issued
}

export function distinctCustomers(all: Tx[]): number[] {
  return [...new Set(all.map((t) => t.customerId))]
}
