import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getRepo_, listIssues, listPRs, listCommits, DEMO } from '../api/github'
import { useStore } from '../store/useStore'
import type { GitHubRepo, GitHubCommit } from '../types'
import { MOCK_ISSUES, MOCK_PRS, MOCK_COMMITS } from '../api/mockData'

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (d < 60) return `${d}s назад`
  if (d < 3600) return `${Math.floor(d / 60)}м назад`
  if (d < 86400) return `${Math.floor(d / 3600)}ч назад`
  return `${Math.floor(d / 86400)}д назад`
}

function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: `${color}0d`,
        border: `1px solid ${color}33`,
        borderRadius: 10,
        padding: '16px 20px',
        flex: 1,
        minWidth: 120
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, color, fontWeight: 700, marginBottom: 4 }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>{label}</div>
    </motion.div>
  )
}

export default function Dashboard() {
  const setView = useStore(s => s.setView)
  const [repo, setRepo] = useState<GitHubRepo | null>(null)
  const [openIssues, setOpenIssues] = useState(0)
  const [openPRs, setOpenPRs] = useState(0)
  const [commits, setCommits] = useState<GitHubCommit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        if (DEMO) {
          await new Promise(r => setTimeout(r, 300))
          setRepo({
            full_name: 'demo/repo', name: 'repo', description: 'Demo repository',
            private: false, open_issues_count: 3, stargazers_count: 42,
            forks_count: 7, default_branch: 'main',
            owner: { login: 'demo', avatar_url: 'https://github.com/identicons/demo.png' }
          })
          setOpenIssues(MOCK_ISSUES.filter(i => i.state === 'open').length)
          setOpenPRs(MOCK_PRS.filter(p => p.state === 'open').length)
          setCommits(MOCK_COMMITS.slice(0, 5))
        } else {
          const [r, issues, prs, cmts] = await Promise.all([
            getRepo_(), listIssues('open'), listPRs('open'), listCommits(1)
          ])
          setRepo(r)
          setOpenIssues(issues.filter(i => !i.pull_request).length)
          setOpenPRs(prs.length)
          setCommits(cmts.slice(0, 5))
        }
      } catch (e) { /* silent */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', gap: 8 }}>
      <span className="spin">◌</span> Загрузка...
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, overflow: 'auto' }}>

      {/* Repo header */}
      {repo && (
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <img src={repo.owner.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, color: 'var(--text)', letterSpacing: '0.06em' }}>{repo.full_name}</div>
              {repo.description && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{repo.description}</div>}
            </div>
            {repo.private && (
              <span style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.3)', color: 'var(--yellow)', fontFamily: 'var(--font-head)', fontSize: 9, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.08em' }}>PRIVATE</span>
            )}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
        <StatCard label="ОТКРЫТЫХ ЗАДАЧ"  value={openIssues}                    color="#00ff88" icon="◉" />
        <StatCard label="ОТКРЫТЫХ PR"      value={openPRs}                       color="#cc88ff" icon="⊕" />
        <StatCard label="ЗВЁЗДЫ"           value={repo?.stargazers_count ?? 0}   color="#ffb800" icon="★" />
        <StatCard label="ФОРКИ"            value={repo?.forks_count ?? 0}        color="#00aaff" icon="⑂" />
      </div>

      {/* Quick nav */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        {[
          { view: 'issues' as const, label: 'Задачи', icon: '◉', color: '#00ff88' },
          { view: 'prs' as const, label: 'Pull Requests', icon: '⊕', color: '#cc88ff' },
          { view: 'commits' as const, label: 'Коммиты', icon: '◈', color: 'var(--blue)' },
          { view: 'invites' as const, label: 'Инвайты', icon: '→', color: 'var(--red)' },
        ].map(item => (
          <button key={item.view} onClick={() => setView(item.view)} style={{
            flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '10px 8px', cursor: 'pointer', transition: 'all 0.15s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
          }}
            onMouseEnter={e => { e.currentTarget.style.background = `${item.color}14`; e.currentTarget.style.borderColor = `${item.color}44` }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <span style={{ fontSize: 16, color: item.color }}>{item.icon}</span>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.08em' }}>{item.label.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Recent commits */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 8 }}>ПОСЛЕДНИЕ КОММИТЫ</div>
        <div className="panel" style={{ overflow: 'auto', maxHeight: 280 }}>
          {commits.map((c, i) => {
            const [firstLine] = c.commit.message.split('\n')
            return (
              <motion.div
                key={c.sha}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}
              >
                {c.author
                  ? <img src={c.author.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0 }} />
                  : <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firstLine}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                    {c.author?.login ?? c.commit.author.name} · {timeAgo(c.commit.author.date)}
                  </div>
                </div>
                <button
                  onClick={() => window.open(c.html_url, '_blank')}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--blue)', fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 7px', cursor: 'pointer', flexShrink: 0 }}
                >
                  {c.sha.slice(0, 7)}
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
