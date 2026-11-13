import { motion } from 'framer-motion'
import { CheckCircle2, Coffee, Ticket } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '../../api'
import type { MerchantShop, PointsAwardResult, Voucher } from '../../api/types'
import { LOYALTY_RULES } from '../../api/types'
import { Button, Field } from '../../components/ui'
import { Notice } from '../../components/ui/Notice'
import { useAwardPoints, useRedeemVoucher } from '../../data/merchant'
import { rise } from '../../design/motion'
import { rules } from '../../lib/validation'
import { inputBox } from '../../components/ui/inputStyles'

const QUICK_POINTS = [5, 10, 15, 20]

const selectClass = `h-12 w-full px-3 ${inputBox}`

// ---------- Give points after a purchase ----------
export function AwardPointsCard({ shops }: { shops: MerchantShop[] }) {
  const award = useAwardPoints()
  const live = shops.filter((s) => s.approved)
  const [shopId, setShopId] = useState('')
  const [email, setEmail] = useState('')
  const [points, setPoints] = useState('10')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PointsAwardResult | null>(null)

  // Default to the first live café once the list loads
  const selectedShop = shopId || (live[0] ? String(live[0].id) : '')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    const n = Number(points)
    const emailError = rules.required('Enter the customer’s email.')(email) ?? rules.email()(email)
    if (emailError) return setError(emailError)
    if (!Number.isInteger(n) || n < 1 || n > LOYALTY_RULES.maxPointsPerTransaction)
      return setError(`Points must be between 1 and ${LOYALTY_RULES.maxPointsPerTransaction}.`)
    award.mutate(
      { customerEmail: email.trim(), coffeeShopId: Number(selectedShop), pointsToAdd: n },
      {
        onSuccess: (res) => {
          setResult(res)
          setEmail('')
        },
        onError: (err) =>
          setError(
            err instanceof ApiError && err.isNotFound
              ? 'No customer account with that email.'
              : err instanceof ApiError && err.isForbidden
                ? err.message
                : 'Couldn’t add the points. Try again.',
          ),
      },
    )
  }

  return (
    <motion.section variants={rise} aria-labelledby="award-title" className="card flex flex-col p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center border border-line-strong text-espresso">
          <Coffee className="size-5" />
        </span>
        <div>
          <h2 id="award-title" className="font-display text-[30px] font-normal leading-tight">
            Give points
          </h2>
          <p className="text-[12.5px] text-muted">
            After a purchase. Every {LOYALTY_RULES.pointsForVoucher} points become a{' '}
            {LOYALTY_RULES.voucherDiscountPercentage}% voucher.
          </p>
        </div>
      </div>

      {live.length === 0 ? (
        <div className="mt-6">
          <Notice tone="info">You can give points once one of your cafés is approved.</Notice>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-6 flex flex-1 flex-col gap-5">
          {live.length > 1 && (
            <label className="flex flex-col gap-2">
              <span className="eyebrow">Café</span>
              <select value={selectedShop} onChange={(e) => setShopId(e.target.value)} className={selectClass}>
                {live.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Field
            label="Customer email"
            type="email"
            autoComplete="off"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <Field
              label="Points"
              inputMode="numeric"
              mono
              value={points}
              onChange={(e) => setPoints(e.target.value.replace(/\D/g, ''))}
            />
            <div className="flex flex-wrap gap-1.5">
              {QUICK_POINTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPoints(String(p))}
                  className={`h-7 rounded-none border px-3 text-[12.5px] transition-colors ${
                    points === String(p) ? 'bg-espresso text-lace' : 'bg-lace text-espresso hover:bg-linen-deep'
                  }`}
                >
                  +{p}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-2">
            <Button type="submit" loading={award.isPending} className="self-start">
              Add points
            </Button>
            {error && <Notice>{error}</Notice>}
            {result && (
              <div role="status" className="rounded-md bg-open-wash p-4 text-[13.5px] text-open">
                <p className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="size-4" />
                  {result.customerName || result.customerEmail} got +{result.pointsAdded} points
                </p>
                <p className="mt-1 text-espresso/80">
                  {result.walletPoints} points saved at {result.coffeeShopName}.
                  {result.vouchersIssued > 0 &&
                    ` ${result.vouchersIssued} new ${result.vouchersIssued === 1 ? 'voucher' : 'vouchers'} unlocked!`}
                </p>
              </div>
            )}
          </div>
        </form>
      )}
    </motion.section>
  )
}

// ---------- Redeem a voucher ----------
export function RedeemVoucherCard() {
  const redeem = useRedeemVoucher()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Voucher | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    const clean = code.replace(/\s/g, '').toUpperCase()
    if (!clean) return setError('Enter the voucher code.')
    redeem.mutate(clean, {
      onSuccess: (v) => {
        setResult(v)
        setCode('')
      },
      onError: (err) => {
        if (!(err instanceof ApiError)) return setError('Couldn’t redeem the voucher. Try again.')
        if (err.isNotFound) return setError('No voucher with this code.')
        if (err.isForbidden) return setError('This voucher belongs to another café.')
        if (err.isConflict) return setError('This voucher was already used.')
        if (err.status === 400) return setError('This voucher has expired.')
        setError(err.message)
      },
    })
  }

  return (
    <motion.section variants={rise} aria-labelledby="redeem-title" className="card flex flex-col p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center border border-line-strong text-espresso">
          <Ticket className="size-5" />
        </span>
        <div>
          <h2 id="redeem-title" className="font-display text-[30px] font-normal leading-tight">
            Redeem a voucher
          </h2>
          <p className="text-[12.5px] text-muted">Type the code the customer shows you.</p>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="mt-6 flex flex-1 flex-col gap-5">
        <Field
          label="Voucher code"
          mono
          autoComplete="off"
          placeholder="K7MPQ 4XR2T"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="[&_input]:tracking-[0.12em]"
        />
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <Button type="submit" loading={redeem.isPending} className="self-start">
            Redeem
          </Button>
          {error && <Notice>{error}</Notice>}
          {result && (
            <div role="status" className="rounded-md bg-open-wash p-4 text-[13.5px] text-open">
              <p className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-4" />
                Apply {result.discountPercentage}% off this order
              </p>
              <p className="mt-1 text-espresso/80">
                Voucher {result.code} at {result.coffeeShopName} is now used.
              </p>
            </div>
          )}
        </div>
      </form>
    </motion.section>
  )
}
