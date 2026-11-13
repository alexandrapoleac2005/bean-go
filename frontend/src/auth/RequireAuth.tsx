import { LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import type { Role } from '../api/types'
import { ForbiddenView } from './ForbiddenView'
import { useAuth } from './useAuth'

interface Props {
  children: ReactNode
  // If set, the user needs one of these roles (mirrors the backend @PreAuthorize rules).
  roles?: Role[]
}

// Route guard. Anonymous -> /login (and back here afterwards).
// Wrong role -> forbidden view. The server still enforces every rule; this is UX.
export function RequireAuth({ children, roles }: Props) {
  const { isAuthenticated, role, roleStatus } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  if (roles) {
    if (roleStatus === 'resolving') return <GuardPending />
    if (!role || !roles.includes(role)) return <ForbiddenView required={roles} />
  }
  return <>{children}</>
}

// Keeps signed-in users away from /login and /register.
export function RequireGuest({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  return isAuthenticated ? <Navigate to={from} replace /> : <>{children}</>
}

function GuardPending() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center gap-3 text-muted">
      <LoaderCircle className="size-4 animate-spin" />
      <span className="eyebrow">Checking your access</span>
    </div>
  )
}
