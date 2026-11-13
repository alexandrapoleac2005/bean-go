import { formatRating } from '../../lib/format'
import { cx } from '../../lib/cx'

interface Props {
  value: number | null | undefined
  count?: number | null
  className?: string
}

// "4.6 / 5 · 128" with a thin bar instead of a row of stars.
export function Rating({ value, count, className }: Props) {
  const pct = value ? Math.min(Math.max(value / 5, 0), 1) * 100 : 0
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <span className="figures text-[15px] font-medium text-espresso">
        {formatRating(value)}
        <span className="text-faint">/5</span>
      </span>
      <span className="relative h-[3px] w-12 overflow-hidden rounded-none bg-line" aria-hidden>
        <span className="absolute inset-y-0 left-0 rounded-none bg-satin-deep" style={{ width: `${pct}%` }} />
      </span>
      {count != null && <span className="figures text-[12px] text-muted">{count}</span>}
    </span>
  )
}
