// TypeScript mirrors of the backend DTOs (backend/src/main/java/com/cafe/bean_go/dtos).
//
// Java -> JSON conventions used here:
//   Long / Integer / Double / BigDecimal  -> number
//   LocalDateTime                          -> IsoDateTime  "2026-11-05T14:03:22.123" (no zone, server local time)
//   LocalTime                              -> IsoTime      "07:30:00"
//   DayOfWeek                              -> DayOfWeek    "MONDAY"
// Fields Lombok can leave null are typed `| null`.

export type IsoDateTime = string
export type IsoTime = string

// ---------- Enums (entities/enums) ----------

export const ROLES = ['USER', 'MERCHANT', 'ADMIN'] as const
export type Role = (typeof ROLES)[number]

export const USER_BADGES = ['ROOKIE', 'COFFEE_LOVER', 'CAFFEINE_ADDICT', 'BEAN_MASTER'] as const
export type UserBadge = (typeof USER_BADGES)[number]

// UserBadge.requiredPoints
export const BADGE_THRESHOLDS: Record<UserBadge, number> = {
  ROOKIE: 0,
  COFFEE_LOVER: 500,
  CAFFEINE_ADDICT: 1500,
  BEAN_MASTER: 3000,
}

export type VoucherStatus = 'ACTIVE' | 'USED'

export const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]

// ---------- Loyalty rules (application.properties + LoyaltyPointService) ----------

export const LOYALTY_RULES = {
  pointsForVoucher: 50,
  maxActiveVouchersPerShop: 3,
  voucherDiscountPercentage: 10,
  voucherValidityMonths: 3,
  maxPointsPerTransaction: 1000,
} as const

// ---------- Errors (dtos/errors) ----------

export interface ApiErrorResponse {
  timestamp: IsoDateTime
  status: number
  error: string
  // Validation errors are joined as "field: message, field: message"
  message: string
  path: string
}

// ---------- Pagination (Spring Data Page<T>) ----------

// Normalized shape the API layer always returns, whichever way Spring serializes Page.
export interface Page<T> {
  content: T[]
  page: number // zero-based
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface PageParams {
  page?: number // >= 0, default 0
  size?: number // 1..50 (1..100 for admin), default 10 (20 for admin)
}

// ---------- Auth (dtos/auth) ----------

export interface LoginRequest {
  email: string // @Email @NotBlank
  password: string // @NotBlank
}

export interface RegisterRequest {
  firstName: string // @NotBlank, max 255
  lastName: string // @NotBlank, max 255
  email: string // @Email @NotBlank, max 255
  password: string // 6..72 chars
}

export interface AuthResponse {
  token: string
}

// ---------- Coffee shops (dtos/coffeeshop) ----------

export interface CoffeeShopSummary {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
}

export interface CoffeeShopDetails {
  id: number
  name: string
  description: string | null
  address: string
  contactEmail?: string | null
  contactPhone?: string | null
  averageRating: number | null
  reviewCount: number | null
  latitude: number
  longitude: number
  facilities: Facility[]
  menu: MenuItem[]
  schedule: OperatingHours[]
}

export interface CoffeeShopRequest {
  name: string // 2..100
  address: string // @NotBlank, max 255
  description?: string // max 500
  contactPhone?: string // optional, /^\+?[0-9. ()-]{7,15}$/
  contactEmail: string // @Email @NotBlank, max 255
  lat: number // -90..90  (note: request uses lat/lng, responses use latitude/longitude)
  lng: number // -180..180
}

// PUT /merchant/coffee-shops/{id} (CoffeeShopUpdateRequestDTO): replaces details and facilities
export interface CoffeeShopUpdateRequest extends CoffeeShopRequest {
  facilityIds: number[]
}

export interface NearbyParams {
  lat: number // -90..90
  lng: number // -180..180
  radius?: number // meters, default 5000, clamped server-side to 1..50000
}

// ---------- Facilities (dtos/facility) ----------

export interface Facility {
  id: number
  name: string
  icon: string | null
}

// ---------- Menu (dtos/menu) ----------

export interface MenuItem {
  id: number
  category: string
  name: string
  price: number // BigDecimal, 2 decimals
  description: string | null
}

export interface MenuItemRequest {
  category: string // @NotBlank, max 100
  name: string // @NotBlank, max 255
  price: number // > 0, up to 8 integer digits + 2 decimals
  description?: string // max 1000
}

// ---------- Schedule (dtos/schedule) ----------

export interface OperatingHours {
  dayOfWeek: DayOfWeek
  openTime: IsoTime
  closeTime: IsoTime
}

export type OperatingHoursRequest = OperatingHours

// ---------- Reviews (dtos/review) ----------

export interface ReviewRequest {
  rating: number // integer 1..5
  comment?: string // max 1000
}

// @JsonInclude(NON_NULL): absent fields are omitted, not null.
export interface Review {
  id: number
  rating: number
  comment?: string
  createdAt: IsoDateTime
  userFirstName?: string
  userLastName?: string
  coffeeShopName?: string
}

// ---------- Favorites (dtos/favorite) ----------

export interface Favorite {
  id: number // favorite id: use this to DELETE
  coffeeShopId: number
  coffeeShopName: string
  coffeeShopAddress: string
}

// ---------- Loyalty (dtos/loyalty) ----------

export interface LoyaltyWallet {
  coffeeShopId: number
  coffeeShopName: string
  points: number
}

// Identify the customer by userId or customerEmail (one is required).
export interface AwardPointsRequest {
  userId?: number
  customerEmail?: string
  coffeeShopId: number
  pointsToAdd: number // 1..1000
}

// POST /loyalty-points/transactions response (PointsAwardResponseDTO)
export interface PointsAwardResult {
  customerName: string
  customerEmail: string
  coffeeShopName: string
  pointsAdded: number
  walletPoints: number // left in this café's wallet after vouchers were issued
  vouchersIssued: number
}

// GET /merchant/coffee-shops (MerchantCoffeeShopResponseDTO)
export interface MerchantShop {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  approved: boolean
}

export interface PointTransaction {
  id: number
  createdAt: IsoDateTime
  points: number
  merchantId: number
  merchantName?: string | null // "First Last"; missing on older backends
  merchantEmail: string
  customerId: number
  customerName?: string | null
  customerEmail: string
  coffeeShopId: number
  coffeeShopName: string
}

// GET /admin/coffee-shops/pending (PendingCoffeeShopResponseDTO)
export interface PendingCoffeeShop {
  id: number
  name: string
  address: string
  description: string | null
  latitude: number
  longitude: number
  contactEmail: string | null
  contactPhone: string | null
  merchantId: number
  merchantName: string | null
  merchantEmail: string
}

export interface PointTransactionFilters extends PageParams {
  merchantId?: number
  customerId?: number
  coffeeShopId?: number
  from?: IsoDateTime // ISO local date-time, e.g. "2026-11-01T00:00:00"
  to?: IsoDateTime
}

// ---------- Vouchers (dtos/voucher) ----------

export interface Voucher {
  id: number
  code: string // 10 chars from ABCDEFGHJKMNPQRSTUVWXYZ23456789
  coffeeShopName: string
  status: VoucherStatus
  generatedAt: IsoDateTime
  expiresAt: IsoDateTime | null
  discountPercentage: number
}

export interface VoucherRedeemRequest {
  code: string // @NotBlank, max 16; server trims + uppercases
}

// ---------- Users (dtos/user) ----------

export interface UserProfile {
  id: number
  firstName: string
  lastName: string
  email: string
  lifetimePoints: number
  badge: UserBadge
}

// ---------- Proposed (not in the Spring backend yet) ----------

// GET /api/v1/admin/vouchers/stats — voucher counts by status. The dashboard
// calls it and shows a "needs endpoint" state while the backend answers 404.
export interface VoucherStats {
  issued: number
  active: number
  used: number
  expired: number
}
