import { AnimatePresence, motion } from 'framer-motion'
import { Award, Plus, Ticket, TicketCheck } from 'lucide-react'
import { useState } from 'react'
import { Figure } from '../../../components/ui'
import { transition } from '../../../design/motion'
import { cx } from '../../../lib/cx'
import { BADGE_LABEL } from '../../../lib/format'
import type { Activity } from '../sync/reconcile'
import { Tile, TileLabel } from './Tile'
import { EmptyState } from '../../../components/ui/EmptyState'

const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })

function dayLabel(at: number, now: number) {
  const d = new Date(at).toDateString()
  if (d === new Date(now).toDateString()) return 'Today'
  if (d === new Date(now - 86_400_000).toDateString()) return 'Yesterday'
  return dayFmt.format(at)
}

// Chronological history of points and vouchers, newest first.
export function LedgerTile({ activity, now }: { activity: Activity[]; now: number }) {
  const [limit, setLimit] = useState(12)
  const items = activity.slice(0, limit)

  const groups: Array<{ day: string; items: Activity[] }> = []
  for (const a of items) {
    const day = dayLabel(a.at, now)
    const last = groups[groups.length - 1]
    if (last?.day === day) last.items.push(a)
    else groups.push({ day, items: [a] })
  }

  return (
    <Tile label="Points ledger" className="flex flex-col lg:col-span-7">
      <div className="flex items-baseline justify-between">
        <TileLabel>Ledger</TileLabel>
        <Figure tone="muted" className="text-[11px]">
          {activity.length} entries
        </Figure>
      </div>

      {activity.length === 0 ? (
        <EmptyState
          compact
          art="ledger"
          title="A blank receipt, for now."
          body="Your next purchase will show up here: points earned, vouchers issued and redeemed."
        />
      ) : (
        <div className="scroll-soft mt-4 max-h-[420px] min-h-0 flex-1 overflow-y-auto pr-1">
          {groups.map((g) => (
            <div key={g.day} className="mb-2">
              <p className="stamp sticky top-0 z-[1] border-b border-line-soft bg-lace py-3 text-[11px] text-muted">
                {g.day}
              </p>
              <ol className="relative">
                <AnimatePresence initial={false}>
                  {g.items.map((a) => (
                    <motion.li
                      key={a.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={transition.base}
                      className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line-soft py-4"
                    >
                      <Dot activity={a} />
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] text-espresso">{describe(a)}</p>
                        <p className="stamp mt-1 text-[10.5px] text-muted">
                          {timeFmt.format(a.at)}
                          {'code' in a ? ` · ${a.code}` : ''}
                        </p>
                      </div>
                      <Amount activity={a} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            </div>
          ))}
          {activity.length > limit && (
            <button
              type="button"
              onClick={() => setLimit((l) => l + 20)}
              className="mt-2 text-[12.5px] font-medium underline decoration-espresso/40 decoration-1 underline-offset-4"
            >
              Show older
            </button>
          )}
        </div>
      )}
    </Tile>
  )
}

function describe(a: Activity) {
  switch (a.kind) {
    case 'earned':
      return `Earned at ${a.shopName}`
    case 'voucher-issued':
      return `${a.discount}% voucher issued · ${a.shopName}`
    case 'voucher-used':
      return `Voucher redeemed · ${a.shopName}`
    case 'voucher-expired':
      return `Voucher expired · ${a.shopName}`
    case 'badge':
      return `Reached ${BADGE_LABEL[a.badge]}`
  }
}

function Dot({ activity }: { activity: Activity }) {
  const map = {
    earned: { Icon: Plus, cls: 'border-line-strong text-espresso' },
    'voucher-issued': { Icon: Ticket, cls: 'border-espresso text-espresso' },
    'voucher-used': { Icon: TicketCheck, cls: 'border-espresso bg-espresso text-lace' },
    'voucher-expired': { Icon: Ticket, cls: 'border-line-strong text-faint' },
    badge: { Icon: Award, cls: 'border-espresso text-espresso' },
  } as const
  const { Icon, cls } = map[activity.kind]
  return (
    <span className={cx('flex size-7 items-center justify-center border', cls)}>
      <Icon className="size-3.5" strokeWidth={1.5} />
    </span>
  )
}

function Amount({ activity: a }: { activity: Activity }) {
  if (a.kind === 'earned') return <span className="stamp text-[12px] text-espresso">+{a.points} pts</span>
  if (a.kind === 'voucher-issued') return <span className="stamp text-[12px] text-muted">−50 pts</span>
  return null
}
