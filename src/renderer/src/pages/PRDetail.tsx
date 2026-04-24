import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getPR, updatePR, mergePR, listPRComments, addPRComment, editComment, deleteComment, submitPRReview } from '../api/github'
import { useStore } from '../store/useStore'
import type { GitHubPR, GitHubComment } from '../types'
import NeonButton from '../components/ui/NeonButton'
import LabelBadge from '../components/ui/LabelBadge'

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (d < 60) return `${d}s ago`
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}

export default function PRDetail() {
  const number = useStore(s => s.selectedNumber)!
  const setView = useStore(s => s.setView)

  const [pr, setPR] = useState<GitHubPR | null>(null)
  const [comments, setComments] = useState<GitHubComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [merging, setMerging] = useState(false)
  const [mergeMethod, setMergeMethod] = useState<'merge' | 'squash' | 'rebase'>('merge')
  const [mergeMsg, setMergeMsg] = useState('')
  const [mergeSuccess, setMergeSuccess] = useState(false)

  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editCommentBody, setEditCommentBody] = useState('')

  const [reviewBody, setReviewBody] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showReview, setShowReview] = useState(false)

  const [editingPR, setEditingPR] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [p, cmts] = await Promise.all([getPR(number), listPRComments(number)])
      setPR(p)
      setComments(cmts)
      setEditTitle(p.title)
      setEditBody(p.body ?? '')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [number])

  const handleMerge = async () => {
    if (!confirm(`Merge this PR via ${mergeMethod}?`)) return
    setMerging(true)
    setError('')
    try {
      await mergePR(number, mergeMethod, mergeMsg || undefined)
      setMergeSuccess(true)
      await load()
    } catch (e: any) { setError(e.message) }
    finally { setMerging(false) }
  }

  const handleClose = async () => {
    if (!pr) return
    try {
      const updated = await updatePR(number, { state: pr.state === 'open' ? 'closed' : 'open' })
      setPR(updated)
    } catch (e: any) { setError(e.message) }
  }

  const submitComment = async () => {
    if (!newComment.trim()) return
    setSubmittingComment(true)
    try {
      const c = await addPRComment(number, newComment)
      setComments(prev => [...prev, c])
      setNewComment('')
    } catch (e: any) { setError(e.message) }
    finally { setSubmittingComment(false) }
  }

  const saveComment = async (id: number) => {
    try {
      const c = await editComment(id, editCommentBody)
      setComments(prev => prev.map(x => x.id === id ? c : x))
      setEditingCommentId(null)
    } catch (e: any) { setError(e.message) }
  }

  const handleReview = async (event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT') => {
    setSubmittingReview(true)
    try {
      await submitPRReview(number, event, reviewBody || undefined)
      setReviewBody('')
      setShowReview(false)
      await load()
    } catch (e: any) { setError(e.message) }
    finally { setSubmittingReview(false) }
  }

  const saveEditPR = async () => {
    try {
      const updated = await updatePR(number, { title: editTitle, body: editBody })
      setPR(updated)
      setEditingPR(false)
    } catch (e: any) { setError(e.message) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', gap: 8 }}>
      <span className="spin">◌</span> Loading PR #{number}...
    </div>
  )
  if (!pr) return null

  const canMerge = pr.state === 'open' && !pr.merged

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', gap: 0 }}>
      {/* Back */}
      <button onClick={() => setView('prs')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer', marginBottom: 12, padding: 0, flexShrink: 0, textAlign: 'left' }}>
        ← Back to pull requests
      </button>

      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
          <span style={{
            background: pr.merged ? 'rgba(204,136,255,0.12)' : pr.state === 'open' ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${pr.merged ? 'rgba(204,136,255,0.3)' : pr.state === 'open' ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: pr.merged ? 'var(--purple)' : pr.state === 'open' ? 'var(--green)' : 'var(--text-3)',
            fontFamily: 'var(--font-head)', fontSize: 9, padding: '3px 9px', borderRadius: 12, flexShrink: 0, marginTop: 4
          }}>
            {pr.merged ? '⊕ MERGED' : pr.state === 'open' ? '◉ OPEN' : '◎ CLOSED'}
          </span>
          {editingPR ? (
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ flex: 1, fontSize: 18, fontWeight: 600 }} />
          ) : (
            <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 20, fontWeight: 700, lineHeight: 1.3, flex: 1 }}>
              {pr.title} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>#{pr.number}</span>
            </h1>
          )}
        </div>

        {/* Labels */}
        {pr.labels.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {pr.labels.map(l => <LabelBadge key={l.id} label={l} />)}
          </div>
        )}

        {/* Branch info */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', marginBottom: 10, display: 'flex', gap: 16 }}>
          <span>
            <span style={{ color: 'var(--text-2)' }}>{pr.head.ref}</span>
            <span> → </span>
            <span style={{ color: 'var(--text-2)' }}>{pr.base.ref}</span>
          </span>
          <span>opened {timeAgo(pr.created_at)} by <strong style={{ color: 'var(--text-2)' }}>{pr.user.login}</strong></span>
          <span style={{ color: 'var(--green)' }}>+{pr.additions}</span>
          <span style={{ color: '#ff4455' }}>-{pr.deletions}</span>
          <span>{pr.changed_files} file{pr.changed_files !== 1 ? 's' : ''}</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!editingPR ? (
            <NeonButton size="sm" variant="ghost" onClick={() => setEditingPR(true)} icon="✎">Edit</NeonButton>
          ) : (
            <>
              <NeonButton size="sm" onClick={saveEditPR}>Save</NeonButton>
              <NeonButton size="sm" variant="ghost" onClick={() => setEditingPR(false)}>Cancel</NeonButton>
            </>
          )}
          {!pr.merged && pr.state === 'open' && (
            <NeonButton size="sm" variant="danger" onClick={handleClose} icon="✗">Close PR</NeonButton>
          )}
          {pr.state === 'closed' && !pr.merged && (
            <NeonButton size="sm" variant="success" onClick={handleClose} icon="↺">Reopen PR</NeonButton>
          )}
          {!pr.merged && pr.state === 'open' && (
            <NeonButton size="sm" variant="ghost" onClick={() => setShowReview(!showReview)} icon="◈">Review</NeonButton>
          )}
        </div>
      </div>

      {/* Merge box */}
      {canMerge && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="panel-red" style={{ padding: '16px 20px', marginBottom: 16, flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 11, color: 'var(--red)', marginBottom: 12 }}>⊕ MERGE PULL REQUEST</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-3)' }}>Method:</div>
            {(['merge', 'squash', 'rebase'] as const).map(m => (
              <button key={m} onClick={() => setMergeMethod(m)} style={{
                background: mergeMethod === m ? 'rgba(255,0,48,0.15)' : 'transparent',
                border: `1px solid ${mergeMethod === m ? 'rgba(255,0,48,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: mergeMethod === m ? 'var(--red)' : 'var(--text-3)',
                borderRadius: 5, padding: '4px 12px',
                fontFamily: 'var(--font-head)', fontSize: 10, cursor: 'pointer', letterSpacing: '0.06em'
              }}>
                {m.toUpperCase()}
              </button>
            ))}
          </div>
          <input
            value={mergeMsg}
            onChange={e => setMergeMsg(e.target.value)}
            placeholder="Commit message (optional)"
            style={{ width: '100%', marginBottom: 10 }}
          />
          {mergeSuccess && (
            <div style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 8 }}>✓ Merged successfully</div>
          )}
          {error && <div style={{ color: '#ff4455', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 8 }}>✗ {error}</div>}
          <NeonButton variant="success" onClick={handleMerge} disabled={merging} icon="⊕">
            {merging ? 'Merging...' : `Merge via ${mergeMethod}`}
          </NeonButton>
        </motion.div>
      )}

      {pr.merged && (
        <div style={{ background: 'rgba(204,136,255,0.08)', border: '1px solid rgba(204,136,255,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: 11, color: 'var(--purple)' }}>⊕ MERGED</span>
          {pr.merged_at && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', marginLeft: 10 }}>{timeAgo(pr.merged_at)}</span>}
        </div>
      )}

      {/* Review box */}
      {showReview && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="panel" style={{ padding: '16px 20px', marginBottom: 16, flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>SUBMIT REVIEW</div>
          <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)} placeholder="Review comment (optional)" style={{ width: '100%', minHeight: 80, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <NeonButton size="sm" variant="success" onClick={() => handleReview('APPROVE')} disabled={submittingReview} icon="✓">Approve</NeonButton>
            <NeonButton size="sm" variant="danger" onClick={() => handleReview('REQUEST_CHANGES')} disabled={submittingReview} icon="✗">Request Changes</NeonButton>
            <NeonButton size="sm" variant="ghost" onClick={() => handleReview('COMMENT')} disabled={submittingReview} icon="💬">Comment</NeonButton>
          </div>
        </motion.div>
      )}

      {/* Body */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: 16, flexShrink: 0 }}>
        {editingPR ? (
          <textarea value={editBody} onChange={e => setEditBody(e.target.value)} style={{ width: '100%', minHeight: 100 }} />
        ) : (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {pr.body || <span style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>No description.</span>}
          </div>
        )}
      </div>

      {/* Comments */}
      {comments.map(c => (
        <motion.div key={c.id} className="panel" style={{ padding: '14px 18px', marginBottom: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={c.user.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{c.user.login}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{timeAgo(c.created_at)}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <NeonButton size="sm" variant="ghost" onClick={() => { setEditingCommentId(c.id); setEditCommentBody(c.body) }} icon="✎">Edit</NeonButton>
              <NeonButton size="sm" variant="danger" onClick={async () => {
                if (!confirm('Delete?')) return
                await deleteComment(c.id)
                setComments(prev => prev.filter(x => x.id !== c.id))
              }} icon="✗">Delete</NeonButton>
            </div>
          </div>
          {editingCommentId === c.id ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea value={editCommentBody} onChange={e => setEditCommentBody(e.target.value)} style={{ width: '100%', minHeight: 80 }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <NeonButton size="sm" onClick={() => saveComment(c.id)}>Save</NeonButton>
                <NeonButton size="sm" variant="ghost" onClick={() => setEditingCommentId(null)}>Cancel</NeonButton>
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{c.body}</div>
          )}
        </motion.div>
      ))}

      {/* New comment */}
      <div className="panel-red" style={{ padding: '14px 18px', marginTop: 4, flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: 'var(--red)', letterSpacing: '0.1em', marginBottom: 8 }}>ADD COMMENT</div>
        <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Leave a comment..." style={{ width: '100%', minHeight: 80, marginBottom: 8 }} />
        <NeonButton size="sm" onClick={submitComment} disabled={submittingComment || !newComment.trim()} icon="↵">
          {submittingComment ? 'Submitting...' : 'Comment'}
        </NeonButton>
      </div>
    </div>
  )
}
