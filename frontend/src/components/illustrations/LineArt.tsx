import type { ReactNode } from 'react'

// Hand-drawn style line illustrations for empty states and page mastheads. One stroke weight,
// round caps, currentColor ink plus a satin wash, so they inherit the context colour.
// Each draws on a 120×96 canvas.

type Name =
  | 'cup'
  | 'map'
  | 'ticket'
  | 'ledger'
  | 'chart'
  | 'review'
  | 'plug'
  | 'steam'
  | 'heart'
  | 'beans'
  | 'storefront'

const WASH = 'var(--color-satin-wash)'

const art: Record<Name, ReactNode> = {
  // An empty cup on a saucer, one curl of steam left
  cup: (
    <>
      <ellipse cx="58" cy="80" rx="38" ry="6" fill={WASH} stroke="none" />
      <path d="M30 42h52v14a26 26 0 0 1-26 26 26 26 0 0 1-26-26Z" fill={WASH} />
      <path d="M30 42h52v14a26 26 0 0 1-26 26 26 26 0 0 1-26-26Z" />
      <path d="M82 48a9 9 0 0 1 0 18" />
      <path d="M22 84h70" />
      <path d="M56 32c-5-5 5-9 0-15" strokeDasharray="1 5" />
    </>
  ),
  // A folded map with a pin and a dotted route that goes nowhere
  map: (
    <>
      <path d="M16 26l28-8 32 8 28-8v54l-28 8-32-8-28 8Z" fill={WASH} />
      <path d="M16 26l28-8 32 8 28-8v54l-28 8-32-8-28 8Z" />
      <path d="M44 18v54M76 26v54" />
      <path d="M26 62c10-2 14-14 26-12s14 10 26 2" strokeDasharray="2 5" />
      <path d="M86 36a7 7 0 1 0-14 0c0 6 7 13 7 13s7-7 7-13Z" />
      <circle cx="79" cy="36" r="2" />
    </>
  ),
  // A torn ticket stub
  ticket: (
    <>
      <path d="M18 30h84v12a6 6 0 0 0 0 12v12H18V54a6 6 0 0 0 0-12Z" fill={WASH} />
      <path d="M18 30h84v12a6 6 0 0 0 0 12v12H18V54a6 6 0 0 0 0-12Z" />
      <path d="M78 32v32" strokeDasharray="2 4" />
      <path d="M30 42h30M30 52h20" />
      <path d="M86 42v12M91 42v12M96 42v12" />
    </>
  ),
  // A receipt roll, blank
  ledger: (
    <>
      <path d="M34 14h52v66l-6.5-5-6.5 5-6.5-5-6.5 5-6.5-5-6.5 5-6.5-5-6.5 5Z" fill={WASH} />
      <path d="M34 14h52v66l-6.5-5-6.5 5-6.5-5-6.5 5-6.5-5-6.5 5-6.5-5-6.5 5Z" />
      <path d="M44 28h32M44 38h22M44 48h28" strokeDasharray="1 4" />
      <path d="M44 60h12M68 60h8" />
    </>
  ),
  // Axes with a flat, faint line: no data yet
  chart: (
    <>
      <path d="M20 16v62h84" />
      <path d="M22 66h80" fill="none" strokeDasharray="2 5" />
      <path d="M30 70l14-10 12 4 14-14 12 6 12-10" stroke={WASH} strokeWidth="6" />
      <path d="M30 70l14-10 12 4 14-14 12 6 12-10" strokeDasharray="2 4" />
    </>
  ),
  // A speech bubble with a single bean
  review: (
    <>
      <path d="M22 22h76a6 6 0 0 1 6 6v34a6 6 0 0 1-6 6H52l-14 12v-12H22a6 6 0 0 1-6-6V28a6 6 0 0 1 6-6Z" fill={WASH} />
      <path d="M22 22h76a6 6 0 0 1 6 6v34a6 6 0 0 1-6 6H52l-14 12v-12H22a6 6 0 0 1-6-6V28a6 6 0 0 1 6-6Z" />
      <ellipse cx="60" cy="45" rx="8" ry="11" transform="rotate(28 60 45)" />
      <path d="M58.5 35c4 5-4 12 2 21" />
    </>
  ),
  // A full cup, freshly poured: three ribbons of steam
  steam: (
    <>
      <ellipse cx="58" cy="82" rx="38" ry="6" fill={WASH} stroke="none" />
      <path d="M30 46h52v12a26 26 0 0 1-26 26 26 26 0 0 1-26-26Z" fill={WASH} />
      <path d="M30 46h52v12a26 26 0 0 1-26 26 26 26 0 0 1-26-26Z" />
      <path d="M82 52a9 9 0 0 1 0 18" />
      <path d="M22 86h70" />
      <path d="M36 54h40" strokeDasharray="1 5" />
      <path d="M44 36c-5-5 5-9 0-15M56 34c-5-6 5-11 0-18M68 36c-5-5 5-9 0-15" />
    </>
  ),
  // A cup with a heart rising from it: a café worth keeping
  heart: (
    <>
      <ellipse cx="58" cy="84" rx="38" ry="6" fill={WASH} stroke="none" />
      <path d="M30 50h52v10a26 26 0 0 1-26 26 26 26 0 0 1-26-26Z" fill={WASH} />
      <path d="M30 50h52v10a26 26 0 0 1-26 26 26 26 0 0 1-26-26Z" />
      <path d="M82 56a9 9 0 0 1 0 18" />
      <path d="M22 88h70" />
      <path d="M56 38c-9-6-13-11-13-16a6.6 6.6 0 0 1 13-2 6.6 6.6 0 0 1 13 2c0 5-4 10-13 16Z" fill={WASH} />
      <path d="M56 38c-9-6-13-11-13-16a6.6 6.6 0 0 1 13-2 6.6 6.6 0 0 1 13 2c0 5-4 10-13 16Z" />
      <path d="M82 22l3-3M86 30h4M30 22l-3-3M26 30h-4" />
    </>
  ),
  // Three roasted beans, scattered
  beans: (
    <>
      <g transform="rotate(-26 44 48)">
        <ellipse cx="44" cy="48" rx="16" ry="23" fill={WASH} />
        <path d="M44 25c7.5 8 7.5 15 0 23s-7.5 15 0 23" />
      </g>
      <g transform="rotate(34 82 42)">
        <ellipse cx="82" cy="42" rx="12" ry="17.5" fill={WASH} />
        <path d="M82 24.5c5.5 6 5.5 11.5 0 17.5s-5.5 11.5 0 17.5" />
      </g>
      <g transform="rotate(78 84 78)">
        <ellipse cx="84" cy="78" rx="7.5" ry="11" fill={WASH} />
        <path d="M84 67c3.5 4 3.5 7.5 0 11s-3.5 7 0 11" />
      </g>
      <path d="M16 88h44" strokeDasharray="1 5" />
    </>
  ),
  // A café front: scalloped awning, a window and an open door
  storefront: (
    <>
      <path d="M24 40h72v44H24Z" fill={WASH} stroke="none" />
      <path d="M24 46v38M96 46v38" />
      <path d="M22 18h76l8 22H14Z" fill="var(--color-lace)" />
      <path d="M41 18l-4 22M60 18v22M79 18l4 22" />
      <path
        d="M14 40a11.5 8 0 0 0 23 0 11.5 8 0 0 0 23 0 11.5 8 0 0 0 23 0 11.5 8 0 0 0 23 0"
        fill="var(--color-lace)"
      />
      <rect x="34" y="56" width="24" height="16" fill="var(--color-lace)" />
      <path d="M46 56v16" />
      <path d="M68 84V56h18v28" fill="var(--color-lace)" />
      <circle cx="72.5" cy="71" r="1" />
      <path d="M12 84h96" />
    </>
  ),
  // An unplugged cable: an endpoint that doesn't exist yet
  plug: (
    <>
      <path d="M14 62h24a8 8 0 0 0 8-8v-4" />
      <rect x="40" y="32" width="14" height="18" rx="3" fill={WASH} />
      <rect x="40" y="32" width="14" height="18" rx="3" />
      <path d="M44 32v-8M50 32v-8" />
      <path d="M66 42h4M74 38l3-3M74 46l3 3" />
      <rect x="82" y="32" width="18" height="20" rx="3" fill={WASH} />
      <rect x="82" y="32" width="18" height="20" rx="3" />
      <path d="M100 42h8" />
      <path d="M87 39v6M95 39v6" />
    </>
  ),
}

export function LineArt({ name, className }: { name: Name; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 96"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {art[name]}
    </svg>
  )
}

export type LineArtName = Name
