import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { rise } from '../../../design/motion'
import { cx } from '../../../lib/cx'

// Tones are kept for callers; every cell now sits flat on the canvas.
// The parent grid draws the 1px hairlines between cells (gap-px over bg-line).
type Tone = 'cocoa' | 'linen' | 'satin' | 'paper'

export function Tile({
  className,
  children,
  label,
}: {
  tone?: Tone
  className?: string
  children: ReactNode
  label?: string
}) {
  return (
    <motion.section
      variants={rise}
      aria-label={label}
      className={cx('relative overflow-hidden bg-lace p-8 text-ink lg:p-12', className)}
    >
      {children}
    </motion.section>
  )
}

export function TileLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('eyebrow', className)}>{children}</p>
}
