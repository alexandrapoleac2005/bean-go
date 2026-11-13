import { AnimatePresence, motion } from 'framer-motion'
import { Gift, ScanLine } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Figure } from '../../../components/ui'
import { transition } from '../../../design/motion'
import { cx } from '../../../lib/cx'
import { formatDate, formatVoucherCode } from '../../../lib/format'
import { daysUntil } from '../../../lib/loyalty'
import type { VoucherRecord } from '../sync/reconcile'
import { Barcode } from './codeArt'
import { ScrambleText } from './ScrambleText'

interface Props {
  record: VoucherRecord
  now: number
  onClaim: (id: number) => void
  onPresent: (id: number) => void
}

const serial = (id: number) => `№ ${String(id).padStart(6, '0')}`

// A physical-feeling coffee ticket: main body + tear-off stub with the code.
// New (unclaimed) vouchers arrive in an espresso sleeve that slides off on claim.
export function Ticket({ record, now, onClaim, onPresent }: Props) {
  const { voucher: v, state, claimed } = record
  const [revealing, setRevealing] = useState(false)
  const days = daysUntil(v.expiresAt, now)
  const soon = state === 'ACTIVE' && days !== null && days <= 7
  const spent = state !== 'ACTIVE'

  const claim = () => {
    setRevealing(true)
    onClaim(v.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, rotate: -0.6 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={transition.base}
      className="ticket-shadow"
    >
      <div
        className={cx(
          'ticket ticket-paper grid h-[176px] grid-cols-[var(--tear)_1fr]',
          spent ? 'border border-line-strong bg-lace text-muted' : 'border border-espresso bg-lace text-espresso',
        )}
        style={{ '--tear': '70%' } as CSSProperties}
      >
        {/* Main body */}
        <div className="relative flex flex-col justify-between overflow-hidden py-4 pl-7 pr-5">
          <div className="flex items-center justify-between gap-3">
            <span className="stamp text-[10px]">Bean&amp;Go · Voucher</span>
            <span className="stamp text-[10px] text-muted">{serial(v.id)}</span>
          </div>

          <div className="flex items-end gap-4">
            <p className={cx('font-display text-[64px] font-light leading-[0.8]', spent ? 'text-faint' : 'text-espresso')}>
              {v.discountPercentage}
              <span className="text-[34px]">%</span>
            </p>
            <div className="min-w-0 pb-1">
              <p className="stamp text-[10.5px] text-muted">off your order at</p>
              <p className="truncate font-display font-normal text-[26px] leading-tight">{v.coffeeShopName}</p>
            </div>
          </div>

          <div className="stamp flex items-center gap-4 text-[10px]">
            <span>
              <span className="text-muted">Issued </span>
              <Figure>{formatDate(v.generatedAt)}</Figure>
            </span>
            {v.expiresAt && (
              <span className={cx(soon && 'text-alert')}>
                <span className={soon ? '' : 'text-muted'}>{state === 'EXPIRED' ? 'Expired ' : 'Valid to '}</span>
                <Figure tone={soon ? 'alert' : 'ink'}>{formatDate(v.expiresAt)}</Figure>
                {soon && days !== null && <Figure tone="alert"> · {days <= 0 ? 'today' : `${days}d left`}</Figure>}
              </span>
            )}
          </div>

          {spent && <Stamp state={state} />}
        </div>

        {/* Stub */}
        <div className="flex flex-col items-center justify-between py-4 pl-3 pr-5">
          <Barcode code={v.code} height={34} className={cx('h-[34px] w-full', spent ? 'text-faint' : 'text-espresso')} />
          <p className="stamp text-center text-[12.5px] leading-tight">
            {claimed || spent ? (
              <ScrambleText text={formatVoucherCode(v.code)} active={revealing} className="whitespace-pre-line" />
            ) : (
              '••••• •••••'
            )}
          </p>
          {state === 'ACTIVE' ? (
            <button
              type="button"
              onClick={() => onPresent(v.id)}
              disabled={!claimed}
              className="inline-flex h-7 items-center gap-1.5 border border-espresso bg-espresso px-3 text-[11px] text-lace transition-colors hover:bg-lace hover:text-espresso disabled:opacity-0"
            >
              <ScanLine className="size-3" /> Use
            </button>
          ) : (
            <span className="stamp text-[9.5px]">{state === 'USED' ? 'Redeemed' : 'Expired'}</span>
          )}
        </div>

        {/* Sleeve for unclaimed vouchers */}
        <AnimatePresence>
          {!claimed && state === 'ACTIVE' && (
            <motion.button
              type="button"
              onClick={claim}
              initial={false}
              exit={{ x: '-108%', rotate: -3, transition: { type: 'spring', stiffness: 160, damping: 22 } }}
              whileHover={{ x: -6 }}
              whileTap={{ x: -14 }}
              className="absolute inset-0 z-10 flex items-center justify-between overflow-hidden border border-espresso bg-linen pl-8 pr-10 text-left text-espresso"
              aria-label={`Claim voucher from ${v.coffeeShopName}`}
            >
              <span className="relative">
                <span className="stamp block text-[10.5px] text-muted">New voucher · sealed</span>
                <span className="mt-2 block font-display font-normal text-[32px] leading-tight">
                  {v.discountPercentage}% at {v.coffeeShopName}
                </span>
                <span className="mt-1 block text-[12.5px] text-ink">Earned with 50 points</span>
              </span>
              <span className="relative inline-flex h-10 items-center gap-3 border border-[#333333] bg-[#252525] px-4 text-[13px] text-lace">
                <Gift className="size-4" /> Claim <span aria-hidden>→</span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function Stamp({ state }: { state: 'USED' | 'EXPIRED' | 'ACTIVE' }) {
  const used = state === 'USED'
  return (
    <motion.span
      initial={{ scale: 1.8, opacity: 0, rotate: -4 }}
      animate={{ scale: 1, opacity: 0.85, rotate: -11 }}
      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
      style={{ y: '-50%' }}
      className={cx(
        'stamp pointer-events-none absolute right-6 top-1/2 border px-3 py-1 text-[14px]',
        used ? 'border-open text-open' : 'border-alert text-alert',
      )}
    >
      {used ? 'REDEEMED' : 'EXPIRED'}
    </motion.span>
  )
}
