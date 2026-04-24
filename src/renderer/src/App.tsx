import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from './store/useStore'
import { setToken, setRepo, setDemo } from './api/github'
import { themes, applyTheme } from './themes'
import TitleBar from './components/layout/TitleBar'
import Setup from './pages/Setup'
import Issues from './pages/Issues'
import IssueDetail from './pages/IssueDetail'
import PullRequests from './pages/PullRequests'
import PRDetail from './pages/PRDetail'
import Commits from './pages/Commits'
import Invites from './pages/Invites'
import Tooltip from './components/ui/Tooltip'
import Settings from './components/ui/Settings'
import type { View } from './types'

const navItems: { id: View; label: string; icon: string }[] = [
  { id: 'issues',  label: 'Issues',        icon: '◉' },
  { id: 'prs',     label: 'Pull Requests',  icon: '⊕' },
  { id: 'commits', label: 'Commits',        icon: '◈' },
  { id: 'invites', label: 'Invites',        icon: '→' },
]

const parentView: Partial<Record<View, View>> = {
  'issue-detail': 'issues',
  'pr-detail': 'prs'
}

export default function App() {
  const token = useStore(s => s.token)
  const repoUrl = useStore(s => s.repoUrl)
  const currentView = useStore(s => s.currentView)
  const themeId = useStore(s => s.themeId)
  const demoMode = useStore(s => s.demoMode)
  const setView = useStore(s => s.setView)
  const setTheme = useStore(s => s.setTheme)

  useEffect(() => {
    if (demoMode) {
      setDemo(true)
    } else {
      if (token) setToken(token)
      if (repoUrl) {
        const path = repoUrl.replace('https://github.com/', '').replace(/\/$/, '')
        setRepo(path)
      }
    }
    const saved = themes.find(t => t.id === themeId) ?? themes[0]
    applyTheme(saved)
  }, [])

  const currentTheme = themes.find(t => t.id === themeId) ?? themes[0]

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
          width: 200, flexShrink: 0,
          background: 'rgba(0,0,0,0.5)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          padding: '16px 8px'
        }}>

          {/* Demo banner */}
          {demoMode && (
            <div style={{
              background: 'rgba(255,184,0,0.08)',
              border: '1px solid rgba(255,184,0,0.25)',
              borderRadius: 6,
              padding: '5px 10px',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span style={{ fontSize: 10 }}>◈</span>
              <span style={{ fontFamily: 'var(--font-head)', fontSize: 9, color: 'var(--yellow)', letterSpacing: '0.08em' }}>DEMO MODE</span>
            </div>
          )}

          {/* Nav */}
          {navItems.map(item => {
            const active = activeParent === item.id
            const tooltips: Record<string, string> = {
              issues: 'Просмотр и управление задачами репозитория',
              prs: 'Просмотр и управление пул-реквестами',
              commits: 'История коммитов репозитория',
              invites: 'Приглашение коллаборантов в репозиторий'
            }
            return (
              <Tooltip key={item.id} text={tooltips[item.id]} position="right">
                <button
                  onClick={() => setView(item.id)}
                  style={{
                    background: active ? `${currentTheme.accent}18` : 'transparent',
                    border: `1px solid ${active ? `${currentTheme.accent}44` : 'transparent'}`,
                    borderRadius: 7,
                    padding: '9px 12px',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                    marginBottom: 2, transition: 'all 0.15s',
                    width: '100%'
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = active ? `${currentTheme.accent}18` : 'transparent' }}
                >
                  <span style={{ fontSize: 14, color: active ? 'var(--red)' : 'var(--text-3)' }}>{item.icon}</span>
                  <span style={{ fontFamily: 'var(--font-head)', fontSize: 11, letterSpacing: '0.08em', color: active ? 'var(--red)' : 'var(--text-2)' }}>
                    {item.label.toUpperCase()}
                  </span>
                </button>
              </Tooltip>
            )
          })}

          <div style={{ flex: 1 }} />

          {/* Settings (gear) */}
          <div style={{ marginBottom: 6 }}>
            <Settings />
          </div>

          {/* Disconnect */}
          <Tooltip text="Отключиться и вернуться к экрану входа" position="right">
            <button
              onClick={() => {
                useStore.getState().setToken('')
                useStore.getState().setRepoUrl('')
                useStore.getState().setDemoMode(false)
                window.location.reload()
              }}
              style={{
                width: '100%',
                background: 'transparent', border: '1px solid transparent', borderRadius: 7,
                padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
            >
              <span style={{ color: 'var(--text-3)', fontSize: 12 }}>⏻</span>
              <span style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>DISCONNECT</span>
            </button>
          </Tooltip>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'hidden', padding: 20, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
            >
              {currentView === 'issues'       && <Issues />}
              {currentView === 'issue-detail' && <IssueDetail />}
              {currentView === 'prs'          && <PullRequests />}
              {currentView === 'pr-detail'    && <PRDetail />}
              {currentView === 'commits'      && <Commits />}
              {currentView === 'invites'      && <Invites />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
