import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, onUnauthorized, tokenStore } from '../api'
import type { LoginRequest, RegisterRequest, Role } from '../api/types'
import { AuthContext, type AuthContextValue, type AuthState } from './context'
import { decodeToken, isExpired, type TokenClaims } from './jwt'
import { probeRole, roleCache } from './roleProbe'

const anonymous = (signedOutReason: string | null = null): AuthState => ({
  status: 'anonymous',
  token: null,
  email: null,
  userId: null,
  role: null,
  roleStatus: 'none',
  expiresAt: null,
  signedOutReason,
})

const fromClaims = (token: string, claims: TokenClaims, knownRole: Role | null = null): AuthState => {
  const role = claims.role ?? knownRole ?? roleCache.get(token)
  return {
    status: 'authenticated',
    token,
    email: claims.email,
    userId: claims.userId,
    role,
    roleStatus: role ? 'resolved' : 'resolving',
    expiresAt: claims.expiresAt,
    signedOutReason: null,
  }
}

function restore(): AuthState {
  const token = tokenStore.get()
  if (!token) return anonymous()
  const claims = decodeToken(token)
  if (!claims || isExpired(claims)) {
    tokenStore.clear()
    roleCache.clear()
    return anonymous(claims ? 'Your session expired. Please sign in again.' : null)
  }
  return fromClaims(token, claims)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<AuthState>(restore)

  const accept = useCallback((token: string, knownRole: Role | null = null) => {
    const claims = decodeToken(token)
    if (!claims) throw new Error('The server returned an unreadable token.')
    tokenStore.set(token)
    const next = fromClaims(token, claims, knownRole)
    if (next.role) roleCache.set(token, next.role)
    setState(next)
  }, [])

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const { token } = await authApi.login({ ...credentials, email: credentials.email.trim() })
      accept(token)
    },
    [accept],
  )

  const register = useCallback(
    async (details: RegisterRequest) => {
      const { token } = await authApi.register({
        ...details,
        firstName: details.firstName.trim(),
        lastName: details.lastName.trim(),
        email: details.email.trim(),
      })
      // AuthService.register always creates Role.USER
      accept(token, 'USER')
    },
    [accept],
  )

  const logout = useCallback(
    (reason?: string) => {
      tokenStore.clear()
      roleCache.clear()
      // Drop per-user cached data (favorites etc.), keep public shop data.
      queryClient.removeQueries({ queryKey: ['me'] })
      setState(anonymous(reason ?? null))
    },
    [queryClient],
  )

  // Work out the role when the token doesn't say.
  useEffect(() => {
    if (state.roleStatus !== 'resolving' || !state.token) return
    const token = state.token
    let cancelled = false
    probeRole().then((role) => {
      if (cancelled) return
      if (role) roleCache.set(token, role)
      setState((s) => (s.token === token ? { ...s, role, roleStatus: role ? 'resolved' : 'failed' } : s))
    })
    return () => {
      cancelled = true
    }
  }, [state.token, state.roleStatus])

  // Any 401 on an authenticated request ends the session.
  useEffect(() => onUnauthorized((message) => logout(message)), [logout])

  // Sign out on expiry instead of waiting for the next failing request.
  useEffect(() => {
    if (!state.expiresAt) return
    const ms = state.expiresAt - Date.now() - 30_000
    const timer = window.setTimeout(
      () => logout('Your session expired. Please sign in again.'),
      Math.min(Math.max(ms, 0), 2_147_483_647), // setTimeout max delay
    )
    return () => window.clearTimeout(timer)
  }, [state.expiresAt, logout])

  // Keep tabs in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'beango.token') setState(restore())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const hasRole = useCallback(
    (...roles: Role[]) => state.role !== null && roles.includes(state.role),
    [state.role],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: state.status === 'authenticated',
      login,
      register,
      logout,
      hasRole,
    }),
    [state, login, register, logout, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
