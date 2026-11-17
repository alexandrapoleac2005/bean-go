import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, favoritesApi } from '../api'
import type { Favorite } from '../api/types'
import { useAuth } from '../auth/useAuth'
import { qk } from './queryClient'

const MAX_PAGES = 20 // 20 × 50 = 1000 favorites, plenty

async function fetchAllFavorites(signal: AbortSignal): Promise<Favorite[]> {
  const all: Favorite[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await favoritesApi.list({ page, size: 50 }, signal)
    all.push(...res.content)
    if (res.last) break
  }
  return all
}

// POST /favorites/{shopId} adds, but DELETE needs the favorite's own id,
// so the full list is kept and indexed by shop id.
export function useFavorites() {
  const { isAuthenticated, role } = useAuth()
  const query = useQuery({
    queryKey: qk.favorites(),
    queryFn: ({ signal }) => fetchAllFavorites(signal),
    enabled: isAuthenticated,
  })
  const byShop = new Map<number, number>((query.data ?? []).map((f) => [f.coffeeShopId, f.id]))
  return {
    ...query,
    byShop,
    // Only USER may add favorites (FavoriteController @PreAuthorize)
    canFavorite: isAuthenticated && (role === 'USER' || role === null),
  }
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ shopId, favoriteId }: { shopId: number; favoriteId: number | undefined }) => {
      if (favoriteId !== undefined) {
        await favoritesApi.remove(favoriteId)
        return
      }
      try {
        await favoritesApi.add(shopId)
      } catch (err) {
        // 409: already saved (e.g. from another tab). Treat as success; the refetch fixes the state.
        if (!(err instanceof ApiError && err.isConflict)) throw err
      }
    },
    // Optimistic: flip the heart immediately, roll back on error.
    onMutate: async ({ shopId, favoriteId }) => {
      await queryClient.cancelQueries({ queryKey: qk.favorites() })
      const previous = queryClient.getQueryData<Favorite[]>(qk.favorites())
      queryClient.setQueryData<Favorite[]>(qk.favorites(), (list = []) =>
        favoriteId !== undefined
          ? list.filter((f) => f.id !== favoriteId)
          : [...list, { id: -shopId, coffeeShopId: shopId, coffeeShopName: '', coffeeShopAddress: '' }],
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(qk.favorites(), ctx.previous)
    },
    // The add endpoint returns no body, so refetch to learn the new favorite id.
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.favorites() }),
  })
}
