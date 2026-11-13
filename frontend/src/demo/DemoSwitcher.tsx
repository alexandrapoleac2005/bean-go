import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, FlaskConical, RotateCcw, ScanLine, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { transition } from '../design/motion'
import { cx } from '../lib/cx'
import { DEMO_AVAILABLE, isDemoOn, PERSONAS, setDemoOn, type DemoPersona } from './config'

// Discreet corner control for portfolio demos. Only rendered when demo mode is
// available (dev server or a VITE_DEMO build). While on, a "Demo data" label is
// always visible so seeded numbers are never mistaken for real ones.
export function DemoSwitcher() {
  const { email, login, logout } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const on = isDemoOn()

  if (!DEMO_AVAILABLE) return null

  const current = PERSONAS.find((p) => p.email === email) ?? PERSONAS[0]

  const toggle = () => {
    setDemoOn(!on)
    logout() // tokens from one backend mean nothing to the other
    window.location.assign('/')
  }

  const become = async (p: DemoPersona) => {
    setBusy(p.key)
    setNote(null)
    try {
      queryClient.removeQueries({ queryKey: ['me'] })
      if (p.email) await login({ email: p.email, password: 'demo' })
      else logout()
      navigate(p.role === 'ADMIN' ? '/admin' : p.role === 'USER' ? '/account' : '/')
    } finally {
      setBusy(null)
    }
  }

  const act = async (kind: 'purchase' | 'redeem') => {
    if (!email) return
    const { simulatePurchase, simulateRedeem } = await import('./mockServer')
    try {
      setNote(kind === 'purchase' ? simulatePurchase(email) : simulateRedeem(email))
      // Refetch now instead of waiting for the next poll
      await queryClient.invalidateQueries({ queryKey: ['me'] })
    } catch (e) {
      setNote(e instanceof Error ? e.message : 'Something went wrong.')
    }
  }

  const reset = async () => {
    const { resetDemoDb } = await import('./mockServer')
    resetDemoDb()
    queryClient.clear()
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 left-4 z-[2500] font-sans">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={transition.base}
            className="glass mb-2 w-[280px] rounded-lg p-4 text-espresso"
          >
            <div className="flex items-center justify-between">
              <p className="eyebrow">Demo mode</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-muted hover:text-espresso">
                <X className="size-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={toggle}
              className="mt-3 flex w-full items-center justify-between rounded-md bg-linen px-3 py-2.5 text-left text-[13px]"
            >
              <span>
                <span className="block font-medium">Seeded demo data</span>
                <span className="text-[11.5px] text-muted">{on ? 'In-browser mock backend' : 'Using the real API'}</span>
              </span>
              <span className={cx('relative h-5 w-9 rounded-none transition-colors', on ? 'bg-espresso' : 'bg-line')}>
                <motion.span
                  layout
                  transition={transition.spring}
                  className={cx('absolute top-0.5 size-4 rounded-full bg-lace', on ? 'right-0.5' : 'left-0.5')}
                />
              </span>
            </button>

            {on && (
              <>
                <p className="eyebrow mt-4 text-[10px]">View as</p>
                <ul className="mt-2 space-y-1">
                  {PERSONAS.map((p) => (
                    <li key={p.key}>
                      <button
                        type="button"
                        onClick={() => become(p)}
                        disabled={busy !== null}
                        className={cx(
                          'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[13px] transition-colors',
                          current.key === p.key ? 'bg-satin-wash' : 'hover:bg-linen',
                        )}
                      >
                        <span>
                          <span className="block font-medium">{p.label}</span>
                          <span className="text-[11px] text-muted">{p.blurb}</span>
                        </span>
                        {current.key === p.key && <Check className="size-4 text-satin-deep" />}
                      </button>
                    </li>
                  ))}
                </ul>

                {current.role === 'USER' && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => act('purchase')}
                      className="flex items-center justify-center gap-1.5 rounded-md bg-espresso px-2 py-2 text-[12px] font-medium text-lace hover:bg-espresso/90"
                    >
                      <ShoppingBag className="size-3.5" /> Buy a coffee
                    </button>
                    <button
                      type="button"
                      onClick={() => act('redeem')}
                      className="flex items-center justify-center gap-1.5 rounded-md bg-linen px-2 py-2 text-[12px] font-medium hover:bg-linen-deep"
                    >
                      <ScanLine className="size-3.5" /> Barista redeems
                    </button>
                  </div>
                )}
                {note && <p className="mt-2 text-[12px] text-muted">{note}</p>}

                <button
                  type="button"
                  onClick={reset}
                  className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-espresso"
                >
                  <RotateCcw className="size-3" /> Reset demo data
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cx(
          'inline-flex h-8 items-center gap-2 rounded-none px-3 text-[11.5px] font-medium transition-colors',
          on ? 'bg-cocoa text-lace' : 'glass text-muted hover:text-espresso',
        )}
        aria-expanded={open}
      >
        <FlaskConical className={cx('size-3.5', on && 'text-satin')} />
        {on ? `Demo data · ${current.label}` : 'Demo'}
      </button>
    </div>
  )
}
