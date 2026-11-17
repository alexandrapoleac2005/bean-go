import { describe, expect, it } from 'vitest'
import type { CoffeeShopDetails, PointTransaction } from '../../api/types'
import { seedDemoDb } from '../../demo/seed'
import { badgeDistribution, delta, kpis, toTx, topShops, volumeSeries, vouchersIssued, windowFor } from './analytics'

const NOW = new Date('2026-11-05T15:00:00').getTime()
const DAY = 86_400_000
const at = (daysAgo: number) => {
  const d = new Date(NOW - daysAgo * DAY)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:00:00`
}
const tx = (id: number, daysAgo: number, points: number, customerId = 1, shopId = 1): PointTransaction => ({
  id,
  createdAt: at(daysAgo),
  points,
  merchantId: 9,
  merchantEmail: 'm@x',
  customerId,
  customerEmail: `c${customerId}@x`,
  coffeeShopId: shopId,
  coffeeShopName: `Shop ${shopId}`,
})

describe('kpis', () => {
  const all = toTx([tx(1, 1, 20, 1), tx(2, 3, 10, 2), tx(3, 9, 30, 1), tx(4, 12, 40, 3)])

  it('sums the current window and the one before it', () => {
    const k = kpis(all, windowFor('7d', NOW))
    expect(k.points).toEqual({ value: 30, previous: 70 })
    expect(k.transactions).toEqual({ value: 2, previous: 2 })
    expect(k.customers).toEqual({ value: 2, previous: 2 })
    expect(k.avgPoints.value).toBe(15)
    expect(delta(k.points)).toBeCloseTo(-0.571, 2)
  })

  it('has no previous window for all time', () => {
    const k = kpis(all, windowFor('all', NOW))
    expect(k.points).toEqual({ value: 100, previous: null })
    expect(delta(k.points)).toBeNull()
  })
})

describe('volumeSeries', () => {
  it('zero-fills one bucket per day', () => {
    const s = volumeSeries(toTx([tx(1, 0, 5), tx(2, 0, 5), tx(3, 6, 8)]), windowFor('7d', NOW))
    expect(s).toHaveLength(7)
    expect(s.at(-1)).toMatchObject({ points: 10, transactions: 2 })
    expect(s[0]).toMatchObject({ points: 8, transactions: 1 })
    expect(s.slice(1, -1).every((b) => b.points === 0)).toBe(true)
  })

  it('uses weekly buckets for all time and keeps every point', () => {
    const all = toTx([tx(1, 0, 5), tx(2, 40, 7), tx(3, 80, 9)])
    const s = volumeSeries(all, windowFor('all', NOW))
    expect(s.reduce((n, b) => n + b.points, 0)).toBe(21)
  })
})

describe('badges & shops & vouchers', () => {
  it('counts every tier, including empty ones', () => {
    const d = badgeDistribution(['ROOKIE', 'ROOKIE', 'BEAN_MASTER'])
    expect(d.map((x) => x.count)).toEqual([2, 0, 0, 1])
    expect(d[0].share).toBeCloseTo(2 / 3)
  })

  it('ranks shops by rating, ignoring ones with too few reviews', () => {
    const shop = (id: number, rating: number, reviews: number) =>
      ({ id, name: `S${id}`, averageRating: rating, reviewCount: reviews }) as CoffeeShopDetails
    const ranked = topShops([shop(1, 4.9, 2), shop(2, 4.5, 10), shop(3, 4.7, 5)], toTx([tx(1, 1, 25, 1, 3)]), windowFor('30d', NOW))
    expect(ranked.map((r) => r.id)).toEqual([3, 2])
    expect(ranked[0].points).toBe(25)
  })

  it('reconstructs vouchers from points that left the wallet', () => {
    const all = toTx([tx(1, 5, 40, 1, 1), tx(2, 2, 30, 1, 1), tx(3, 1, 120, 2, 1)])
    const wallets = new Map([
      [1, [{ coffeeShopId: 1, coffeeShopName: 'S', points: 20 }]], // 70 earned, 20 left -> 1
      [2, [{ coffeeShopId: 1, coffeeShopName: 'S', points: 20 }]], // 120 earned, 20 left -> 2
    ])
    expect(vouchersIssued(all, wallets)).toBe(3)
  })
})

describe('demo seed', () => {
  const db = seedDemoDb(NOW)

  it('is deterministic', () => {
    expect(seedDemoDb(NOW).transactions.length).toBe(db.transactions.length)
  })

  it('keeps lifetime points equal to the ledger', () => {
    for (const u of db.users.filter((x) => x.role === 'USER')) {
      const sum = db.transactions.filter((t) => t.customerId === u.id).reduce((s, t) => s + t.points, 0)
      expect(u.lifetimePoints).toBe(sum)
    }
  })

  it('issues vouchers the same way the backend does', () => {
    const wallets = new Map<number, Array<{ coffeeShopId: number; coffeeShopName: string; points: number }>>()
    for (const w of db.wallets) {
      wallets.set(w.userId, [...(wallets.get(w.userId) ?? []), { coffeeShopId: w.shopId, coffeeShopName: '', points: w.points }])
    }
    expect(vouchersIssued(toTx(db.transactions), wallets)).toBe(db.vouchers.length)
  })

  it('gives the personas the story they need', () => {
    const ana = db.users.find((u) => u.email === 'ana.popescu@demo.beango')!
    const radu = db.users.find((u) => u.email === 'radu.ionescu@demo.beango')!
    expect(ana.lifetimePoints).toBeGreaterThanOrEqual(1500) // Caffeine Addict
    expect(radu.lifetimePoints).toBeLessThan(50)
    expect(db.vouchers.some((v) => v.userId === ana.id && v.usedAt === null && v.expiresAt > NOW)).toBe(true)
  })
})
