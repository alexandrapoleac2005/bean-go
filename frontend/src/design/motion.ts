import type { Transition, Variants } from 'framer-motion'

// "Pour" easing: fast start, long soft settle. Matches --ease-pour in CSS.
export const pour = [0.22, 1, 0.36, 1] as const

export const transition = {
  quick: { duration: 0.18, ease: pour },
  base: { duration: 0.32, ease: pour },
  slow: { duration: 0.6, ease: pour },
  spring: { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 },
} satisfies Record<string, Transition>

export const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: transition.base },
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transition.base },
}

// Parent variant for lists: children rise one after another.
export const stagger = (step = 0.05, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
})
