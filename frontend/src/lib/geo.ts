import { isDemoOn } from '../demo/config'

export interface LatLng {
  lat: number
  lng: number
}

// Great-circle distance in meters. The nearby endpoint doesn't return distances,
// so the UI computes them from the user's position.
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6_371_000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Cluj-Napoca city centre (Piața Unirii), used when location access is denied.
export const DEFAULT_CENTER: LatLng = { lat: 46.7709, lng: 23.5899 }

export function getCurrentPosition(options?: PositionOptions): Promise<LatLng> {
  // Demo data is seeded around central Cluj-Napoca: stand there instead of the real location
  if (isDemoOn()) return Promise.resolve({ lat: 46.7709, lng: 23.5899 })
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not available in this browser.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000, ...options },
    )
  })
}
