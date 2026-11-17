import { motion } from 'framer-motion'
import { BADGE_THRESHOLDS, USER_BADGES, type UserProfile } from '../../../api/types'
import { AnimatedNumber } from '../../../components/ui/AnimatedNumber'
import { transition } from '../../../design/motion'
import { cx } from '../../../lib/cx'
import { BADGE_LABEL, formatPoints } from '../../../lib/format'
import { tierProgress } from '../../../lib/loyalty'
import { Tile, TileLabel } from './Tile'

const MAX = BADGE_THRESHOLDS.BEAN_MASTER

// Lifetime points (they never go down; vouchers are cut from per-café wallets),
// set large on the canvas, with a 1px ruler marking every tier threshold.
export function BalanceTile({
  profile,
  walletTotal,
  activeVouchers,
}: {
  profile: UserProfile | null
  walletTotal: number | null
  activeVouchers: number
}) {
  const points = profile?.lifetimePoints ?? 0
  const tier = tierProgress(points)
  const overall = Math.min(points / MAX, 1)

  return (
    <Tile label="Points balance" className="flex min-h-[340px] flex-col justify-between lg:col-span-7 lg:row-span-2">
      <div>
        <TileLabel>Lifetime points</TileLabel>
        <p className="mt-6 flex items-baseline gap-4">
          {profile ? (
            <AnimatedNumber
              value={points}
              className="font-display text-[clamp(4.5rem,10vw,8.5rem)] font-light leading-[0.9] tracking-[-0.02em] text-espresso tabular-nums"
            />
          ) : (
            <span className="font-display text-[clamp(4.5rem,10vw,8.5rem)] font-light leading-[0.9] text-faint">— —</span>
          )}
          <span className="stamp text-[12px] text-muted">pts</span>
        </p>
        <p className="mt-6 max-w-sm text-[14px] leading-relaxed text-ink">
          {!profile
            ? 'Your balance appears here once your account can be identified.'
            : tier.next
              ? (
                <>
                  <span className="figures">{formatPoints(tier.remaining)}</span> points to{' '}
                  <em className="font-display text-[19px] font-normal text-espresso">{BADGE_LABEL[tier.next]}</em>
                </>
              )
              : 'Top tier reached. Every cup from here is a victory lap.'}
        </p>
      </div>

      <div className="mt-14">
        {/* Tier ruler: a 1px line, the reached part in charcoal */}
        <div className="relative h-px bg-line-strong">
          <motion.div
            className="absolute inset-y-0 left-0 bg-espresso"
            initial={{ width: 0 }}
            animate={{ width: `${overall * 100}%` }}
            transition={{ ...transition.slow, duration: 1.1 }}
          />
          {USER_BADGES.map((b) => {
            const reached = points >= BADGE_THRESHOLDS[b]
            return (
              <span
                key={b}
                className={cx('absolute -top-[5px] h-[11px] w-px', reached ? 'bg-espresso' : 'bg-line-strong')}
                style={{ left: `${(BADGE_THRESHOLDS[b] / MAX) * 100}%` }}
              />
            )
          })}
        </div>
        <div className="relative mt-4 h-10">
          {USER_BADGES.map((b, i) => {
            const at = BADGE_THRESHOLDS[b] / MAX
            const align =
              i === 0 ? 'translate-x-0 text-left' : i === USER_BADGES.length - 1 ? '-translate-x-full text-right' : '-translate-x-1/2 text-center'
            const reached = points >= BADGE_THRESHOLDS[b]
            return (
              <div key={b} className={cx('absolute top-0', align)} style={{ left: `${at * 100}%` }}>
                <p className={cx('text-[12px]', reached ? 'text-espresso' : 'text-faint')}>{BADGE_LABEL[b]}</p>
                <p className="stamp text-[10px] text-faint">{formatPoints(BADGE_THRESHOLDS[b])}</p>
              </div>
            )
          })}
        </div>

        <dl className="mt-8 grid grid-cols-2 border-t border-line">
          <div className="pr-6 pt-6">
            <dt className="eyebrow">In café wallets</dt>
            <dd className="mt-2 font-display text-[36px] font-light leading-none text-espresso tabular-nums">
              {walletTotal === null ? '—' : formatPoints(walletTotal)}
            </dd>
          </div>
          <div className="border-l border-line pl-6 pt-6">
            <dt className="eyebrow">Active vouchers</dt>
            <dd className="mt-2 font-display text-[36px] font-light leading-none text-espresso tabular-nums">{activeVouchers}</dd>
          </div>
        </dl>
      </div>
    </Tile>
  )
}
