import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Heart, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { Favorite } from '../../api/types'
import { Notice } from '../../components/ui/Notice'
import { EmptyState } from '../../components/ui/EmptyState'
import { LineArt } from '../../components/illustrations/LineArt'
import { Skeleton, SkeletonLines } from '../../components/ui/Skeleton'
import { useFavorites, useToggleFavorite } from '../../data/favorites'
import { color } from '../../design/tokens'
import { rise, stagger, transition } from '../../design/motion'

// The signed-in customer's saved cafés (USER-only, like FavoriteController).
export function FavoritesPage() {
  const favorites = useFavorites()
  const toggle = useToggleFavorite()
  const [error, setError] = useState<string | null>(null)

  // Negative ids are optimistic placeholders from the heart button; skip them until the refetch lands.
  const list = useMemo(
    () =>
      (favorites.data ?? [])
        .filter((f) => f.id > 0)
        .sort((a, b) => a.coffeeShopName.localeCompare(b.coffeeShopName)),
    [favorites.data],
  )

  const remove = (f: Favorite) => {
    setError(null)
    toggle.mutate(
      { shopId: f.coffeeShopId, favoriteId: f.id },
      { onError: () => setError(`Couldn't remove ${f.coffeeShopName}. Try again.`) },
    )
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-32 pt-16 md:pt-20">
      <header className="flex items-end justify-between gap-6 border-b border-espresso/25 pb-6">
        <div>
          <p className="eyebrow">Favorites</p>
          <h1 className="mt-4 text-headline">
            Your <em className="font-light">cozy corners</em>.
          </h1>
          {list.length > 0 && (
            <p className="mt-3 text-[14px] text-muted">
              {list.length} saved {list.length === 1 ? 'café' : 'cafés'}
            </p>
          )}
        </div>
        <LineArt name="heart" className="hidden h-24 w-[120px] shrink-0 text-satin-deep sm:block" />
      </header>

      <div className="mt-6 space-y-3">
        {error && <Notice>{error}</Notice>}
        {favorites.isError && !favorites.data && <Notice>Couldn't load your favorites. Check your connection.</Notice>}
      </div>

      {favorites.isPending ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="card p-6">
              <Skeleton className="mb-4 h-6 w-2/3" />
              <SkeletonLines lines={2} />
            </div>
          ))}
        </div>
      ) : list.length === 0 && !favorites.isError ? (
        <EmptyState
          className="mt-6"
          art="cup"
          title="No favorites yet."
          body="Open a café on the map and tap the heart to keep it here."
          action={
            <Link
              to="/"
              className="text-sm font-medium underline decoration-espresso/40 decoration-1 underline-offset-4"
            >
              Explore the map
            </Link>
          }
        />
      ) : (
        <motion.ul
          variants={stagger(0.05)}
          initial="hidden"
          animate="show"
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence initial={false}>
            {list.map((f) => (
              <motion.li
                key={f.id}
                layout
                variants={rise}
                exit={{ opacity: 0, scale: 0.96, transition: transition.quick }}
                className="card flex flex-col p-6 transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-title">{f.coffeeShopName}</h2>
                  <button
                    type="button"
                    onClick={() => remove(f)}
                    disabled={toggle.isPending}
                    aria-label={`Remove ${f.coffeeShopName} from favorites`}
                    title="Remove from favorites"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-satin-wash text-satin-deep transition-colors hover:bg-linen-deep disabled:opacity-60"
                  >
                    <Heart className="size-[17px]" fill={color.satin} strokeWidth={1.5} />
                  </button>
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-[13.5px] leading-snug text-muted">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" />
                  {f.coffeeShopAddress}
                </p>
                <Link
                  to={`/?shop=${f.coffeeShopId}`}
                  className="mt-6 inline-flex items-center gap-1 self-start text-[13px] font-medium text-espresso underline-offset-4 decoration-espresso/40 decoration-1 hover:underline"
                >
                  Show on map <ArrowUpRight className="size-3.5" />
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  )
}
