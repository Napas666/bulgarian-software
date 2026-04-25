import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { listPRs, DEMO } from '../api/github'
import { MOCK_PRS } from '../api/mockData'
import { useStore } from '../store/useStore'
import type { GitHubPR } from '../types'
import NeonButton from '../components/ui/NeonButton'
import LabelBadge from '../components/ui/LabelBadge'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (d < 60) return `${d}s ago`
  if (d < 3600) return `${Math.floor(d / 60)}м ago`
  if (d < 86400) return `${Math.floor(d / 3600)}ч ago`
  return `${Math.floor(d / 86400)}д ago`
}

function PRStateBadge({ pr }: { pr: GitHubPR }) {
  if (pr.merged) return <span style={{ background: 'rgba(204,136,255,0.12)', border: '1px solid rgba(204,136,255,0.3)', color: 'var(--purple)', fontFamily: 'var(--font-head)', fontSize: 9, padding: '2px 8px', borderRadius: 12 }}>⊕ MERGED</span>
  if (pr.state === 'open') return <span style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: 'var(--green)', fontFamily: 'var(--font-head)', fontSize: 9, padding: '2px 8px', borderRadius: 12 }}>◉ OPEN</span>
  return <span style={{ background: 'rgba(255,0,48,0.1)', border: '1px solid rgba(255,0,48,0.2)', color: 'var(--red)', fontFamily: 'var(--font-head)', fontSize: 9, padding: '2px 8px', borderRadius: 12 }}>◎ CLOSED</span>
}

export default function PullRequests() {
  const setView = useStore(s => s.setView)
  const compactMode = useStore(s => s.compactMode)
  const [prs, setPRs] = useState<GitHubPR[]>([])
  const [state, setState] = useState<'open' | 'closed'>('open')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterLabel, setFilterLabel] = useState<string | null>(null)
  const [showLabelFilter, setShowLabelFilter] = useState(false)

  const allLabels = Array.from(new Set(prs.flatMap(p => p.labels.map(l => l.name))))

  const load = async (s: 'open' | 'closed') => {
    setLoading(true); setError('')
    try {
      if (DEMO) {
        await new Promise(r => setTimeout(r, 250))
        setPRs(MOCK_PRS.filter(p => s === 'closed' ? (p.merged || p.state === 'closed') : p.state === 'open'))
      } else {
        const data = await listPRs(s)
        setPRs(data)
      }
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load(state) }, [state])

  const countdown = useAutoRefresh(() => load(state))
  useKeyboardShortcuts({
    'r': () => load(state), 'R': () => load(state),
    'Escape': () => setShowLabelFilter(false),
  })

  const filtered = prs.filter(p => {
    const matchText = p.title.toLowerCase().includes(search.toLowerCase()) || `#${p.number}`.includes(search)
    const matchLabel = !filterLabel || p.labels.some(l => l.name === filterLabel)
    return matchText && matchLabel
  })

  const padding = compactMode ? '8px 14px' : '12px 16px'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск пул-реквестов..." style={{ flex: 1, minWidth: 120, fontSize: 13 }} />

        {/* Label filter */}
        {allLabels.length > 0 && (
          <div style={{ position: 'relative' }}>
            <NeonButton size="sm" variant={filterLabel ? 'primary' : 'ghost'} onClick={() => setShowLabelFilter(v => !v)} icon="⬡" tooltip="Фильтр по метке">
              {filterLabel ?? 'Метка'}
            </NeonButton>
            <AnimatePresence>
              {showLabelFilter && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, zIndex: 50, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                  <button onClick={() => { setFilterLabel(null); setShowLabelFilter(false) }}
                    style={{ width: '100%', padding: '8px 12px', background: !filterLabel ? 'rgba(255,255,255,0.06)' : 'transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-3)', textAlign: 'left' }}>
                    Все метки
                  </button>
                  {allLabels.map(name => {
                    const label = prs.flatMap(p => p.labels).find(l => l.name === name)
                    return (
                      <button key={name} onClick={() => { setFilterLabel(name); setShowLabelFilter(false) }}
                        style={{ width: '100%', padding: '7px 12px', background: filterLabel === name ? `#${label?.color ?? 'fff'}22` : 'transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {label && <span style={{ width: 8, height: 8, borderRadius: '50%', background: `#${label.color}`, flexShrink: 0 }} />}
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-2)' }}>{name}</span>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 6, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {(['open', 'closed'] as const).map(s => (
            <button key={s} onClick={() => setState(s)} style={{ padding: '6px 14px', background: state === s ? 'rgba(255,0,48,0.12)' : 'transparent', border: 'none', color: state === s ? 'var(--red)' : 'var(--text-3)', fontFamily: 'var(--font-head)', fontSize: 10, letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.15s' }}>
              {s === 'open' ? '◉' : '◎'} {s.toUpperCase()}
            </button>
          ))}
        </div>

        <NeonButton size="sm" variant="ghost" onClick={() => load(state)} icon="↻" tooltip="Обновить список пул-реквестов с GitHub">
          {countdown > 0 ? `↻ ${countdown}s` : 'Refresh'}
        </NeonButton>
      </div>

      <div className="panel" style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13, gap: 8 }}>
            <span className="spin">◌</span> Загрузка...
          </div>
        ) : error ? (
          <div style={{ padding: 20, color: '#ff4455', fontFamily: 'var(--font-mono)', fontSize: 13 }}>✗ {error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: 'var(--text-3)', fontSize: 14 }}>
            Нет {state === 'open' ? 'открытых' : 'закрытых'} PR{search || filterLabel ? ' по фильтру' : ''}
          </div>
        ) : filtered.map((pr, i) => (
          <motion.div key={pr.number}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
            onClick={() => setView('pr-detail', pr.number)}
            style={{ padding, borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'background 0.1s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ marginTop: 2, flexShrink: 0 }}><PRStateBadge pr={pr} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: compactMode ? 0 : 4 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: compactMode ? 13 : 14, color: 'var(--text)', fontWeight: 600 }}>{pr.title}</span>
                {pr.labels.map(l => <LabelBadge key={l.id} label={l} />)}
              </div>
              {!compactMode && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span>#{pr.number}</span>
                  <span>{pr.head.ref} → {pr.base.ref}</span>
                  <span>открыт {timeAgo(pr.created_at)} пользователем {pr.user.login}</span>
                  {pr.comments > 0 && <span>💬 {pr.comments}</span>}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>
        {filtered.length} пул-реквест{filtered.length !== 1 ? 'ов' : ''}
      </div>
    </div>
  )
}
