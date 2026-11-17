import { http } from '../client'
import type { Voucher } from '../types'

// VoucherController
export const vouchersApi = {
  // Authenticated. Usable (ACTIVE, not expired) vouchers of the current user.
  active: (signal?: AbortSignal) => http.get<Voucher[]>('/api/v1/vouchers/active', { signal }),

  // MERCHANT, at the counter. Code is trimmed + uppercased server-side.
  // 404 unknown code | 403 other shop's voucher | 409 already used | 400 expired
  redeem: (code: string) => http.post<Voucher>('/api/v1/vouchers/redeem', { code }),
}
