import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: ReactNode
  error?: string
  mono?: boolean // codes, coordinates, ids
  trailing?: ReactNode // e.g. a show-password toggle
}

// Square framed input on the canvas: label above, charcoal frame on focus.
export function Field({ label, hint, error, mono, trailing, className, id, ...rest }: FieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={inputId} className="text-[12.5px] text-ink">
        {label}
      </label>
      <div
        className={cx(
          'flex items-center border bg-transparent transition-colors duration-150',
          error ? 'border-alert' : 'border-line-strong hover:border-faint focus-within:border-espresso focus-within:hover:border-espresso',
        )}
      >
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cx(
            'h-12 w-full min-w-0 border-0 bg-transparent px-4 text-[14px] text-espresso',
            'placeholder:text-faint focus:outline-none focus-visible:outline-none',
            mono && 'stamp text-[13px]',
          )}
          {...rest}
        />
        {trailing && <span className="flex shrink-0 items-center pr-3">{trailing}</span>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-[12.5px] text-alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
