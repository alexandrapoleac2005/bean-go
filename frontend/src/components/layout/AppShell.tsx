import { LogOut } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router'
import type { Role } from '../../api/types'
import { useAuth } from '../../auth/useAuth'
import { DemoSwitcher } from '../../demo/DemoSwitcher'
import { cx } from '../../lib/cx'
import { Grain } from './Grain'
import { ROLE_LABEL } from '../../lib/format'

// Each role's home area (see App.tsx guards)
const ROLE_AREA: Record<Role, { to: string; label: string }> = {
  USER: { to: '/account', label: 'Rewards' },
  MERCHANT: { to: '/merchant', label: 'Merchant' },
  ADMIN: { to: '/admin', label: 'Admin' },
}

// Masthead-style header: wordmark left, nav in small caps.
export function AppShell() {
  const { isAuthenticated, email, role, logout } = useAuth()

  return (
    <div className="paper flex min-h-dvh flex-col">
      <header className="sticky top-0 z-[1300] border-b border-line bg-lace">
        <div className="mx-auto flex h-16 items-center gap-12 px-8">
          <Link to="/" className="font-display text-[28px] font-normal leading-none tracking-[-0.01em] text-espresso">
            Bean&amp;Go
          </Link>
          <nav className="flex items-center gap-8">
            <ShellLink to="/">Explore</ShellLink>
            {role && <ShellLink to={ROLE_AREA[role].to}>{ROLE_AREA[role].label}</ShellLink>}
            {role === 'USER' && <ShellLink to="/favorites">Favorites</ShellLink>}
          </nav>
          <div className="ml-auto flex items-center gap-5">
            {isAuthenticated ? (
              <>
                <span className="hidden items-center gap-2 text-[13px] text-ink sm:flex">
                  {role && <span className="eyebrow text-satin-deep">{ROLE_LABEL[role]}</span>}
                  {email}
                </span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1.5 text-[13px] text-ink underline-offset-[6px] hover:underline"
                >
                  <LogOut className="size-3.5" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-[13px] text-ink underline-offset-[6px] hover:underline">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex h-9 items-center gap-3 border border-[#333333] bg-[#252525] px-4 text-[13px] text-lace hover:bg-transparent hover:text-espresso"
                >
                  Join <span aria-hidden>→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <DemoSwitcher />
      <Grain />
    </div>
  )
}

function ShellLink({ to, children }: { to: string; children: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cx(
          'relative py-1 text-[13px] font-normal text-ink transition-colors hover:text-espresso',
          isActive && 'text-espresso after:absolute after:inset-x-0 after:-bottom-[19px] after:h-px after:bg-espresso',
        )
      }
    >
      {children}
    </NavLink>
  )
}
