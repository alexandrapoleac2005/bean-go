import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { LineArt } from '../../components/illustrations/LineArt'
import { Button, Field, Figure } from '../../components/ui'
import { Notice } from '../../components/ui/Notice'
import { cx } from '../../lib/cx'
import { useForm } from '../../lib/useForm'
import { registerSchema } from '../../lib/validation'
import { PasswordToggle } from './PasswordToggle'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    initial: { firstName: '', lastName: '', email: '', password: '' },
    schema: registerSchema,
    onSubmit: async (values) => {
      await register(values)
      navigate(from, { replace: true })
    },
    // 409 from EmailAlreadyExistsException belongs on the email field
    mapApiError: (err) => (err.isConflict ? { email: err.message } : null),
  })

  const pwLength = form.values.password.length
  const pwOk = pwLength >= 6 && pwLength <= 72

  return (
    <>
      <LineArt name="map" className="mb-8 h-20 w-[100px] text-satin-deep" />
      <p className="eyebrow">Create account</p>
      <h1 className="mt-4 text-headline">Start your coffee map.</h1>

      <form onSubmit={form.handleSubmit} noValidate className="mt-12 flex flex-col gap-8">
        {form.formError && <Notice>{form.formError}</Notice>}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Field label="First name" autoComplete="given-name" maxLength={255} {...form.field('firstName')} />
          <Field label="Last name" autoComplete="family-name" maxLength={255} {...form.field('lastName')} />
        </div>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          maxLength={255}
          {...form.field('email')}
        />
        <Field
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          maxLength={72}
          {...form.field('password')}
          trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
          hint={
            <span className="flex items-center justify-between">
              <span>Between 6 and 72 characters.</span>
              <Figure tone={pwLength === 0 ? 'muted' : pwOk ? 'open' : 'satin'} className={cx('text-[12px]')}>
                {pwLength}/72
              </Figure>
            </span>
          }
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <Button type="submit" variant="accent" size="lg" loading={form.submitting} className="min-w-[180px]">
            Create account
          </Button>
          <p className="text-[13px] text-muted">
            Have an account?{' '}
            <Link
              to="/login"
              state={location.state}
              className="text-espresso underline decoration-espresso/40 decoration-1 underline-offset-[5px]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </>
  )
}
