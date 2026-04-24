import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { themes, applyTheme } from '../../themes'

export default function Settings() {
  const [open, setOpen] = useState(false)
  const themeId = useStore(s => s.themeId)
  const tooltipsEnabled = useStore(s => s.tooltipsEnabled)
  const setTheme = useStore(s => s.setTheme)
  const setTooltipsEnabled = useStore(s => s.setTooltipsEnabled)
  const currentTheme = themes.find(t => t.id === themeId) ?? themes[0]

  const handleTheme = (id: string) => {
    const t = themes.find(x => x.id === id)!
    applyTheme(t)
    setTheme(id)
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Gear button */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Settings"
        style={{
          width: '100%',
          background: open ? `${currentTheme.accent}14` : 'transparent',
          border: `1px solid ${open ? `${currentTheme.accent}44` : 'var(--border)'}`,
          borderRadius: 7,
          padding: '8px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.borderColor = 'var(--border-red)' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ fontSize: 14, color: open ? currentTheme.accent : 'var(--text-3)', display: 'block' }}
        >
          ⚙
        </motion.span>
        <span style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: open ? currentTheme.accent : 'var(--text-3)', letterSpacing: '0.08em' }}>
          SETTINGS
        </span>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              zIndex: 200,
              boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
              overflow: 'hidden'
            }}
          >
            {/* Section: Theme */}
            <div style={{ padding: '10px 12px 6px', fontFamily: 'var(--font-head)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em' }}>
              COLOR THEME
            </div>
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => handleTheme(t.id)}
                style={{
                  width: '100%',
                  background: themeId === t.id ? `${t.accent}14` : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  padding: '9px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = `${t.accent}18`)}
                onMouseLeave={e => (e.currentTarget.style.background = themeId === t.id ? `${t.accent}14` : 'transparent')}
              >
                <span style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: t.swatch, flexShrink: 0,
                  boxShadow: `0 0 6px ${t.swatch}88`,
                  border: themeId === t.id ? `2px solid ${t.swatch}` : '2px solid transparent'
                }} />
                <span style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: themeId === t.id ? t.accent : 'var(--text-2)', letterSpacing: '0.08em', flex: 1, textAlign: 'left' }}>
                  {t.name}
                </span>
                {themeId === t.id && <span style={{ color: t.accent, fontSize: 10 }}>✓</span>}
              </button>
            ))}

            {/* Section: Tooltips toggle */}
            <div style={{ padding: '10px 12px 6px', fontFamily: 'var(--font-head)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em' }}>
              INTERFACE
            </div>
            <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.06em' }}>TOOLTIPS</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Show hints on hover</div>
                </div>
                <button
                  onClick={() => setTooltipsEnabled(!tooltipsEnabled)}
                  style={{
                    width: 36, height: 20, borderRadius: 10,
                    background: tooltipsEnabled ? `${currentTheme.accent}` : 'rgba(255,255,255,0.1)',
                    border: 'none', cursor: 'pointer', position: 'relative',
                    transition: 'background 0.2s', flexShrink: 0
                  }}
                >
                  <motion.div
                    animate={{ x: tooltipsEnabled ? 17 : 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{
                      position: 'absolute', top: 2,
                      width: 16, height: 16, borderRadius: '50%',
                      background: 'white',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
                    }}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
