import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { listCommits, getRepo_, DEMO } from '../api/github'
import { MOCK_COMMITS } from '../api/mockData'
import type { GitHubCommit } from '../types'
import NeonButton from '../components/ui/NeonButton'
import { useStore } from '../store/useStore'

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (d < 60) return `${d}s ago`
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}

export default function Commits() {
  const repoUrl = useStore(s => s.repoUrl)
  const [commits, setCommits] = useState<GitHubCommit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [defaultBranch, setDefaultBranch] = useState('')

  const load = async (p = 1) => {
    setLoading(true)
    setError('')
    try {
      if (DEMO) {
        await new Promise(r => setTimeout(r, 250))
        setDefaultBranch('main')
        setCommits(MOCK_COMMITS)
        setHasMore(false)
      } else {
        if (p === 1) {
          const repo = await getRepo_()
          setDefaultBranch(repo.default_branch)
        }
        const data = await listCommits(p)
        if (p === 1) setCommits(data)
        else setCommits(prev => [...prev, ...data])
        setHasMore(data.length === 30)
      }
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load(1) }, [])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    load(next)
  }

  const openCommit = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em' }}>COMMITS </span>
          {defaultBranch && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>on {defaultBranch}</span>}
        </div>
        <NeonButton size="sm" variant="ghost" onClick={() => load(1)} icon="↻" tooltip="Обновить список коммитов с GitHub">Refresh</NeonButton>
      </div>

      <div className="panel" style={{ flex: 1, overflow: 'auto' }}>
        {error && <div style={{ padding: 16, color: '#ff4455', fontFamily: 'var(--font-mono)', fontSize: 13 }}>✗ {error}</div>}
        {commits.map((c, i) => {
          const [firstLine, ...rest] = c.commit.message.split('\n')
          const body = rest.filter(Boolean).join('\n').trim()
          const shortSha = c.sha.slice(0, 7)

          return (
            <motion.div
              key={c.sha}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.015 }}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', gap: 12, alignItems: 'flex-start'
              }}
            >
              {/* Avatar */}
              {c.author ? (
                <img src={c.author.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 1 }} />
              ) : (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>?</div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)', fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {firstLine}
                </div>
                {body && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-3)', marginBottom: 4, overflow: 'hidden', maxHeight: 36 }}>
                    {body}
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', display: 'flex', gap: 12 }}>
                  <span>{c.author?.login ?? c.commit.author.name}</span>
                  <span>{timeAgo(c.commit.author.date)}</span>
                </div>
              </div>

              {/* SHA */}
              <button
                onClick={() => openCommit(c.html_url)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 5,
                  color: 'var(--blue)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  padding: '3px 8px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,170,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                title="Open on GitHub"
              >
                {shortSha}
              </button>
            </motion.div>
          )
        })}

        {loading && (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            <span className="spin" style={{ marginRight: 8 }}>◌</span>Loading...
          </div>
        )}

        {!loading && hasMore && (
          <div style={{ padding: 16, textAlign: 'center' }}>
            <NeonButton size="sm" variant="ghost" onClick={loadMore}>Load more</NeonButton>
          </div>
        )}
      </div>
    </div>
  )
}
