import L from 'leaflet'
import { formatRating } from '../../lib/format'
import type { ExploreShop } from './types'

export type PinState = 'idle' | 'hover' | 'active'

const cache = new Map<string, L.DivIcon>()

// Pill-shaped pin: status dot + live rating. Styles live in styles/index.css (.bean-pin).
// Icons are cached by their visual key so re-renders don't rebuild DOM.
export function shopPin(shop: ExploreShop, state: PinState): L.DivIcon {
  const loading = !shop.details
  const rating = loading ? '···' : formatRating(shop.details!.averageRating)
  const status = loading ? 'loading' : shop.open.kind
  const key = `${rating}|${status}|${state}`

  let icon = cache.get(key)
  if (!icon) {
    const classes = ['bean-pin', `bean-pin--${status}`, state !== 'idle' && `bean-pin--${state}`]
      .filter(Boolean)
      .join(' ')
    icon = L.divIcon({
      className: 'bean-marker',
      iconSize: [56, 32],
      iconAnchor: [28, 32],
      html: `<div class="${classes}">
        <span class="bean-pin__body"><span class="bean-pin__dot"></span><span class="bean-pin__rating">${rating}</span></span>
        <span class="bean-pin__tail"></span>
      </div>`,
    })
    cache.set(key, icon)
  }
  return icon
}

export const userPin = L.divIcon({
  className: 'bean-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  html: '<div class="bean-me"></div>',
})
