import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { formatPoints } from '../../lib/format'

// Counts up/down to `value` with a soft spring. Starts from 0 on mount.
export function AnimatedNumber({
  value,
  format = formatPoints,
  className,
}: {
  value: number
  format?: (n: number) => string
  className?: string
}) {
  const target = useMotionValue(0)
  const spring = useSpring(target, { stiffness: 70, damping: 18, mass: 1 })
  const text = useTransform(spring, (v) => format(Math.round(v)))

  useEffect(() => {
    target.set(value)
  }, [value, target])

  return (
    <motion.span className={className} aria-label={format(value)}>
      {text}
    </motion.span>
  )
}
