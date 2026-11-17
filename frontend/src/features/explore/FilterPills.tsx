import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Facility } from '../../api/types'
import { transition } from '../../design/motion'
import { cx } from '../../lib/cx'
import { facilityIcon } from './facilityIcon'

interface Props {
  facilities: Facility[] // every facility seen among the nearby shops
  selected: Set<number>
  onToggle: (id: number) => void
  openNow: boolean
  onToggleOpenNow: () => void
}

export function FilterPills({ facilities, selected, onToggle, openNow, onToggleOpenNow }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      <Pill active={openNow} onClick={onToggleOpenNow} tone="open">
        <span className={cx('size-1.5 rounded-full', openNow ? 'bg-lace' : 'bg-open')} />
        Open now
      </Pill>
      {facilities.length > 0 && <span className="mx-1 h-5 w-px shrink-0 bg-line" aria-hidden />}
      {facilities.map((f) => {
        const Icon = facilityIcon(f.name, f.icon)
        const active = selected.has(f.id)
        return (
          <Pill key={f.id} active={active} onClick={() => onToggle(f.id)}>
            {active ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
            {f.name}
          </Pill>
        )
      })}
    </div>
  )
}

function Pill({
  active,
  onClick,
  tone = 'espresso',
  children,
}: {
  active: boolean
  onClick: () => void
  tone?: 'espresso' | 'open'
  children: React.ReactNode
}) {
  return (
    <motion.button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      transition={transition.quick}
      className={cx(
        'inline-flex h-8 shrink-0 items-center gap-1.5 border px-3 text-[12.5px] transition-colors',
        active
          ? tone === 'open'
            ? 'border-open bg-open text-lace'
            : 'border-espresso bg-espresso text-lace'
          : 'border-line-strong bg-lace text-espresso hover:border-espresso',
      )}
    >
      {children}
    </motion.button>
  )
}
