import { useEffect, useState } from 'react'

// Current time, re-rendering on the minute boundary so open/closed labels stay live.
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let interval: number | undefined
    const align = window.setTimeout(() => {
      setNow(new Date())
      interval = window.setInterval(() => setNow(new Date()), intervalMs)
    }, intervalMs - (Date.now() % intervalMs))
    return () => {
      window.clearTimeout(align)
      window.clearInterval(interval)
    }
  }, [intervalMs])
  return now
}
