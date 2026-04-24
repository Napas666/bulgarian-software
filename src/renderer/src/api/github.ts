import type { GitHubIssue, GitHubComment, GitHubLabel, GitHubPR, GitHubRepo, GitHubCommit, GitHubInvitation } from '../types'

let TOKEN = ''
let REPO = ''  // owner/repo
export let DEMO = false

export function setToken(t: string) { TOKEN = t }
export function setRepo(r: string) { REPO = r }
export function getRepo() { return REPO }
export function setDemo(v: boolean) { DEMO = v }

async function gh(path: string, opts: RequestInit = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(opts.headers ?? {})
    }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).message ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// ── Repo ─────────────────────────────────────────────────────────────────
export const getRepo_ = (): Promise<GitHubRepo> => gh(`/repos/${REPO}`)

// ── Issues ────────────────────────────────────────────────────────────────
export const listIssues = (state: 'open' | 'closed' | 'all' = 'open', page = 1): Promise<GitHubIssue[]> =>
  gh(`/repos/${REPO}/issues?state=${state}&per_page=30&page=${page}&filter=all`)

export const getIssue = (n: number): Promise<GitHubIssue> =>
  gh(`/repos/${REPO}/issues/${n}`)

export const updateIssue = (n: number, data: Partial<{ title: string; body: string; state: 'open' | 'closed'; labels: string[]; assignees: string[] }>): Promise<GitHubIssue> =>
  gh(`/repos/${REPO}/issues/${n}`, { method: 'PATCH', body: JSON.stringify(data) })

export const createIssue = (data: { title: string; body?: string; labels?: string[] }): Promise<GitHubIssue> =>
  gh(`/repos/${REPO}/issues`, { method: 'POST', body: JSON.stringify(data) })

export const lockIssue = (n: number): Promise<null> =>
  gh(`/repos/${REPO}/issues/${n}/lock`, { method: 'PUT', body: JSON.stringify({ lock_reason: 'resolved' }) })

export const unlockIssue = (n: number): Promise<null> =>
  gh(`/repos/${REPO}/issues/${n}/lock`, { method: 'DELETE' })

// ── Comments ──────────────────────────────────────────────────────────────
export const listComments = (n: number): Promise<GitHubComment[]> =>
  gh(`/repos/${REPO}/issues/${n}/comments?per_page=100`)

export const addComment = (n: number, body: string): Promise<GitHubComment> =>
  gh(`/repos/${REPO}/issues/${n}/comments`, { method: 'POST', body: JSON.stringify({ body }) })

export const editComment = (id: number, body: string): Promise<GitHubComment> =>
  gh(`/repos/${REPO}/issues/comments/${id}`, { method: 'PATCH', body: JSON.stringify({ body }) })

export const deleteComment = (id: number): Promise<null> =>
  gh(`/repos/${REPO}/issues/comments/${id}`, { method: 'DELETE' })

// ── Labels ────────────────────────────────────────────────────────────────
export const listLabels = (): Promise<GitHubLabel[]> =>
  gh(`/repos/${REPO}/labels?per_page=100`)

export const addLabels = (n: number, labels: string[]): Promise<GitHubLabel[]> =>
  gh(`/repos/${REPO}/issues/${n}/labels`, { method: 'POST', body: JSON.stringify({ labels }) })

export const removeLabel = (n: number, label: string): Promise<GitHubLabel[]> =>
  gh(`/repos/${REPO}/issues/${n}/labels/${encodeURIComponent(label)}`, { method: 'DELETE' })

export const createLabel = (name: string, color: string, description?: string): Promise<GitHubLabel> =>
  gh(`/repos/${REPO}/labels`, { method: 'POST', body: JSON.stringify({ name, color: color.replace('#', ''), description }) })

// ── Pull Requests ─────────────────────────────────────────────────────────
export const listPRs = (state: 'open' | 'closed' | 'all' = 'open', page = 1): Promise<GitHubPR[]> =>
  gh(`/repos/${REPO}/pulls?state=${state}&per_page=30&page=${page}`)

export const getPR = (n: number): Promise<GitHubPR> =>
  gh(`/repos/${REPO}/pulls/${n}`)

export const mergePR = (n: number, method: 'merge' | 'squash' | 'rebase' = 'merge', msg?: string): Promise<{ sha: string; merged: boolean; message: string }> =>
  gh(`/repos/${REPO}/pulls/${n}/merge`, { method: 'PUT', body: JSON.stringify({ merge_method: method, commit_message: msg }) })

export const updatePR = (n: number, data: Partial<{ title: string; body: string; state: 'open' | 'closed' }>): Promise<GitHubPR> =>
  gh(`/repos/${REPO}/pulls/${n}`, { method: 'PATCH', body: JSON.stringify(data) })

export const listPRComments = (n: number): Promise<GitHubComment[]> =>
  gh(`/repos/${REPO}/issues/${n}/comments?per_page=100`)

export const addPRComment = (n: number, body: string): Promise<GitHubComment> =>
  gh(`/repos/${REPO}/issues/${n}/comments`, { method: 'POST', body: JSON.stringify({ body }) })

export const submitPRReview = (n: number, event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT', body?: string): Promise<object> =>
  gh(`/repos/${REPO}/pulls/${n}/reviews`, { method: 'POST', body: JSON.stringify({ event, body }) })

// ── Commits ───────────────────────────────────────────────────────────────
export const listCommits = (page = 1): Promise<GitHubCommit[]> =>
  gh(`/repos/${REPO}/commits?per_page=30&page=${page}`)

// ── Collaborator Invitations ──────────────────────────────────────────────
export const listInvitations = (): Promise<GitHubInvitation[]> =>
  gh(`/repos/${REPO}/invitations`)

export const inviteCollaborator = (username: string, permission: 'pull' | 'triage' | 'push' | 'maintain' | 'admin'): Promise<GitHubInvitation | null> =>
  gh(`/repos/${REPO}/collaborators/${username}`, { method: 'PUT', body: JSON.stringify({ permission }) })

export const cancelInvitation = (invitationId: number): Promise<null> =>
  gh(`/repos/${REPO}/invitations/${invitationId}`, { method: 'DELETE' })

// ── Token validation ──────────────────────────────────────────────────────
export const validateToken = (): Promise<{ login: string; name: string; avatar_url: string }> =>
  gh('/user')
