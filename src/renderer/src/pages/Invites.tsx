import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { listInvitations, inviteCollaborator, cancelInvitation, DEMO } from '../api/github'
import type { GitHubInvitation } from '../types'
import NeonButton from '../components/ui/NeonButton'

type Permission = 'pull' | 'triage' | 'push' | 'maintain' | 'admin'

const PERMISSIONS: { value: Permission; label: string; desc: string }[] = [
  { value: 'pull',     label: 'Read',     desc: 'Can read and clone' },
  { value: 'triage',  label: 'Triage',   desc: 'Can manage issues/PRs' },
  { value: 'push',    label: 'Write',    desc: 'Can push to branches' },
  { value: 'maintain',label: 'Maintain', desc: 'Can manage repo settings' },
  { value: 'admin',   label: 'Admin',    desc: 'Full access' },
]

const PERM_COLORS: Record<Permission, string> = {
  pull:     '#00aaff',
  triage:   '#00ff88',
  push:     '#ffb800',
  maintain: '#cc88ff',
  admin:    '#ff4455'
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}

const MOCK_INVITATIONS: GitHubInvitation[] = [
  {
    id: 1,
    login: 'artur_dev',
    permissions: 'write',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    invitee: { login: 'artur_dev', avatar_url: 'https://github.com/identicons/artur.png' },
    inviter: { login: 'napas666', avatar_url: 'https://github.com/identicons/napas666.png' }
  }
]

export default function Invites() {
  const [invitations, setInvitations] = useState<GitHubInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [username, setUsername] = useState('')
  const [permission, setPermission] = useState<Permission>('push')
  const [sending, setSending] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      if (DEMO) {
        await new Promise(r => setTimeout(r, 200))
        setInvitations(MOCK_INVITATIONS)
      } else {
        const data = await listInvitations()
        setInvitations(data)
      }
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleInvite = async () => {
    if (!username.trim()) return
    setSending(true)
    setError('')
    setSuccess('')
    try {
      if (DEMO) {
        await new Promise(r => setTimeout(r, 400))
        const fake: GitHubInvitation = {
          id: Date.now(),
          login: username,
          permissions: permission,
          created_at: new Date().toISOString(),
          invitee: { login: username, avatar_url: `https://github.com/identicons/${username}.png` },
          inviter: { login: 'napas666', avatar_url: 'https://github.com/identicons/napas666.png' }
        }
        setInvitations(prev => [fake, ...prev])
        setSuccess(`Invitation sent to @${username}`)
        setUsername('')
      } else {
        await inviteCollaborator(username.trim(), permission)
        setSuccess(`Invitation sent to @${username}`)
        setUsername('')
        await load()
      }
    } catch (e: any) { setError(e.message) }
    finally { setSending(false) }
  }

  const handleCancel = async (id: number, login: string) => {
    if (!confirm(`Cancel invitation for @${login}?`)) return
    try {
      if (DEMO) {
        setInvitations(prev => prev.filter(i => i.id !== id))
      } else {
        await cancelInvitation(id)
        setInvitations(prev => prev.filter(i => i.id !== id))
      }
    } catch (e: any) { setError(e.message) }
  }

  const selectedPerm = PERMISSIONS.find(p => p.value === permission)!

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>

      {/* Invite form */}
      <div className="panel-red" style={{ padding: '18px 20px', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 11, color: 'var(--red)', letterSpacing: '0.1em', marginBottom: 14 }}>
          ＋ INVITE COLLABORATOR
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 5 }}>GITHUB USERNAME</div>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="username"
              style={{ width: '100%' }}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
            />
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 5 }}>PERMISSION</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PERMISSIONS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPermission(p.value)}
                  title={p.desc}
                  style={{
                    padding: '5px 12px',
                    background: permission === p.value ? `${PERM_COLORS[p.value]}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${permission === p.value ? PERM_COLORS[p.value] : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 5,
                    color: permission === p.value ? PERM_COLORS[p.value] : 'var(--text-3)',
                    fontFamily: 'var(--font-head)',
                    fontSize: 10,
                    cursor: 'pointer',
                    letterSpacing: '0.06em',
                    transition: 'all 0.15s'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
              {selectedPerm.desc}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
          <NeonButton onClick={handleInvite} disabled={sending || !username.trim()} size="sm" icon="→" tooltip="Send a GitHub collaboration invitation to this user">
            {sending ? 'Sending...' : 'Send Invite'}
          </NeonButton>
          {success && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}
            >
              ✓ {success}
            </motion.span>
          )}
          {error && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ff4455' }}>✗ {error}</span>
          )}
        </div>
      </div>

      {/* Pending invitations */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0, overflow: 'auto' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 10, flexShrink: 0 }}>
          PENDING INVITATIONS {!loading && `(${invitations.length})`}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            <span className="spin" style={{ marginRight: 8 }}>◌</span>Loading...
          </div>
        ) : invitations.length === 0 ? (
          <div className="panel" style={{ padding: 30, textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
            No pending invitations
          </div>
        ) : (
          <div className="panel" style={{ overflow: 'hidden' }}>
            <AnimatePresence>
              {invitations.map((inv, i) => {
                const permColor = PERM_COLORS[inv.permissions as Permission] ?? 'var(--text-3)'
                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <img
                      src={inv.invitee.avatar_url}
                      alt=""
                      style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)', fontWeight: 600, marginBottom: 2 }}>
                        @{inv.invitee.login}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', display: 'flex', gap: 10 }}>
                        <span>invited by @{inv.inviter.login}</span>
                        <span>{timeAgo(inv.created_at)}</span>
                      </div>
                    </div>

                    {/* Permission badge */}
                    <span style={{
                      background: `${permColor}18`,
                      border: `1px solid ${permColor}44`,
                      color: permColor,
                      fontFamily: 'var(--font-head)',
                      fontSize: 9,
                      padding: '3px 9px',
                      borderRadius: 10,
                      letterSpacing: '0.08em',
                      flexShrink: 0
                    }}>
                      {PERMISSIONS.find(p => p.value === inv.permissions)?.label ?? inv.permissions}
                    </span>

                    {/* Pending badge */}
                    <span style={{
                      background: 'rgba(255,184,0,0.1)',
                      border: '1px solid rgba(255,184,0,0.25)',
                      color: 'var(--yellow)',
                      fontFamily: 'var(--font-head)',
                      fontSize: 9,
                      padding: '3px 9px',
                      borderRadius: 10,
                      letterSpacing: '0.08em',
                      flexShrink: 0
                    }}>
                      PENDING
                    </span>

                    <NeonButton size="sm" variant="danger" onClick={() => handleCancel(inv.id, inv.invitee.login)} icon="✗" tooltip="Revoke this pending invitation">
                      Cancel
                    </NeonButton>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
