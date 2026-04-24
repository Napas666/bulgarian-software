import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { setToken, setRepo, setDemo, validateToken } from '../api/github'
import NeonButton from '../components/ui/NeonButton'

export default function Setup() {
  const storeToken = useStore(s => s.token)
  const storeRepo = useStore(s => s.repoUrl)
  const setStoreToken = useStore(s => s.setToken)
  const setStoreRepo = useStore(s => s.setRepoUrl)
  const setStoreDemoMode = useStore(s => s.setDemoMode)

  const [tokenInput, setTokenInput] = useState(storeToken)
  const [repoInput, setRepoInput] = useState(storeRepo)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<{ login: string; name: string; avatar_url: string } | null>(null)

  const connect = async () => {
    setError('')
    setLoading(true)
    try {
      const repoPath = repoInput
        .replace('https://github.com/', '')
        .replace(/\/$/, '')
        .replace(/\.git$/, '')

      setToken(tokenInput)
      setRepo(repoPath)

      const u = await validateToken()
      setUser(u)
      setStoreToken(tokenInput)
      setStoreRepo(`https://github.com/${repoPath}`)
    } catch (e: any) {
      setError(e.message ?? 'Connection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(255,0,48,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,48,1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="panel"
        style={{ width: 480, padding: '36px 40px', position: 'relative' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #ff0030 0%, #880018 100%)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 900, color: '#fff',
            fontFamily: 'var(--font-head)',
            margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(255,0,48,0.3)'
          }}>B</div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, color: 'var(--red)', letterSpacing: '0.18em', marginBottom: 4 }}>
            BULGARIAN SOFTWARE
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-3)' }}>
            GitHub operations from your desk
          </div>
        </div>

        {user ? (
          // Connected state
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{
              background: 'rgba(0,255,136,0.06)',
              border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: 8,
              padding: '16px 20px',
              marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <img src={user.avatar_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(0,255,136,0.3)' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 12, color: 'var(--green)', marginBottom: 2 }}>CONNECTED</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)' }}>
                  {user.name || user.login} <span style={{ color: 'var(--text-3)' }}>(@{user.login})</span>
                </div>
              </div>
            </div>
            <NeonButton variant="success" fullWidth onClick={() => window.location.reload()} icon="→">
              Open Repository
            </NeonButton>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 6 }}>
                GITHUB TOKEN
              </div>
              <input
                type="password"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 13 }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--font-body)' }}>
                Settings → Developer settings → Personal access tokens
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 6 }}>
                REPOSITORY URL
              </div>
              <input
                value={repoInput}
                onChange={e => setRepoInput(e.target.value)}
                placeholder="https://github.com/owner/repo"
                style={{ width: '100%' }}
                onKeyDown={e => e.key === 'Enter' && connect()}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(255,0,48,0.08)', border: '1px solid rgba(255,0,48,0.3)', borderRadius: 6, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ff4455' }}>
                ✗ {error}
              </div>
            )}

            <NeonButton
              fullWidth
              onClick={connect}
              disabled={loading || !tokenInput || !repoInput}
              icon={loading ? undefined : '⚡'}
            >
              {loading ? <><span className="spin">◌</span>&nbsp;Connecting...</> : 'Connect'}
            </NeonButton>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <NeonButton
              fullWidth
              variant="ghost"
              icon="◈"
              onClick={() => {
                setDemo(true)
                setStoreDemoMode(true)
                setStoreToken('demo')
                setStoreRepo('demo/repo')
                window.location.reload()
              }}
            >
              Try Demo — no token needed
            </NeonButton>
          </div>
        )}
      </motion.div>
    </div>
  )
}
