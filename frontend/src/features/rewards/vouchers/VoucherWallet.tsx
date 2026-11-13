import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Figure } from '../../../components/ui'
import { transition } from '../../../design/motion'
import { cx } from '../../../lib/cx'
import { parseLocal } from '../../../lib/loyalty'
import type { VoucherRecord, VoucherState } from '../sync/reconcile'
import { Ticket } from './Ticket'
import { EmptyState } from '../../../components/ui/EmptyState'

type Filter = 'ALL' | VoucherState

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'ACTIVE', label: 'Active' },
  { key: 'USED', label: 'Redeemed' },
  { key: 'EXPIRED', label: 'Expired' },
  { key: 'ALL', label: 'All' },
]

interface Props {
  records: VoucherRecord[]
  now: number
  onClaim: (id: number) => void
  onPresent: (id: number) => void
}

export function VoucherWallet({ records, now, onClaim, onPresent }: Props) {
  const [filter, setFilter] = useState<Filter>('ACTIVE')

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { ALL: records.length, ACTIVE: 0, USED: 0, EXPIRED: 0 }
    for (const r of records) c[r.state]++
    return c
  }, [records])

  // Active: unclaimed first, then soonest to expire. Others: most recent first.
  const shown = useMemo(() => {
    const list = filter === 'ALL' ? records : records.filter((r) => r.state === filter)
    return [...list].sort((a, b) => {
      if (a.state === 'ACTIVE' && b.state === 'ACTIVE') {
        if (a.claimed !== b.claimed) return a.claimed ? 1 : -1
        return (parseLocal(a.voucher.expiresAt) ?? Infinity) - (parseLocal(b.voucher.expiresAt) ?? Infinity)
      }
      if (a.state === 'ACTIVE') return -1
      if (b.state === 'ACTIVE') return 1
      return (b.resolvedAt ?? 0) - (a.resolvedAt ?? 0)
    })
  }, [records, filter])

  const unclaimed = records.filter((r) => r.state === 'ACTIVE' && !r.claimed).length

  return (
    <section aria-labelledby="wallet-title">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-espresso/25 pb-4">
        <div>
          <p className="eyebrow">Voucher wallet</p>
          <h2 id="wallet-title" className="mt-3 text-headline">
            Your tickets
            {unclaimed > 0 && (
              <span className="ml-3 inline-flex h-8 translate-y-[-6px] items-center rounded-none bg-satin text-espresso px-3 align-middle font-sans text-[13px] font-medium tracking-normal text-lace">
                {unclaimed} to claim
              </span>
            )}
          </h2>
        </div>
        <div role="tablist" aria-label="Filter vouchers by status" className="flex gap-1">
          {FILTERS.map(({ key, label }) => {
            const active = filter === key
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(key)}
                className={cx(
                  'relative h-9 rounded-none px-3.5 text-[13px] font-medium transition-colors',
                  active ? 'text-lace' : 'text-muted hover:text-espresso',
                )}
              >
                {active && (
                  <motion.span layoutId="voucher-filter" transition={transition.spring} className="absolute inset-0 rounded-none bg-espresso" />
                )}
                <span className="relative">
                  {label} <Figure className={cx('text-[11px]', active ? 'text-lace/70' : 'text-faint')}>{counts[key]}</Figure>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          art="ticket"
          className="py-14"
          title={filter === 'ACTIVE' ? 'No vouchers in your wallet yet.' : 'Nothing here yet.'}
          body={
            <>
              Every <Figure>50</Figure> points you earn at a café turns into a <Figure>10%</Figure> voucher for that café,
              valid for three months.
            </>
          }
        />
      ) : (
        <motion.div layout className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {shown.map((record) => (
              <Ticket key={record.voucher.id} record={record} now={now} onClaim={onClaim} onPresent={onPresent} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  )
}
