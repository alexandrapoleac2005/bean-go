import { motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { chart } from '../../../design/tokens'
import { transition } from '../../../design/motion'
import { cx } from '../../../lib/cx'
import { ChartTooltip } from './Tooltip'
import { useWidth } from './useWidth'

export interface BarRow {
  key: string | number
  label: ReactNode
  value: number
  display: string // value at the bar tip
  meta?: ReactNode // quiet second line under the label
  tooltip?: Array<{ value: ReactNode; label: ReactNode }>
}

// Horizontal bars on one shared baseline, one hue. Each row is a hairline track
// with a fine 3px line drawn over it, like the rulers on the rewards page;
// the value is printed at the end of the track.
export function BarList({
  rows,
  max,
  barColor = chart.roast,
  labelWidth = 150,
  title,
}: {
  rows: BarRow[]
  max?: number
  barColor?: string
  labelWidth?: number
  title: (row: BarRow) => ReactNode
}) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHoverState] = useState<{ i: number; y: number } | null>(null)
  const enter = (i: number, el: HTMLElement) => setHoverState({ i, y: el.offsetTop + el.offsetHeight / 2 })
  const leave = () => setHoverState(null)
  const top = max ?? Math.max(...rows.map((r) => r.value), 1)
  const track = Math.max(width - labelWidth - 56, 40)

  return (
    <div ref={ref} className="relative">
      <ul className="space-y-2.5">
        {rows.map((r, i) => {
          const w = Math.max((r.value / top) * track, r.value > 0 ? 3 : 0)
          return (
            <li
              key={r.key}
              tabIndex={0}
              onPointerEnter={(e) => enter(i, e.currentTarget)}
              onPointerLeave={leave}
              onFocus={(e) => enter(i, e.currentTarget)}
              onBlur={leave}
              className="grid items-center gap-3 rounded-sm py-1 outline-none focus-visible:bg-linen"
              style={{ gridTemplateColumns: `${labelWidth}px 1fr` }}
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">{r.label}</p>
                {r.meta && <p className="truncate text-[11.5px] text-muted">{r.meta}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="relative block h-px shrink-0 bg-line-strong" style={{ width: track }}>
                  <motion.span
                    className={cx('absolute -top-px left-0 block h-[3px] transition-opacity', hover !== null && hover.i !== i && 'opacity-45')}
                    style={{ background: barColor }}
                    initial={{ width: 0 }}
                    animate={{ width: w }}
                    transition={{ ...transition.slow, delay: i * 0.04 }}
                  />
                </span>
                <span className="figures text-[12.5px] text-espresso">{r.display}</span>
              </div>
            </li>
          )
        })}
      </ul>
      {hover !== null && rows[hover.i]?.tooltip && (
        <ChartTooltip
          x={labelWidth + Math.max((rows[hover.i].value / top) * track, 3) + 12}
          y={hover.y}
          containerWidth={width}
          title={title(rows[hover.i])}
          rows={rows[hover.i].tooltip!.map((t) => ({ color: barColor, ...t }))}
        />
      )}
    </div>
  )
}
