// Decorative barcode and QR-style marks, derived deterministically from the
// voucher code so each ticket looks unique and stable. They are not scannable:
// the barista types the code at the till (POST /vouchers/redeem).

function seed(text: string) {
  let h = 2166136261
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return h >>> 0
}

// mulberry32
function rng(s: number) {
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function Barcode({
  code,
  height = 40,
  className,
  color = 'currentColor',
}: {
  code: string
  height?: number
  className?: string
  color?: string
}) {
  const rand = rng(seed(code))
  const bars: Array<{ x: number; w: number }> = []
  let x = 0
  const guard = () => {
    bars.push({ x, w: 1 })
    x += 2
    bars.push({ x, w: 1 })
    x += 2
  }
  guard()
  for (const ch of code) {
    // each character: 3 bars, widths 1..3, gaps 1..2
    const n = ch.charCodeAt(0)
    for (let i = 0; i < 3; i++) {
      const w = 1 + (((n >> i) + Math.floor(rand() * 3)) % 3)
      bars.push({ x, w })
      x += w + 1 + Math.floor(rand() * 2)
    }
  }
  guard()
  return (
    <svg viewBox={`0 0 ${x} ${height}`} preserveAspectRatio="none" className={className} aria-hidden>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={height} fill={color} />
      ))}
    </svg>
  )
}

export function QrMark({ code, size = 120, className }: { code: string; size?: number; className?: string }) {
  const N = 25
  const rand = rng(seed(`qr:${code}`))
  const corners = [
    [0, 0],
    [0, N - 7],
    [N - 7, 0],
  ]
  // 1 = finder ink, 0 = finder blank / separator, -1 = data area
  const finder = (r: number, c: number) => {
    for (const [r0, c0] of corners) {
      if (r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7) {
        const rr = r - r0
        const cc = c - c0
        const ring = rr === 0 || rr === 6 || cc === 0 || cc === 6
        const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4
        return ring || core ? 1 : 0
      }
      if (r >= r0 - 1 && r <= r0 + 7 && c >= c0 - 1 && c <= c0 + 7) return 0
    }
    return -1
  }

  const cells: Array<[number, number]> = []
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const fixed = finder(r, c)
      const on = fixed === -1 ? (r === 6 || c === 6 ? (r + c) % 2 === 0 : rand() > 0.52) : fixed === 1
      if (on) cells.push([r, c])
    }
  }
  return (
    <svg viewBox={`-2 -2 ${N + 4} ${N + 4}`} width={size} height={size} className={className} aria-hidden>
      {cells.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={c} y={r} width={1.02} height={1.02} rx={0.18} fill="currentColor" />
      ))}
    </svg>
  )
}
