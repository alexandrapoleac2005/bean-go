import { BADGE_THRESHOLDS, LOYALTY_RULES, USER_BADGES, type IsoDateTime, type UserBadge } from '../api/types'

export interface TierProgress {
  current: UserBadge
  next: UserBadge | null
  // 0..1 progress from the current tier's threshold to the next one
  fraction: number
  remaining: number // points left to the next tier (0 at the top)
}

// Same rule as UserBadge.getBadgeForPoints in the backend.
export function badgeForPoints(points: number): UserBadge {
  let badge: UserBadge = 'ROOKIE'
  for (const b of USER_BADGES) if (points >= BADGE_THRESHOLDS[b]) badge = b
  return badge
}

export function tierProgress(lifetimePoints: number): TierProgress {
  const current = badgeForPoints(lifetimePoints)
  const index = USER_BADGES.indexOf(current)
  const next = USER_BADGES[index + 1] ?? null
  if (!next) return { current, next: null, fraction: 1, remaining: 0 }
  const from = BADGE_THRESHOLDS[current]
  const to = BADGE_THRESHOLDS[next]
  return {
    current,
    next,
    fraction: Math.min(Math.max((lifetimePoints - from) / (to - from), 0), 1),
    remaining: to - lifetimePoints,
  }
}

// Wallet points normally stay below 50 (each 50 turns into a voucher), unless the
// shop already has the max number of active vouchers. Then points keep piling up.
export function walletProgress(points: number, activeVouchersAtShop: number) {
  const { pointsForVoucher, maxActiveVouchersPerShop } = LOYALTY_RULES
  const full = activeVouchersAtShop >= maxActiveVouchersPerShop
  return {
    fraction: Math.min(points / pointsForVoucher, 1),
    remaining: Math.max(pointsForVoucher - points, 0),
    full, // no new voucher until one is used
    ready: full && points >= pointsForVoucher,
  }
}

// LocalDateTime from the backend has no zone: read it as local time.
export function parseLocal(value: IsoDateTime | null | undefined): number | null {
  if (!value) return null
  const t = new Date(value).getTime()
  return Number.isNaN(t) ? null : t
}

export function daysUntil(value: IsoDateTime | null, now: number): number | null {
  const t = parseLocal(value)
  return t === null ? null : Math.ceil((t - now) / 86_400_000)
}
