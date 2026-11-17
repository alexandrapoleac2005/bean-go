import type { ReactNode } from 'react'

// Shared chart tooltip: value first and strong, label after and quiet,
// series keyed by a short line stroke (not a box). Positioned by the chart.
export function ChartTooltip({
  x,
  y,
  title,
  rows,
  containerWidth,
}: {
  x: number
  y: number
  title: ReactNode
  rows: Array<{ color: string; value: ReactNode; label: ReactNode }>
  containerWidth: number
}) {
  const flip = x > containerWidth - 180
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 min-w-[140px] rounded-md bg-cocoa px-3 py-2.5 text-lace"
      style={{ left: x, top: y, transform: `translate(${flip ? 'calc(-100% - 12px)' : '12px'}, -50%)` }}
    >
      <p className="text-[11px] text-lace/60">{title}</p>
      <ul className="mt-1.5 space-y-1">
        {rows.map((r, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-[2px] w-3 rounded-none" style={{ background: r.color }} aria-hidden />
            <span className="figures text-[14px] font-medium">{r.value}</span>
            <span className="text-[11.5px] text-lace/65">{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
