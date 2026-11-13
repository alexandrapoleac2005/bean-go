import { describe, expect, it } from 'vitest'
import type { LoyaltyWallet, UserProfile, Voucher } from '../../../api/types'
import { badgeForPoints, tierProgress, walletProgress } from '../../../lib/loyalty'
import { claimVoucher, emptyRewardsState, reconcile, type LoyaltySnapshot } from './reconcile'

const T0 = new Date('2026-11-05T10:00:00').getTime()
const MIN = 60_000

const voucher = (id: number, shop = 'Origo', expiresAt = '2027-02-05T10:00:00'): Voucher => ({
  id,
  code: `CODE${id}`.padEnd(10, 'X'),
  coffeeShopName: shop,
  status: 'ACTIVE',
  generatedAt: '2026-11-01T09:00:00',
  expiresAt,
  discountPercentage: 10,
})
const wallet = (shopId: number, points: number, name = 'Origo'): LoyaltyWallet => ({
  coffeeShopId: shopId,
  coffeeShopName: name,
  points,
})
const profile = (lifetimePoints: number): UserProfile => ({
  id: 7,
  firstName: 'Ana',
  lastName: 'Pop',
  email: 'ana@example.com',
  lifetimePoints,
  badge: badgeForPoints(lifetimePoints),
})
const snap = (p: Partial<LoyaltySnapshot>, fetchedAt: number): LoyaltySnapshot => ({
  profile: null,
  wallets: null,
  vouchers: [],
  ...p,
  fetchedAt,
})

describe('reconcile', () => {
  it('first sync sets a baseline without emitting events', () => {
    const { state, events } = reconcile(
      emptyRewardsState(),
      snap({ profile: profile(120), wallets: [wallet(1, 20)], vouchers: [voucher(1)] }, T0),
    )
    expect(events).toEqual([])
    expect(state.initialized).toBe(true)
    expect(state.lifetimePoints).toBe(120)
    expect(state.vouchers[1].state).toBe('ACTIVE')
    expect(state.vouchers[1].claimed).toBe(false)
    // issued vouchers still land in the history, at their server timestamp
    expect(state.activity.map((a) => a.kind)).toEqual(['voucher-issued'])
  })

  it('is idempotent for the same snapshot', () => {
    const s = snap({ profile: profile(120), wallets: [wallet(1, 20)], vouchers: [voucher(1)] }, T0)
    const first = reconcile(emptyRewardsState(), s).state
    const again = reconcile(first, s)
    expect(again.events).toEqual([])
    expect(again.state.activity).toHaveLength(first.activity.length)
  })

  it('records points earned at a shop', () => {
    const base = reconcile(emptyRewardsState(), snap({ profile: profile(100), wallets: [wallet(1, 20)] }, T0)).state
    const { events } = reconcile(base, snap({ profile: profile(130), wallets: [wallet(1, 50 - 0 - 0)] }, T0 + MIN))
    expect(events).toEqual([expect.objectContaining({ kind: 'earned', shopId: 1, points: 30 })])
  })

  it('counts points that were converted into a voucher', () => {
    // 40 -> +30 = 70 -> one voucher (-50) -> wallet shows 20
    const base = reconcile(emptyRewardsState(), snap({ profile: profile(40), wallets: [wallet(1, 40)] }, T0)).state
    const { events, state } = reconcile(
      base,
      snap({ profile: profile(70), wallets: [wallet(1, 20)], vouchers: [voucher(9)] }, T0 + MIN),
    )
    const kinds = events.map((e) => e.kind).sort()
    expect(kinds).toEqual(['earned', 'voucher-issued'])
    expect(events.find((e) => e.kind === 'earned')).toMatchObject({ points: 30 })
    expect(state.vouchers[9].claimed).toBe(false)
  })

  it('handles a first purchase at a new shop', () => {
    const base = reconcile(emptyRewardsState(), snap({ profile: profile(0), wallets: [] }, T0)).state
    const { events } = reconcile(base, snap({ profile: profile(15), wallets: [wallet(4, 15, 'Steam')] }, T0 + MIN))
    expect(events).toEqual([expect.objectContaining({ kind: 'earned', shopName: 'Steam', points: 15 })])
  })

  it('marks a voucher that left the active list as used', () => {
    const base = reconcile(emptyRewardsState(), snap({ vouchers: [voucher(1), voucher(2)] }, T0)).state
    const { state, events } = reconcile(base, snap({ vouchers: [voucher(2)] }, T0 + MIN))
    expect(state.vouchers[1].state).toBe('USED')
    expect(state.vouchers[1].resolvedAt).toBe(T0 + MIN)
    expect(events).toEqual([expect.objectContaining({ kind: 'voucher-used', voucherId: 1 })])
  })

  it('marks it expired instead when its expiry date has passed', () => {
    const base = reconcile(emptyRewardsState(), snap({ vouchers: [voucher(1, 'Origo', '2026-11-05T10:30:00')] }, T0)).state
    const { state } = reconcile(base, snap({ vouchers: [] }, T0 + 60 * MIN))
    expect(state.vouchers[1].state).toBe('EXPIRED')
  })

  it('emits a badge event when the tier changes', () => {
    const base = reconcile(emptyRewardsState(), snap({ profile: profile(480), wallets: [wallet(1, 30)] }, T0)).state
    const { events, state } = reconcile(base, snap({ profile: profile(510), wallets: [wallet(1, 10)], vouchers: [voucher(3)] }, T0 + MIN))
    expect(state.badge).toBe('COFFEE_LOVER')
    expect(events.find((e) => e.kind === 'badge')).toMatchObject({ badge: 'COFFEE_LOVER', from: 'ROOKIE' })
  })

  it('works without profile/wallets (user id unknown)', () => {
    const base = reconcile(emptyRewardsState(), snap({ vouchers: [voucher(1)] }, T0)).state
    const { state, events } = reconcile(base, snap({ vouchers: [voucher(1), voucher(2)] }, T0 + MIN))
    expect(state.wallets).toBeNull()
    expect(events.map((e) => e.kind)).toEqual(['voucher-issued'])
  })

  it('claiming only flips the claimed flag', () => {
    const base = reconcile(emptyRewardsState(), snap({ vouchers: [voucher(1)] }, T0)).state
    const claimed = claimVoucher(base, 1)
    expect(claimed.vouchers[1].claimed).toBe(true)
    expect(claimVoucher(claimed, 1)).toBe(claimed)
    // a later sync keeps the claim
    expect(reconcile(claimed, snap({ vouchers: [voucher(1)] }, T0 + MIN)).state.vouchers[1].claimed).toBe(true)
  })
})

describe('tiers', () => {
  it('matches UserBadge thresholds', () => {
    expect(badgeForPoints(0)).toBe('ROOKIE')
    expect(badgeForPoints(499)).toBe('ROOKIE')
    expect(badgeForPoints(500)).toBe('COFFEE_LOVER')
    expect(badgeForPoints(1500)).toBe('CAFFEINE_ADDICT')
    expect(badgeForPoints(3000)).toBe('BEAN_MASTER')
  })

  it('computes progress to the next tier', () => {
    expect(tierProgress(1000)).toEqual({ current: 'COFFEE_LOVER', next: 'CAFFEINE_ADDICT', fraction: 0.5, remaining: 500 })
    expect(tierProgress(4000)).toMatchObject({ current: 'BEAN_MASTER', next: null, fraction: 1 })
  })

  it('wallet progress knows when the shop is capped', () => {
    expect(walletProgress(30, 0)).toMatchObject({ fraction: 0.6, remaining: 20, full: false })
    expect(walletProgress(80, 3)).toMatchObject({ fraction: 1, full: true, ready: true })
  })
})
