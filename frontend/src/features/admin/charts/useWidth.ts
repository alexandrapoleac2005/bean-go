import { useLayoutEffect, useRef, useState } from 'react'

// Tracks an element's content width so SVG charts can lay out in real pixels
// (keeps 2px lines and 1px gridlines crisp instead of scaling a viewBox).
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}
