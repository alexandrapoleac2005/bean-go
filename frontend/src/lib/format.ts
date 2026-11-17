import type { DayOfWeek, IsoDateTime, IsoTime, Role, UserBadge } from '../api/types'

export const ROLE_LABEL: Record<Role, string> = {
  USER: 'Customer',
  MERCHANT: 'Merchant',
  ADMIN: 'Admin',
}

// Distance in meters -> "350 m" / "1.4 km"
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)} km`
}

// 46.7709, 23.5899 -> "46.7709° N, 23.5899° E"
export function formatCoordinates(lat: number, lng: number, digits = 4): string {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(digits)}° ${ns}, ${Math.abs(lng).toFixed(digits)}° ${ew}`
}

export function formatRating(rating: number | null | undefined): string {
  return rating == null || rating === 0 ? '—' : rating.toFixed(1)
}

const pointsFormatter = new Intl.NumberFormat('en-US')
export const formatPoints = (points: number) => pointsFormatter.format(points)

const priceFormatter = new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' })
export const formatPrice = (price: number) => priceFormatter.format(price)

// "ABCDE23456" -> "ABCDE 23456" for reading aloud at the counter
export function formatVoucherCode(code: string): string {
  return code.length === 10 ? `${code.slice(0, 5)} ${code.slice(5)}` : code
}

// "07:30:00" -> "07:30"
export const formatTime = (time: IsoTime) => time.slice(0, 5)

// The backend sends LocalDateTime without a zone; the browser reads it as local time.
export const parseDateTime = (value: IsoDateTime) => new Date(value)

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
export const formatDate = (value: IsoDateTime) => dateFormatter.format(parseDateTime(value))

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})
export const formatDateTime = (value: IsoDateTime) => dateTimeFormatter.format(parseDateTime(value))

export const DAY_LABEL: Record<DayOfWeek, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
}

export const BADGE_LABEL: Record<UserBadge, string> = {
  ROOKIE: 'Rookie',
  COFFEE_LOVER: 'Coffee Lover',
  CAFFEINE_ADDICT: 'Caffeine Addict',
  BEAN_MASTER: 'Bean Master',
}
