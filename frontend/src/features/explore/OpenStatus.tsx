import { StatusTag } from '../../components/ui'
import { DAY_LABEL, formatTime } from '../../lib/format'
import type { OpenState } from '../../lib/schedule'

// "Open · until 22:00" / "Closed · opens 08:00" / "Closed · opens Mon 08:00"
export function OpenStatus({ state, now }: { state: OpenState; now: Date }) {
  if (state.kind === 'open') {
    return (
      <StatusTag tone="open" pulse>
        Open · until <span className="figures">{formatTime(state.closesAt)}</span>
      </StatusTag>
    )
  }
  if (state.kind === 'unknown') return <StatusTag tone="closed">Hours not listed</StatusTag>
  if (!state.opensAt || !state.opensOn) return <StatusTag tone="closed">Closed</StatusTag>

  const today = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][now.getDay()]
  const when = state.opensOn === today ? '' : `${DAY_LABEL[state.opensOn].slice(0, 3)} `
  return (
    <StatusTag tone="closed">
      Closed · opens {when}
      <span className="figures">{formatTime(state.opensAt)}</span>
    </StatusTag>
  )
}
