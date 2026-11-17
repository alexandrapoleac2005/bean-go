import { motion, type HTMLMotionProps } from 'framer-motion'
import { LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { transition } from '../../design/motion'
import { cx } from '../../lib/cx'

type Variant = 'primary' | 'accent' | 'quiet' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

// Aesop-style: sharp rectangles, a 1px charcoal frame, quiet type.
const variants: Record<Variant, string> = {
  // Charcoal block with alabaster type
  primary: 'border border-[#333333] bg-[#252525] text-lace hover:bg-transparent hover:text-espresso',
  // Same weight as primary: there is one kind of primary action
  accent: 'border border-[#333333] bg-[#252525] text-lace hover:bg-transparent hover:text-espresso',
  // Outline on the canvas
  quiet: 'border border-[#333333] bg-transparent text-espresso hover:bg-[#252525] hover:text-lace',
  // Text only, hairline underline on hover
  ghost: 'text-espresso underline-offset-[6px] decoration-1 hover:underline',
  danger: 'border border-alert bg-transparent text-alert hover:bg-alert hover:text-lace',
}

const sizes: Record<Size, string> = {
  sm: 'min-h-9 px-4 py-2 text-[12.5px] gap-2',
  md: 'min-h-12 px-6 py-[14px] text-[13px] gap-3',
  lg: 'min-h-14 px-8 py-4 text-[13px] gap-3',
}

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  // Trailing arrow, on by default for framed buttons without an icon
  arrow?: boolean
  children?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  arrow,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading
  const showArrow = arrow ?? (!icon && size !== 'sm' && variant !== 'ghost' && variant !== 'danger')
  return (
    <motion.button
      whileTap={isDisabled ? undefined : { scale: 0.99 }}
      transition={transition.quick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cx(
        'inline-flex select-none items-center justify-between rounded-none font-sans font-normal tracking-[0.02em]',
        'transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        variant !== 'ghost' && sizes[size],
        variant === 'ghost' && 'gap-1.5 text-[13px]',
        className,
      )}
      {...rest}
    >
      <span className="inline-flex items-center gap-2">
        {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
        {children}
      </span>
      {showArrow && (
        <span aria-hidden className="pl-4 text-[14px] leading-none">
          →
        </span>
      )}
    </motion.button>
  )
}
