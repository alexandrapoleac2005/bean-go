import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation, useOutlet } from 'react-router'
import { transition } from '../../design/motion'
import { DemoSwitcher } from '../../demo/DemoSwitcher'

// Morning light on an espresso cup. Unsplash photo, served by their CDN.
const PHOTO =
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=85'

// Split screen: a full-bleed photograph on the left, the form on the alabaster canvas on the right.
// The photo stays put while the form cross-fades between /login and /register.
export function AuthLayout() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-lace lg:grid-cols-2">
      <Photo />
      <div className="relative flex flex-col border-line px-6 py-10 sm:px-12 lg:border-l lg:px-20">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-[30px] font-normal leading-none tracking-[-0.01em] text-espresso">
            Bean&amp;Go
          </Link>
          <Link to="/" className="text-[13px] text-ink underline-offset-[6px] hover:underline">
            Browse the map <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={transition.base}
              className="w-full max-w-[420px] py-12"
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="stamp border-t border-line pt-5 text-[11px] text-muted">Bean&amp;Go · Est. Cluj-Napoca · Nº 001</p>
      </div>
      <DemoSwitcher />
    </div>
  )
}

function Photo() {
  return (
    <aside className="relative hidden overflow-hidden bg-linen lg:block">
      <motion.img
        src={PHOTO}
        alt="A ceramic espresso cup on a table in soft morning light"
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 size-full object-cover"
        style={{ filter: 'contrast(0.95) brightness(0.95) saturate(0.85) sepia(0.06)' }}
      />
    </aside>
  )
}
