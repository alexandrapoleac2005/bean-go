import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, CheckCircle2, MapPin, Plus, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import type { MerchantShop } from '../../api/types'
import { useAuth } from '../../auth/useAuth'
import { Button, Field, StatusTag } from '../../components/ui'
import { EmptyState } from '../../components/ui/EmptyState'
import { Notice } from '../../components/ui/Notice'
import { Skeleton } from '../../components/ui/Skeleton'
import { useCreateShop } from '../../data/merchant'
import { rise, transition } from '../../design/motion'
import { formatCoordinates } from '../../lib/format'
import { useForm } from '../../lib/useForm'
import { cafeSchema } from './cafeSchema'
import { LocationPicker } from './LocationPicker'
import { inputBox } from '../../components/ui/inputStyles'

interface Props {
  shops: MerchantShop[] | undefined
  loading: boolean
  error: boolean
}

export function MyCafes({ shops, loading, error }: Props) {
  const [adding, setAdding] = useState(false)
  const [sent, setSent] = useState<string | null>(null)

  return (
    <section aria-labelledby="cafes-title">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-espresso/25 pb-4">
        <div>
          <p className="eyebrow">Your cafés</p>
          <h2 id="cafes-title" className="mt-3 text-headline">
            On the map
          </h2>
        </div>
        {!adding && (
          <Button
            variant="accent"
            icon={<Plus className="size-4" />}
            onClick={() => {
              setSent(null)
              setAdding(true)
            }}
          >
            Add a café
          </Button>
        )}
      </div>

      {sent && (
        <p role="status" className="mt-5 flex items-center gap-2 text-[14px] font-medium text-open">
          <CheckCircle2 className="size-4" /> {sent} was sent for approval. It appears on the map once an admin approves
          it.
        </p>
      )}

      <AnimatePresence initial={false}>
        {adding && (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={transition.base}
            className="overflow-hidden"
          >
            <AddCafeForm
              onCancel={() => setAdding(false)}
              onCreated={(name) => {
                setAdding(false)
                setSent(name)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} rounded="md" className="h-32 w-full" />
            ))}
          </div>
        ) : error ? (
          <Notice>Couldn’t load your cafés. Check your connection.</Notice>
        ) : !shops || shops.length === 0 ? (
          <EmptyState
            art="cup"
            title="No cafés yet."
            body="Add your first café. Once an admin approves it, customers can find it on the map."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((s) => (
              <motion.li key={s.id} variants={rise} className="card flex flex-col p-5 transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-[28px] font-normal leading-tight">{s.name}</p>
                  {s.approved ? (
                    <StatusTag tone="open" className="shrink-0">
                      Approved
                    </StatusTag>
                  ) : (
                    <StatusTag tone="accent" className="shrink-0">
                      Waiting for approval
                    </StatusTag>
                  )}
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-[13px] text-muted">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" />
                  {s.address}
                </p>
                {!s.approved && <p className="mt-3 text-[12.5px] text-muted">An admin will review it soon.</p>}
                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-5">
                  <Link
                    to={`/merchant/cafes/${s.id}`}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium underline-offset-4 decoration-espresso/40 decoration-1 hover:underline"
                  >
                    <Settings2 className="size-3.5" /> Manage
                  </Link>
                  {s.approved && (
                    <Link
                      to={`/?shop=${s.id}`}
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-muted underline-offset-4 decoration-espresso/40 decoration-1 hover:text-espresso hover:underline"
                    >
                      View on map <ArrowUpRight className="size-3.5" />
                    </Link>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function AddCafeForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (name: string) => void }) {
  const { email } = useAuth()
  const create = useCreateShop()
  const form = useForm({
    initial: { name: '', address: '', description: '', contactEmail: email ?? '', contactPhone: '', lat: '', lng: '' },
    schema: cafeSchema,
    onSubmit: async (v) => {
      await create.mutateAsync({
        name: v.name.trim(),
        address: v.address.trim(),
        description: v.description.trim() || undefined,
        contactEmail: v.contactEmail.trim(),
        contactPhone: v.contactPhone.trim() || undefined,
        lat: Number(v.lat),
        lng: Number(v.lng),
      })
      onCreated(v.name.trim())
    },
  })
  const { values, setValues, errors } = form
  const location = values.lat ? { lat: Number(values.lat), lng: Number(values.lng) } : null
  const description = form.field('description')

  return (
    <form onSubmit={form.handleSubmit} noValidate className="card mt-6 p-6">
      <h3 className="font-display text-[32px] font-normal leading-tight">Add a café</h3>
      <p className="mt-1 text-[13px] text-muted">An admin reviews every new café before it appears on the map.</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Field label="Name" placeholder="e.g. The Linen Cup" {...form.field('name')} />
          <Field label="Address" placeholder="Str. Universității 7, Cluj-Napoca" {...form.field('address')} />
          <div className="flex flex-col gap-2">
            <label htmlFor="cafe-description" className="eyebrow">
              Description <span className="normal-case tracking-normal text-faint">(optional)</span>
            </label>
            <textarea
              id="cafe-description"
              rows={3}
              placeholder="What makes your café special?"
              className={`resize-none px-4 py-3 leading-relaxed ${inputBox}`}
              {...description}
            />
            {errors.description ? (
              <p className="text-[12px] text-alert">{errors.description}</p>
            ) : (
              <p className="text-right text-[11.5px] text-faint">{values.description.length}/500</p>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Contact email" type="email" {...form.field('contactEmail')} />
            <Field label="Phone (optional)" type="tel" placeholder="+40 712 345 678" {...form.field('contactPhone')} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="eyebrow">Location</span>
          <LocationPicker
            value={location}
            onChange={(p) => setValues((v) => ({ ...v, lat: String(p.lat), lng: String(p.lng) }))}
          />
          {errors.lat ? (
            <p className="text-[12px] text-alert">{errors.lat}</p>
          ) : (
            <p className="text-[12px] text-muted">
              {location ? (
                <span className="figures">{formatCoordinates(location.lat, location.lng)}</span>
              ) : (
                'Click the map where your café is. You can drag the pin to adjust it.'
              )}
            </p>
          )}
        </div>
      </div>

      {form.formError && (
        <div className="mt-5">
          <Notice>{form.formError}</Notice>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" loading={form.submitting}>
          Send for approval
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
