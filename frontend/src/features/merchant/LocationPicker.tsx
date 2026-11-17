import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import { color, mapTiles } from '../../design/tokens'
import { DEFAULT_CENTER, type LatLng } from '../../lib/geo'

const pin = L.divIcon({
  className: 'bean-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  html: `
    <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 23s-7.5-7.2-7.5-13A7.5 7.5 0 0 1 19.5 10c0 5.8-7.5 13-7.5 13Z"
            fill="${color.espresso}" stroke="${color.lace}" stroke-width="1.5"/>
      <circle cx="12" cy="10" r="3" fill="${color.satin}"/>
    </svg>`,
})

function ClickToPlace({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

// Click the map (or drag the pin) to set the café's location.
export function LocationPicker({ value, onChange }: { value: LatLng | null; onChange: (p: LatLng) => void }) {
  return (
    <MapContainer
      center={[value?.lat ?? DEFAULT_CENTER.lat, value?.lng ?? DEFAULT_CENTER.lng]}
      zoom={14}
      scrollWheelZoom
      className="h-64 w-full rounded-md border border-line"
    >
      <TileLayer url={mapTiles.url} attribution={mapTiles.attribution} maxZoom={mapTiles.maxZoom} className="bean-tiles" />
      <ClickToPlace onPick={onChange} />
      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={pin}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const p = (e.target as L.Marker).getLatLng()
              onChange({ lat: p.lat, lng: p.lng })
            },
          }}
        />
      )}
    </MapContainer>
  )
}
