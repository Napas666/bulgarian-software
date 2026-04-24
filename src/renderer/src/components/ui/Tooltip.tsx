import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import type { ReactNode } from 'react'

interface Props {
  text: string
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function Tooltip({ text, children, position = 'top' }: Props) {
  const tooltipsEnabled = useStore(s => s.tooltipsEnabled)
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const show = () => {
    if (!tooltipsEnabled || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    let x = r.left + r.width / 2
    let y = r.top - 8
    if (position === 'bottom') y = r.bottom + 8
    if (position === 'left') { x = r.left - 8; y = r.top + r.height / 2 }
    if (position === 'right') { x = r.right + 8; y = r.top + r.height / 2 }
    setCoords({ x, y })
    setVisible(true)
  }

  const hide = () => setVisible(false)

  useEffect(() => { return () => setVisible(false) }, [])

  return (
    <div ref={ref} style={{ display: 'contents' }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {createPortal(
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: position === 'bottom' ? -4 : 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'fixed',
                left: coords.x,
                top: position === 'bottom' ? coords.y : undefined,
                bottom: position === 'top' ? `calc(100vh - ${coords.y}px)` : undefined,
                transform: position === 'left' || position === 'right'
                  ? `translate(${position === 'left' ? '-100%' : '0'}, -50%)`
                  : 'translateX(-50%)',
                background: 'rgba(10,10,18,0.97)',
                border: '1px solid var(--border-red)',
                borderRadius: 6,
                padding: '5px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-2)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 9999,
                boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                letterSpacing: '0.02em'
              }}
            >
              {text}
              {/* Arrow */}
              <div style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                ...(position === 'top' ? { bottom: -4, borderTop: '4px solid var(--border-red)', borderLeft: '4px solid transparent', borderRight: '4px solid transparent' } : {}),
                ...(position === 'bottom' ? { top: -4, borderBottom: '4px solid var(--border-red)', borderLeft: '4px solid transparent', borderRight: '4px solid transparent' } : {}),
                width: 0, height: 0
              }} />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
