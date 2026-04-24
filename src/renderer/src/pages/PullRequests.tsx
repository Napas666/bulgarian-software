import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { listPRs, DEMO } from '../api/github'
import { MOCK_PRS } from '../api/mockData'
import { useStore } from '../store/useStore'
import type { GitHubPR } from '../types'
import NeonButton from '../components/ui/NeonButton'
import LabelBadge from '../components/ui/LabelBadge'

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (d < 60) return `${d}s ago`
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}

function PRStateBadge({ pr }: { pr: GitHubPR }) {
  if (pr.merged) return (
    <span style={{ background: 'rgba(204,136,255,0.12)', border: '1px solid rgba(204,136,255,0.3)', color: 'var(--purple)', fontFamily: 'var(--font-head)', fontSize: 9, padding: '2px 8px', borderRadius: 12 }}>⊕ MERGED</span>
  )
  if (pr.state === 'open') return (
    <span style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: 'var(--green)', fontFamily: 'var(--font-head)', fontSize: 9, padding: '2px 8px', borderRadius: 12 }}>◉ OPEN</span>
  )
  return (
    <span style={{ background: 'rgba(255,0,48,0.1)', border: '1px solid rgba(255,0,48,0.2)', color: 'var(--red)', fontFamily: 'var(--font-head)', fontSize: 9, padding: '2px 8px', borderRadius: 12 }}>◎ CLOSED</span>
  )
}

export default function PullRequests() {
  const setView = useStore(s => s.setView)
  const [prs, setPRs] = useState<GitHubPR[]>([])
  const [state, setState] = useState<'open' | 'closed'>('open')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = async (s: 'open' | 'closed') => {
    setLoading(true)
    setError('')
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

  const filtered = prs.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    `#${p.number}`.includes(search)
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search pull requests..."
          style={{ flex: 1, fontSize: 13 }}
        />
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 6, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {(['open', 'closed'] as const).map(s => (
            <button key={s} onClick={() => setState(s)} style={{
              padding: '6px 14px',
              background: state === s ? 'rgba(255,0,48,0.12)' : 'transparent',
              border: 'none',
              color: state === s ? 'var(--red)' : 'var(--text-3)',
              fontFamily: 'var(--font-head)', fontSize: 10, letterSpacing: '0.08em',
              cursor: 'pointer', transition: 'all 0.15s'
            }}>
              {s === 'open' ? '◉' : '◎'} {s.toUpperCase()}
            </button>
          ))}
        </div>
        <NeonButton size="sm" variant="ghost" onClick={() => load(state)} icon="↻" tooltip="Обновить список пул-реквестов с GitHub">Refresh</NeonButton>
      </div>

      {/* PR list */}
      <div className="panel" style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13, gap: 8 }}>
            <span className="spin">◌</span> Loading...
          </div>
        ) : error ? (
          <div style={{ padding: 20, color: '#ff4455', fontFamily: 'var(--font-mono)', fontSize: 13 }}>✗ {error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: 'var(--text-3)', fontSize: 14 }}>
            No {state} pull requests{search ? ' matching your search' : ''}
          </div>
        ) : filtered.map((pr, i) => (
          <motion.div
            key={pr.number}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => setView('pr-detail', pr.number)}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'flex', gap: 12, alignItems: 'flex-start',
              transition: 'background 0.1s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ marginTop: 2, flexShrink: 0 }}>
              <PRStateBadge pr={pr} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{pr.title}</span>
                {pr.labels.map(l => <LabelBadge key={l.id} label={l} />)}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>#{pr.number}</span>
                <span>{pr.head.ref} → {pr.base.ref}</span>
                <span>opened {timeAgo(pr.created_at)} by {pr.user.login}</span>
                {pr.comments > 0 && <span>💬 {pr.comments}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>
        {filtered.length} pull request{filtered.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
