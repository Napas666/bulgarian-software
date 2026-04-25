import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { setRepo, setToken } from '../../api/github'

export default function RepoSwitcher() {
  const repoUrl = useStore(s => s.repoUrl)
  const setRepoUrl = useStore(s => s.setRepoUrl)
  const addToast = useStore(s => s.addToast)
  const setView = useStore(s => s.setView)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  const repoName = repoUrl.replace('https://github.com/', '').replace(/\/$/, '')

  const handleSwitch = () => {
    let v = value.trim()
    if (!v) return
    // Принимаем как owner/repo так и полный URL
    v = v.replace('https://github.com/', '').replace(/\/$/, '')
    if (!v.includes('/')) { addToast('Формат: owner/repo или ссылка на GitHub', 'error'); return }
    const fullUrl = `https://github.com/${v}`
    setRepoUrl(fullUrl)
    setRepo(v)
    setView('dashboard')
    setValue('')
    setOpen(false)
    addToast(`Переключено на ${v}`, 'success')
  }

  return (
    <div style={{ position: 'relative', marginBottom: 6 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', background: 'transparent',
          border: '1px solid var(--border)', borderRadius: 7,
          padding: '7px 10px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s'
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-red)')}
        onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>⑂</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {repoName || '—'}
        </span>
        <span style={{ color: 'var(--text-3)', fontSize: 9 }}>{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0,
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: 8, zIndex: 300, padding: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 8 }}>СМЕНИТЬ РЕПОЗИТОРИЙ</div>
            <input
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSwitch()}
              placeholder="owner/repo"
              autoFocus
              style={{ width: '100%', marginBottom: 8, fontSize: 12 }}
            />
            <button
              onClick={handleSwitch}
              style={{
                width: '100%', background: 'rgba(255,0,48,0.12)', border: '1px solid rgba(255,0,48,0.35)',
                borderRadius: 5, padding: '6px 0', cursor: 'pointer',
                fontFamily: 'var(--font-head)', fontSize: 10, color: 'var(--red)', letterSpacing: '0.08em'
              }}
            >
              ПЕРЕКЛЮЧИТЬ →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
