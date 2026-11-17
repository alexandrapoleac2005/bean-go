import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

type Tone = 'open' | 'closed' | 'alert' | 'accent' | 'neutral'

const tones: Record<Tone, { wrap: string; dot: string }> = {
  open: { wrap: 'border-open/40 text-open', dot: 'bg-open' },
  closed: { wrap: 'border-line-strong text-muted', dot: 'bg-faint' },
  alert: { wrap: 'border-alert/40 text-alert', dot: 'bg-alert' },
  accent: { wrap: 'border-satin-deep/40 text-satin-deep', dot: 'bg-satin-deep' },
  neutral: { wrap: 'border-line-strong text-espresso', dot: 'bg-espresso' },
}

interface Props {
  tone?: Tone
  pulse?: boolean // live indicator, e.g. "Open now"
  children: ReactNode
  className?: string
}

export function StatusTag({ tone = 'neutral', pulse, children, className }: Props) {
  const t = tones[tone]
  return (
    <span
      className={cx(
        'inline-flex h-6 items-center gap-1.5 border bg-transparent px-2 text-[11.5px] font-normal tracking-[0.01em]',
        t.wrap,
        className,
      )}
    >
      <span className="relative flex size-1.5">
        {pulse && <span className={cx('absolute inset-0 animate-ping rounded-none opacity-60', t.dot)} />}
        <span className={cx('relative size-1.5 rounded-full', t.dot)} />
      </span>
      {children}
    </span>
  )
}
