import { http } from '../client'
import type { CoffeeShopDetails, CoffeeShopUpdateRequest, Facility, MerchantShop } from '../types'

const BASE = '/api/v1/merchant'

// MerchantController — every route requires MERCHANT.
export const merchantApi = {
  // The logged-in merchant's cafés, approved or waiting for approval.
  myShops: (signal?: AbortSignal) => http.get<MerchantShop[]>(`${BASE}/coffee-shops`, { signal }),

  // One of the merchant's own cafés with full details. 403 if it belongs to someone else.
  getShop: (id: number, signal?: AbortSignal) => http.get<CoffeeShopDetails>(`${BASE}/coffee-shops/${id}`, { signal }),

  // Replaces name, address, contact, location and facilities. 404 on an unknown facility id.
  updateShop: (id: number, body: CoffeeShopUpdateRequest) =>
    http.put<CoffeeShopDetails>(`${BASE}/coffee-shops/${id}`, body),

  // Every facility a café can offer, sorted by name.
  facilities: (signal?: AbortSignal) => http.get<Facility[]>(`${BASE}/facilities`, { signal }),
}
