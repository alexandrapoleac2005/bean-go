import { DAYS_OF_WEEK, type DayOfWeek, type OperatingHours } from '../api/types'

export type OpenState =
  | { kind: 'open'; closesAt: string }
  | { kind: 'closed'; opensAt: string | null; opensOn: DayOfWeek | null }
  | { kind: 'unknown' }

// JS getDay(): 0 = Sunday. Java DayOfWeek: MONDAY first.
const jsDayToJava = (day: number): DayOfWeek => DAYS_OF_WEEK[(day + 6) % 7]

const minutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// Works out whether a shop is open right now from its weekly schedule.
// Handles shifts past midnight (closeTime earlier than openTime).
export function getOpenState(schedule: OperatingHours[], now = new Date()): OpenState {
  if (!schedule.length) return { kind: 'unknown' }

  const today = jsDayToJava(now.getDay())
  const yesterday = jsDayToJava((now.getDay() + 6) % 7)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const byDay = new Map(schedule.map((entry) => [entry.dayOfWeek, entry]))

  const prev = byDay.get(yesterday)
  if (prev && minutes(prev.closeTime) < minutes(prev.openTime) && nowMin < minutes(prev.closeTime)) {
    return { kind: 'open', closesAt: prev.closeTime }
  }

  const cur = byDay.get(today)
  if (cur) {
    const open = minutes(cur.openTime)
    const close = minutes(cur.closeTime)
    const overnight = close < open
    if (nowMin >= open && (overnight || nowMin < close)) return { kind: 'open', closesAt: cur.closeTime }
    if (nowMin < open) return { kind: 'closed', opensAt: cur.openTime, opensOn: today }
  }

  const start = DAYS_OF_WEEK.indexOf(today)
  for (let i = 1; i <= 7; i++) {
    const day = DAYS_OF_WEEK[(start + i) % 7]
    const next = byDay.get(day)
    if (next) return { kind: 'closed', opensAt: next.openTime, opensOn: day }
  }
  return { kind: 'closed', opensAt: null, opensOn: null }
}
