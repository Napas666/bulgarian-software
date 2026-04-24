import { useEffect, useState } from 'react'
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
  const [showThemes, setShowThemes] = useState(false)

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

  const handleTheme = (id: string) => {
    const t = themes.find(x => x.id === id)!
    applyTheme(t)
    setTheme(id)
    setShowThemes(false)
  }

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
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                style={{
                  background: active ? `${currentTheme.accent}18` : 'transparent',
                  border: `1px solid ${active ? `${currentTheme.accent}44` : 'transparent'}`,
                  borderRadius: 7,
                  padding: '9px 12px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 2, transition: 'all 0.15s'
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.background = active ? `${currentTheme.accent}18` : 'transparent' }}
              >
                <span style={{ fontSize: 14, color: active ? 'var(--red)' : 'var(--text-3)' }}>{item.icon}</span>
                <span style={{ fontFamily: 'var(--font-head)', fontSize: 11, letterSpacing: '0.08em', color: active ? 'var(--red)' : 'var(--text-2)' }}>
                  {item.label.toUpperCase()}
                </span>
              </button>
            )
          })}

          <div style={{ flex: 1 }} />

          {/* Theme picker */}
          <div style={{ marginBottom: 6, position: 'relative' }}>
            <button
              onClick={() => setShowThemes(!showThemes)}
              style={{
                width: '100%', background: 'transparent',
                border: '1px solid var(--border)', borderRadius: 7,
                padding: '8px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-red)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: currentTheme.accent, flexShrink: 0, boxShadow: `0 0 6px ${currentTheme.accent}88` }} />
              <span style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', flex: 1, textAlign: 'left' }}>THEME</span>
              <span style={{ color: 'var(--text-3)', fontSize: 10 }}>{showThemes ? '▲' : '▼'}</span>
            </button>

            <AnimatePresence>
              {showThemes && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0,
                    background: 'var(--bg-2)', border: '1px solid var(--border)',
                    borderRadius: 8, overflow: 'hidden', zIndex: 100,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
                  }}
                >
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleTheme(t.id)}
                      style={{
                        width: '100%', background: themeId === t.id ? `${t.accent}14` : 'transparent',
                        border: 'none', borderBottom: '1px solid var(--border)',
                        padding: '10px 12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.1s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = `${t.accent}18`)}
                      onMouseLeave={e => (e.currentTarget.style.background = themeId === t.id ? `${t.accent}14` : 'transparent')}
                    >
                      <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.swatch, flexShrink: 0, boxShadow: `0 0 8px ${t.swatch}88`, border: themeId === t.id ? `2px solid ${t.swatch}` : '2px solid transparent' }} />
                      <span style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: themeId === t.id ? t.accent : 'var(--text-2)', letterSpacing: '0.08em' }}>{t.name}</span>
                      {themeId === t.id && <span style={{ marginLeft: 'auto', color: t.accent, fontSize: 10 }}>✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Disconnect */}
          <button
            onClick={() => {
              useStore.getState().setToken('')
              useStore.getState().setRepoUrl('')
              useStore.getState().setDemoMode(false)
              window.location.reload()
            }}
            style={{
              background: 'transparent', border: '1px solid transparent', borderRadius: 7,
              padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
          >
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>⏻</span>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>DISCONNECT</span>
          </button>
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
