import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from '../api'
import type { Review, ReviewRequest } from '../api/types'
import { qk } from './queryClient'

const PAGE_SIZE = 50
const MAX_PAGES = 10

export interface ShopReviews {
  reviews: Review[] // newest first (server sorts by createdAt DESC)
  total: number
  complete: boolean // false if there were more than we fetched
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>
}

// Loads up to 500 reviews so the rating breakdown is computed from real data.
// (The backend only exposes the average and count, not a histogram.)
async function fetchShopReviews(shopId: number, signal: AbortSignal): Promise<ShopReviews> {
  const reviews: Review[] = []
  let total = 0
  let complete = false
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await reviewsApi.forShop(shopId, { page, size: PAGE_SIZE }, signal)
    reviews.push(...res.content)
    total = res.totalElements
    if (res.last) {
      complete = true
      break
    }
  }
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5
    breakdown[star]++
  }
  return { reviews, total, complete, breakdown }
}

export function useShopReviews(shopId: number | null) {
  return useQuery({
    queryKey: qk.reviews(shopId ?? -1),
    queryFn: ({ signal }) => fetchShopReviews(shopId!, signal),
    enabled: shopId !== null,
  })
}

export function useSubmitReview(shopId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ReviewRequest) => reviewsApi.create(shopId, body),
    // averageRating / reviewCount are recalculated server-side, so refresh both.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.reviews(shopId) }),
        queryClient.invalidateQueries({ queryKey: qk.shop(shopId) }),
      ]),
  })
}
