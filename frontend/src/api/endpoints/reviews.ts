import { getPage, http } from '../client'
import type { PageParams, Review, ReviewRequest } from '../types'

// ReviewController
export const reviewsApi = {
  // Public. size 1..50
  forShop: (coffeeShopId: number, { page = 0, size = 10 }: PageParams = {}, signal?: AbortSignal) =>
    getPage<Review>(`/api/v1/coffee-shops/${coffeeShopId}/reviews`, { query: { page, size }, signal }),

  // USER. 201, no body. 409 if the user already reviewed this shop.
  create: (coffeeShopId: number, body: ReviewRequest) =>
    http.post<void>(`/api/v1/coffee-shops/${coffeeShopId}/reviews`, body),

  // Authenticated (any role)
  forUser: (userId: number, { page = 0, size = 10 }: PageParams = {}, signal?: AbortSignal) =>
    getPage<Review>(`/api/v1/users/${userId}/reviews`, { query: { page, size }, signal }),

  // USER
  mine: ({ page = 0, size = 10 }: PageParams = {}, signal?: AbortSignal) =>
    getPage<Review>('/api/v1/reviews/me', { query: { page, size }, signal }),

  // USER or MERCHANT, author only. 204.
  remove: (reviewId: number) => http.delete(`/api/v1/reviews/${reviewId}`),
}
