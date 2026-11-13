import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { transition } from '../../design/motion'
import { formatVoucherCode } from '../../lib/format'

// Ticket-stub style code with copy-to-clipboard.
export function VoucherCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard can be blocked; the code is still selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group inline-flex items-center gap-3 rounded-xs border border-dashed border-satin/60 bg-satin-wash/60 px-4 py-2.5 text-left transition-colors hover:border-satin"
      aria-label={`Copy voucher code ${code}`}
    >
      <span className="figures select-all text-lg font-medium tracking-[0.18em] text-espresso">
        {formatVoucherCode(code)}
      </span>
      <span className="relative size-4 text-satin-deep">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? 'done' : 'copy'}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={transition.quick}
            className="absolute inset-0"
          >
            {copied ? <Check className="size-4 text-open" /> : <Copy className="size-4" />}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  )
}
