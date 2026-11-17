import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { loyaltyApi, usersApi, vouchersApi } from '../../../api'
import { useAuth } from '../../../auth/useAuth'
import { qk } from '../../../data/queryClient'
import { reconcile, type Activity, type LoyaltySnapshot } from './reconcile'
import { rewardsStore, useRewardsState } from './store'

// Profile, wallets and vouchers are read together so one sync is one consistent
// snapshot. That matters: a purchase moves points out of a wallet and into a
// voucher at the same moment, and the earned-points maths needs both sides.
async function fetchSnapshot(userId: number | null, signal: AbortSignal): Promise<LoyaltySnapshot> {
  const [profile, wallets, vouchers] = await Promise.all([
    userId !== null ? usersApi.profile(userId, signal) : Promise.resolve(null),
    userId !== null ? loyaltyApi.wallets(userId, signal) : Promise.resolve(null),
    vouchersApi.active(signal),
  ])
  return { profile, wallets, vouchers, fetchedAt: Date.now() }
}

export const SYNC_INTERVAL = { idle: 30_000, live: 4_000 } as const

interface Options {
  // Poll fast while a voucher is shown at the counter
  live?: boolean
  onEvents?: (events: Activity[]) => void
}

// Keeps the rewards view in step with the backend: polls (fast while presenting a
// voucher), refetches on tab focus, and folds every snapshot into the stored state.
export function useRewardsSync({ live = false, onEvents }: Options = {}) {
  const { email, userId, isAuthenticated } = useAuth()

  const query = useQuery({
    queryKey: qk.loyalty(userId),
    queryFn: ({ signal }) => fetchSnapshot(userId, signal),
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: live ? SYNC_INTERVAL.live : SYNC_INTERVAL.idle,
    refetchIntervalInBackground: false,
  })

  const onEventsRef = useRef(onEvents)
  useEffect(() => {
    onEventsRef.current = onEvents
  })

  useEffect(() => {
    if (!query.data || !email) return
    const { state, events } = reconcile(rewardsStore.get(email), query.data)
    rewardsStore.set(email, state)
    if (events.length) onEventsRef.current?.(events)
  }, [query.data, email])

  return {
    state: useRewardsState(email),
    snapshot: query.data,
    isFetching: query.isFetching,
    error: query.error,
    lastSyncedAt: query.dataUpdatedAt || null,
    refresh: () => query.refetch(),
    identityKnown: userId !== null,
  }
}
