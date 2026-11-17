import { motion } from 'framer-motion'
import { CircleAlert, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { transition } from '../../design/motion'
import { cx } from '../../lib/cx'

// Inline message strip: alert tone for errors, linen for info.
export function Notice({ tone = 'alert', children }: { tone?: 'alert' | 'info'; children: ReactNode }) {
  const Icon = tone === 'alert' ? CircleAlert : Info
  return (
    <motion.div
      role={tone === 'alert' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition.base}
      className={cx(
        'flex items-start gap-2.5 border-l-2 px-3.5 py-3 text-[13px] leading-snug',
        tone === 'alert' ? 'border-alert bg-alert-wash text-alert' : 'border-faint bg-linen text-muted',
      )}
    >
      <Icon className="mt-px size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </motion.div>
  )
}
