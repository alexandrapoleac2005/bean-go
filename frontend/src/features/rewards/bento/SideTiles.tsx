import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Coffee } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { LOYALTY_RULES, type LoyaltyWallet, type UserBadge } from '../../../api/types'
import { TierStamp } from '../../../components/badges/TierStamp'
import { BADGE_BLURB } from '../../../components/badges/badgeCopy'
import { Figure } from '../../../components/ui'
import { transition } from '../../../design/motion'
import { cx } from '../../../lib/cx'
import { BADGE_LABEL, formatPoints } from '../../../lib/format'
import { walletProgress } from '../../../lib/loyalty'
import { StampCard } from './StampCard'
import { Tile, TileLabel } from './Tile'

export function CurrentBadgeTile({ badge }: { badge: UserBadge | null }) {
  return (
    <Tile tone="linen" label="Current badge" className="flex items-center gap-8 lg:col-span-5">
      <motion.div
        key={badge ?? 'none'}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition.slow}
        className="shrink-0"
      >
        <TierStamp badge={badge ?? 'ROOKIE'} unlocked={badge !== null} />
      </motion.div>
      <div>
        <TileLabel>Current badge</TileLabel>
        <p className="mt-3 font-display text-[40px] font-light leading-none">{badge ? BADGE_LABEL[badge] : '—'}</p>
        <p className="mt-3 text-[13px] leading-relaxed text-ink">{badge ? BADGE_BLURB[badge] : 'Sync your account to see your tier.'}</p>
      </div>
    </Tile>
  )
}

interface WalletRow {
  wallet: LoyaltyWallet
  activeVouchers: number
}

// One paper stamp card per café, flipped through with the arrows.
// Cards that can still earn a voucher come first, closest to the reward first.
export function NextVoucherTile({ rows }: { rows: WalletRow[] | null }) {
  const cards = useMemo(
    () =>
      (rows ?? [])
        .map((r) => ({ ...r, p: walletProgress(r.wallet.points, r.activeVouchers) }))
        .sort((a, b) => Number(a.p.full) - Number(b.p.full) || b.p.fraction - a.p.fraction),
    [rows],
  )
  // Remember the café, not the position, so a refresh that reorders the cards
  // doesn't swap the one being looked at.
  const [shopId, setShopId] = useState<number | null>(null)
  const [direction, setDirection] = useState(1)

  const found = cards.findIndex((c) => c.wallet.coffeeShopId === shopId)
  const index = found === -1 ? 0 : found
  const card = cards[index]
  const many = cards.length > 1
  const cardKey = card?.wallet.coffeeShopId ?? 'blank'

  const flip = (step: number) => {
    const next = cards[(index + step + cards.length) % cards.length]
    setDirection(step)
    setShopId(next.wallet.coffeeShopId)
  }

  return (
    <Tile tone="satin" label="Stamp cards" className="lg:col-span-5">
      <div className="flex items-baseline justify-between gap-3">
        <TileLabel>{many ? 'Stamp cards' : 'Stamp card'}</TileLabel>
        {many && (
          <Figure tone="muted" className="shrink-0 text-[11px]" aria-live="polite">
            {index + 1} / {cards.length}
          </Figure>
        )}
      </div>

      <Flip id={cardKey} direction={direction}>
        <div className="mt-3 flex items-baseline justify-between gap-4">
          <p className={cx('truncate font-display text-[30px] font-normal leading-tight', !card && 'text-faint')}>
            {card ? card.wallet.coffeeShopName : 'Your first card'}
          </p>
          {card && (
            <Figure tone="muted" className="shrink-0 text-[11px]">
              {Math.min(card.wallet.points, LOYALTY_RULES.pointsForVoucher)}/{LOYALTY_RULES.pointsForVoucher} points
            </Figure>
          )}
        </div>
      </Flip>

      {/* The arrows stay still on either side while the card between them slides. */}
      <div className="mt-6 flex items-center gap-2 sm:gap-3">
        {many && (
          <FlipButton label="Previous café" onClick={() => flip(-1)}>
            <ChevronLeft className="size-4" strokeWidth={1.5} />
          </FlipButton>
        )}
        <div className="min-w-0 flex-1">
          <Flip id={cardKey} direction={direction}>
            <StampCard points={card?.wallet.points ?? 0} />
          </Flip>
        </div>
        {many && (
          <FlipButton label="Next café" onClick={() => flip(1)}>
            <ChevronRight className="size-4" strokeWidth={1.5} />
          </FlipButton>
        )}
      </div>

      <Flip id={cardKey} direction={direction}>
        <p className="mt-5 text-[13px] text-ink">
          {card?.p.full ? (
            <span className="text-[11.5px]">
              Your <Figure>{LOYALTY_RULES.maxActiveVouchersPerShop}</Figure> tickets here are waiting. Use one to earn
              the next.
            </span>
          ) : card ? (
            <>
              A stamp every <Figure>5</Figure> points. <Figure className="text-espresso">{card.p.remaining}</Figure>{' '}
              more for a <Figure>{LOYALTY_RULES.voucherDiscountPercentage}%</Figure> ticket.
            </>
          ) : (
            <span className="text-muted">
              {rows === null ? 'Waiting for your wallets.' : 'Collect points at any café to press your first stamp.'}
            </span>
          )}
        </p>
      </Flip>
    </Tile>
  )
}

// The card slides a short way in the direction of the arrow that was pressed.
const flipVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -24 }),
}

// Swaps its content with the slide whenever `id` (the café) changes.
function Flip({ id, direction, children }: { id: number | string; direction: number; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <motion.div
        key={id}
        custom={direction}
        variants={flipVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={transition.quick}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

function FlipButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-8 shrink-0 items-center justify-center border border-line-strong text-espresso transition-colors duration-150 hover:border-[#333333] hover:bg-[#252525] hover:text-lace sm:size-9"
    >
      {children}
    </button>
  )
}

export function WalletsTile({ rows }: { rows: WalletRow[] | null }) {
  return (
    <Tile label="Café wallets" className="lg:col-span-5">
      <div className="flex items-baseline justify-between">
        <TileLabel>Café wallets</TileLabel>
        {rows && <Figure tone="muted" className="text-[11px]">{rows.length} cafés</Figure>}
      </div>
      {rows === null ? (
        <p className="mt-6 text-[14px] text-muted">Per-café points appear once your account can be identified.</p>
      ) : rows.length === 0 ? (
        <div className="mt-6 flex items-center gap-3 text-[14px] text-muted">
          <Coffee className="size-4 text-satin-deep" /> No points yet. Ask for them at the till.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line-soft border-t border-line-soft">
          {rows
            .slice()
            .sort((a, b) => b.wallet.points - a.wallet.points)
            .map(({ wallet, activeVouchers }) => {
              const p = walletProgress(wallet.points, activeVouchers)
              return (
                <li key={wallet.coffeeShopId} className="py-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-[14px] text-espresso">{wallet.coffeeShopName}</span>
                    <Figure className="shrink-0 text-[13px]">
                      {formatPoints(wallet.points)}
                      <span className="text-faint">/50</span>
                    </Figure>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="h-px flex-1 bg-line-strong">
                      <motion.div
                        className={cx('h-full', p.full ? 'bg-faint' : 'bg-espresso')}
                        initial={{ width: 0 }}
                        animate={{ width: `${p.fraction * 100}%` }}
                        transition={transition.slow}
                      />
                    </div>
                    <span className="flex gap-1" aria-label={`${activeVouchers} of 3 voucher slots used`}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} className={cx('size-2 border', i < activeVouchers ? 'border-espresso bg-espresso' : 'border-line-strong')} />
                      ))}
                    </span>
                  </div>
                  {p.full && (
                    <p className="mt-2 text-[12px] text-muted">
                      Wallet full: use a voucher here to unlock the next one.
                    </p>
                  )}
                </li>
              )
            })}
        </ul>
      )}
    </Tile>
  )
}
