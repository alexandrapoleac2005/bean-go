import { Link } from 'react-router'
import type { Role } from '../api/types'
import { ROLE_LABEL } from '../lib/format'
import { useAuth } from './useAuth'

export function ForbiddenView({ required }: { required: Role[] }) {
  const { role, roleStatus } = useAuth()
  return (
    <div className="mx-auto grid max-w-[1280px] grid-cols-12 gap-6 px-6 py-28">
      <div className="col-span-12 md:col-span-7">
        <p className="eyebrow text-alert">403 · Behind the counter</p>
        <h1 className="mt-5 text-headline">This room is for {required.map((r) => ROLE_LABEL[r]).join(' or ')} accounts.</h1>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
          {roleStatus === 'failed'
            ? "We couldn't confirm your account type. Check your connection and reload."
            : `You're signed in as ${role ? ROLE_LABEL[role].toLowerCase() : 'an unknown role'}.`}
        </p>
        <Link
          to="/"
          className="mt-10 inline-block text-sm font-medium underline decoration-espresso/40 decoration-1 underline-offset-4"
        >
          Back to the map
        </Link>
      </div>
    </div>
  )
}
