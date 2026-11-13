import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { LineArt } from '../../components/illustrations/LineArt'
import { Button, Field } from '../../components/ui'
import { Notice } from '../../components/ui/Notice'
import { useForm } from '../../lib/useForm'
import { loginSchema } from '../../lib/validation'
import { PasswordToggle } from './PasswordToggle'

export function LoginPage() {
  const { login, signedOutReason } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    initial: { email: '', password: '' },
    schema: loginSchema,
    onSubmit: async (values) => {
      await login(values)
      navigate(from, { replace: true })
    },
  })

  return (
    <>
      <LineArt name="steam" className="mb-8 h-20 w-[100px] text-satin-deep" />
      <p className="eyebrow">Sign in</p>
      <h1 className="mt-4 text-headline">Welcome back.</h1>

      <form onSubmit={form.handleSubmit} noValidate className="mt-12 flex flex-col gap-8">
        {signedOutReason && !form.formError && <Notice tone="info">{signedOutReason}</Notice>}
        {form.formError && <Notice>{form.formError}</Notice>}

        <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" {...form.field('email')} />
        <Field
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          {...form.field('password')}
          trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <Button type="submit" size="lg" loading={form.submitting} className="min-w-[160px]">
            Sign in
          </Button>
          <p className="text-[13px] text-muted">
            New here?{' '}
            <Link
              to="/register"
              state={location.state}
              className="text-espresso underline decoration-espresso/40 decoration-1 underline-offset-[5px]"
            >
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </>
  )
}
