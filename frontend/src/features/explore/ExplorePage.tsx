import { AnimatePresence, motion } from 'framer-motion'
import { LoaderCircle, LocateFixed, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import type { Facility } from '../../api/types'
import { useNearbyShops, useShopDetailsMap } from '../../data/shops'
import { transition } from '../../design/motion'
import { cx } from '../../lib/cx'
import { DEFAULT_CENTER, distanceMeters, getCurrentPosition, type LatLng } from '../../lib/geo'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useNow } from '../../lib/useNow'
import { getOpenState } from '../../lib/schedule'
import { ShopDrawer } from '../shop/ShopDrawer'
import { DiscoveryPanel } from './DiscoveryPanel'
import { FilterPills } from './FilterPills'
import { RadarMap } from './RadarMap'
import { RadiusControl } from './RadiusControl'
import { DEFAULT_RADIUS, RADIUS_STOPS, type ExploreShop } from './types'

type GeoStatus = 'locating' | 'found' | 'denied'

// Map-first explorer. URL keeps the selected shop (?shop=) and radius (?r=) shareable.
export function ExplorePage() {
  const [params, setParams] = useSearchParams()
  const selectedId = params.get('shop') ? Number(params.get('shop')) : null
  const radiusParam = Number(params.get('r'))
  const radius = (RADIUS_STOPS as readonly number[]).includes(radiusParam) ? radiusParam : DEFAULT_RADIUS

  const [geo, setGeo] = useState<GeoStatus>('locating')
  const [userPosition, setUserPosition] = useState<LatLng | null>(null)
  const [searchCenter, setSearchCenter] = useState<LatLng>(DEFAULT_CENTER)
  const [mapCenter, setMapCenter] = useState<LatLng>(DEFAULT_CENTER)
  const [facilityFilter, setFacilityFilter] = useState<Set<number>>(new Set())
  const [openNow, setOpenNow] = useState(false)
  const [hover, setHover] = useState<{ id: number | null; source: 'map' | 'list' | null }>({ id: null, source: null })
  const now = useNow()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  // ---- Location ----
  const requestLocation = useCallback(
    () =>
      getCurrentPosition()
        .then((pos) => {
          setUserPosition(pos)
          setSearchCenter(pos)
          setMapCenter(pos)
          setGeo('found')
        })
        .catch(() => setGeo('denied')),
    [],
  )
  useEffect(() => {
    requestLocation()
  }, [requestLocation])
  const locate = () => {
    setGeo('locating')
    requestLocation()
  }

  // ---- Data ----
  const nearby = useNearbyShops(searchCenter, radius)
  const summaries = useMemo(() => nearby.data ?? [], [nearby.data])
  const { details } = useShopDetailsMap(summaries.map((s) => s.id))

  const shops: ExploreShop[] = useMemo(() => {
    const origin = userPosition ?? searchCenter
    return summaries.map((summary) => {
      const d = details.get(summary.id)
      return {
        summary,
        details: d,
        distance: distanceMeters(origin, { lat: summary.latitude, lng: summary.longitude }),
        open: d ? getOpenState(d.schedule, now) : { kind: 'unknown' },
      }
    })
  }, [summaries, details, userPosition, searchCenter, now])

  // Facilities present among nearby shops, most common first.
  const facilities: Facility[] = useMemo(() => {
    const counts = new Map<number, { facility: Facility; n: number }>()
    for (const s of shops) {
      for (const f of s.details?.facilities ?? []) {
        const entry = counts.get(f.id) ?? { facility: f, n: 0 }
        entry.n++
        counts.set(f.id, entry)
      }
    }
    return [...counts.values()].sort((a, b) => b.n - a.n).map((e) => e.facility)
  }, [shops])

  const filtersActive = openNow || facilityFilter.size > 0
  const visible = useMemo(() => {
    if (!filtersActive) return shops
    return shops.filter((s) => {
      if (!s.details) return false // can't confirm until details load
      if (openNow && s.open.kind !== 'open') return false
      const ids = new Set(s.details.facilities.map((f) => f.id))
      for (const id of facilityFilter) if (!ids.has(id)) return false
      return true
    })
  }, [shops, filtersActive, openNow, facilityFilter])

  // ---- Actions ----
  const select = useCallback(
    (id: number | null) =>
      setParams(
        (p) => {
          const next = new URLSearchParams(p)
          if (id === null) next.delete('shop')
          else next.set('shop', String(id))
          return next
        },
        { replace: id === null },
      ),
    [setParams],
  )
  const close = useCallback(() => select(null), [select])

  const setRadius = (m: number) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        next.set('r', String(m))
        return next
      },
      { replace: true },
    )

  const toggleFacility = (id: number) =>
    setFacilityFilter((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const clearFilters = () => {
    setFacilityFilter(new Set())
    setOpenNow(false)
  }

  const movedAway = distanceMeters(mapCenter, searchCenter) > radius * 0.35
  const selectedShop = shops.find((s) => s.summary.id === selectedId)

  // Space the floating UI takes up, so the map frames content around it.
  const insets = isDesktop
    ? { left: 400, top: 168, right: selectedId !== null ? 480 : 16, bottom: 80 }
    : { left: 0, top: 112, right: 0, bottom: Math.round(window.innerHeight * 0.42) }

  return (
    <div className="relative h-[calc(100dvh-4rem)] overflow-hidden bg-linen">
      <div className="absolute inset-0 z-0">
        <RadarMap
          searchCenter={searchCenter}
          radius={radius}
          shops={visible}
          userPosition={userPosition}
          hoveredId={hover.id}
          activeId={selectedId}
          onHover={(id) => setHover({ id, source: id === null ? null : 'map' })}
          onSelect={select}
          onViewChange={setMapCenter}
          insets={insets}
        />
      </div>

      {/* Floating controls */}
      <div
        className={cx(
          'pointer-events-none absolute z-[1100] flex flex-col gap-2',
          isDesktop ? cx('left-[424px] top-6', selectedId !== null ? 'right-[504px]' : 'right-6') : 'inset-x-2 top-2',
        )}
      >
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <div className="no-scrollbar max-w-full overflow-x-auto">
            <RadiusControl value={radius} onChange={setRadius} />
          </div>
          <button
            type="button"
            onClick={locate}
            className="inline-flex h-10 items-center gap-2 border border-line-strong bg-lace px-4 text-[13px] text-espresso hover:border-espresso"
            aria-label="Search around my location"
          >
            {geo === 'locating' ? (
              <LoaderCircle className="size-4 animate-spin text-open" />
            ) : (
              <LocateFixed className={cx('size-4', geo === 'found' ? 'text-open' : 'text-muted')} />
            )}
            <span className="hidden sm:inline">{geo === 'denied' ? 'Location off' : 'Near me'}</span>
          </button>
        </div>
        <div className="pointer-events-auto max-w-full">
          <FilterPills
            facilities={facilities}
            selected={facilityFilter}
            onToggle={toggleFacility}
            openNow={openNow}
            onToggleOpenNow={() => setOpenNow((v) => !v)}
          />
        </div>
      </div>

      {/* Search this area */}
      <AnimatePresence>
        {movedAway && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: -8, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -8, x: '-50%' }}
            transition={transition.base}
            onClick={() => setSearchCenter(mapCenter)}
            className={cx(
              'absolute z-[1100] inline-flex h-11 items-center gap-3 rounded-none border border-[#333333] bg-[#252525] px-6 text-[13px] text-lace hover:bg-lace hover:text-espresso',
              isDesktop ? 'bottom-8 left-[calc(50%+200px)]' : 'left-1/2 top-[124px]',
            )}
          >
            <Search className="size-3.5" /> Search this area <span aria-hidden>→</span>
          </motion.button>
        )}
      </AnimatePresence>

      {geo === 'denied' && (
        <p className="glass absolute bottom-4 right-4 z-[1100] hidden rounded-none px-4 py-2 text-[12px] text-muted md:block">
          Location is off. Showing central Cluj-Napoca.
        </p>
      )}

      {/* Discovery panel */}
      <div
        className={cx(
          'absolute z-[1100]',
          isDesktop ? 'bottom-0 left-0 top-0 w-[400px]' : 'inset-x-0 bottom-0 h-[42%] border-t border-line',
        )}
      >
        <DiscoveryPanel
          shops={visible}
          totalInRadius={shops.length}
          radius={radius}
          loading={nearby.isPending}
          error={nearby.isError ? nearby.error.message : null}
          hoveredId={hover.id}
          hoverSource={hover.source}
          activeId={selectedId}
          filtersActive={filtersActive}
          now={now}
          onHover={(id) => setHover({ id, source: id === null ? null : 'list' })}
          onSelect={select}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selectedId !== null && (
          <ShopDrawer
            key="drawer"
            shopId={selectedId}
            distance={selectedShop?.distance ?? null}
            now={now}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
