import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useStore } from '../../store/useStore'

export default function ToastContainer() {
  const toasts = useStore(s => s.toasts)
  const removeToast = useStore(s => s.removeToast)

  return createPortal(
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      <AnimatePresence>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}

function ToastItem({ toast, onDismiss }: { toast: { id: string; message: string; type: 'success' | 'error' | 'info' }; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [])

  const colors = {
    success: { bg: 'rgba(0,255,136,0.12)', border: 'rgba(0,255,136,0.35)', color: 'var(--green)', icon: '✓' },
    error:   { bg: 'rgba(255,0,48,0.15)',  border: 'rgba(255,0,48,0.4)',   color: '#ff4455',      icon: '✗' },
    info:    { bg: 'rgba(0,170,255,0.12)', border: 'rgba(0,170,255,0.35)', color: 'var(--blue)',  icon: '◈' },
  }
  const c = colors[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      onClick={onDismiss}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        pointerEvents: 'all',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        minWidth: 220,
        maxWidth: 340,
        backdropFilter: 'blur(8px)'
      }}
    >
      <span style={{ color: c.color, fontSize: 14, flexShrink: 0 }}>{c.icon}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-2)', flex: 1 }}>{toast.message}</span>
    </motion.div>
  )
}
