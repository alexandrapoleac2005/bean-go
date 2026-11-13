import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query'
import { coffeeShopsApi } from '../api'
import type { CoffeeShopDetails } from '../api/types'
import { qk } from './queryClient'

// Coordinates are rounded so tiny map drags reuse the cache (~11 m precision).
const round = (n: number) => Math.round(n * 1e4) / 1e4

export function useNearbyShops(center: { lat: number; lng: number } | null, radius: number) {
  const lat = center ? round(center.lat) : 0
  const lng = center ? round(center.lng) : 0
  return useQuery({
    queryKey: qk.nearby(lat, lng, radius),
    queryFn: ({ signal }) => coffeeShopsApi.nearby({ lat, lng, radius }, signal),
    enabled: center !== null,
    placeholderData: keepPreviousData, // keep pins on screen while the radius changes
  })
}

export function useShopDetails(id: number | null) {
  return useQuery({
    queryKey: qk.shop(id ?? -1),
    queryFn: ({ signal }) => coffeeShopsApi.get(id!, signal),
    enabled: id !== null,
    staleTime: 5 * 60_000,
  })
}

// /nearby only returns id, name, address and coordinates. Rating, schedule and
// facilities come from the details endpoint, fetched per shop (max 50) and cached,
// so pins and cards fill in progressively.
export function useShopDetailsMap(ids: number[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: qk.shop(id),
      queryFn: ({ signal }: { signal: AbortSignal }) => coffeeShopsApi.get(id, signal),
      staleTime: 5 * 60_000,
    })),
    combine: (results) => {
      const map = new Map<number, CoffeeShopDetails>()
      results.forEach((r) => {
        if (r.data) map.set(r.data.id, r.data)
      })
      return { details: map, loading: results.some((r) => r.isPending) }
    },
  })
}
