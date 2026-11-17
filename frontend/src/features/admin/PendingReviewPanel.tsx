import { motion } from 'framer-motion'
import L from 'leaflet'
import { Check, Mail, MapPin, Phone, Store, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import type { PendingCoffeeShop } from '../../api/types'
import { Button, Figure } from '../../components/ui'
import { Notice } from '../../components/ui/Notice'
import { Skeleton } from '../../components/ui/Skeleton'
import { usePendingShopDetails } from '../../data/admin'
import { color, mapTiles } from '../../design/tokens'
import { cx } from '../../lib/cx'
import { useNow } from '../../lib/useNow'
import { facilityIcon } from '../explore/facilityIcon'
import { HoursTable } from '../shop/HoursTable'
import { MenuView } from '../shop/MenuView'

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

interface Props {
  shop: PendingCoffeeShop
  busy: boolean
  error: string | null
  onApprove: () => void
  onDeny: () => void
  onClose: () => void
}

// Slide-over where an admin reads a café request in full before deciding:
// who sent it, where it is, its hours and its menu. The basics come from the
// pending list; menu, hours and facilities from GET /admin/coffee-shops/pending/{id}.
export function PendingReviewPanel({ shop, busy, error, onApprove, onDeny, onClose }: Props) {
  const details = usePendingShopDetails(shop.id)
  const [confirming, setConfirming] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const now = useNow()
  const d = details.data

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
  }, [])

  const contactEmail = d?.contactEmail ?? shop.contactEmail
  const contactPhone = d?.contactPhone ?? shop.contactPhone

  return (
    <div className="fixed inset-0 z-[1400]">
      <motion.div
        className="absolute inset-0 bg-espresso/25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden
      />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={`Review ${shop.name}`}
        initial={{ x: '104%' }}
        animate={{ x: 0 }}
        exit={{ x: '104%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 36, mass: 0.9 }}
        className="absolute inset-y-0 right-0 flex w-full flex-col bg-lace sm:w-[520px] sm:border-l sm:border-line"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-10 items-center justify-center text-espresso transition-colors hover:bg-linen"
          >
            <X className="size-5" />
          </button>
          <span className="eyebrow">Review request</span>
          <span className="size-10" />
        </div>

        <div className="scroll-soft min-h-0 flex-1 overflow-y-auto overscroll-contain px-7 pb-10 pt-8">
          <p className="eyebrow text-satin-deep">Waiting for approval</p>
          <h2 className="mt-3 font-display text-[40px] leading-[1.05] tracking-[-0.02em]">{shop.name}</h2>

          <div className="mt-6 flex items-start gap-2 border-y border-line py-4">
            <MapPin className="mt-0.5 size-4 shrink-0 text-satin-deep" />
            <p className="text-[14px]">{shop.address}</p>
          </div>

          {shop.description && (
            <p className="mt-6 font-display text-[23px] font-light italic leading-snug text-espresso/85">{shop.description}</p>
          )}

          {/* Who is asking, and how to reach the café */}
          <dl className="mt-8 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
            <div className="bg-lace p-4">
              <dt className="eyebrow">Sent by</dt>
              <dd className="mt-2 flex items-start gap-2 text-[13.5px]">
                <Store className="mt-0.5 size-3.5 shrink-0 text-satin-deep" />
                <span className="min-w-0">
                  <span className="block truncate text-espresso">{shop.merchantName ?? 'Merchant'}</span>
                  <span className="block truncate text-[12.5px] text-muted">{shop.merchantEmail}</span>
                </span>
              </dd>
            </div>
            <div className="bg-lace p-4">
              <dt className="eyebrow">Café contact</dt>
              <dd className="mt-2 space-y-1.5 text-[13px]">
                {contactPhone && (
                  <p className="flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0 text-satin-deep" />
                    <span className="figures">{contactPhone}</span>
                  </p>
                )}
                {contactEmail && (
                  <p className="flex items-center gap-2">
                    <Mail className="size-3.5 shrink-0 text-satin-deep" />
                    <span className="truncate">{contactEmail}</span>
                  </p>
                )}
                {!contactPhone && !contactEmail && <p className="text-muted">None given.</p>}
              </dd>
            </div>
          </dl>

          {details.isPending && (
            <div className="mt-8 space-y-4" aria-busy>
              <Skeleton className="h-24" rounded="md" />
              <Skeleton className="h-48" rounded="md" />
            </div>
          )}

          {details.isError && (
            <div className="mt-8">
              <Notice>Couldn't load the menu, hours and facilities for this request. The details above are still correct.</Notice>
            </div>
          )}

          {d && (
            <>
              {/* What is filled in, at a glance */}
              <ul className="mt-8 divide-y divide-line-soft border-y border-line-soft text-[13.5px]">
                <CheckRow label="Menu" ok={d.menu.length > 0} value={d.menu.length > 0 ? plural(d.menu.length, 'item') : 'No menu yet'} />
                <CheckRow
                  label="Opening hours"
                  ok={d.schedule.length > 0}
                  value={d.schedule.length > 0 ? `${plural(d.schedule.length, 'day')} a week` : 'No hours yet'}
                />
                <CheckRow
                  label="Facilities"
                  ok={d.facilities.length > 0}
                  value={d.facilities.length > 0 ? `${d.facilities.length} listed` : 'None listed'}
                />
              </ul>

              {d.facilities.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-1.5">
                  {d.facilities.map((f) => {
                    const Icon = facilityIcon(f.name, f.icon)
                    return (
                      <li key={f.id} className="inline-flex h-8 items-center gap-1.5 bg-linen px-3 text-[12.5px] font-medium">
                        <Icon className="size-3.5 text-satin-deep" /> {f.name}
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}

          <Section index="01" title="Location">
            <MapContainer
              center={[shop.latitude, shop.longitude]}
              zoom={16}
              scrollWheelZoom={false}
              className="h-52 w-full border border-line"
            >
              <TileLayer url={mapTiles.url} attribution={mapTiles.attribution} maxZoom={mapTiles.maxZoom} className="bean-tiles" />
              <Marker position={[shop.latitude, shop.longitude]} icon={pin} interactive={false} />
            </MapContainer>
            <p className="mt-3 text-[12.5px] text-muted">Check that the pin matches the address above.</p>
          </Section>

          {d && (
            <>
              <Section index="02" title="Hours">
                <HoursTable schedule={d.schedule} now={now} />
              </Section>
              <Section index="03" title="Menu">
                <MenuView menu={d.menu} />
              </Section>
            </>
          )}
        </div>

        {/* The decision stays in reach while reading */}
        <div className="shrink-0 border-t border-line px-7 py-4">
          {error && <p className="mb-3 text-[13px] font-medium text-alert">{error}</p>}
          <div className="flex flex-wrap items-center gap-2">
            {confirming ? (
              <>
                <span className="mr-1 text-[12.5px] font-medium text-alert">Delete this request?</span>
                <Button size="sm" variant="danger" disabled={busy} onClick={onDeny}>
                  Yes, deny
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" loading={busy} disabled={busy} icon={<Check className="size-3.5" />} onClick={onApprove}>
                  Approve
                </Button>
                <Button size="sm" variant="quiet" disabled={busy} icon={<X className="size-3.5" />} onClick={() => setConfirming(true)}>
                  Deny
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.aside>
    </div>
  )
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

function CheckRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <li className="flex items-baseline justify-between gap-4 py-3">
      <span className="text-muted">{label}</span>
      <span className={cx('figures', ok ? 'text-espresso' : 'text-terracotta')}>{value}</span>
    </li>
  )
}

function Section({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
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
