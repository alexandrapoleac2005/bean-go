import { ROLES, type Role } from '../api/types'

// What JwtService.generateToken puts in the token today: sub (email), iat, exp.
// userId and role are read if the backend starts adding them as extra claims;
// until then they stay null.
export interface TokenClaims {
  email: string
  issuedAt: number // ms epoch
  expiresAt: number // ms epoch
  userId: number | null
  role: Role | null
}

interface RawClaims {
  sub?: string
  iat?: number
  exp?: number
  userId?: number | string
  id?: number | string
  role?: string
  roles?: string[]
  authorities?: string[]
}

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function toRole(value: string | undefined): Role | null {
  if (!value) return null
  const name = value.replace(/^ROLE_/, '').toUpperCase()
  return (ROLES as readonly string[]).includes(name) ? (name as Role) : null
}

// Decodes without verifying the signature. That's fine: the server verifies on every request.
export function decodeToken(token: string): TokenClaims | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const raw = JSON.parse(base64UrlDecode(payload)) as RawClaims
    if (!raw.sub || !raw.exp) return null

    const rawId = raw.userId ?? raw.id
    const userId = rawId === undefined ? null : Number(rawId)
    const role = toRole(raw.role) ?? toRole(raw.roles?.[0]) ?? toRole(raw.authorities?.[0])

    return {
      email: raw.sub,
      issuedAt: (raw.iat ?? 0) * 1000,
      expiresAt: raw.exp * 1000,
      userId: Number.isFinite(userId) ? userId : null,
      role,
    }
  } catch {
    return null
  }
}

// Treat a token as expired a little early so requests don't race the deadline.
const EXPIRY_SKEW_MS = 30_000

export function isExpired(claims: TokenClaims, now = Date.now()) {
  return claims.expiresAt - EXPIRY_SKEW_MS <= now
}
