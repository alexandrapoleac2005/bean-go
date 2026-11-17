import { motion } from 'framer-motion'
import { LOYALTY_RULES } from '../../../api/types'
import { transition } from '../../../design/motion'
import { cx } from '../../../lib/cx'

const SLOTS = 10
const PER_STAMP = LOYALTY_RULES.pointsForVoucher / SLOTS

// A fixed tilt per slot, so the stamps look pressed by hand rather than printed.
const TILT = [-8, 5, -3, 9, -6, 4, -10, 6, -4, 7]

// A paper loyalty card: ten slots, one bean stamp for every 5 wallet points.
// The last slot is the reward. Drawn as a hairline grid like the rest of the page.
export function StampCard({ points, className }: { points: number; className?: string }) {
  const clamped = Math.min(Math.max(points, 0), LOYALTY_RULES.pointsForVoucher)
  const filled = Math.floor(clamped / PER_STAMP)
  const partial = clamped % PER_STAMP > 0
  const remaining = LOYALTY_RULES.pointsForVoucher - clamped

  return (
    <div
      role="img"
      aria-label={`${filled} of ${SLOTS} stamps. ${remaining} points to a ${LOYALTY_RULES.voucherDiscountPercentage}% voucher.`}
      className={cx('grid max-w-[400px] grid-cols-5 gap-px border border-line bg-line', className)}
    >
      {Array.from({ length: SLOTS }, (_, i) => {
        const isFilled = i < filled
        const isPartial = i === filled && partial
        const isReward = i === SLOTS - 1
        return (
          <div key={i} className="relative flex aspect-square items-center justify-center bg-lace">
            {isFilled ? (
              <motion.span
                key="stamped"
                initial={{ opacity: 0, scale: 1.5, rotate: TILT[i] - 14 }}
                animate={{ opacity: 1, scale: 1, rotate: TILT[i] }}
                transition={{ ...transition.spring, delay: 0.25 + i * 0.06 }}
                className="text-espresso"
              >
                <Bean />
              </motion.span>
            ) : isPartial ? (
              // Points towards the next stamp: the bean is pencilled in, not inked yet.
              <span className="text-faint" style={{ transform: `rotate(${TILT[i]}deg)` }}>
                <Bean pencilled />
              </span>
            ) : isReward ? (
              <span className="stamp text-[11px] text-satin-deep">{LOYALTY_RULES.voucherDiscountPercentage}%</span>
            ) : (
              <span className="stamp text-[10px] text-line-strong">{String(i + 1).padStart(2, '0')}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Bean({ pencilled }: { pencilled?: boolean }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className="size-7 sm:size-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeDasharray={pencilled ? '1.5 3.5' : undefined}
      aria-hidden
    >
      <ellipse cx="16" cy="16" rx="7.5" ry="11" fill={pencilled ? 'none' : 'var(--color-satin-wash)'} />
      <path d="M16 5c3.5 4 3.5 7.5 0 11s-3.5 7 0 11" />
    </svg>
  )
}
