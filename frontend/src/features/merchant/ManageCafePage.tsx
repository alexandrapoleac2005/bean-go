import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ApiError } from '../../api'
import { StatusTag } from '../../components/ui'
import { Notice } from '../../components/ui/Notice'
import { Skeleton } from '../../components/ui/Skeleton'
import { useMyShop, useMyShops } from '../../data/merchant'
import { transition } from '../../design/motion'
import { cx } from '../../lib/cx'
import { CafeDetailsForm } from './CafeDetailsForm'
import { HoursEditor } from './HoursEditor'
import { MenuEditor } from './MenuEditor'

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'menu', label: 'Menu' },
  { id: 'hours', label: 'Hours' },
] as const
type Tab = (typeof TABS)[number]['id']

// One of the merchant's cafés: edit details and facilities, the menu, and opening hours.
export function ManageCafePage() {
  const id = Number(useParams().id)
  const shop = useMyShop(id)
  const approved = useMyShops().data?.find((s) => s.id === id)?.approved
  const [tab, setTab] = useState<Tab>('details')

  const back = (
    <Link
      to="/merchant"
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-espresso"
    >
      <ArrowLeft className="size-4" /> Back to the counter
    </Link>
  )

  if (shop.isPending) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 pb-32 pt-16 md:pt-20">
        {back}
        <Skeleton className="mt-8 h-14 w-80" />
        <Skeleton rounded="md" className="mt-10 h-96 w-full" />
      </div>
    )
  }

  if (shop.isError) {
    const err = shop.error
    const message =
      err instanceof ApiError && err.isForbidden
        ? 'This café belongs to another merchant.'
        : err instanceof ApiError && err.isNotFound
          ? 'This café doesn’t exist anymore.'
          : 'Couldn’t load this café. Check your connection.'
    return (
      <div className="mx-auto max-w-[1280px] px-6 pb-32 pt-16 md:pt-20">
        {back}
        <div className="mt-8 max-w-lg">
          <Notice>{message}</Notice>
        </div>
      </div>
    )
  }

  const details = shop.data

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-32 pt-16 md:pt-20">
      {back}
      <header className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Manage café</p>
          <h1 className="mt-4 text-headline">{details.name}</h1>
        </div>
        {approved !== undefined &&
          (approved ? (
            <StatusTag tone="open">Approved</StatusTag>
          ) : (
            <StatusTag tone="accent">Waiting for approval</StatusTag>
          ))}
      </header>

      <div role="tablist" aria-label="Café sections" className="mt-10 flex gap-1 border-b border-espresso/25">
        {TABS.map((t) => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cx(
                'relative px-3 pb-3 pt-1 text-[14px] font-medium transition-colors',
                active ? 'text-espresso' : 'text-muted hover:text-espresso',
              )}
            >
              {t.label}
              {t.id === 'menu' && <span className="figures ml-1.5 text-[11px] text-faint">{details.menu.length}</span>}
              {active && (
                <motion.span
                  layoutId="manage-tab"
                  transition={transition.spring}
                  className="absolute inset-x-3 -bottom-px h-[2px] rounded-none bg-satin"
                />
              )}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-8">
        {tab === 'details' && <CafeDetailsForm key={details.id} details={details} />}
        {tab === 'menu' && <MenuEditor shopId={details.id} menu={details.menu} />}
        {tab === 'hours' && <HoursEditor key={details.id} shopId={details.id} schedule={details.schedule} />}
      </div>
    </div>
  )
}
