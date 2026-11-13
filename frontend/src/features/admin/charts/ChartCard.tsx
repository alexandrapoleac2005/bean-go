import { motion } from 'framer-motion'
import { BarChart3, Table2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { rise } from '../../../design/motion'
import { cx } from '../../../lib/cx'

// Card shell for every chart: title, one-line subtitle, and a Chart/Table toggle
// (the table view is the accessible fallback and the home of every value).
// While data refetches the previous render stays, dimmed: no skeleton, no jump.
export function ChartCard({
  title,
  subtitle,
  className,
  refreshing,
  table,
  children,
  aside,
}: {
  title: string
  subtitle?: ReactNode
  className?: string
  refreshing?: boolean
  table?: ReactNode // omit for cards that have no table view (e.g. an empty state)
  children: ReactNode
  aside?: ReactNode
}) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  return (
    <motion.section
      variants={rise}
      aria-label={title}
      className={cx('card relative flex flex-col p-6', className)}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display font-normal text-[26px] leading-tight tracking-[-0.01em]">{title}</h2>
          {subtitle && <p className="mt-1 text-[11.5px] text-muted">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {aside}
          {table && (
            <div role="group" aria-label="View" className="flex rounded-none bg-linen p-0.5">
              {(['chart', 'table'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  aria-label={v === 'chart' ? 'Chart view' : 'Table view'}
                  className={cx(
                    'flex size-7 items-center justify-center rounded-full transition-colors',
                    view === v ? 'bg-lace text-espresso' : 'text-muted hover:text-espresso',
                  )}
                >
                  {v === 'chart' ? <BarChart3 className="size-3.5" /> : <Table2 className="size-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      <div className={cx('mt-5 flex-1 transition-opacity duration-300', refreshing && 'opacity-50')}>
        {view === 'table' && table ? table : children}
      </div>
    </motion.section>
  )
}

// Plain data table used by every card's table view.
export function DataTable({
  columns,
  rows,
}: {
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' }>
  rows: Array<Record<string, ReactNode>>
}) {
  return (
    <div className="max-h-[320px] overflow-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead className="sticky top-0 bg-lace">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cx('border-b border-line py-2 text-[12.5px] font-medium tracking-[-0.01em] text-muted', c.align === 'right' ? 'text-right' : 'text-left')}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line/60">
              {columns.map((c) => (
                <td key={c.key} className={cx('py-2', c.align === 'right' ? 'figures text-right' : '')}>
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
