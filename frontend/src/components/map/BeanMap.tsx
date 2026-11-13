import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { CoffeeShopSummary } from '../../api/types'
import { color, mapTiles } from '../../design/tokens'
import type { LatLng } from '../../lib/geo'
import { cx } from '../../lib/cx'

// Markers are plain HTML (divIcon), so they use the palette instead of Leaflet's blue pins.
function shopIcon(active: boolean) {
  const fill = active ? color.satin : color.espresso
  const size = active ? 34 : 26
  return L.divIcon({
    className: 'bean-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    html: `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 23s-7.5-7.2-7.5-13A7.5 7.5 0 0 1 19.5 10c0 5.8-7.5 13-7.5 13Z"
              fill="${fill}" stroke="${color.lace}" stroke-width="1.5"/>
        <ellipse cx="12" cy="10" rx="2.6" ry="3.6" fill="${color.lace}" transform="rotate(28 12 10)"/>
        <path d="M10.6 7.2c1.4 1.5 1.4 4.1 0 5.6" stroke="${fill}" stroke-width="1" fill="none"/>
      </svg>`,
  })
}

const userIcon = L.divIcon({
  className: 'bean-marker',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${color.open};border:3px solid ${color.lace};box-shadow:0 0 0 6px ${color.open}33"></span>`,
})

function Recenter({ center, zoom }: { center: LatLng; zoom?: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([center.lat, center.lng], zoom ?? map.getZoom(), { duration: 0.6 })
  }, [map, center.lat, center.lng, zoom])
  return null
}

interface Props {
  center: LatLng
  zoom?: number
  shops?: CoffeeShopSummary[]
  userPosition?: LatLng | null
  activeShopId?: number | null
  onSelectShop?: (shop: CoffeeShopSummary) => void
  className?: string
}

export function BeanMap({
  center,
  zoom = 14,
  shops = [],
  userPosition,
  activeShopId,
  onSelectShop,
  className,
}: Props) {
  const icons = useMemo(() => ({ idle: shopIcon(false), active: shopIcon(true) }), [])

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      zoomControl={false}
      scrollWheelZoom
      className={cx('h-full w-full', className)}
    >
      <TileLayer url={mapTiles.url} attribution={mapTiles.attribution} maxZoom={mapTiles.maxZoom} className="bean-tiles" />
      <Recenter center={center} />

      {userPosition && <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon} />}

      {shops.map((shop) => (
        <Marker
          key={shop.id}
          position={[shop.latitude, shop.longitude]}
          icon={shop.id === activeShopId ? icons.active : icons.idle}
          zIndexOffset={shop.id === activeShopId ? 1000 : 0}
          eventHandlers={{ click: () => onSelectShop?.(shop) }}
        >
          <Tooltip direction="top" offset={[0, -24]} opacity={1}>
            <span className="font-sans text-[12px] font-medium text-espresso">{shop.name}</span>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  )
}
