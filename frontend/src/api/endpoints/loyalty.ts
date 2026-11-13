import { http } from '../client'
import type { AwardPointsRequest, LoyaltyWallet, PointsAwardResult } from '../types'

// LoyaltyPointController
export const loyaltyApi = {
  // Self or ADMIN. One wallet per coffee shop the user has points at.
  wallets: (userId: number, signal?: AbortSignal) =>
    http.get<LoyaltyWallet[]>(`/api/v1/users/${userId}/loyalty-points`, { signal }),

  // MERCHANT, for their own approved shop, to a USER account (not themselves).
  // Every 50 points auto-converts into a 10% voucher (max 3 active per shop).
  // 404 if no customer has that email.
  awardPoints: (body: AwardPointsRequest) =>
    http.post<PointsAwardResult>('/api/v1/loyalty-points/transactions', body),
}
