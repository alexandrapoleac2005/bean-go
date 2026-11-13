import { adminApi, ApiError, reviewsApi } from '../api'
import type { Role } from '../api/types'

// The JWT only carries the email, so when it has no role claim the role is
// worked out from two cheap role-gated reads:
//   GET /api/v1/reviews/me               -> 200 only for USER
//   GET /api/v1/admin/point-transactions -> 200 only for ADMIN
//   403 on both                          -> MERCHANT (the only remaining role)
// Returns null if the answer can't be trusted (network error, 5xx).
export async function probeRole(): Promise<Role | null> {
  const [asUser, asAdmin] = await Promise.allSettled([
    reviewsApi.mine({ size: 1 }),
    adminApi.pointTransactions({ size: 1 }),
  ])
  if (asUser.status === 'fulfilled') return 'USER'
  if (asAdmin.status === 'fulfilled') return 'ADMIN'
  const forbidden = (r: PromiseSettledResult<unknown>) =>
    r.status === 'rejected' && r.reason instanceof ApiError && r.reason.isForbidden
  return forbidden(asUser) && forbidden(asAdmin) ? 'MERCHANT' : null
}

// Cache per token so a reload doesn't probe again. Keyed by the token's
// signature tail, which changes with every new token.
const ROLE_KEY = 'beango.role'
const tokenTag = (token: string) => token.slice(-16)

export const roleCache = {
  get(token: string): Role | null {
    const raw = localStorage.getItem(ROLE_KEY)
    if (!raw) return null
    const [tag, role] = raw.split(':')
    return tag === tokenTag(token) ? (role as Role) : null
  },
  set(token: string, role: Role) {
    localStorage.setItem(ROLE_KEY, `${tokenTag(token)}:${role}`)
  },
  clear() {
    localStorage.removeItem(ROLE_KEY)
  },
}
