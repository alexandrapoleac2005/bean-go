import { Lock } from 'lucide-react'
import { BADGE_THRESHOLDS, USER_BADGES, type UserBadge } from '../../../api/types'
import { TierStamp } from '../../../components/badges/TierStamp'
import { Figure, StatusTag } from '../../../components/ui'
import { BADGE_LABEL, formatPoints } from '../../../lib/format'
import { BADGE_BLURB } from '../../../components/badges/badgeCopy'
import { Tile, TileLabel } from './Tile'

// All four UserBadge tiers. Unlocked = inked; locked = embossed, with the criteria.
export function BadgeShowcase({ lifetimePoints, current }: { lifetimePoints: number | null; current: UserBadge | null }) {
  const points = lifetimePoints ?? 0
  return (
    <Tile tone="paper" label="Badges" className="lg:col-span-12">
      <div className="flex items-baseline justify-between">
        <TileLabel>Badge collection</TileLabel>
        <Figure tone="muted" className="text-[11px]">
          {lifetimePoints === null ? '—' : USER_BADGES.filter((b) => points >= BADGE_THRESHOLDS[b]).length}/{USER_BADGES.length}{' '}
          unlocked
        </Figure>
      </div>

      <ol className="mt-8 grid grid-cols-2 border-t border-line md:grid-cols-4">
        {USER_BADGES.map((badge, i) => {
          const need = BADGE_THRESHOLDS[badge]
          const unlocked = lifetimePoints !== null && points >= need
          const isCurrent = badge === current
          const prev = i === 0 ? 0 : BADGE_THRESHOLDS[USER_BADGES[i - 1]]
          const fraction = unlocked ? 1 : Math.max(0, Math.min((points - prev) / (need - prev), 1))
          return (
            <li key={badge} className="flex flex-col items-center border-line px-6 pt-10 text-center md:[&:not(:first-child)]:border-l">
              <TierStamp badge={badge} unlocked={unlocked} size="lg" />
              <p className="mt-6 font-display text-[26px] font-normal leading-tight">{BADGE_LABEL[badge]}</p>
              <p className="mt-2 max-w-[24ch] text-[13px] leading-relaxed text-ink">{BADGE_BLURB[badge]}</p>
              <div className="mt-3 flex h-6 items-center">
                {isCurrent ? (
                  <StatusTag tone="accent">Current tier</StatusTag>
                ) : unlocked ? (
                  <StatusTag tone="open">Unlocked</StatusTag>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
                    <Lock className="size-3" /> Unlocks at <Figure>{formatPoints(need)}</Figure> pts
                  </span>
                )}
              </div>
              {!unlocked && lifetimePoints !== null && (
                <div className="mt-2 w-28">
                  <div className="h-px bg-line-strong">
                    <div className="h-full bg-espresso" style={{ width: `${fraction * 100}%` }} />
                  </div>
                  <Figure tone="muted" className="mt-1 block text-[10.5px]">
                    {formatPoints(need - points)} to go
                  </Figure>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </Tile>
  )
}
