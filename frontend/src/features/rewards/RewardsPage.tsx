import { AnimatePresence, motion } from 'framer-motion'
import { Award, Plus, RefreshCw, Ticket, TicketCheck } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import type { UserBadge } from '../../api/types'
import { useAuth } from '../../auth/useAuth'
import { TierStamp } from '../../components/badges/TierStamp'
import { LineArt } from '../../components/illustrations/LineArt'
import { Button } from '../../components/ui'
import { Notice } from '../../components/ui/Notice'
import { stagger, transition } from '../../design/motion'
import { cx } from '../../lib/cx'
import { BADGE_LABEL } from '../../lib/format'
import { useNow } from '../../lib/useNow'
import { BadgeShowcase } from './bento/BadgeShowcase'
import { BalanceTile } from './bento/BalanceTile'
import { LedgerTile } from './bento/LedgerTile'
import { CurrentBadgeTile, NextVoucherTile, WalletsTile } from './bento/SideTiles'
import { claimVoucher, type Activity } from './sync/reconcile'
import { rewardsStore } from './sync/store'
import { useRewardsSync } from './sync/useRewardsSync'
import { CounterModal } from './vouchers/CounterModal'
import { VoucherWallet } from './vouchers/VoucherWallet'

interface Toast {
  id: string
  activity: Activity
}

export function RewardsPage() {
  const { email } = useAuth()
  const [presentingId, setPresentingId] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [celebrate, setCelebrate] = useState<UserBadge | null>(null)
  const now = useNow(1000).getTime()

  const onEvents = useCallback((events: Activity[]) => {
    const badge = events.find((e) => e.kind === 'badge')
    if (badge?.kind === 'badge') setCelebrate(badge.badge)
    const fresh = events.filter((e) => e.kind !== 'badge').slice(0, 4)
    setToasts((t) => [...fresh.map((a) => ({ id: `${a.id}-${Date.now()}`, activity: a })), ...t].slice(0, 4))
    fresh.forEach((a) =>
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.activity.id !== a.id)), 5200),
    )
  }, [])

  const sync = useRewardsSync({ live: presentingId !== null, onEvents })
  const { state, snapshot } = sync

  const records = useMemo(() => Object.values(state.vouchers), [state.vouchers])
  const activeRecords = records.filter((r) => r.state === 'ACTIVE')

  // Wallet rows with how many of that café's 3 voucher slots are taken.
  // VoucherResponseDTO only carries the shop name, so match on that.
  const walletRows = useMemo(() => {
    if (!snapshot?.wallets) return null
    return snapshot.wallets.map((wallet) => ({
      wallet,
      activeVouchers: snapshot.vouchers.filter((v) => v.coffeeShopName === wallet.coffeeShopName).length,
    }))
  }, [snapshot])

  const walletTotal = snapshot?.wallets ? snapshot.wallets.reduce((sum, w) => sum + w.points, 0) : null
  const profile = snapshot?.profile ?? null
  const presenting = presentingId !== null ? state.vouchers[presentingId] : undefined

  const claim = (id: number) => email && rewardsStore.update(email, (s) => claimVoucher(s, id))

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-32 pt-16 md:pt-20">
      {/* Masthead */}
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Rewards</p>
          <h1 className="mt-4 text-headline">
            {profile ? (
              <>
                Good to see you, <em className="font-light">{profile.firstName}</em>.
              </>
            ) : (
              'Your coffee ledger.'
            )}
          </h1>
        </div>
        <div className="flex items-end gap-8">
          <LineArt name="beans" className="hidden h-24 w-[120px] shrink-0 text-satin-deep sm:block" />
          <RefreshButton fetching={sync.isFetching} onRefresh={() => sync.refresh()} />
        </div>
      </header>

      <div className="mt-6 space-y-3">
        {!sync.identityKnown && (
          <Notice tone="info">
            Points, badges and café wallets need your account ID, which isn't in your sign-in token yet. Your vouchers
            below are live.
          </Notice>
        )}
        {sync.error && <Notice>Couldn't reach the server. Showing your last synced rewards.</Notice>}
      </div>

      {/* Bento */}
      <motion.div
        variants={stagger(0.06)}
        initial="hidden"
        animate="show"
        className="mt-12 grid grid-cols-1 gap-px border border-line bg-line lg:grid-cols-12 lg:grid-rows-[auto_auto]"
      >
        <BalanceTile profile={profile} walletTotal={walletTotal} activeVouchers={activeRecords.length} />
        <CurrentBadgeTile badge={profile?.badge ?? null} />
        <NextVoucherTile rows={walletRows} />
        <WalletsTile rows={walletRows} />
        <LedgerTile activity={state.activity} now={now} />
        <BadgeShowcase lifetimePoints={profile?.lifetimePoints ?? null} current={profile?.badge ?? null} />
      </motion.div>

      <div className="mt-24">
        <VoucherWallet records={records} now={now} onClaim={claim} onPresent={setPresentingId} />
      </div>

      <AnimatePresence>
        {presenting && (
          <CounterModal
            key="counter"
            record={presenting}
            lastSyncedAt={sync.lastSyncedAt}
            now={now}
            onClose={() => setPresentingId(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {celebrate && <BadgeUnlocked key={celebrate} badge={celebrate} onClose={() => setCelebrate(null)} />}
      </AnimatePresence>

      <ToastStack toasts={toasts} />
    </div>
  )
}

// Data refreshes on its own (see useRewardsSync); this just forces it now.
function RefreshButton({ fetching, onRefresh }: { fetching: boolean; onRefresh: () => void }) {
  return (
    <Button
      variant="quiet"
      size="sm"
      onClick={onRefresh}
      disabled={fetching}
      icon={<RefreshCw className={cx('size-3.5', fetching && 'animate-spin')} />}
    >
      Refresh
    </Button>
  )
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[1900] flex w-[320px] flex-col gap-2" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map(({ id, activity: a }) => {
          const { Icon, title, body } = toastContent(a)
          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              transition={transition.spring}
              className="flex items-center gap-3 rounded-md bg-cocoa px-4 py-3 text-lace"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-satin text-espresso">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium">{title}</p>
                <p className="truncate text-[12px] text-lace/65">{body}</p>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

function toastContent(a: Activity) {
  switch (a.kind) {
    case 'earned':
      return { Icon: Plus, title: `+${a.points} points`, body: `at ${a.shopName}` }
    case 'voucher-issued':
      return { Icon: Ticket, title: 'New voucher!', body: `${a.discount}% off at ${a.shopName}. Claim it below.` }
    case 'voucher-used':
      return { Icon: TicketCheck, title: 'Voucher redeemed', body: a.shopName }
    case 'voucher-expired':
      return { Icon: Ticket, title: 'Voucher expired', body: a.shopName }
    case 'badge':
      return { Icon: Award, title: 'New badge', body: BADGE_LABEL[a.badge] }
  }
}

function BadgeUnlocked({ badge, onClose }: { badge: UserBadge; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[2100] flex items-center justify-center bg-lace/95 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="flex flex-col items-center border border-line px-16 py-14 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={transition.slow}>
          <TierStamp badge={badge} size="lg" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...transition.base, delay: 0.3 }}>
          <p className="eyebrow mt-10">Badge unlocked</p>
          <p className="mt-3 font-display text-[48px] font-light leading-none">{BADGE_LABEL[badge]}</p>
          <Button variant="accent" className="mt-10" onClick={onClose}>
            Lovely
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
