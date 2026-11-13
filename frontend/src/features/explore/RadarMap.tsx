import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { mapTiles } from '../../design/tokens'
import type { LatLng } from '../../lib/geo'
import { shopPin, userPin } from './pins'
import type { ExploreShop } from './types'

interface Props {
  searchCenter: LatLng
  radius: number
  shops: ExploreShop[]
  userPosition: LatLng | null
  hoveredId: number | null
  activeId: number | null
  onHover: (id: number | null) => void
  onSelect: (id: number) => void
  onViewChange: (center: LatLng) => void
  // Space covered by floating UI, so fitting and panning avoid it
  insets: { left: number; right: number; top: number; bottom: number }
}

export function RadarMap(props: Props) {
  const { searchCenter, radius, shops, userPosition, hoveredId, activeId, onHover, onSelect } = props

  return (
    <MapContainer
      center={[searchCenter.lat, searchCenter.lng]}
      zoom={14}
      zoomSnap={0.25}
      zoomDelta={0.5}
      zoomControl={false}
      attributionControl
      className="h-full w-full"
    >
      <TileLayer url={mapTiles.url} attribution={mapTiles.attribution} maxZoom={mapTiles.maxZoom} className="bean-tiles" />

      {userPosition && (
        <Marker position={[userPosition.lat, userPosition.lng]} icon={userPin} keyboard={false} zIndexOffset={-100}>
          <Tooltip direction="top" offset={[0, -10]} className="bean-tooltip">
            You are here
          </Tooltip>
        </Marker>
      )}

      {shops.map((shop) => {
        const state = shop.summary.id === activeId ? 'active' : shop.summary.id === hoveredId ? 'hover' : 'idle'
        return (
          <Marker
            key={shop.summary.id}
            position={[shop.summary.latitude, shop.summary.longitude]}
            icon={shopPin(shop, state)}
            zIndexOffset={state === 'active' ? 2000 : state === 'hover' ? 1000 : 0}
            title={shop.summary.name}
            eventHandlers={{
              click: () => onSelect(shop.summary.id),
              mouseover: () => onHover(shop.summary.id),
              mouseout: () => onHover(null),
            }}
          >
            {state === 'hover' && (
              <Tooltip direction="top" offset={[0, -34]} permanent className="bean-tooltip">
                {shop.summary.name}
              </Tooltip>
            )}
          </Marker>
        )
      })}

      <FitToRadius center={searchCenter} radius={radius} insets={props.insets} />
      <KeepActiveVisible shops={shops} activeId={activeId} insets={props.insets} />
      <ViewWatcher onViewChange={props.onViewChange} />
    </MapContainer>
  )
}

// Zoom so the whole radius circle fits between the floating panels.
function FitToRadius({ center, radius, insets }: { center: LatLng; radius: number; insets: Props['insets'] }) {
  const map = useMap()
  const first = useRef(true)
  useEffect(() => {
    const bounds = L.latLng(center.lat, center.lng).toBounds(radius * 2)
    const options: L.FitBoundsOptions = {
      paddingTopLeft: [insets.left + 24, insets.top + 24],
      paddingBottomRight: [insets.right + 24, insets.bottom + 24],
    }
    if (first.current) {
      first.current = false
      map.fitBounds(bounds, options)
      // On first paint the container may not have its final size yet (lazy route, fonts):
      // measure again once layout settles and refit, so the radius really fills the view
      const t = window.setTimeout(() => {
        map.invalidateSize()
        map.fitBounds(bounds, options)
      }, 120)
      return () => window.clearTimeout(t)
    } else {
      map.flyToBounds(bounds, { ...options, duration: 0.7 })
    }
    // insets intentionally left out: don't refit when the drawer opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, center.lat, center.lng, radius])
  return null
}

// When the drawer opens, nudge the map so the selected pin isn't hidden under it.
function KeepActiveVisible({
  shops,
  activeId,
  insets,
}: {
  shops: ExploreShop[]
  activeId: number | null
  insets: Props['insets']
}) {
  const map = useMap()
  useEffect(() => {
    if (activeId === null) return
    const shop = shops.find((s) => s.summary.id === activeId)
    if (!shop) return
    map.panInside([shop.summary.latitude, shop.summary.longitude], {
      paddingTopLeft: [insets.left + 40, insets.top + 60],
      paddingBottomRight: [insets.right + 40, insets.bottom + 40],
    })
    // only when the selection or drawer width changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, activeId, insets.right, insets.bottom])
  return null
}

function ViewWatcher({ onViewChange }: { onViewChange: (center: LatLng) => void }) {
  // Only the user's own panning counts: programmatic fits are offset by the side panels
  // and would otherwise look like the map had moved away from the search.
  useMapEvents({
    dragend: (e) => {
      const c = (e.target as L.Map).getCenter()
      onViewChange({ lat: c.lat, lng: c.lng })
    },
  })
  return null
}
