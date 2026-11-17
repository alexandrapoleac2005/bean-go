import { Eye, EyeOff } from 'lucide-react'

export function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="p-1 text-faint transition-colors hover:text-espresso"
      aria-label={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  )
}
