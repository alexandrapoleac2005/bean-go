import { createContext } from 'react'
import type { LoginRequest, RegisterRequest, Role } from '../api/types'

// Stateless JWT auth, matching SecurityConfig:
//   - POST /api/auth/login | /register returns { token }
//   - every protected call sends "Authorization: Bearer <token>"
//   - no refresh endpoint: an expired token (24h by default) means signing in again
export interface AuthState {
  status: 'anonymous' | 'authenticated'
  token: string | null
  email: string | null
  userId: number | null // null until the backend adds a userId claim
  role: Role | null
  // 'resolving' while the role is being worked out (see roleProbe.ts)
  roleStatus: 'none' | 'resolving' | 'resolved' | 'failed'
  expiresAt: number | null
  // Why the last session ended, e.g. "The token has expired. Please log in again."
  signedOutReason: string | null
}

export interface AuthContextValue extends AuthState {
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (details: RegisterRequest) => Promise<void>
  logout: (reason?: string) => void
  // True if the user has any of the roles. Unknown role => false.
  hasRole: (...roles: Role[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
