import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import type { CoffeeShopDetails } from '../../api/types'
import { Button, Field } from '../../components/ui'
import { Notice } from '../../components/ui/Notice'
import { Skeleton } from '../../components/ui/Skeleton'
import { useFacilities, useUpdateShop } from '../../data/merchant'
import { cx } from '../../lib/cx'
import { formatCoordinates } from '../../lib/format'
import { useForm } from '../../lib/useForm'
import { facilityIcon } from '../explore/facilityIcon'
import { LocationPicker } from './LocationPicker'
import { cafeSchema } from './cafeSchema'
import { inputBox } from '../../components/ui/inputStyles'

// Name, contact, description, location and facilities (PUT /merchant/coffee-shops/{id}).
export function CafeDetailsForm({ details }: { details: CoffeeShopDetails }) {
  const update = useUpdateShop(details.id)
  const facilities = useFacilities()
  const [selected, setSelected] = useState(() => new Set(details.facilities.map((f) => f.id)))
  const [saved, setSaved] = useState(false)

  const form = useForm({
    initial: {
      name: details.name,
      address: details.address,
      description: details.description ?? '',
      contactEmail: details.contactEmail ?? '',
      contactPhone: details.contactPhone ?? '',
      lat: String(details.latitude),
      lng: String(details.longitude),
    },
    schema: cafeSchema,
    onSubmit: async (v) => {
      setSaved(false)
      await update.mutateAsync({
        name: v.name.trim(),
        address: v.address.trim(),
        description: v.description.trim() || undefined,
        contactEmail: v.contactEmail.trim(),
        contactPhone: v.contactPhone.trim() || undefined,
        lat: Number(v.lat),
        lng: Number(v.lng),
        facilityIds: [...selected],
      })
      setSaved(true)
    },
  })
  const { values, setValues, errors } = form
  const location = { lat: Number(values.lat), lng: Number(values.lng) }

  const toggle = (id: number) => {
    setSaved(false)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <form onSubmit={form.handleSubmit} noValidate onChange={() => setSaved(false)}>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Field label="Name" {...form.field('name')} />
          <Field label="Address" {...form.field('address')} />
          <div className="flex flex-col gap-2">
            <label htmlFor="cafe-edit-description" className="eyebrow">
              Description <span className="normal-case tracking-normal text-faint">(optional)</span>
            </label>
            <textarea
              id="cafe-edit-description"
              rows={3}
              placeholder="What makes your café special?"
              className={`resize-none px-4 py-3 leading-relaxed ${inputBox}`}
              {...form.field('description')}
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

          <fieldset className="mt-2">
            <legend className="eyebrow">Facilities</legend>
            {facilities.isPending ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} rounded="full" className="h-9 w-28" />
                ))}
              </div>
            ) : facilities.isError ? (
              <div className="mt-3">
                <Notice>Couldn’t load the facilities list.</Notice>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {facilities.data.map((f) => {
                  const Icon = facilityIcon(f.name, f.icon)
                  const on = selected.has(f.id)
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(f.id)}
                      className={cx(
                        'inline-flex h-9 items-center gap-2 rounded-none px-3.5 text-[13px] font-medium transition-colors',
                        on ? 'bg-espresso text-lace' : 'bg-linen text-espresso ring-1 ring-inset ring-line hover:bg-linen-deep',
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                      {f.name}
                    </button>
                  )
                })}
              </div>
            )}
          </fieldset>
        </div>

        <div className="flex flex-col gap-2">
          <span className="eyebrow">Location</span>
          <LocationPicker
            value={location}
            onChange={(p) => {
              setSaved(false)
              setValues((v) => ({ ...v, lat: String(p.lat), lng: String(p.lng) }))
            }}
          />
          <p className="text-[12px] text-muted">
            <span className="figures">{formatCoordinates(location.lat, location.lng)}</span>
            {' · '}Click the map or drag the pin to move your café.
          </p>
        </div>
      </div>

      {form.formError && (
        <div className="mt-6 max-w-xl">
          <Notice>{form.formError}</Notice>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button type="submit" loading={form.submitting}>
          Save changes
        </Button>
        {saved && (
          <p role="status" className="flex items-center gap-2 text-[14px] font-medium text-open">
            <CheckCircle2 className="size-4" /> Saved.
          </p>
        )}
      </div>
    </form>
  )
}
