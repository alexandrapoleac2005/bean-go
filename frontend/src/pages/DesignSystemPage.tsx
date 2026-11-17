import { motion } from 'framer-motion'
import { ArrowUpRight, Heart, MapPin } from 'lucide-react'
import { useState } from 'react'
import type { CoffeeShopSummary } from '../api/types'
import { BeanMap } from '../components/map/BeanMap'
import { Button, Field, Figure, Rating, StatusTag, VoucherCode } from '../components/ui'
import { color } from '../design/tokens'
import { rise, stagger } from '../design/motion'
import { formatCoordinates, formatDistance, formatPoints } from '../lib/format'
import { DEFAULT_CENTER, distanceMeters } from '../lib/geo'

// Internal reference for the tokens and primitives (not linked in the nav; open /system).
// Sample data only, no API calls.
const swatches = [
  { name: 'Linen', token: 'lace', hex: color.lace, role: 'Page background' },
  { name: 'Camel', token: 'satin', hex: color.satin, role: 'Accent fills, highlights' },
  { name: 'Espresso', token: 'espresso', hex: color.espresso, role: 'Type, primary actions', dark: true },
  { name: 'Deep Roast', token: 'cocoa', hex: color.cocoa, role: 'Dark surfaces', dark: true },
  { name: 'Open', token: 'open', hex: color.open, role: 'Status: open', dark: true },
  { name: 'Alert', token: 'alert', hex: color.alert, role: 'Status: errors', dark: true },
]

const sampleShops: CoffeeShopSummary[] = [
  { id: 1, name: 'Cupola Roasters', address: 'Piața Unirii 18', latitude: 46.77, longitude: 23.5893 },
  { id: 2, name: 'Linden & Lace', address: 'Str. Universității 7', latitude: 46.7677, longitude: 23.5905 },
  { id: 3, name: 'Satin Bean', address: 'Str. Napoca 10', latitude: 46.7685, longitude: 23.5872 },
]

export function DesignSystemPage() {
  const [active, setActive] = useState<number | null>(1)
  const activeShop = sampleShops.find((s) => s.id === active)

  return (
    <motion.div
      variants={stagger(0.06)}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-[1280px] px-6 pb-32 pt-16"
    >
      {/* Masthead: off-axis, left-heavy */}
      <motion.header variants={rise} className="grid grid-cols-12 gap-6 border-b border-espresso/25 pb-10">
        <div className="col-span-12 md:col-span-8">
          <p className="eyebrow mb-6">Vol. 01 · Design system</p>
          <h1 className="text-display">
            Slow coffee,
            <br />
            <em className="font-light">quickly</em> found.
          </h1>
        </div>
        <p className="col-span-12 self-end text-[15px] leading-relaxed text-muted md:col-span-4 md:pl-6">
          The tokens, type and primitives Bean&amp;Go is built from. Linen paper, espresso ink, camel used
          sparingly, deep roast for the dark rooms. Numbers use tabular figures in the body face.
        </p>
      </motion.header>

      {/* Palette as a horizontal strip, widths weighted by usage */}
      <motion.section variants={rise} className="mt-16">
        <SectionLabel index="01" title="Palette" />
        <div className="mt-6 flex h-56 overflow-hidden rounded-md ring-1 ring-line">
          {swatches.map((s, i) => (
            <div
              key={s.token}
              className="flex flex-col justify-end p-4"
              style={{ background: s.hex, flexGrow: [5, 2.6, 2.2, 1.8, 0.8, 0.8][i] }}
            >
              <p className={s.dark ? 'text-lace' : 'text-espresso'}>
                <span className="block font-sans font-medium text-[17px]">{s.name}</span>
                <span className="figures block text-[11px] opacity-75">{s.hex}</span>
                <span className="block text-[11px] opacity-75">{s.role}</span>
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Type */}
      <motion.section variants={rise} className="mt-20 grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3">
          <SectionLabel index="02" title="Type" />
        </div>
        <div className="col-span-12 space-y-8 md:col-span-9">
          <TypeRow label="Fraunces · Display">
            <span className="font-serif text-headline">The pour-over district</span>
          </TypeRow>
          <TypeRow label="Fraunces · Title">
            <span className="font-serif text-title italic">A Hario V60, a window seat, nowhere to be.</span>
          </TypeRow>
          <TypeRow label="Plus Jakarta Sans · UI">
            <span className="text-[15px] leading-relaxed">
              Filters, buttons, labels and body copy. Soft, rounded, legible at 13px.
            </span>
          </TypeRow>
          <TypeRow label="Plus Jakarta Sans · Tabular data">
            <span className="figures flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
              <span>{formatDistance(420)}</span>
              <span>{formatCoordinates(46.77, 23.5893)}</span>
              <span>4.7/5</span>
              <span>{formatPoints(1250)} pts</span>
              <span>K7MPQ 4XR2T</span>
            </span>
          </TypeRow>
        </div>
      </motion.section>

      {/* Components + map, uneven split */}
      <motion.section variants={rise} className="mt-20 grid grid-cols-12 gap-x-10 gap-y-12">
        <div className="col-span-12 lg:col-span-5">
          <SectionLabel index="03" title="Primitives" />
          <div className="mt-8 space-y-10">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="accent">Find a café</Button>
              <Button>Sign in</Button>
              <Button variant="quiet" icon={<Heart className="size-4" />}>
                Save
              </Button>
              <Button variant="ghost">
                View menu <ArrowUpRight className="size-3.5" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusTag tone="open" pulse>
                Open · until <Figure className="text-[12px]">22:00</Figure>
              </StatusTag>
              <StatusTag tone="closed">Closed · opens 08:00</StatusTag>
              <StatusTag tone="accent">Coffee Lover</StatusTag>
              <StatusTag tone="alert">Voucher expired</StatusTag>
            </div>
            <Rating value={4.6} count={128} />
            <div className="grid grid-cols-2 gap-6">
              <Field label="Email" type="email" placeholder="you@example.com" />
              <Field label="Voucher code" mono placeholder="XXXXXXXXXX" error="This voucher was already used" />
            </div>
            <VoucherCode code="K7MPQ4XR2T" />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <SectionLabel index="04" title="Map" />
          <div className="relative mt-8 h-[460px] overflow-hidden rounded-lg ring-1 ring-line">
            <BeanMap
              center={DEFAULT_CENTER}
              zoom={14}
              shops={sampleShops}
              userPosition={DEFAULT_CENTER}
              activeShopId={active}
              onSelectShop={(s) => setActive(s.id)}
            />
            {activeShop && (
              <div className="absolute bottom-4 left-4 z-[500] w-72 rounded-md bg-lace p-4">
                <p className="font-display font-normal text-[26px] leading-tight">{activeShop.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
                  <MapPin className="size-3.5" /> {activeShop.address}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                  <Figure tone="satin" className="text-[13px]">
                    {formatDistance(
                      distanceMeters(DEFAULT_CENTER, { lat: activeShop.latitude, lng: activeShop.longitude }),
                    )}
                  </Figure>
                  <Figure tone="muted" className="text-[11px]">
                    {formatCoordinates(activeShop.latitude, activeShop.longitude, 3)}
                  </Figure>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <Figure tone="satin" className="text-[12px]">
        {index}
      </Figure>
      <h2 className="font-serif text-title">{title}</h2>
    </div>
  )
}

function TypeRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 border-t border-line pt-4 sm:grid-cols-[200px_1fr] sm:gap-6">
      <span className="eyebrow pt-2">{label}</span>
      {children}
    </div>
  )
}
