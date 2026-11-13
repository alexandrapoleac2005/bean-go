import type { CSSProperties } from 'react'
import { cx } from '../../lib/cx'

// Warm loading placeholder: linen block with a slow satin sheen sweeping across.
// The sheen is off under prefers-reduced-motion (see .skeleton in index.css).
export function Skeleton({
  className,
  rounded = 'xs',
  style,
}: {
  className?: string
  rounded?: 'xs' | 'md' | 'full'
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden
      style={style}
      className={cx(
        'skeleton block',
        rounded === 'full' ? 'rounded-none' : rounded === 'md' ? 'rounded-md' : 'rounded-xs',
        className,
      )}
    />
  )
}

// A few stacked text lines, last one shorter.
export function SkeletonLines({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <span className={cx('flex flex-col gap-2', className)} aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className="h-3" style={{ width: i === lines - 1 ? '55%' : `${92 - i * 6}%` }} />
      ))}
    </span>
  )
}
