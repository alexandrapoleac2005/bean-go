import type { CoffeeShopDetails, CoffeeShopSummary } from '../../api/types'
import type { OpenState } from '../../lib/schedule'

// A /nearby result plus whatever we know from its details call.
export interface ExploreShop {
  summary: CoffeeShopSummary
  details: CoffeeShopDetails | undefined // undefined while loading
  distance: number // meters from the user (or the search centre if location is unknown)
  open: OpenState
}

export const RADIUS_STOPS = [500, 1000, 2000, 5000, 10_000, 25_000, 50_000] as const
export const DEFAULT_RADIUS = 2000
