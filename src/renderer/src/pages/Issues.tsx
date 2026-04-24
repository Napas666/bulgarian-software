import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { listIssues, createIssue, DEMO } from '../api/github'
import { MOCK_ISSUES } from '../api/mockData'
import { useStore } from '../store/useStore'
import type { GitHubIssue } from '../types'
import NeonButton from '../components/ui/NeonButton'
import LabelBadge from '../components/ui/LabelBadge'

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (d < 60) return `${d}s ago`
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}

export default function Issues() {
  const setView = useStore(s => s.setView)
  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [state, setState] = useState<'open' | 'closed'>('open')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async (s: 'open' | 'closed') => {
    setLoading(true)
    setError('')
    try {
      if (DEMO) {
        await new Promise(r => setTimeout(r, 300))
        setIssues(MOCK_ISSUES.filter(i => i.state === s))
      } else {
        const data = await listIssues(s)
        setIssues(data.filter(i => !i.pull_request))
      }
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load(state) }, [state])

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setSubmitting(true)
    try {
      const issue = await createIssue({ title: newTitle, body: newBody })
      setIssues(prev => [issue, ...prev])
      setCreating(false)
      setNewTitle('')
      setNewBody('')
    } catch (e: any) { setError(e.message) }
    finally { setSubmitting(false) }
  }

  const filtered = issues.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    `#${i.number}`.includes(search)
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search issues..."
          style={{ flex: 1, fontSize: 13 }}
        />

        {/* Open / Closed toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 6, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {(['open', 'closed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setState(s)}
              style={{
                padding: '6px 14px',
                background: state === s ? 'rgba(255,0,48,0.12)' : 'transparent',
                border: 'none',
                color: state === s ? 'var(--red)' : 'var(--text-3)',
                fontFamily: 'var(--font-head)',
                fontSize: 10,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {s === 'open' ? '◉' : '✓'} {s.toUpperCase()}
            </button>
          ))}
        </div>

        <NeonButton size="sm" onClick={() => setCreating(true)} icon="＋">New Issue</NeonButton>
        <NeonButton size="sm" variant="ghost" onClick={() => load(state)} icon="↻">Refresh</NeonButton>
      </div>

      {/* New issue form */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="panel-red"
            style={{ padding: 16, overflow: 'hidden', flexShrink: 0 }}
          >
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 11, color: 'var(--red)', marginBottom: 10 }}>NEW ISSUE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" style={{ width: '100%' }} />
              <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Description (markdown supported)" style={{ width: '100%', minHeight: 80 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <NeonButton size="sm" onClick={handleCreate} disabled={submitting || !newTitle.trim()}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </NeonButton>
                <NeonButton size="sm" variant="ghost" onClick={() => setCreating(false)}>Cancel</NeonButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issues list */}
      <div className="panel" style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            <span className="spin" style={{ marginRight: 8 }}>◌</span> Loading...
          </div>
        ) : error ? (
          <div style={{ padding: 20, color: '#ff4455', fontFamily: 'var(--font-mono)', fontSize: 13 }}>✗ {error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: 'var(--text-3)', fontSize: 14 }}>
            No {state} issues{search ? ' matching your search' : ''}
          </div>
        ) : (
          filtered.map((issue, i) => (
            <motion.div
              key={issue.number}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setView('issue-detail', issue.number)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                transition: 'background 0.1s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* State icon */}
              <span style={{ fontSize: 14, marginTop: 1, flexShrink: 0, color: state === 'open' ? 'var(--green)' : 'var(--text-3)' }}>
                {state === 'open' ? '◉' : '◎'}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>
                    {issue.title}
                  </span>
                  {issue.labels.map(l => <LabelBadge key={l.id} label={l} />)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', display: 'flex', gap: 12 }}>
                  <span>#{issue.number}</span>
                  <span>opened {timeAgo(issue.created_at)} by {issue.user.login}</span>
                  {issue.comments > 0 && <span>💬 {issue.comments}</span>}
                </div>
              </div>

              {issue.assignees.length > 0 && (
                <div style={{ display: 'flex', gap: -4 }}>
                  {issue.assignees.slice(0, 3).map(a => (
                    <img key={a.login} src={a.avatar_url} alt={a.login} title={a.login}
                      style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--bg-2)' }} />
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>
        {filtered.length} issue{filtered.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
