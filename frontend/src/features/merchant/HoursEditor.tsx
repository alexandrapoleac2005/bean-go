import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { DAYS_OF_WEEK, type DayOfWeek, type OperatingHours } from '../../api/types'
import { Button } from '../../components/ui'
import { Notice } from '../../components/ui/Notice'
import { useUpdateSchedule } from '../../data/merchant'
import { cx } from '../../lib/cx'
import { DAY_LABEL, formatTime } from '../../lib/format'
import { inputBox } from '../../components/ui/inputStyles'

interface Row {
  open: boolean
  openTime: string // "HH:MM"
  closeTime: string
}

const DEFAULT_ROW: Row = { open: false, openTime: '08:00', closeTime: '18:00' }

const timeInput = `figures h-10 px-3 text-[14px] disabled:opacity-40 ${inputBox}`

// Weekly opening hours. Saving replaces the whole schedule (PUT /coffee-shops/{id}/schedule).
export function HoursEditor({ shopId, schedule }: { shopId: number; schedule: OperatingHours[] }) {
  const save = useUpdateSchedule(shopId)
  const [saved, setSaved] = useState(false)
  const [rows, setRows] = useState<Record<DayOfWeek, Row>>(() => {
    const byDay = new Map(schedule.map((h) => [h.dayOfWeek, h]))
    return Object.fromEntries(
      DAYS_OF_WEEK.map((day) => {
        const h = byDay.get(day)
        return [day, h ? { open: true, openTime: formatTime(h.openTime), closeTime: formatTime(h.closeTime) } : DEFAULT_ROW]
      }),
    ) as Record<DayOfWeek, Row>
  })

  // The backend rejects shifts past midnight, so close must be later than open on the same day
  const invalid = DAYS_OF_WEEK.filter((d) => rows[d].open && !(rows[d].closeTime > rows[d].openTime))

  const change = (day: DayOfWeek, patch: Partial<Row>) => {
    setSaved(false)
    setRows((r) => ({ ...r, [day]: { ...r[day], ...patch } }))
  }

  const copyMonday = () => {
    setSaved(false)
    setRows((r) => ({
      ...r,
      TUESDAY: r.MONDAY,
      WEDNESDAY: r.MONDAY,
      THURSDAY: r.MONDAY,
      FRIDAY: r.MONDAY,
    }))
  }

  const submit = () => {
    if (invalid.length) return
    setSaved(false)
    save.mutate(
      DAYS_OF_WEEK.filter((d) => rows[d].open).map((d) => ({
        dayOfWeek: d,
        openTime: `${rows[d].openTime}:00`,
        closeTime: `${rows[d].closeTime}:00`,
      })),
      { onSuccess: () => setSaved(true) },
    )
  }

  return (
    <div className="max-w-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-muted">Untick a day to mark it closed.</p>
        <Button type="button" variant="ghost" onClick={copyMonday}>
          Copy Monday to weekdays
        </Button>
      </div>

      <ul className="mt-4 divide-y divide-line/80">
        {DAYS_OF_WEEK.map((day) => {
          const row = rows[day]
          const bad = invalid.includes(day)
          return (
            <li key={day} className="py-3">
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="flex items-center gap-2.5 text-[14px] font-medium">
                  <input
                    type="checkbox"
                    checked={row.open}
                    onChange={(e) => change(day, { open: e.target.checked })}
                    className="size-4 accent-espresso"
                  />
                  {DAY_LABEL[day]}
                </label>
                {row.open ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      aria-label={`${DAY_LABEL[day]} opens at`}
                      value={row.openTime}
                      onChange={(e) => change(day, { openTime: e.target.value })}
                      className={timeInput}
                    />
                    <span className="text-faint">–</span>
                    <input
                      type="time"
                      aria-label={`${DAY_LABEL[day]} closes at`}
                      value={row.closeTime}
                      onChange={(e) => change(day, { closeTime: e.target.value })}
                      className={cx(timeInput, bad && 'border-alert text-alert')}
                    />
                  </div>
                ) : (
                  <span className="text-[14px] text-faint">Closed</span>
                )}
              </div>
              {bad && <p className="mt-1.5 pl-[156px] text-[12px] text-alert">Closing time must be after opening time.</p>}
            </li>
          )
        })}
      </ul>

      {save.isError && (
        <div className="mt-5">
          <Notice>{save.error.message || 'Couldn’t save the hours. Try again.'}</Notice>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button type="button" onClick={submit} loading={save.isPending} disabled={invalid.length > 0}>
          Save hours
        </Button>
        {saved && (
          <p role="status" className="flex items-center gap-2 text-[14px] font-medium text-open">
            <CheckCircle2 className="size-4" /> Saved.
          </p>
        )}
      </div>
    </div>
  )
}
