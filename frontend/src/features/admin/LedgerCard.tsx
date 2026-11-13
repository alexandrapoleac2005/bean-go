import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Figure } from '../../components/ui'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAllPointTransactions, useAllShops, useLedgerPage } from '../../data/admin'
import { rise } from '../../design/motion'
import { cx } from '../../lib/cx'
import { formatDateTime, formatPoints } from '../../lib/format'
import type { Window } from './analytics'

const toLocal = (t: number) => {
  const d = new Date(t)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T00:00:00`
}

type Option = { id: number; label: string; hint?: string }

const byLabel = (a: Option, b: Option) => a.label.localeCompare(b.label)

// The raw audit log, paged and filtered server-side by GET /admin/point-transactions.
// Filters are picked by name; the IDs are only used behind the scenes.
export function LedgerCard({ window: w, className }: { window: Window; className?: string }) {
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({ customerId: '', merchantId: '', coffeeShopId: '' })
  const num = (s: string) => (s ? Number(s) : undefined)

  // Same cached queries the dashboard already loaded, so no extra requests.
  const all = useAllPointTransactions()
  const shops = useAllShops()
  const options = useMemo(() => {
    const customers = new Map<number, Option>()
    const merchants = new Map<number, Option>()
    const cafes = new Map<number, Option>()
    for (const s of shops.data ?? []) cafes.set(s.id, { id: s.id, label: s.name, hint: s.address })
    for (const t of all.data?.items ?? []) {
      if (!customers.has(t.customerId))
        customers.set(t.customerId, { id: t.customerId, label: t.customerName || t.customerEmail, hint: t.customerEmail })
      if (!merchants.has(t.merchantId))
        merchants.set(t.merchantId, { id: t.merchantId, label: t.merchantName || t.merchantEmail, hint: t.merchantEmail })
      if (!cafes.has(t.coffeeShopId)) cafes.set(t.coffeeShopId, { id: t.coffeeShopId, label: t.coffeeShopName })
    }
    return {
      customerId: [...customers.values()].sort(byLabel),
      merchantId: [...merchants.values()].sort(byLabel),
      coffeeShopId: [...cafes.values()].sort(byLabel),
    }
  }, [all.data, shops.data])

  const q = useLedgerPage({
    page,
    size: 12,
    customerId: num(filters.customerId),
    merchantId: num(filters.merchantId),
    coffeeShopId: num(filters.coffeeShopId),
    from: w.from !== null ? toLocal(w.from) : undefined,
    to: toLocal(w.to),
  })
  const data = q.data

  const setFilter = (key: keyof typeof filters, v: string) => {
    setFilters((f) => ({ ...f, [key]: v }))
    setPage(0)
  }

  return (
    <motion.section variants={rise} aria-label="Points ledger" className={cx('card p-6', className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display font-normal text-[26px] leading-tight">Points ledger</h2>
          <p className="mt-1 text-[12.5px] text-muted">Every award, newest first. Filters run on the server.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['customerId', 'Customer', 'All customers'],
              ['merchantId', 'Merchant', 'All merchants'],
              ['coffeeShopId', 'Café', 'All cafés'],
            ] as const
          ).map(([key, label, any]) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="eyebrow text-[10px]">{label}</span>
              <select
                value={filters[key]}
                onChange={(e) => setFilter(key, e.target.value)}
                className={cx(
                  'h-9 w-48 truncate rounded-sm border border-line bg-lace px-2 text-[13px] focus:border-espresso focus:outline-none',
                  !filters[key] && 'text-muted',
                )}
              >
                <option value="">{any}</option>
                {options[key].map((o) => (
                  <option key={o.id} value={o.id} title={o.hint}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className={cx('mt-5 overflow-x-auto transition-opacity', q.isFetching && data && 'opacity-50')}>
        {!data ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : data.content.length === 0 ? (
          <EmptyState compact art="ledger" title="Nothing matches." body="No awards in this period with these filters." />
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-[12.5px] font-medium tracking-[-0.01em] text-muted">
                {['When', 'Customer', 'Café', 'Merchant', 'Points'].map((h, i) => (
                  <th key={h} scope="col" className={cx('border-b border-line py-2 font-medium', i === 4 && 'text-right')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.content.map((t) => (
                <tr key={t.id} className="border-b border-line/60 hover:bg-linen/60">
                  <td className="figures py-2.5 pr-4 text-[12px] text-muted">{formatDateTime(t.createdAt)}</td>
                  <td className="py-2.5 pr-4">
                    <span className="block font-medium">{t.customerName || t.customerEmail}</span>
                    {t.customerName && <span className="block text-[11.5px] text-muted">{t.customerEmail}</span>}
                  </td>
                  <td className="py-2.5 pr-4">{t.coffeeShopName}</td>
                  <td className="py-2.5 pr-4">
                    <span className="block">{t.merchantName || t.merchantEmail}</span>
                    {t.merchantName && <span className="block text-[11.5px] text-muted">{t.merchantEmail}</span>}
                  </td>
                  <td className="figures py-2.5 text-right font-medium">+{formatPoints(t.points)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.totalElements > 0 && (
        <div className="mt-4 flex items-center justify-between text-[12px] text-muted">
          <Figure tone="muted">
            {(data.page * data.size + 1).toLocaleString('en-US')}–{Math.min((data.page + 1) * data.size, data.totalElements).toLocaleString('en-US')} of{' '}
            {data.totalElements.toLocaleString('en-US')}
          </Figure>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={data.first}
              aria-label="Previous page"
              className="flex size-8 items-center justify-center rounded-full hover:bg-linen disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={data.last}
              aria-label="Next page"
              className="flex size-8 items-center justify-center rounded-full hover:bg-linen disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </motion.section>
  )
}
