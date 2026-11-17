import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { validate, type Rule } from './validation'

type Errors<T> = Partial<Record<keyof T, string>>

interface Options<T extends Record<string, string>> {
  initial: T
  schema: { [K in keyof T]?: Rule[] }
  onSubmit: (values: T) => Promise<void>
  // Turn known API errors into field errors (e.g. 409 email taken -> email)
  mapApiError?: (error: ApiError) => Errors<T> | null
}

// Small form helper: validates on submit, then live for fields already shown an error.
// Server validation messages ("field: message") are routed back onto matching fields.
export function useForm<T extends Record<string, string>>({ initial, schema, onSubmit, mapApiError }: Options<T>) {
  const [values, setValues] = useState<T>(initial)
  const [errors, setErrors] = useState<Errors<T>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const field = useCallback(
    (name: keyof T) => ({
      name: name as string,
      value: values[name],
      error: errors[name],
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const next = { ...values, [name]: e.target.value } as T
        setValues(next)
        if (submitted) setErrors(validate(next, schema))
      },
    }),
    [values, errors, submitted, schema],
  )

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setFormError(null)
    const found = validate(values, schema)
    setErrors(found)
    if (Object.keys(found).length) return

    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      if (err instanceof ApiError) {
        const mapped = mapApiError?.(err)
        const fromServer = Object.fromEntries(
          Object.entries(err.fieldErrors).filter(([key]) => key in values),
        ) as Errors<T>
        const fieldErrs = { ...fromServer, ...mapped }
        if (Object.keys(fieldErrs).length) setErrors(fieldErrs)
        else setFormError(err.message)
      } else {
        setFormError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return { values, setValues, errors, formError, submitting, field, handleSubmit }
}
