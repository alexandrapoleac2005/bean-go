import { AnimatePresence, motion } from 'framer-motion'
import { MapPin, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ApiError } from '../../api'
import { Figure, Rating } from '../../components/ui'
import { Notice } from '../../components/ui/Notice'
import { useShopDetails } from '../../data/shops'
import { transition } from '../../design/motion'
import { formatDistance } from '../../lib/format'
import { getOpenState } from '../../lib/schedule'
import { facilityIcon } from '../explore/facilityIcon'
import { OpenStatus } from '../explore/OpenStatus'
import { FavoriteButton } from './FavoriteButton'
import { HoursTable } from './HoursTable'
import { MenuView } from './MenuView'
import { ReviewsSection } from './ReviewsSection'
import { Skeleton } from '../../components/ui/Skeleton'

interface Props {
  shopId: number
  distance: number | null
  now: Date
  onClose: () => void
}

// Slide-over over the map. Mount it inside <AnimatePresence> so it springs in and out.
export function ShopDrawer({ shopId, distance, now, onClose }: Props) {
  const { data: shop, isPending, error } = useShopDetails(shopId)
  const [toast, setToast] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // New shop: back to the top, focus the close button for keyboard users.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
    closeRef.current?.focus({ preventScroll: true })
  }, [shopId])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(t)
  }, [toast])

  const open = shop ? getOpenState(shop.schedule, now) : null

  return (
    <motion.aside
      role="dialog"
      aria-modal="false"
      aria-label={shop?.name ?? 'Coffee shop'}
      initial={{ x: '104%' }}
      animate={{ x: 0 }}
      exit={{ x: '104%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 36, mass: 0.9 }}
      className="absolute inset-y-0 right-0 z-[1200] flex w-full flex-col bg-lace sm:w-[480px] sm:border-l sm:border-line"
    >
      {/* Top bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-10 items-center justify-center rounded-full text-espresso transition-colors hover:bg-linen"
        >
          <X className="size-5" />
        </button>
        <span className="eyebrow">Café</span>
        {shop ? <FavoriteButton shopId={shop.id} onError={setToast} /> : <span className="size-10" />}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition.base}
            className="absolute inset-x-4 top-16 z-10"
          >
            <Notice>{toast}</Notice>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={scrollRef} className="scroll-soft min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isPending && <DrawerSkeleton />}

        {error && (
          <div className="p-8">
            <Notice>
              {error instanceof ApiError && error.isNotFound
                ? 'This café is no longer listed.'
                : "Couldn't load this café. Check your connection."}
            </Notice>
          </div>
        )}

        {shop && open && (
          <motion.article
            key={shop.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={transition.base}
            className="px-7 pb-24 pt-8"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3">
              <OpenStatus state={open} now={now} />
              {distance !== null && (
                <Figure tone="satin" className="text-[12px]">
                  {formatDistance(distance)} away
                </Figure>
              )}
            </div>
            <h2 className="mt-5 font-display text-[44px] leading-[1.05] tracking-[-0.025em]">{shop.name}</h2>
            <div className="mt-4">
              <Rating value={shop.averageRating} count={shop.reviewCount} />
            </div>

            <div className="mt-6 flex items-start gap-2 border-y border-line py-4">
              <MapPin className="mt-0.5 size-4 shrink-0 text-satin-deep" />
              <div>
                <p className="text-[14px]">{shop.address}</p>
              </div>
            </div>

            {shop.description && (
              <p className="mt-6 font-display font-light text-[25px] italic leading-snug text-espresso/85">
                {shop.description}
              </p>
            )}

            {shop.facilities.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-1.5">
                {shop.facilities.map((f) => {
                  const Icon = facilityIcon(f.name, f.icon)
                  return (
                    <li
                      key={f.id}
                      className="inline-flex h-8 items-center gap-1.5 rounded-none bg-linen px-3 text-[12.5px] font-medium"
                    >
                      <Icon className="size-3.5 text-satin-deep" /> {f.name}
                    </li>
                  )
                })}
              </ul>
            )}

            <Section index="01" title="Hours">
              <HoursTable schedule={shop.schedule} now={now} isOpen={open.kind === 'open'} />
            </Section>

            <Section index="02" title="Menu">
              <MenuView menu={shop.menu} />
            </Section>

            <Section index="03" title="Reviews">
              <ReviewsSection shopId={shop.id} averageRating={shop.averageRating} reviewCount={shop.reviewCount} />
            </Section>
          </motion.article>
        )}
      </div>
    </motion.aside>
  )
}

function Section({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <section className="mt-14">
      <div className="mb-5 flex items-baseline gap-3 border-b border-espresso/25 pb-3">
        <Figure tone="satin" className="text-[12px]">
          {index}
        </Figure>
        <h3 className="text-[24px] leading-none tracking-[-0.02em]">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4 px-7 pt-8">
      <Skeleton className="h-6 w-36" rounded="full" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="mt-8 h-24" rounded="md" />
      <Skeleton className="h-48" rounded="md" />
    </div>
  )
}
