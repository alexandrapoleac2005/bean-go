import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useEffect } from 'react'
import { Button, Figure } from '../../../components/ui'
import { transition } from '../../../design/motion'
import { formatVoucherCode } from '../../../lib/format'
import type { VoucherRecord } from '../sync/reconcile'
import { SYNC_INTERVAL } from '../sync/useRewardsSync'
import { QrMark } from './codeArt'

interface Props {
  record: VoucherRecord // live from the store: flips to USED when the barista redeems it
  lastSyncedAt: number | null
  now: number
  onClose: () => void
}

// Full-screen "show this at the till" view. While it's open the page polls every
// few seconds, so the moment the merchant redeems the code it gets stamped here.
export function CounterModal({ record, lastSyncedAt, now, onClose }: Props) {
  const { voucher: v, state } = record
  const done = state !== 'ACTIVE'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-cocoa/85 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition.base}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Voucher for ${v.coffeeShopName}`}
        initial={{ y: 40, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 40, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="ticket-paper relative w-full max-w-[380px] overflow-hidden rounded-lg bg-lace"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full text-muted hover:bg-linen"
        >
          <X className="size-4" />
        </button>

        <div className="px-8 pb-6 pt-8 text-center">
          <p className="eyebrow">Show this at the counter</p>
          <p className="mt-3 font-serif text-[30px] leading-tight">{v.coffeeShopName}</p>
          <p className="mt-1 font-display font-normal text-[24px] italic text-satin-deep">{v.discountPercentage}% off your order</p>
        </div>

        {/* Perforation between header and code */}
        <div className="relative h-0 border-t-2 border-dotted border-line">
          <span className="absolute -left-3 -top-3 size-6 rounded-full bg-cocoa/85" />
          <span className="absolute -right-3 -top-3 size-6 rounded-full bg-cocoa/85" />
        </div>

        <div className="relative flex flex-col items-center px-8 pb-8 pt-7">
          <div className={done ? 'opacity-25 transition-opacity' : ''}>
            <QrMark code={v.code} size={168} className="text-espresso" />
          </div>
          <p className="figures mt-5 select-all text-[28px] font-medium tracking-[0.22em]">{formatVoucherCode(v.code)}</p>
          <p className="mt-2 text-[12px] text-muted">The barista types this code at the till.</p>

          {done ? (
            <motion.div
              initial={{ scale: 2.2, opacity: 0, rotate: 6 }}
              animate={{ scale: 1, opacity: 1, rotate: -9 }}
              transition={{ type: 'spring', stiffness: 420, damping: 16 }}
              className={`absolute top-[86px] flex items-center gap-2 rounded-md border-[3px] bg-lace/80 px-5 py-2 figures text-[24px] font-medium tracking-[0.2em] ${
                state === 'USED' ? 'border-open text-open' : 'border-alert text-alert'
              }`}
            >
              {state === 'USED' && <Check className="size-6" strokeWidth={3} />}
              {state === 'USED' ? 'REDEEMED' : 'EXPIRED'}
            </motion.div>
          ) : null}

          <div className="mt-6 flex w-full items-center justify-between border-t border-line pt-4 text-[11.5px]">
            {done ? (
              <span className={state === 'USED' ? 'font-medium text-open' : 'font-medium text-alert'}>
                {state === 'USED' ? 'Enjoy your coffee.' : 'This voucher has expired.'}
              </span>
            ) : (
              <span className="flex items-center gap-2 text-muted">
                <span className="relative flex size-2">
                  <span className="absolute inset-0 animate-ping rounded-none bg-open opacity-60" />
                  <span className="relative size-2 rounded-full bg-open" />
                </span>
                Waiting for the barista
              </span>
            )}
            <Figure tone="muted" className="text-[10.5px]">
              {lastSyncedAt ? `synced ${Math.max(0, Math.round((now - lastSyncedAt) / 1000))}s ago` : 'syncing…'} ·{' '}
              {SYNC_INTERVAL.live / 1000}s
            </Figure>
          </div>

          {done && (
            <Button className="mt-5 w-full" onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
