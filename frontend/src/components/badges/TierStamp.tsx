import { BADGE_THRESHOLDS, USER_BADGES, type UserBadge } from '../../api/types'
import { cx } from '../../lib/cx'
import { BADGE_LABEL, formatPoints } from '../../lib/format'

// Apothecary-label stand-in for the old illustrated badges: a framed,
// typewritten tier card (Nº, name, threshold). Locked tiers print faded.
export function TierStamp({
  badge,
  unlocked = true,
  size = 'md',
  className,
}: {
  badge: UserBadge
  unlocked?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const n = USER_BADGES.indexOf(badge) + 1
  return (
    <div
      className={cx(
        'stamp flex shrink-0 flex-col justify-between border text-center',
        unlocked ? 'border-espresso text-espresso' : 'border-dashed border-line-strong text-faint',
        size === 'sm' && 'h-[92px] w-[76px] p-2 text-[9.5px]',
        size === 'md' && 'h-[124px] w-[100px] p-3 text-[10.5px]',
        size === 'lg' && 'h-[176px] w-[140px] p-4 text-[12px]',
        className,
      )}
      aria-hidden
    >
      <span>Nº {String(n).padStart(2, '0')}</span>
      <span className="border-y border-current py-1.5 leading-tight">{BADGE_LABEL[badge]}</span>
      <span>{formatPoints(BADGE_THRESHOLDS[badge])} pts</span>
    </div>
  )
}
