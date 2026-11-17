import { useId, type ReactNode } from 'react'
import type { UserBadge } from '../../api/types'
import { color } from '../../design/tokens'

// Hand-built seals, one per UserBadge tier. Unlocked tiers are inked in satin,
// espresso and cocoa; locked tiers are blind-embossed: no ink, a pressed outline with a highlight.
//
//   ROOKIE           ticked round seal  · a single bean
//   COFFEE_LOVER     scalloped seal     · cup with heart-shaped steam
//   CAFFEINE_ADDICT  hexagonal seal     · lightning bolt between two beans
//   BEAN_MASTER      starburst seal     · laurel wreath, crowned bean

interface Paint {
  sealFill: string
  sealStroke: string
  discFill: string
  discStroke: string
  ink: string // motif fill
  line: string // motif linework
  accent: string
  text: string
  dash?: string
}

const LOCKED: Paint = {
  sealFill: color.linen,
  sealStroke: color.line,
  discFill: 'none',
  discStroke: color.line,
  ink: 'none',
  line: color.faint,
  accent: 'none',
  text: color.faint,
  dash: '1.5 3',
}

const UNLOCKED: Record<UserBadge, Paint> = {
  // Linen seal, satin disc, espresso bean
  ROOKIE: {
    sealFill: color.linen,
    sealStroke: color.satinDeep,
    discFill: color.satin,
    discStroke: color.satinDeep,
    ink: color.espresso,
    line: color.lace,
    accent: color.satin,
    text: color.satinDeep,
  },
  // Satin-wash scallop, espresso disc, satin cup with a lace heart
  COFFEE_LOVER: {
    sealFill: color.satinWash,
    sealStroke: color.satin,
    discFill: color.espresso,
    discStroke: color.espresso,
    ink: color.satin,
    line: color.satin,
    accent: color.lace,
    text: color.satinDeep,
  },
  // Satin hexagon, cocoa disc, satin bolt between two beans
  CAFFEINE_ADDICT: {
    sealFill: color.satin,
    sealStroke: color.satinDeep,
    discFill: color.cocoa,
    discStroke: color.cocoa,
    ink: color.satin,
    line: color.lace,
    accent: color.satinWash,
    text: color.espresso,
  },
  // Espresso starburst, cocoa disc, lace laurel, satin bean and crown
  BEAN_MASTER: {
    sealFill: color.espresso,
    sealStroke: color.cocoa,
    discFill: color.cocoa,
    discStroke: color.satin,
    ink: color.espresso,
    line: color.lace,
    accent: color.lace,
    text: color.satin,
  },
}

const LABEL: Record<UserBadge, string> = {
  ROOKIE: 'ROOKIE · FIRST CRACK · ',
  COFFEE_LOVER: 'COFFEE LOVER · SECOND CUP · ',
  CAFFEINE_ADDICT: 'CAFFEINE ADDICT · DOUBLE SHOT · ',
  BEAN_MASTER: 'BEAN MASTER · HOUSE ROAST · ',
}

// ---------- geometry ----------
const C = 60
const pt = (r: number, a: number) => [C + r * Math.cos(a), C + r * Math.sin(a)] as const
const f = (n: number) => n.toFixed(2)

function scallop(r: number, bumps: number, depth: number) {
  let d = ''
  for (let i = 0; i < bumps; i++) {
    const a0 = (i / bumps) * Math.PI * 2
    const a1 = ((i + 1) / bumps) * Math.PI * 2
    const [x0, y0] = pt(r, a0)
    const [cx, cy] = pt(r + depth * 2, (a0 + a1) / 2)
    const [x1, y1] = pt(r, a1)
    d += `${i === 0 ? `M${f(x0)} ${f(y0)}` : ''} Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)} `
  }
  return d + 'Z'
}

function polygon(r: number, sides: number, rotation = -Math.PI / 2) {
  return (
    Array.from({ length: sides }, (_, i) => {
      const [x, y] = pt(r, rotation + (i / sides) * Math.PI * 2)
      return `${i ? 'L' : 'M'}${f(x)} ${f(y)}`
    }).join(' ') + ' Z'
  )
}

function starburst(outer: number, inner: number, points: number) {
  return (
    Array.from({ length: points * 2 }, (_, i) => {
      const [x, y] = pt(i % 2 ? inner : outer, -Math.PI / 2 + (i / (points * 2)) * Math.PI * 2)
      return `${i ? 'L' : 'M'}${f(x)} ${f(y)}`
    }).join(' ') + ' Z'
  )
}

// Ring of path text, used as the seal's legend
const ringPath = (r: number) => `M ${C} ${C - r} a ${r} ${r} 0 1 1 0 ${r * 2} a ${r} ${r} 0 1 1 0 ${-r * 2}`

// ---------- motifs ----------
function Bean({ x, y, s = 1, rot = 28, p }: { x: number; y: number; s?: number; rot?: number; p: Paint }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse rx="9" ry="13" fill={p.ink} stroke={p.line} strokeWidth={p.ink === 'none' ? 1.2 : 0} />
      <path
        d="M -1.5 -11 C 4 -5, -5 4, 1.5 11"
        fill="none"
        stroke={p.line}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </g>
  )
}

function Motif({ badge, p }: { badge: UserBadge; p: Paint }) {
  const stroke = { stroke: p.line, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (badge) {
    case 'ROOKIE':
      return <Bean x={C} y={C} s={1.35} p={p} />

    case 'COFFEE_LOVER':
      return (
        <g>
          {/* heart-shaped steam */}
          <path
            d="M60 47 C 53 42, 52 34.5, 57 33.5 C 59 33, 60 34.5, 60 35.5 C 60 34.5, 61 33, 63 33.5 C 68 34.5, 67 42, 60 47 Z"
            fill={p.ink === 'none' ? 'none' : color.lace}
            {...stroke}
            stroke={p.ink === 'none' ? p.line : color.lace}
            strokeWidth={1.2}
          />
          {/* cup */}
          <path d="M43 54 H75 V60 A16 16 0 0 1 59 76 A16 16 0 0 1 43 60 Z" fill={p.ink} {...stroke} strokeWidth={p.ink === 'none' ? 1.6 : 0} />
          <path d="M75 57.5 A6.5 6.5 0 0 1 75 70.5" fill="none" {...stroke} stroke={p.ink === 'none' ? p.line : p.ink} strokeWidth={3} />
          <path d="M40 80 H80" {...stroke} stroke={p.ink === 'none' ? p.line : p.ink} strokeWidth={2.2} />
        </g>
      )

    case 'CAFFEINE_ADDICT':
      return (
        <g>
          <Bean x={40} y={66} s={0.62} rot={-24} p={{ ...p, ink: p.ink === 'none' ? 'none' : color.satinWash, line: p.ink === 'none' ? p.line : color.satinDeep }} />
          <Bean x={80} y={54} s={0.62} rot={32} p={{ ...p, ink: p.ink === 'none' ? 'none' : color.satinWash, line: p.ink === 'none' ? p.line : color.satinDeep }} />
          <path
            d="M65 31 L48 62 H59 L53 89 L74 55 H62 L70 31 Z"
            fill={p.ink}
            stroke={p.ink === 'none' ? p.line : color.lace}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        </g>
      )

    case 'BEAN_MASTER': {
      const leaves = (side: 1 | -1) =>
        Array.from({ length: 6 }, (_, i) => {
          const a = Math.PI / 2 + side * (0.35 + i * 0.36)
          const [x, y] = pt(26, a)
          const deg = (a * 180) / Math.PI + (side === 1 ? 0 : 180)
          return (
            <ellipse
              key={`${side}-${i}`}
              cx={x}
              cy={y}
              rx="2.6"
              ry="6"
              transform={`rotate(${deg} ${x} ${y})`}
              fill={p.ink === 'none' ? 'none' : color.lace}
              stroke={p.ink === 'none' ? p.line : 'none'}
              strokeWidth={1}
            />
          )
        })
      return (
        <g>
          {leaves(1)}
          {leaves(-1)}
          <Bean x={C} y={63} s={0.9} rot={20} p={{ ...p, ink: p.ink === 'none' ? 'none' : color.satin, line: p.ink === 'none' ? p.line : color.espresso }} />
          {/* crown */}
          <path
            d="M50 44 L52 35 L56 40 L60 32 L64 40 L68 35 L70 44 Z"
            fill={p.ink === 'none' ? 'none' : color.satin}
            stroke={p.ink === 'none' ? p.line : 'none'}
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        </g>
      )
    }
  }
}

function Seal({ badge, p }: { badge: UserBadge; p: Paint }) {
  const common = { fill: p.sealFill, stroke: p.sealStroke, strokeWidth: 1.5, strokeDasharray: p.dash }
  switch (badge) {
    case 'ROOKIE':
      return (
        <g>
          <circle cx={C} cy={C} r={54} {...common} />
          {Array.from({ length: 48 }, (_, i) => {
            const a = (i / 48) * Math.PI * 2
            const [x0, y0] = pt(50, a)
            const [x1, y1] = pt(i % 4 ? 52 : 53.5, a)
            return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={p.sealStroke} strokeWidth={0.8} opacity={0.7} />
          })}
        </g>
      )
    case 'COFFEE_LOVER':
      return <path d={scallop(51, 18, 2.4)} {...common} />
    case 'CAFFEINE_ADDICT':
      return (
        <g>
          <path d={polygon(56, 6, -Math.PI / 2)} {...common} />
          <path d={polygon(50, 6, -Math.PI / 2)} fill="none" stroke={p.sealStroke} strokeWidth={0.75} opacity={0.6} />
        </g>
      )
    case 'BEAN_MASTER':
      return <path d={starburst(57, 50, 20)} {...common} />
  }
}

interface Props {
  badge: UserBadge
  unlocked: boolean
  size?: number
  className?: string
  title?: string
}

export function BadgeArt({ badge, unlocked, size = 120, className, title }: Props) {
  const id = useId().replace(/:/g, '')
  const p = unlocked ? UNLOCKED[badge] : LOCKED

  const art = (paint: Paint): ReactNode => (
    <>
      <Seal badge={badge} p={paint} />
      <circle cx={C} cy={C} r={33} fill={paint.discFill} stroke={paint.discStroke} strokeWidth={1.2} strokeDasharray={paint.dash} />
      <Motif badge={badge} p={paint} />
    </>
  )

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title ?? `${badge.replace('_', ' ').toLowerCase()} badge${unlocked ? '' : ' (locked)'}`}
    >
      <defs>
        <path id={`ring-${id}`} d={ringPath(41.5)} />
      </defs>

      {unlocked ? (
        art(p)
      ) : (
        <>
          {/* blind emboss: a light copy offset down-right, then the pressed line */}
          <g transform="translate(0.8 0.9)" opacity={0.9}>
            {art({ ...LOCKED, sealFill: 'none', sealStroke: '#FFFCF7', discStroke: '#FFFCF7', line: '#FFFCF7' })}
          </g>
          {art(p)}
        </>
      )}

      <text
        fill={p.text}
        fontFamily="Plus Jakarta Sans, sans-serif"
        fontSize="5.6"
        fontWeight={600}
        letterSpacing="1.4"
      >
        <textPath href={`#ring-${id}`} startOffset="0">
          {LABEL[badge].repeat(2)}
        </textPath>
      </text>
    </svg>
  )
}
