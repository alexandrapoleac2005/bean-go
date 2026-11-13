import { DAYS_OF_WEEK, type OperatingHours } from '../../api/types'
import { cx } from '../../lib/cx'
import { DAY_LABEL, formatTime } from '../../lib/format'

// Monday-first week, today highlighted. Days missing from the schedule are closed.
export function HoursTable({ schedule, now }: { schedule: OperatingHours[]; now: Date; isOpen?: boolean }) {
  const today = DAYS_OF_WEEK[(now.getDay() + 6) % 7]
  const byDay = new Map(schedule.map((h) => [h.dayOfWeek, h]))

  if (!schedule.length) return <p className="text-[14px] text-muted">This café hasn't published its hours yet.</p>

  return (
    <dl className="divide-y divide-line/80">
      {DAYS_OF_WEEK.map((day) => {
        const hours = byDay.get(day)
        const isToday = day === today
        return (
          <div
            key={day}
            className={cx(
              'grid grid-cols-[1fr_auto] items-center py-2.5 text-[14px]',
              isToday && '-mx-3 rounded-sm bg-satin/15 px-3',
            )}
          >
            <dt className={cx('flex items-center gap-2', isToday ? 'font-medium' : 'text-muted')}>
              {DAY_LABEL[day]}
              {isToday && <span className="sr-only">(today)</span>}
            </dt>
            <dd className={cx('figures text-[13px]', !hours && 'text-faint')}>
              {hours ? `${formatTime(hours.openTime)} – ${formatTime(hours.closeTime)}` : 'Closed'}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
