import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Figure } from '../../components/ui'
import { transition } from '../../design/motion'
import { cx } from '../../lib/cx'
import { formatDistance, formatRating } from '../../lib/format'
import { OpenStatus } from './OpenStatus'
import type { ExploreShop } from './types'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState as EmptyStateView } from '../../components/ui/EmptyState'
import type { LineArtName } from '../../components/illustrations/LineArt'

interface Props {
  shops: ExploreShop[] // already filtered
  totalInRadius: number
  radius: number
  loading: boolean
  error: string | null
  hoveredId: number | null
  activeId: number | null
  hoverSource: 'map' | 'list' | null
  filtersActive: boolean
  now: Date
  onHover: (id: number | null) => void
  onSelect: (id: number) => void
  onClearFilters: () => void
}

export function DiscoveryPanel(props: Props) {
  const { shops, totalInRadius, radius, loading, error, hoveredId, activeId, now } = props
  const listRef = useRef<HTMLOListElement>(null)

  // Hovering a pin scrolls its card into view.
  useEffect(() => {
    if (props.hoverSource !== 'map' || hoveredId === null) return
    listRef.current
      ?.querySelector<HTMLElement>(`[data-shop-id="${hoveredId}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [hoveredId, props.hoverSource])

  return (
    <section
      aria-label="Coffee shops nearby"
      className="flex h-full min-h-0 flex-col overflow-hidden border-r border-line bg-lace"
    >
      <header className="border-b border-line px-8 pb-6 pt-8">
        <p className="eyebrow">Within {formatDistance(radius)}</p>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <h1 className="text-title">
            <span className="tabular-nums">{shops.length}</span> {shops.length === 1 ? 'café' : 'cafés'}
          </h1>
          {props.filtersActive && totalInRadius !== shops.length && (
            <button
              type="button"
              onClick={props.onClearFilters}
              className="text-[12px] font-medium text-satin-deep hover:underline"
            >
              Show all {totalInRadius}
            </button>
          )}
        </div>
      </header>

      <ol ref={listRef} className="scroll-soft min-h-0 flex-1 overflow-y-auto overscroll-contain pb-16">
        {loading && shops.length === 0 && <SkeletonRows />}

        {!loading && error && (
          <EmptyState art="plug" title="The map lost its signal." body={error} />
        )}

        {!loading && !error && shops.length === 0 && (
          <EmptyState
            art="map"
            title={props.filtersActive ? 'Nothing matches those filters.' : 'No cafés in this circle yet.'}
            body={
              props.filtersActive
                ? 'Try removing a filter, or widen the radius.'
                : 'Widen the radius or move the map and search this area.'
            }
          />
        )}

        <AnimatePresence initial={false}>
          {shops.map((shop, index) => (
            <ShopRow
              key={shop.summary.id}
              index={index}
              shop={shop}
              now={now}
              hovered={hoveredId === shop.summary.id}
              active={activeId === shop.summary.id}
              onHover={props.onHover}
              onSelect={props.onSelect}
            />
          ))}
        </AnimatePresence>
      </ol>
    </section>
  )
}

function ShopRow({
  shop,
  index,
  now,
  hovered,
  active,
  onHover,
  onSelect,
}: {
  shop: ExploreShop
  index: number
  now: Date
  hovered: boolean
  active: boolean
  onHover: (id: number | null) => void
  onSelect: (id: number) => void
}) {
  const { summary, details } = shop
  return (
    <motion.li
      layout="position"
      data-shop-id={summary.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { ...transition.base, delay: Math.min(index, 10) * 0.025 } }}
      exit={{ opacity: 0, transition: transition.quick }}
    >
      <button
        type="button"
        onClick={() => onSelect(summary.id)}
        onMouseEnter={() => onHover(summary.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(summary.id)}
        onBlur={() => onHover(null)}
        aria-current={active || undefined}
        className={cx(
          'group relative grid w-full grid-cols-[1fr_auto] gap-x-4 gap-y-3 border-b border-line-soft px-8 py-6 text-left transition-colors duration-200',
          active ? 'bg-linen' : hovered ? 'bg-linen/70' : 'hover:bg-linen/70',
        )}
      >
        <div className="min-w-0">
          <p className="truncate font-display text-[22px] font-normal leading-tight">{summary.name}</p>
          <p className="mt-0.5 truncate text-[12.5px] text-muted">{summary.address}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Figure className="text-[13px]">{formatDistance(shop.distance)}</Figure>
          {details ? (
            <Figure tone={details.averageRating ? 'satin' : 'muted'} className="text-[12px]">
              ★ {formatRating(details.averageRating)}
              {details.reviewCount ? <span className="text-faint"> ({details.reviewCount})</span> : null}
            </Figure>
          ) : (
            <Skeleton className="h-3 w-10" />
          )}
        </div>
        <div className="col-span-2">
          {details ? (
            <OpenStatus state={shop.open} now={now} />
          ) : (
            <Skeleton className="h-6 w-28" rounded="full" />
          )}
        </div>
      </button>
    </motion.li>
  )
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <li key={i} className="space-y-2 border-b border-line-soft px-8 py-6">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-5 w-24" rounded="full" />
        </li>
      ))}
    </>
  )
}

function EmptyState({ art, title, body }: { art: LineArtName; title: string; body: string }) {
  return (
    <li className="px-4">
      <EmptyStateView art={art} title={title} body={body} />
    </li>
  )
}
