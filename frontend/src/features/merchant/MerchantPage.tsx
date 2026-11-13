import { motion } from 'framer-motion'
import { useAuth } from '../../auth/useAuth'
import { LineArt } from '../../components/illustrations/LineArt'
import { useMyShops } from '../../data/merchant'
import { stagger } from '../../design/motion'
import { AwardPointsCard, RedeemVoucherCard } from './CounterCards'
import { MyCafes } from './MyCafes'

// Merchant home: the counter (points + vouchers) and their cafés.
export function MerchantPage() {
  const { email } = useAuth()
  const shops = useMyShops()

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-32 pt-16 md:pt-20">
      <header className="flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Merchant counter</p>
          <h1 className="mt-4 text-headline">
            Behind the <em className="font-light">counter</em>.
          </h1>
          {email && <p className="mt-3 text-[14px] text-muted">Signed in as {email}</p>}
        </div>
        <LineArt name="storefront" className="hidden h-24 w-[120px] shrink-0 text-satin-deep sm:block" />
      </header>

      <motion.div
        variants={stagger(0.06)}
        initial="hidden"
        animate="show"
        className="mt-10 grid gap-4 md:grid-cols-2"
      >
        <AwardPointsCard shops={shops.data ?? []} />
        <RedeemVoucherCard />
      </motion.div>

      <motion.div variants={stagger(0.05)} initial="hidden" animate="show" className="mt-24">
        <MyCafes shops={shops.data} loading={shops.isPending} error={shops.isError} />
      </motion.div>
    </div>
  )
}
