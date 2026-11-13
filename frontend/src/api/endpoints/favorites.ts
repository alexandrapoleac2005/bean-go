import { getPage, http } from '../client'
import type { Favorite, PageParams } from '../types'

// FavoriteController
export const favoritesApi = {
  // Authenticated. size 1..50
  list: ({ page = 0, size = 10 }: PageParams = {}, signal?: AbortSignal) =>
    getPage<Favorite>('/api/v1/favorites', { query: { page, size }, signal }),

  // USER. Takes the coffee shop id. 201, no body. 409 if already a favorite.
  add: (coffeeShopId: number) => http.post<void>(`/api/v1/favorites/${coffeeShopId}`),

  // Authenticated, owner only. Takes the FAVORITE id (Favorite.id), not the shop id. 204.
  remove: (favoriteId: number) => http.delete(`/api/v1/favorites/${favoriteId}`),
}
