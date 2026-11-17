import { getPage, http } from '../client'
import type {
  CoffeeShopDetails,
  PageParams,
  PendingCoffeeShop,
  PointTransaction,
  PointTransactionFilters,
  VoucherStats,
} from '../types'

// AdminController — every route requires ADMIN.
export const adminApi = {
  // Point-award audit log. size 1..100, default 20. from/to are ISO local date-times.
  pointTransactions: ({ page = 0, size = 20, ...filters }: PointTransactionFilters = {}, signal?: AbortSignal) =>
    getPage<PointTransaction>('/api/v1/admin/point-transactions', {
      query: { page, size, ...filters },
      signal,
    }),

  // Cafés waiting for approval, oldest first. size 1..100.
  pendingShops: ({ page = 0, size = 100 }: PageParams = {}, signal?: AbortSignal) =>
    getPage<PendingCoffeeShop>('/api/v1/admin/coffee-shops/pending', { query: { page, size }, signal }),

  // Full details (menu, hours, facilities) of one café that is still waiting. 404 once approved.
  pendingShop: (id: number, signal?: AbortSignal) =>
    http.get<CoffeeShopDetails>(`/api/v1/admin/coffee-shops/pending/${id}`, { signal }),

  // Deny a pending café: deletes the request. 204; 409 if it's already approved.
  rejectShop: (id: number) => http.delete(`/api/v1/admin/coffee-shops/pending/${id}`),

  // Proposed endpoint; 404 on the current backend (see VoucherStats)
  voucherStats: (signal?: AbortSignal) => http.get<VoucherStats>('/api/v1/admin/vouchers/stats', { signal }),
}
