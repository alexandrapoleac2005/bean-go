import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, ApiError, coffeeShopsApi, loyaltyApi, usersApi } from '../api'
import type {
  CoffeeShopSummary,
  LoyaltyWallet,
  PendingCoffeeShop,
  PointTransaction,
  PointTransactionFilters,
  UserBadge,
} from '../api/types'

const TX_PAGE = 100 // admin endpoint max
const TX_MAX_PAGES = 60 // 6,000 transactions; beyond that the dashboard says it's a sample
const CUSTOMER_CAP = 200

// The whole ledger, newest first, so the dashboard can aggregate any window.
export function useAllPointTransactions() {
  return useQuery({
    queryKey: ['admin', 'transactions', 'all'],
    queryFn: async ({ signal }) => {
      const items: PointTransaction[] = []
      let total = 0
      for (let page = 0; page < TX_MAX_PAGES; page++) {
        const res = await adminApi.pointTransactions({ page, size: TX_PAGE }, signal)
        items.push(...res.content)
        total = res.totalElements
        if (res.last) break
      }
      return { items, total, capped: items.length < total }
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}

// Profile (badge) + wallets for each customer seen in the ledger. Admins may read
// any user's profile and wallets, so this gives exact badges without a stats endpoint.
export function useCustomerSnapshots(customerIds: number[]) {
  const ids = customerIds.slice(0, CUSTOMER_CAP)
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['admin', 'customer', id],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const [profile, wallets] = await Promise.all([usersApi.profile(id, signal), loyaltyApi.wallets(id, signal)])
        return { id, badge: profile.badge, wallets }
      },
      staleTime: 5 * 60_000,
    })),
    combine: (results) => {
      const badges: UserBadge[] = []
      const wallets = new Map<number, LoyaltyWallet[]>()
      for (const r of results) {
        if (!r.data) continue
        badges.push(r.data.badge)
        wallets.set(r.data.id, r.data.wallets)
      }
      return {
        badges,
        wallets,
        loading: results.some((r) => r.isPending),
        sampled: customerIds.length > ids.length ? ids.length : null,
      }
    },
  })
}

// Every approved coffee shop (public list, 50 per page).
export function useAllShops() {
  return useQuery({
    queryKey: ['shops', 'all'],
    queryFn: async ({ signal }) => {
      const all: CoffeeShopSummary[] = []
      for (let page = 0; page < 40; page++) {
        const res = await coffeeShopsApi.list({ page, size: 50 }, signal)
        all.push(...res.content)
        if (res.last) break
      }
      return all
    },
    staleTime: 5 * 60_000,
  })
}

// Proposed endpoint. null = the backend doesn't have it yet (404).
export function useVoucherStats() {
  return useQuery({
    queryKey: ['admin', 'voucher-stats'],
    queryFn: async ({ signal }) => {
      try {
        return await adminApi.voucherStats(signal)
      } catch (e) {
        if (e instanceof ApiError && (e.isNotFound || e.status === 405)) return null
        throw e
      }
    },
    staleTime: 60_000,
  })
}

// One page of the ledger table, filtered server-side.
export function useLedgerPage(filters: PointTransactionFilters) {
  return useQuery({
    queryKey: ['admin', 'transactions', 'page', filters],
    queryFn: ({ signal }) => adminApi.pointTransactions(filters, signal),
    placeholderData: keepPreviousData,
  })
}

// Every café waiting for approval.
export function usePendingShops() {
  return useQuery({
    queryKey: ['admin', 'pending-shops'],
    queryFn: async ({ signal }) => {
      const all: PendingCoffeeShop[] = []
      for (let page = 0; page < 20; page++) {
        const res = await adminApi.pendingShops({ page, size: 100 }, signal)
        all.push(...res.content)
        if (res.last) break
      }
      return all
    },
  })
}

// Menu, hours and facilities of one pending café, for the admin review.
export function usePendingShopDetails(id: number) {
  return useQuery({
    queryKey: ['admin', 'pending-shop', id],
    queryFn: ({ signal }) => adminApi.pendingShop(id, signal),
    staleTime: 30_000,
    // 404 means it was approved or denied meanwhile: retrying won't help
    retry: (count, error) => !(error instanceof ApiError && error.isNotFound) && count < 2,
  })
}

export function useRejectShop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.rejectShop(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'pending-shops'] }),
  })
}

export function useApproveShop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => coffeeShopsApi.approve(id),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['shops'] }),
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
      ]),
  })
}
