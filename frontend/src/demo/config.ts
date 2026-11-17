import type { Role } from '../api/types'

// Demo mode swaps the HTTP client for an in-browser mock backend with seeded data,
// so every screen is populated without the Spring server (portfolio demos).
// Available in `npm run dev`, or in a build made with VITE_DEMO=true.
// Off by default; never available in a normal production build.
export const DEMO_AVAILABLE = import.meta.env.DEV || import.meta.env.VITE_DEMO === 'true'

const KEY = 'beango.demo'

export function isDemoOn(): boolean {
  return DEMO_AVAILABLE && localStorage.getItem(KEY) === '1'
}

export function setDemoOn(on: boolean) {
  if (on) localStorage.setItem(KEY, '1')
  else localStorage.removeItem(KEY)
}

export interface DemoPersona {
  key: string
  label: string
  blurb: string
  email: string | null // null = signed out
  role: Role | null
}

// Emails match accounts created by the seed (demo/seed.ts).
export const PERSONAS: DemoPersona[] = [
  { key: 'guest', label: 'Guest', blurb: 'Signed out, browsing the map', email: null, role: null },
  { key: 'regular', label: 'Ana · regular', blurb: 'Caffeine Addict with vouchers', email: 'ana.popescu@demo.beango', role: 'USER' },
  { key: 'newbie', label: 'Radu · new', blurb: 'Rookie, first few cups', email: 'radu.ionescu@demo.beango', role: 'USER' },
  { key: 'merchant', label: 'Merchant', blurb: 'Owns three cafés', email: 'mara.stan@demo.beango', role: 'MERCHANT' },
  { key: 'admin', label: 'Admin', blurb: 'Analytics and approvals', email: 'admin@demo.beango', role: 'ADMIN' },
]

// Unsigned token in the same shape as the backend's, plus userId/role claims.
// Only ever accepted by the mock server.
export function makeDemoToken(user: { id: number; email: string; role: Role }, hours = 24): string {
  const b64 = (o: object) =>
    btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  const now = Math.floor(Date.now() / 1000)
  return [
    b64({ alg: 'none', typ: 'JWT' }),
    b64({ sub: user.email, iat: now, exp: now + hours * 3600, userId: user.id, role: user.role }),
    'demo',
  ].join('.')
}
