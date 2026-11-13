import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { coffeeShopsApi, loyaltyApi, merchantApi, vouchersApi } from '../api'
import type {
  AwardPointsRequest,
  CoffeeShopDetails,
  CoffeeShopRequest,
  CoffeeShopUpdateRequest,
  MenuItemRequest,
  OperatingHoursRequest,
} from '../api/types'
import { qk } from './queryClient'

const MY_SHOPS = ['merchant', 'shops'] as const
const myShop = (id: number) => ['merchant', 'shop', id] as const

export function useMyShops() {
  return useQuery({
    queryKey: MY_SHOPS,
    queryFn: ({ signal }) => merchantApi.myShops(signal),
  })
}

export function useMyShop(id: number) {
  return useQuery({
    queryKey: myShop(id),
    queryFn: ({ signal }) => merchantApi.getShop(id, signal),
    enabled: Number.isFinite(id),
    retry: false,
  })
}

export function useFacilities() {
  return useQuery({
    queryKey: ['merchant', 'facilities'],
    queryFn: ({ signal }) => merchantApi.facilities(signal),
    staleTime: Infinity,
  })
}

export function useAwardPoints() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AwardPointsRequest) => loyaltyApi.awardPoints(body),
    // Admin dashboards and ledgers are stale now
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })
}

export function useRedeemVoucher() {
  return useMutation({
    mutationFn: (code: string) => vouchersApi.redeem(code),
  })
}

export function useCreateShop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CoffeeShopRequest) => coffeeShopsApi.create(body),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: MY_SHOPS }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'pending-shops'] }),
      ]),
  })
}

// After any edit: store the fresh details and refresh the lists and public views that show this café.
function useShopEdited(id: number) {
  const queryClient = useQueryClient()
  return (details?: CoffeeShopDetails) => {
    if (details) queryClient.setQueryData(myShop(id), details)
    return Promise.all([
      details ? null : queryClient.invalidateQueries({ queryKey: myShop(id) }),
      queryClient.invalidateQueries({ queryKey: MY_SHOPS }),
      queryClient.invalidateQueries({ queryKey: qk.shop(id) }),
      queryClient.invalidateQueries({ queryKey: ['shops', 'nearby'] }),
    ])
  }
}

export function useUpdateShop(id: number) {
  const edited = useShopEdited(id)
  return useMutation({
    mutationFn: (body: CoffeeShopUpdateRequest) => merchantApi.updateShop(id, body),
    onSuccess: (details) => edited(details),
  })
}

export function useSaveMenuItem(shopId: number) {
  const edited = useShopEdited(shopId)
  return useMutation({
    mutationFn: ({ itemId, item }: { itemId?: number; item: MenuItemRequest }) =>
      itemId == null
        ? coffeeShopsApi.addMenuItem(shopId, item)
        : coffeeShopsApi.updateMenuItem(shopId, itemId, item),
    onSuccess: (details) => edited(details),
  })
}

export function useRemoveMenuItem(shopId: number) {
  const edited = useShopEdited(shopId)
  return useMutation({
    mutationFn: (itemId: number) => coffeeShopsApi.removeMenuItem(shopId, itemId),
    onSuccess: () => edited(),
  })
}

export function useUpdateSchedule(shopId: number) {
  const edited = useShopEdited(shopId)
  return useMutation({
    mutationFn: (schedule: OperatingHoursRequest[]) => coffeeShopsApi.updateSchedule(shopId, schedule),
    onSuccess: () => edited(),
  })
}
