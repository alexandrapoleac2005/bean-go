import { QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, Link, RouterProvider } from 'react-router'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth, RequireGuest } from './auth/RequireAuth'
import { AppShell } from './components/layout/AppShell'
import { queryClient } from './data/queryClient'
import { LineArt } from './components/illustrations/LineArt'

// Route-level code splitting: Leaflet only loads with the explorer.
const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('./features/explore/ExplorePage')).ExplorePage }),
      },
      {
        path: 'system',
        lazy: async () => ({ Component: (await import('./pages/DesignSystemPage')).DesignSystemPage }),
      },
      // Role areas, guarded to match the backend @PreAuthorize rules. Screens come next.
      {
        path: 'account',
        // Loyalty hub: profile, points, badges, vouchers (USER-only, like the loyalty endpoints)
        lazy: async () => {
          const { RewardsPage } = await import('./features/rewards/RewardsPage')
          return {
            element: (
              <RequireAuth roles={['USER']}>
                <RewardsPage />
              </RequireAuth>
            ),
          }
        },
      },
      {
        path: 'favorites',
        // Saved cafés (USER-only, like FavoriteController)
        lazy: async () => {
          const { FavoritesPage } = await import('./features/favorites/FavoritesPage')
          return {
            element: (
              <RequireAuth roles={['USER']}>
                <FavoritesPage />
              </RequireAuth>
            ),
          }
        },
      },
      {
        path: 'merchant',
        // The counter and the merchant's cafés (MERCHANT-only, like MerchantController)
        lazy: async () => {
          const { MerchantPage } = await import('./features/merchant/MerchantPage')
          return {
            element: (
              <RequireAuth roles={['MERCHANT']}>
                <MerchantPage />
              </RequireAuth>
            ),
          }
        },
      },
      {
        path: 'merchant/cafes/:id',
        // Edit one of the merchant's cafés: details, menu, hours
        lazy: async () => {
          const { ManageCafePage } = await import('./features/merchant/ManageCafePage')
          return {
            element: (
              <RequireAuth roles={['MERCHANT']}>
                <ManageCafePage />
              </RequireAuth>
            ),
          }
        },
      },
      {
        path: 'admin',
        // Analytics + management, ADMIN-only like AdminController
        lazy: async () => {
          const { AdminPage } = await import('./features/admin/AdminPage')
          return {
            element: (
              <RequireAuth roles={['ADMIN']}>
                <AdminPage />
              </RequireAuth>
            ),
          }
        },
      },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    // Full-bleed auth screens, outside the app shell
    lazy: async () => ({ Component: (await import('./pages/auth/AuthLayout')).AuthLayout }),
    children: [
      {
        path: 'login',
        lazy: async () => {
          const { LoginPage } = await import('./pages/auth/LoginPage')
          return { element: <RequireGuest><LoginPage /></RequireGuest> }
        },
      },
      {
        path: 'register',
        lazy: async () => {
          const { RegisterPage } = await import('./pages/auth/RegisterPage')
          return { element: <RequireGuest><RegisterPage /></RequireGuest> }
        },
      },
    ],
  },
])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-32">
      <LineArt name="cup" className="mb-8 h-24 w-[120px] text-satin-deep" />
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-headline">This cup is empty.</h1>
      <Link
        to="/"
        className="mt-8 inline-block text-sm font-medium underline decoration-espresso/40 decoration-1 underline-offset-4"
      >
        Back to the counter
      </Link>
    </div>
  )
}
