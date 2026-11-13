import { useSyncExternalStore } from 'react'
import { emptyRewardsState, type RewardsState } from './reconcile'

// Per-user rewards state saved in localStorage (voucher history, claims, activity).
// Keyed by email so two accounts on one device don't mix.
const PREFIX = 'beango.rewards.'
const VERSION = 1

const cache = new Map<string, RewardsState>()
const listeners = new Set<() => void>()
const EMPTY = emptyRewardsState()

const keyFor = (email: string) => `${PREFIX}${email.toLowerCase()}`

export const rewardsStore = {
  get(email: string): RewardsState {
    const key = keyFor(email)
    const hit = cache.get(key)
    if (hit) return hit
    let state = emptyRewardsState()
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw) as { v: number; state: RewardsState }
        if (parsed.v === VERSION) state = parsed.state
      }
    } catch {
      // corrupt entry: start over
    }
    cache.set(key, state)
    return state
  },

  set(email: string, state: RewardsState) {
    const key = keyFor(email)
    if (cache.get(key) === state) return
    cache.set(key, state)
    try {
      localStorage.setItem(key, JSON.stringify({ v: VERSION, state }))
    } catch {
      // storage full or blocked: keep the in-memory copy
    }
    listeners.forEach((l) => l())
  },

  update(email: string, fn: (s: RewardsState) => RewardsState) {
    this.set(email, fn(this.get(email)))
  },

  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

// Other tabs write to localStorage too: drop the cache so we re-read.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key?.startsWith(PREFIX)) {
      cache.delete(e.key)
      listeners.forEach((l) => l())
    }
  })
}

export function useRewardsState(email: string | null): RewardsState {
  return useSyncExternalStore(
    (l) => rewardsStore.subscribe(l),
    () => (email ? rewardsStore.get(email) : EMPTY),
  )
}
