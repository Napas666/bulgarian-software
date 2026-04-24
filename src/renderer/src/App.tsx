import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from './store/useStore'
import { setToken, setRepo } from './api/github'
import TitleBar from './components/layout/TitleBar'
import Setup from './pages/Setup'
import Issues from './pages/Issues'
import IssueDetail from './pages/IssueDetail'
import PullRequests from './pages/PullRequests'
import PRDetail from './pages/PRDetail'
import Commits from './pages/Commits'
import type { View } from './types'

const navItems: { id: View; label: string; icon: string }[] = [
  { id: 'issues', label: 'Issues', icon: '◉' },
  { id: 'prs', label: 'Pull Requests', icon: '⊕' },
  { id: 'commits', label: 'Commits', icon: '◈' }
]

const parentView: Partial<Record<View, View>> = {
  'issue-detail': 'issues',
  'pr-detail': 'prs'
}

export default function App() {
  const token = useStore(s => s.token)
  const repoUrl = useStore(s => s.repoUrl)
  const currentView = useStore(s => s.currentView)
  const setView = useStore(s => s.setView)

  // Restore API state from persisted store on mount
  useEffect(() => {
    if (token) setToken(token)
    if (repoUrl) {
      const path = repoUrl.replace('https://github.com/', '').replace(/\/$/, '')
      setRepo(path)
    }
  }, [])

  const isSetup = !token || !repoUrl

  if (isSetup) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TitleBar />
      <Setup />
    </div>
  )

  const activeParent = parentView[currentView] ?? currentView

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TitleBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: 200,
          flexShrink: 0,
          background: 'rgba(8,8,15,0.8)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 8px'
        }}>
          {navItems.map(item => {
            const active = activeParent === item.id
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                style={{
                  background: active ? 'rgba(255,0,48,0.1)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(255,0,48,0.3)' : 'transparent'}`,
                  borderRadius: 7,
                  padding: '9px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 2,
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 14, color: active ? 'var(--red)' : 'var(--text-3)' }}>{item.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  color: active ? 'var(--red)' : 'var(--text-2)'
                }}>
                  {item.label.toUpperCase()}
                </span>
              </button>
            )
          })}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Disconnect */}
          <button
            onClick={() => {
              useStore.getState().setToken('')
              useStore.getState().setRepoUrl('')
              window.location.reload()
            }}
            style={{
              background: 'transparent', border: '1px solid transparent', borderRadius: 7,
              padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,0,48,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,0,48,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
          >
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>⏻</span>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>DISCONNECT</span>
          </button>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'hidden', padding: 20, display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
            >
              {currentView === 'issues' && <Issues />}
              {currentView === 'issue-detail' && <IssueDetail />}
              {currentView === 'prs' && <PullRequests />}
              {currentView === 'pr-detail' && <PRDetail />}
              {currentView === 'commits' && <Commits />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
