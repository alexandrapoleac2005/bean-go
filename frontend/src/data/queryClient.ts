import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // Don't retry client errors (404, 403...), only network / 5xx, twice.
      retry: (count, error) =>
        count < 2 && (!(error instanceof ApiError) || error.status === 0 || error.status >= 500),
    },
  },
})

// Keys under ['me'] are per-user and get dropped on sign-out.
export const qk = {
  nearby: (lat: number, lng: number, radius: number) => ['shops', 'nearby', lat, lng, radius] as const,
  shop: (id: number) => ['shops', 'detail', id] as const,
  reviews: (shopId: number) => ['shops', 'reviews', shopId] as const,
  favorites: () => ['me', 'favorites'] as const,
  loyalty: (userId: number | null) => ['me', 'loyalty', userId ?? 'unknown'] as const,
}
