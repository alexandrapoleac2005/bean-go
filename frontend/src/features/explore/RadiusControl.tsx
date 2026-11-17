import { motion } from 'framer-motion'
import { Radar } from 'lucide-react'
import { transition } from '../../design/motion'
import { cx } from '../../lib/cx'
import { RADIUS_STOPS } from './types'

const label = (m: number) => (m < 1000 ? `${m} m` : `${m / 1000} km`)

// Segmented radius picker. The active stop slides under the selection.
export function RadiusControl({ value, onChange }: { value: number; onChange: (m: number) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Search radius"
      className="flex h-10 items-stretch border border-line-strong bg-lace"
    >
      <span className="flex items-center border-r border-line-strong px-3 text-muted"><Radar className="size-4 shrink-0" aria-hidden /></span>
      {RADIUS_STOPS.map((stop) => {
        const selected = stop === value
        return (
          <button
            key={stop}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(stop)}
            className={cx(
              'relative px-3.5 figures text-[12.5px] transition-colors',
              selected ? 'text-lace' : 'text-muted hover:text-espresso',
            )}
          >
            {selected && (
              <motion.span
                layoutId="radius-thumb"
                transition={transition.spring}
                className="absolute inset-0 rounded-none bg-espresso"
              />
            )}
            <span className="relative">{label(stop)}</span>
          </button>
        )
      })}
    </div>
  )
}
