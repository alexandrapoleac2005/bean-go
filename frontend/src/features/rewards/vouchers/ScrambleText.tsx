import { useEffect, useState } from 'react'

// Same alphabet as VoucherCodeGenerator
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

// Slot-machine reveal: characters shuffle, then lock in left to right.
export function ScrambleText({ text, active, className }: { text: string; active: boolean; className?: string }) {
  const [shown, setShown] = useState(active ? scramble(text, 0) : text)

  useEffect(() => {
    if (!active) return
    let frame = 0
    const total = 18 + text.length * 2
    const id = window.setInterval(() => {
      frame++
      const locked = Math.floor((frame / total) * text.length)
      setShown(scramble(text, locked))
      if (frame >= total) {
        window.clearInterval(id)
        setShown(text)
      }
    }, 38)
    return () => window.clearInterval(id)
  }, [active, text])

  return (
    <span className={className} aria-label={text}>
      {shown}
    </span>
  )
}

function scramble(text: string, locked: number) {
  return [...text]
    .map((ch, i) => (i < locked || ch === ' ' ? ch : ALPHABET[Math.floor(Math.random() * ALPHABET.length)]))
    .join('')
}
