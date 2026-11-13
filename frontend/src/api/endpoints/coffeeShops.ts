import { getPage, http } from '../client'
import type {
  CoffeeShopDetails,
  CoffeeShopRequest,
  CoffeeShopSummary,
  MenuItemRequest,
  NearbyParams,
  OperatingHours,
  OperatingHoursRequest,
  PageParams,
} from '../types'

const BASE = '/api/v1/coffee-shops'

// CoffeeShopController. All GETs under /api/v1/coffee-shops/** are public.
// Only approved shops are returned by the public reads.
export const coffeeShopsApi = {
  // size 1..50, default 10
  list: ({ page = 0, size = 10 }: PageParams = {}, signal?: AbortSignal) =>
    getPage<CoffeeShopSummary>(BASE, { query: { page, size }, signal }),

  get: (id: number, signal?: AbortSignal) => http.get<CoffeeShopDetails>(`${BASE}/${id}`, { signal }),

  // radius in meters, server clamps to 1..50000; not paginated
  nearby: ({ lat, lng, radius }: NearbyParams, signal?: AbortSignal) =>
    http.get<CoffeeShopSummary[]>(`${BASE}/nearby`, { query: { lat, lng, radius }, signal }),

  // MERCHANT. 201. New shops start unapproved until an ADMIN approves them.
  create: (body: CoffeeShopRequest) => http.post<CoffeeShopDetails>(BASE, body),

  // ADMIN. 204.
  approve: (id: number) => http.patch<void>(`${BASE}/${id}/approve`),

  // MERCHANT, owner only. Replaces the whole weekly schedule. 400 on invalid schedule.
  updateSchedule: (id: number, schedule: OperatingHoursRequest[]) =>
    http.put<OperatingHours[]>(`${BASE}/${id}/schedule`, schedule),

  // MERCHANT, owner only. Menu writes return the full updated shop.
  addMenuItem: (shopId: number, item: MenuItemRequest) =>
    http.post<CoffeeShopDetails>(`${BASE}/${shopId}/menu`, item),

  updateMenuItem: (shopId: number, itemId: number, item: MenuItemRequest) =>
    http.put<CoffeeShopDetails>(`${BASE}/${shopId}/menu/${itemId}`, item),

  removeMenuItem: (shopId: number, itemId: number) => http.delete(`${BASE}/${shopId}/menu/${itemId}`),
}
