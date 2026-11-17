import { LOYALTY_RULES, type LoyaltyWallet, type UserBadge, type UserProfile, type Voucher } from '../../../api/types'
import { parseLocal } from '../../../lib/loyalty'

// One synced read of the user's loyalty data.
export interface LoyaltySnapshot {
  profile: UserProfile | null // null while the user id is unknown
  wallets: LoyaltyWallet[] | null // idem
  vouchers: Voucher[] // GET /vouchers/active: only ACTIVE, unexpired
  fetchedAt: number
}

// The backend only lists usable vouchers. Ones that disappear from that list
// are kept here as USED, or EXPIRED if their expiry date has passed.
export type VoucherState = 'ACTIVE' | 'USED' | 'EXPIRED'

export interface VoucherRecord {
  voucher: Voucher
  state: VoucherState
  firstSeenAt: number
  resolvedAt: number | null // when it left the active list
  claimed: boolean // the user has revealed it in the wallet
}

export type Activity =
  | { id: string; at: number; kind: 'earned'; shopId: number; shopName: string; points: number }
  | { id: string; at: number; kind: 'voucher-issued'; voucherId: number; shopName: string; code: string; discount: number }
  | { id: string; at: number; kind: 'voucher-used'; voucherId: number; shopName: string; code: string }
  | { id: string; at: number; kind: 'voucher-expired'; voucherId: number; shopName: string; code: string }
  | { id: string; at: number; kind: 'badge'; badge: UserBadge; from: UserBadge }

export interface RewardsState {
  initialized: boolean
  vouchers: Record<number, VoucherRecord>
  wallets: Record<number, { shopName: string; points: number }> | null
  lifetimePoints: number | null
  badge: UserBadge | null
  activity: Activity[] // newest first
}

export const emptyRewardsState = (): RewardsState => ({
  initialized: false,
  vouchers: {},
  wallets: null,
  lifetimePoints: null,
  badge: null,
  activity: [],
})

const MAX_ACTIVITY = 200
const MAX_RESOLVED_VOUCHERS = 60

// Folds a new snapshot into the stored state. Pure and idempotent: applying the
// same snapshot twice produces no new activity. `events` is what changed since
// the last sync (empty on the very first sync, which only sets the baseline).
export function reconcile(
  prev: RewardsState,
  snap: LoyaltySnapshot,
  now: number = snap.fetchedAt,
): { state: RewardsState; events: Activity[] } {
  const fresh: Activity[] = []

  // ---- Vouchers ----
  const vouchers: Record<number, VoucherRecord> = { ...prev.vouchers }
  const activeIds = new Set(snap.vouchers.map((v) => v.id))
  const issued: Voucher[] = []

  for (const v of snap.vouchers) {
    const known = vouchers[v.id]
    if (known) {
      vouchers[v.id] = { ...known, voucher: v, state: 'ACTIVE', resolvedAt: null }
    } else {
      vouchers[v.id] = { voucher: v, state: 'ACTIVE', firstSeenAt: now, resolvedAt: null, claimed: false }
      issued.push(v)
      fresh.push({
        id: `issued-${v.id}`,
        at: parseLocal(v.generatedAt) ?? now,
        kind: 'voucher-issued',
        voucherId: v.id,
        shopName: v.coffeeShopName,
        code: v.code,
        discount: v.discountPercentage,
      })
    }
  }

  for (const record of Object.values(prev.vouchers)) {
    if (record.state !== 'ACTIVE' || activeIds.has(record.voucher.id)) continue
    const expiresAt = parseLocal(record.voucher.expiresAt)
    const state: VoucherState = expiresAt !== null && expiresAt <= now ? 'EXPIRED' : 'USED'
    const v = record.voucher
    vouchers[v.id] = { ...record, state, resolvedAt: now, voucher: { ...v, status: 'USED' } }
    fresh.push({
      id: `${state === 'USED' ? 'used' : 'expired'}-${v.id}`,
      at: now,
      kind: state === 'USED' ? 'voucher-used' : 'voucher-expired',
      voucherId: v.id,
      shopName: v.coffeeShopName,
      code: v.code,
    })
  }

  // ---- Wallets: points earned = balance change + 50 per voucher issued from it ----
  let wallets = prev.wallets
  if (snap.wallets) {
    const next: NonNullable<RewardsState['wallets']> = {}
    for (const w of snap.wallets) next[w.coffeeShopId] = { shopName: w.coffeeShopName, points: w.points }

    if (prev.wallets) {
      for (const w of snap.wallets) {
        const before = prev.wallets[w.coffeeShopId]?.points ?? 0
        const converted = issued.filter((v) => v.coffeeShopName === w.coffeeShopName).length
        const earned = w.points - before + converted * LOYALTY_RULES.pointsForVoucher
        if (earned > 0) {
          fresh.push({
            id: `earned-${w.coffeeShopId}-${now}`,
            at: now,
            kind: 'earned',
            shopId: w.coffeeShopId,
            shopName: w.coffeeShopName,
            points: earned,
          })
        }
      }
    }
    wallets = next
  }

  // ---- Profile / badge ----
  let { lifetimePoints, badge } = prev
  if (snap.profile) {
    if (prev.badge && prev.badge !== snap.profile.badge) {
      fresh.push({ id: `badge-${snap.profile.badge}-${now}`, at: now, kind: 'badge', badge: snap.profile.badge, from: prev.badge })
    }
    lifetimePoints = snap.profile.lifetimePoints
    badge = snap.profile.badge
  }

  // ---- Keep storage bounded ----
  const resolved = Object.values(vouchers)
    .filter((r) => r.state !== 'ACTIVE')
    .sort((a, b) => (b.resolvedAt ?? 0) - (a.resolvedAt ?? 0))
  for (const r of resolved.slice(MAX_RESOLVED_VOUCHERS)) delete vouchers[r.voucher.id]

  const seen = new Set(prev.activity.map((a) => a.id))
  const added = fresh.filter((a) => !seen.has(a.id))
  const activity = [...added, ...prev.activity].sort((a, b) => b.at - a.at).slice(0, MAX_ACTIVITY)

  return {
    state: { initialized: true, vouchers, wallets, lifetimePoints, badge, activity },
    events: prev.initialized ? added : [],
  }
}

export function claimVoucher(state: RewardsState, voucherId: number): RewardsState {
  const record = state.vouchers[voucherId]
  if (!record || record.claimed) return state
  return { ...state, vouchers: { ...state.vouchers, [voucherId]: { ...record, claimed: true } } }
}
