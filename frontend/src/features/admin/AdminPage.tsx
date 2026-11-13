import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { Button } from '../../components/ui'
import { Notice } from '../../components/ui/Notice'
import { useAllPointTransactions, useAllShops, useCustomerSnapshots } from '../../data/admin'
import { useShopDetailsMap } from '../../data/shops'
import { stagger, transition } from '../../design/motion'
import { cx } from '../../lib/cx'
import { formatPoints } from '../../lib/format'
import { BadgesCard, PendingShopsCard, TopShopsCard } from './AdminCards'
import { distinctCustomers, kpis, RANGES, topShops, toTx, windowFor, type RangeKey } from './analytics'
import { LedgerCard } from './LedgerCard'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'ledger', label: 'Ledger' },
] as const
type TabKey = (typeof TABS)[number]['key']

// Admin home in two tabs. Overview: cafés to approve first, then a quiet row of
// figures and two charts. Ledger: every points award, with filters.
// The backend has no statistics endpoints, so the figures are aggregated here
// from the admin ledger plus profile and shop reads.
export function AdminPage() {
  const [params, setParams] = useSearchParams()
  const tab: TabKey = params.get('tab') === 'ledger' ? 'ledger' : 'overview'
  const [range, setRange] = useState<RangeKey>('30d')
  const queryClient = useQueryClient()
  // Fixed for the page's lifetime so windows don't drift between renders
  const [now] = useState(() => Date.now())

  const ledger = useAllPointTransactions()
  const shopsList = useAllShops()

  const txs = useMemo(() => toTx(ledger.data?.items ?? []), [ledger.data])
  const customerIds = useMemo(() => distinctCustomers(txs), [txs])
  const customers = useCustomerSnapshots(customerIds)
  const shopIds = useMemo(() => (shopsList.data ?? []).map((s) => s.id), [shopsList.data])
  const { details, loading: detailsLoading } = useShopDetailsMap(shopIds)

  const w = windowFor(range, now)

  const k = useMemo(() => kpis(txs, w), [txs, w.from, w.to]) // eslint-disable-line react-hooks/exhaustive-deps
  const ranked = useMemo(() => topShops([...details.values()], txs, w), [details, txs, w.from, w.to]) // eslint-disable-line react-hooks/exhaustive-deps

  const loading = ledger.isPending
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin'] })

  const selectTab = (key: TabKey) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        if (key === 'overview') next.delete('tab')
        else next.set('tab', key)
        return next
      },
      { replace: true },
    )

  const count = (n: number) => n.toLocaleString('en-US')
  const figures = [
    { label: 'Points awarded', value: loading ? null : formatPoints(k.points.value) },
    { label: 'Transactions', value: loading ? null : count(k.transactions.value) },
    { label: 'Active customers', value: loading ? null : count(k.customers.value) },
    { label: 'Cafés live', value: shopsList.isPending ? null : count(shopIds.length) },
  ]

  const rangeBar = (
    <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
      <div role="radiogroup" aria-label="Date range" className="flex gap-1">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            role="radio"
            aria-checked={range === r.key}
            onClick={() => setRange(r.key)}
            className={cx(
              'relative h-9 rounded-none px-4 text-[13px] font-medium transition-colors',
              range === r.key ? 'text-lace' : 'text-muted hover:text-espresso',
            )}
          >
            {range === r.key && (
              <motion.span layoutId="admin-range" transition={transition.spring} className="absolute inset-0 rounded-none bg-espresso" />
            )}
            <span className="relative">{r.label}</span>
          </button>
        ))}
      </div>
      <Button
        variant="quiet"
        size="sm"
        onClick={refresh}
        disabled={ledger.isFetching}
        icon={<RefreshCw className={cx('size-3.5', ledger.isFetching && 'animate-spin')} />}
      >
        Refresh
      </Button>
    </div>
  )

  const notices = (ledger.isError || ledger.data?.capped) && (
    <div className="mt-4 space-y-3">
      {ledger.isError && <Notice>Couldn't load the points ledger: {ledger.error.message}</Notice>}
      {ledger.data?.capped && (
        <Notice tone="info">
          Showing the latest {ledger.data.items.length.toLocaleString('en-US')} of {ledger.data.total.toLocaleString('en-US')} transactions.
        </Notice>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-32 pt-16 md:pt-20">
      <header>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-4 text-headline">The house ledger.</h1>
      </header>

      <div role="tablist" aria-label="Admin sections" className="mt-10 flex gap-8 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`admin-tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`admin-panel-${t.key}`}
            onClick={() => selectTab(t.key)}
            className={cx(
              'relative pb-3 pt-1 text-[14px] transition-colors',
              tab === t.key ? 'text-espresso' : 'text-muted hover:text-espresso',
            )}
          >
            {t.label}
            {tab === t.key && (
              <motion.span layoutId="admin-tab" transition={transition.spring} className="absolute inset-x-0 -bottom-px h-px bg-espresso" />
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <motion.div
          key="overview"
          role="tabpanel"
          id="admin-panel-overview"
          aria-labelledby="admin-tab-overview"
          variants={stagger(0.05)}
          initial="hidden"
          animate="show"
          className="mt-10"
        >
          {/* What needs doing comes first */}
          <PendingShopsCard />

          <div className="mt-16">{rangeBar}</div>
          {notices}

          {/* One quiet row of figures for the chosen period */}
          <dl className="mt-6 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
            {figures.map((f) => (
              <div key={f.label} className="bg-lace px-6 py-7 lg:px-8">
                <dt className="eyebrow">{f.label}</dt>
                <dd
                  className={cx(
                    'mt-3 font-display text-[40px] font-light leading-none tabular-nums',
                    f.value === null ? 'text-faint' : 'text-espresso',
                  )}
                >
                  {f.value ?? '—'}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <BadgesCard
              badges={customers.badges}
              loading={loading || customers.loading}
              sampled={customers.sampled}
              className="lg:col-span-5"
            />
            <TopShopsCard
              shops={ranked}
              loading={shopsList.isPending || detailsLoading}
              className="lg:col-span-7"
            />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="ledger"
          role="tabpanel"
          id="admin-panel-ledger"
          aria-labelledby="admin-tab-ledger"
          variants={stagger(0.05)}
          initial="hidden"
          animate="show"
          className="mt-10"
        >
          {rangeBar}
          {notices}
          <LedgerCard window={w} className="mt-6" />
        </motion.div>
      )}
    </div>
  )
}
