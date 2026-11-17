import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { LineArt, type LineArtName } from '../illustrations/LineArt'

// Illustration + serif headline + one helpful line (+ optional action).
export function EmptyState({
  art,
  title,
  body,
  action,
  compact,
  className,
}: {
  art: LineArtName
  title: string
  body?: ReactNode
  action?: ReactNode
  compact?: boolean
  className?: string
}) {
  return (
    <div className={cx('flex flex-col items-start', compact ? 'gap-2 py-6' : 'gap-3 py-10', className)}>
      <LineArt name={art} className={cx('text-satin-deep', compact ? 'h-14 w-[70px]' : 'h-20 w-[100px]')} />
      <p className={cx('font-medium leading-tight tracking-[-0.01em]', compact ? 'text-[16px]' : 'text-[19px]')}>{title}</p>
      {body && <div className="max-w-sm text-[13.5px] leading-relaxed text-muted">{body}</div>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
