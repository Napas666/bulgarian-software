import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  getIssue, updateIssue, listComments, addComment, editComment, deleteComment,
  listLabels, addLabels, removeLabel, DEMO
} from '../api/github'
import { MOCK_ISSUES, MOCK_COMMENTS, MOCK_LABELS } from '../api/mockData'
import { useStore } from '../store/useStore'
import type { GitHubIssue, GitHubComment, GitHubLabel } from '../types'
import NeonButton from '../components/ui/NeonButton'
import LabelBadge from '../components/ui/LabelBadge'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (d < 60) return `${d}s ago`
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}

export default function IssueDetail() {
  const number = useStore(s => s.selectedNumber)!
  const setView = useStore(s => s.setView)
  const addToast = useStore(s => s.addToast)
  const pushHistory = useStore(s => s.pushHistory)

  const [issue, setIssue] = useState<GitHubIssue | null>(null)
  const [comments, setComments] = useState<GitHubComment[]>([])
  const [allLabels, setAllLabels] = useState<GitHubLabel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingBody, setEditingBody] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editCommentBody, setEditCommentBody] = useState('')

  const [showLabels, setShowLabels] = useState(false)
  const [togglingState, setTogglingState] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      if (DEMO) {
        await new Promise(r => setTimeout(r, 200))
        const iss = MOCK_ISSUES.find(i => i.number === number) ?? MOCK_ISSUES[0]
        setIssue(iss)
        setComments(MOCK_COMMENTS)
        setAllLabels(MOCK_LABELS)
        setEditTitle(iss.title)
        setEditBody(iss.body ?? '')
      } else {
        const [iss, cmts, lbls] = await Promise.all([getIssue(number), listComments(number), listLabels()])
        setIssue(iss)
        setComments(cmts)
        setAllLabels(lbls)
        setEditTitle(iss.title)
        setEditBody(iss.body ?? '')
      }
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [number])

  useKeyboardShortcuts({ 'Escape': () => setView('issues') })

  // Push to history when issue loads
  useEffect(() => {
    if (issue) pushHistory({ type: 'issue', number: issue.number, title: issue.title })
  }, [issue?.number])

  const saveEdit = async () => {
    setSavingEdit(true)
    try {
      const updated = await updateIssue(number, { title: editTitle, body: editBody })
      setIssue(updated)
      setEditingBody(false)
    } catch (e: any) { setError(e.message); addToast(e.message, 'error') }
    finally { setSavingEdit(false) }
  }

  const toggleState = async () => {
    if (!issue) return
    setTogglingState(true)
    try {
      const updated = await updateIssue(number, { state: issue.state === 'open' ? 'closed' : 'open' })
      setIssue(updated)
      addToast(updated.state === 'closed' ? 'Задача закрыта' : 'Задача переоткрыта', 'success')
    } catch (e: any) { setError(e.message); addToast(e.message, 'error') }
    finally { setTogglingState(false) }
  }

  const submitComment = async () => {
    if (!newComment.trim()) return
    setSubmittingComment(true)
    try {
      const c = await addComment(number, newComment)
      setComments(prev => [...prev, c])
      setNewComment('')
      addToast('Комментарий добавлен', 'success')
    } catch (e: any) { setError(e.message); addToast(e.message, 'error') }
    finally { setSubmittingComment(false) }
  }

  const saveComment = async (id: number) => {
    try {
      const c = await editComment(id, editCommentBody)
      setComments(prev => prev.map(x => x.id === id ? c : x))
      setEditingCommentId(null)
    } catch (e: any) { setError(e.message) }
  }

  const removeCommentHandler = async (id: number) => {
    if (!confirm('Delete this comment?')) return
    try {
      await deleteComment(id)
      setComments(prev => prev.filter(x => x.id !== id))
    } catch (e: any) { setError(e.message) }
  }

  const toggleLabel = async (label: GitHubLabel) => {
    if (!issue) return
    const has = issue.labels.some(l => l.name === label.name)
    try {
      if (has) {
        await removeLabel(number, label.name)
        setIssue(prev => prev ? { ...prev, labels: prev.labels.filter(l => l.name !== label.name) } : prev)
      } else {
        await addLabels(number, [label.name])
        setIssue(prev => prev ? { ...prev, labels: [...prev.labels, label] } : prev)
      }
    } catch (e: any) { setError(e.message) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', gap: 8 }}>
      <span className="spin">◌</span> Loading issue #{number}...
    </div>
  )
  if (error) return <div style={{ padding: 20, color: '#ff4455', fontFamily: 'var(--font-mono)' }}>✗ {error}</div>
  if (!issue) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0, overflow: 'auto' }}>
      {/* Back + header */}
      <div style={{ flexShrink: 0, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={() => setView('issues')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer', padding: 0 }}>
            ← Назад к задачам
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(`https://github.com/${issue?.html_url ?? ''}`); addToast('Ссылка скопирована', 'success') }}
            title="Скопировать ссылку на задачу"
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 11, transition: 'all 0.1s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-red)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)' }}
          >⎘ Копировать ссылку</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
          {/* State badge */}
          <span style={{
            background: issue.state === 'open' ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${issue.state === 'open' ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: issue.state === 'open' ? 'var(--green)' : 'var(--text-3)',
            fontFamily: 'var(--font-head)', fontSize: 9, letterSpacing: '0.1em',
            padding: '3px 9px', borderRadius: 12, flexShrink: 0, marginTop: 2
          }}>
            {issue.state === 'open' ? '◉ OPEN' : '◎ CLOSED'}
          </span>

          {editingBody ? (
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ flex: 1, fontSize: 18, fontWeight: 600 }} />
          ) : (
            <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 20, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, flex: 1 }}>
              {issue.title}
              <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: 8 }}>#{issue.number}</span>
            </h1>
          )}
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', marginBottom: 12 }}>
          opened {timeAgo(issue.created_at)} by <strong style={{ color: 'var(--text-2)' }}>{issue.user.login}</strong>
          {' · '}{issue.comments} comment{issue.comments !== 1 ? 's' : ''}
        </div>

        {/* Labels row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 12 }}>
          {issue.labels.map(l => (
            <LabelBadge key={l.id} label={l} onRemove={() => toggleLabel(l)} />
          ))}
          <button
            onClick={() => setShowLabels(!showLabels)}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 12, padding: '2px 10px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer' }}
          >
            + Label
          </button>
        </div>

        {/* Label picker */}
        {showLabels && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="panel" style={{ padding: '10px 12px', marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {allLabels.map(l => (
              <div key={l.id} onClick={() => toggleLabel(l)} style={{ cursor: 'pointer', opacity: issue.labels.some(x => x.name === l.name) ? 1 : 0.5, transition: 'opacity 0.15s' }}>
                <LabelBadge label={l} />
              </div>
            ))}
          </motion.div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!editingBody ? (
            <NeonButton size="sm" variant="ghost" onClick={() => setEditingBody(true)} icon="✎" tooltip="Редактировать заголовок и описание задачи">Edit</NeonButton>
          ) : (
            <>
              <NeonButton size="sm" onClick={saveEdit} disabled={savingEdit} tooltip="Сохранить изменения на GitHub">{savingEdit ? 'Saving...' : 'Save'}</NeonButton>
              <NeonButton size="sm" variant="ghost" onClick={() => { setEditingBody(false); setEditTitle(issue.title); setEditBody(issue.body ?? '') }} tooltip="Отменить изменения">Cancel</NeonButton>
            </>
          )}

          {/* Separator + Close button pushed to far right */}
          <div style={{ flex: 1 }} />
          <div style={{ width: 1, height: 20, background: 'var(--border)', flexShrink: 0 }} />
          <NeonButton
            size="sm"
            variant={issue.state === 'open' ? 'danger' : 'success'}
            onClick={toggleState}
            disabled={togglingState}
            icon={issue.state === 'open' ? '✗' : '↺'}
            tooltip={issue.state === 'open' ? 'Закрыть задачу — пометить как решённую' : 'Переоткрыть задачу'}
          >
            {togglingState ? '...' : issue.state === 'open' ? 'Close Issue' : 'Reopen Issue'}
          </NeonButton>
        </div>
      </div>

      {/* Body */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: 16, flexShrink: 0 }}>
        {editingBody ? (
          <textarea value={editBody} onChange={e => setEditBody(e.target.value)} style={{ width: '100%', minHeight: 120 }} />
        ) : (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {issue.body || <span style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>No description.</span>}
          </div>
        )}
      </div>

      {/* Comments */}
      {comments.map(c => (
        <motion.div key={c.id} className="panel" style={{ padding: '14px 18px', marginBottom: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={c.user.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{c.user.login}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{timeAgo(c.created_at)}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <NeonButton size="sm" variant="ghost" onClick={() => { setEditingCommentId(c.id); setEditCommentBody(c.body) }} icon="✎" tooltip="Редактировать этот комментарий">Edit</NeonButton>
              <NeonButton size="sm" variant="danger" onClick={() => removeCommentHandler(c.id)} icon="✗" tooltip="Безвозвратно удалить этот комментарий">Delete</NeonButton>
            </div>
          </div>
          {editingCommentId === c.id ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea value={editCommentBody} onChange={e => setEditCommentBody(e.target.value)} style={{ width: '100%', minHeight: 80 }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <NeonButton size="sm" onClick={() => saveComment(c.id)} tooltip="Сохранить изменения комментария на GitHub">Save</NeonButton>
                <NeonButton size="sm" variant="ghost" onClick={() => setEditingCommentId(null)} tooltip="Отменить изменения комментария">Cancel</NeonButton>
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {c.body}
            </div>
          )}
        </motion.div>
      ))}

      {/* Add comment */}
      <div className="panel-red" style={{ padding: '14px 18px', marginTop: 4, flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 10, color: 'var(--red)', letterSpacing: '0.1em', marginBottom: 8 }}>ADD COMMENT</div>
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Leave a comment..."
          style={{ width: '100%', minHeight: 80, marginBottom: 8 }}
        />
        <NeonButton onClick={submitComment} disabled={submittingComment || !newComment.trim()} size="sm" icon="↵" tooltip="Опубликовать комментарий к задаче">
          {submittingComment ? 'Submitting...' : 'Comment'}
        </NeonButton>
      </div>
    </div>
  )
}
