import { AnimatePresence, motion } from 'framer-motion'
import { Check, CheckCircle2, Eye, MapPin, Store, X } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import { ApiError } from '../../api'
import type { PendingCoffeeShop, UserBadge } from '../../api/types'
import { Button } from '../../components/ui'
import { EmptyState } from '../../components/ui/EmptyState'
import { Notice } from '../../components/ui/Notice'
import { Skeleton } from '../../components/ui/Skeleton'
import { useApproveShop, usePendingShopDetails, usePendingShops, useRejectShop } from '../../data/admin'
import { rise } from '../../design/motion'
import { BADGE_LABEL } from '../../lib/format'
import type { ShopRank } from './analytics'
import { badgeDistribution } from './analytics'
import { BarList } from './charts/BarList'
import { ChartCard } from './charts/ChartCard'

const pct = (n: number) => `${Math.round(n * 100)}%`

// The review panel brings the map library with it, so it loads only when opened.
const PendingReviewPanel = lazy(() => import('./PendingReviewPanel').then((m) => ({ default: m.PendingReviewPanel })))

// ---------- Badge distribution ----------
export function BadgesCard({
  badges,
  loading,
  sampled,
  className,
}: {
  badges: UserBadge[]
  loading: boolean
  sampled: number | null
  className?: string
}) {
  const dist = badgeDistribution(badges)
  return (
    <ChartCard
      title="Badge distribution"
      subtitle={
        sampled
          ? `Loyalty tiers across the first ${sampled} customers`
          : `Loyalty tiers across ${badges.length} ${badges.length === 1 ? 'customer' : 'customers'}`
      }
      className={className}
    >
      {loading && badges.length === 0 ? (
        <div className="space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-full" rounded="md" />
          ))}
        </div>
      ) : badges.length === 0 ? (
        <EmptyState compact art="cup" title="No customers yet." body="Badges appear once someone earns points." />
      ) : (
        // Tiers are ordinal, so they stay in tier order (not ranked) on one hue
        <BarList
          labelWidth={150}
          title={(r) => String(r.label)}
          rows={dist.map((d, i) => ({
            key: d.badge,
            // Numbered like the tier stamps on the rewards page
            label: (
              <span className="flex items-baseline gap-3">
                <span className="stamp text-[10px] text-faint">Nº {String(i + 1).padStart(2, '0')}</span>
                {BADGE_LABEL[d.badge]}
              </span>
            ),
            value: d.count,
            display: d.count.toLocaleString('en-US'),
            tooltip: [
              { value: d.count, label: 'customers' },
              { value: pct(d.share), label: 'of customers' },
            ],
          }))}
        />
      )}
    </ChartCard>
  )
}

// ---------- Top-rated shops ----------
export function TopShopsCard({
  shops,
  loading,
  className,
}: {
  shops: ShopRank[]
  loading: boolean
  className?: string
}) {
  return (
    <ChartCard
      title="Top-rated cafés"
      subtitle="Average rating, at least 3 reviews"
      className={className}
    >
      {loading && shops.length === 0 ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-full" rounded="md" />
          ))}
        </div>
      ) : shops.length === 0 ? (
        <EmptyState compact art="review" title="Not enough reviews yet." body="Cafés show up here after their third review." />
      ) : (
        <BarList
          labelWidth={170}
          max={5}
          title={(r) => String(r.label)}
          rows={shops.map((s) => ({
            key: s.id,
            label: s.name,
            meta: `${s.reviews} ${s.reviews === 1 ? 'review' : 'reviews'}`,
            value: s.rating,
            display: s.rating.toFixed(1),
            tooltip: [
              { value: s.rating.toFixed(1), label: 'average rating' },
              { value: s.reviews, label: 'reviews' },
            ],
          }))}
        />
      )}
    </ChartCard>
  )
}

// ---------- Cafés waiting for approval ----------
// GET /admin/coffee-shops/pending. Approve puts a café on the map;
// Deny deletes the request (asks for confirmation first). Review opens the
// full request (menu, hours, location) in a side panel before deciding.
export function PendingShopsCard({ className }: { className?: string }) {
  const pending = usePendingShops()
  const approve = useApproveShop()
  const reject = useRejectShop()
  const [confirming, setConfirming] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [reviewingId, setReviewingId] = useState<number | null>(null)

  const run = (shop: PendingCoffeeShop, action: 'approve' | 'deny') => {
    setMessage(null)
    setConfirming(null)
    setBusyId(shop.id)
    const mutation = action === 'approve' ? approve : reject
    mutation.mutate(shop.id, {
      onSuccess: () =>
        setMessage({
          tone: 'ok',
          text: action === 'approve' ? `${shop.name} is now live on the map.` : `${shop.name} was denied and removed.`,
        }),
      onError: (err) =>
        setMessage({
          tone: 'error',
          text:
            err instanceof ApiError && err.isConflict
              ? `${shop.name} was already approved.`
              : `Couldn't ${action} ${shop.name}. Try again.`,
        }),
      onSettled: () => setBusyId(null),
    })
  }

  const list = pending.data ?? []
  // Once a café is approved or denied it leaves the list, which closes the panel.
  const reviewing = list.find((s) => s.id === reviewingId)

  return (
    <motion.section variants={rise} aria-label="Cafés waiting for approval" className={`card p-6 ${className ?? ''}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display font-normal text-[26px] leading-tight">
            Waiting for approval
            {list.length > 0 && (
              <span className="ml-2 inline-flex h-6 items-center rounded-none bg-satin/60 px-2.5 align-middle font-sans text-[12px] font-medium text-espresso">
                {list.length}
              </span>
            )}
          </h2>
          <p className="mt-1 text-[12.5px] text-muted">New cafés stay off the map until an admin approves them.</p>
        </div>
        {message && (
          <p
            role="status"
            className={`flex items-center gap-2 text-[13px] font-medium ${message.tone === 'ok' ? 'text-open' : 'text-alert'}`}
          >
            {message.tone === 'ok' && <CheckCircle2 className="size-4" />}
            {message.text}
          </p>
        )}
      </div>

      <div className="mt-5">
        {pending.isPending ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} rounded="md" className="h-36 w-full" />
            ))}
          </div>
        ) : pending.isError ? (
          <Notice>Couldn't load the cafés waiting for approval.</Notice>
        ) : list.length === 0 ? (
          <EmptyState compact art="cup" title="All caught up." body="No cafés are waiting for approval." />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {list.map((shop) => {
              const busy = busyId === shop.id
              return (
                <li key={shop.id} className="flex flex-col rounded-md border border-line bg-lace p-4">
                  <p className="font-display text-[26px] font-normal leading-tight">{shop.name}</p>
                  <p className="mt-1 flex items-start gap-1.5 text-[13px] text-muted">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" />
                    {shop.address}
                  </p>
                  <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-muted">
                    <Store className="size-3.5 shrink-0" />
                    <span>
                      {shop.merchantName ?? 'Merchant'} <span className="text-faint">· {shop.merchantEmail}</span>
                    </span>
                  </p>
                  <Completeness shopId={shop.id} />

                  <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
                    {confirming === shop.id ? (
                      <>
                        <span className="mr-1 text-[12.5px] font-medium text-alert">Delete this request?</span>
                        <Button size="sm" variant="danger" onClick={() => run(shop, 'deny')}>
                          Yes, deny
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          loading={busy && approve.isPending}
                          disabled={busy}
                          icon={<Check className="size-3.5" />}
                          onClick={() => run(shop, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="quiet"
                          loading={busy && reject.isPending}
                          disabled={busy}
                          icon={<X className="size-3.5" />}
                          onClick={() => setConfirming(shop.id)}
                        >
                          Deny
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto"
                          icon={<Eye className="size-3.5" />}
                          onClick={() => {
                            setMessage(null)
                            setReviewingId(shop.id)
                          }}
                        >
                          Review
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {reviewing && (
          <Suspense fallback={null}>
            <PendingReviewPanel
              key={reviewing.id}
              shop={reviewing}
              busy={busyId === reviewing.id}
              error={message?.tone === 'error' ? message.text : null}
              onApprove={() => run(reviewing, 'approve')}
              onDeny={() => run(reviewing, 'deny')}
              onClose={() => setReviewingId(null)}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

// One line on each request saying what the merchant has filled in so far.
// Stays empty until the details load (or if the backend can't provide them).
function Completeness({ shopId }: { shopId: number }) {
  const { data } = usePendingShopDetails(shopId)
  if (!data) return null
  const parts = [
    { ok: data.menu.length > 0, text: data.menu.length > 0 ? `${data.menu.length} menu ${data.menu.length === 1 ? 'item' : 'items'}` : 'No menu yet' },
    { ok: data.schedule.length > 0, text: data.schedule.length > 0 ? 'Hours set' : 'No hours yet' },
  ]
  return (
    <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
      {parts.map((p) => (
        <span key={p.text} className={p.ok ? 'text-muted' : 'text-terracotta'}>
          {p.text}
        </span>
      ))}
    </p>
  )
}
