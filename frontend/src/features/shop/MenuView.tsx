import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { MenuItem } from '../../api/types'
import { transition } from '../../design/motion'
import { cx } from '../../lib/cx'
import { formatPrice } from '../../lib/format'

// Category tabs (in the order the café listed them) + a printed-menu style list.
export function MenuView({ menu }: { menu: MenuItem[] }) {
  const categories = useMemo(() => {
    const map = new Map<string, MenuItem[]>()
    for (const item of menu) {
      const key = item.category.trim() || 'Other'
      map.set(key, [...(map.get(key) ?? []), item])
    }
    return [...map.entries()]
  }, [menu])

  const [selected, setSelected] = useState<string | null>(null)
  const current = categories.find(([name]) => name === selected) ?? categories[0]

  if (!menu.length) return <p className="text-[14px] text-muted">No menu published yet.</p>

  return (
    <div>
      <div role="tablist" aria-label="Menu categories" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto">
        {categories.map(([name, items]) => {
          const active = name === current[0]
          return (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(name)}
              className={cx(
                'relative shrink-0 px-2.5 pb-2.5 pt-1 text-[13px] font-medium transition-colors',
                active ? 'text-espresso' : 'text-muted hover:text-espresso',
              )}
            >
              {name}
              <span className="figures ml-1.5 text-[11px] text-faint">{items.length}</span>
              {active && (
                <motion.span
                  layoutId="menu-tab"
                  transition={transition.spring}
                  className="absolute inset-x-2.5 bottom-0 h-[2px] rounded-none bg-satin"
                />
              )}
            </button>
          )
        })}
      </div>
      <div className="h-px bg-line" />

      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={current[0]}
          role="tabpanel"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={transition.quick}
          className="mt-2"
        >
          {current[1].map((item) => (
            <li key={item.id} className="py-3">
              <div className="flex items-baseline gap-2">
                <span className="font-sans font-medium text-[17px] leading-snug">{item.name}</span>
                {/* dotted leader, like a printed menu */}
                <span className="mb-1 flex-1 border-b border-dotted border-faint/60" aria-hidden />
                <span className="figures text-[13.5px] font-medium">{formatPrice(item.price)}</span>
              </div>
              {item.description && (
                <p className="mt-1 pr-16 text-[13px] leading-relaxed text-muted">{item.description}</p>
              )}
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  )
}
