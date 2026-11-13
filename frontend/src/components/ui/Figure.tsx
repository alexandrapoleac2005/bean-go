import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'

type Tone = 'ink' | 'muted' | 'satin' | 'open' | 'alert'

const tones: Record<Tone, string> = {
  ink: 'text-espresso',
  muted: 'text-muted',
  satin: 'text-satin-deep',
  open: 'text-open',
  alert: 'text-alert',
}

interface FigureProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

// Tabular numbers in the body face. Use for distances, coordinates, ratings,
// point balances and voucher codes, so columns of data line up.
export function Figure({ tone = 'ink', className, ...rest }: FigureProps) {
  return <span className={cx('figures', tones[tone], className)} {...rest} />
}
