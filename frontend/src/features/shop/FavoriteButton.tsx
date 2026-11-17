import { AnimatePresence, motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ApiError } from '../../api'
import { useAuth } from '../../auth/useAuth'
import { useFavorites, useToggleFavorite } from '../../data/favorites'
import { color } from '../../design/tokens'
import { transition } from '../../design/motion'
import { cx } from '../../lib/cx'

const BURST = Array.from({ length: 7 }, (_, i) => (i / 7) * Math.PI * 2)

// One-click save. Anonymous users are sent to sign in and brought back.
export function FavoriteButton({ shopId, onError }: { shopId: number; onError: (msg: string) => void }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const favorites = useFavorites()
  const toggle = useToggleFavorite()
  const [burstKey, setBurstKey] = useState(0)

  if (isAuthenticated && !favorites.canFavorite) return null // merchants/admins can't save favorites

  const favoriteId = favorites.byShop.get(shopId)
  const saved = favoriteId !== undefined
  // A negative id is the optimistic placeholder: wait for the real one before allowing remove.
  const busy = toggle.isPending || (favoriteId !== undefined && favoriteId < 0)

  const onClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname + location.search } })
      return
    }
    if (busy) return
    if (!saved) setBurstKey((k) => k + 1)
    toggle.mutate(
      { shopId, favoriteId },
      {
        onError: (err) =>
          onError(
            err instanceof ApiError && err.isForbidden
              ? 'Only customer accounts can save favorites.'
              : 'Could not update your favorites. Try again.',
          ),
      },
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
      className={cx(
        'relative flex size-10 items-center justify-center rounded-full transition-colors',
        saved ? 'bg-satin-wash text-satin-deep' : 'bg-linen text-espresso hover:bg-linen-deep',
      )}
    >
      <motion.span
        key={saved ? 'on' : 'off'}
        initial={{ scale: saved ? 0.4 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 600, damping: 14 }}
        className="flex"
      >
        <Heart className="size-[18px]" fill={saved ? color.satin : 'none'} strokeWidth={saved ? 1.5 : 2} />
      </motion.span>

      {/* Burst of beans when saving */}
      <AnimatePresence>
        {burstKey > 0 && (
          <motion.span key={burstKey} className="pointer-events-none absolute inset-0" initial="from" animate="to">
            {BURST.map((angle, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 h-[5px] w-[3.5px] rounded-none bg-satin"
                style={{ rotate: `${(angle * 180) / Math.PI + 90}deg` }}
                variants={{
                  from: { x: -1.75, y: -2.5, opacity: 1, scale: 1 },
                  to: {
                    x: Math.cos(angle) * 22 - 1.75,
                    y: Math.sin(angle) * 22 - 2.5,
                    opacity: 0,
                    scale: 0.4,
                  },
                }}
                transition={{ ...transition.slow, duration: 0.55 }}
              />
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
