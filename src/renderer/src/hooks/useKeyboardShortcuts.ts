import { useEffect } from 'react'
import { useStore } from '../store/useStore'

type ShortcutMap = Partial<Record<string, () => void>>

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const enabled = useStore(s => s.shortcutsEnabled)

  useEffect(() => {
    if (!enabled) return
    const handler = (e: KeyboardEvent) => {
      // Не срабатывает когда фокус в input/textarea
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      const fn = shortcuts[e.key]
      if (fn) { e.preventDefault(); fn() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled, shortcuts])
}
