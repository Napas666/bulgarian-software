import type { GitHubIssue, GitHubPR, GitHubCommit, GitHubComment, GitHubLabel } from '../types'

const avatar = (seed: string) => `https://avatars.dicebear.com/api/identicon/${seed}.svg`

export const MOCK_LABELS: GitHubLabel[] = [
  { id: 1, name: 'bug', color: 'd73a4a' },
  { id: 2, name: 'security', color: 'e4e669' },
  { id: 3, name: 'enhancement', color: 'a2eeef' },
  { id: 4, name: 'critical', color: 'ff0000' },
  { id: 5, name: 'good first issue', color: '7057ff' },
]

export const MOCK_ISSUES: GitHubIssue[] = [
  {
    number: 42, title: 'Fix SQL injection in /api/login endpoint', body: 'The login endpoint is vulnerable to classic SQLi.\n\n**Steps to reproduce:**\n1. Send POST /api/login with username: `\' OR 1=1 --`\n2. Observe full DB dump returned\n\n**Impact:** Full database read access, authentication bypass.\n\n**Fix:** Use parameterized queries.',
    state: 'open', labels: [MOCK_LABELS[0], MOCK_LABELS[1]], comments: 3,
    user: { login: 'napas666', avatar_url: 'https://github.com/identicons/napas666.png' },
    assignees: [], created_at: new Date(Date.now() - 86400000 * 2).toISOString(), updated_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    number: 38, title: 'Implement rate limiting on auth endpoints', body: 'Currently /api/auth has no rate limiting — brute force is trivial.\n\nSuggested: 5 attempts per IP per minute, then 429 with backoff.',
    state: 'open', labels: [MOCK_LABELS[2]], comments: 1,
    user: { login: 'artur_dev', avatar_url: 'https://github.com/identicons/artur.png' },
    assignees: [{ login: 'napas666', avatar_url: 'https://github.com/identicons/napas666.png' }],
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    number: 35, title: 'Update lodash — CVE-2024-11111 prototype pollution', body: 'Lodash < 4.17.22 is affected by prototype pollution via `merge()`. Update immediately.',
    state: 'open', labels: [MOCK_LABELS[1], MOCK_LABELS[3]], comments: 0,
    user: { login: 'dependabot', avatar_url: 'https://github.com/identicons/dependabot.png' },
    assignees: [], created_at: new Date(Date.now() - 86400000 * 7).toISOString(), updated_at: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    number: 29, title: 'Add 2FA support for admin accounts', body: 'Admin panel has no 2FA. TOTP via Google Authenticator / Authy.',
    state: 'open', labels: [MOCK_LABELS[2], MOCK_LABELS[1]], comments: 5,
    user: { login: 'napas666', avatar_url: 'https://github.com/identicons/napas666.png' },
    assignees: [], created_at: new Date(Date.now() - 86400000 * 14).toISOString(), updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    number: 18, title: 'XSS in comment renderer — stored', body: 'Comments are rendered as raw HTML. `<script>` tags execute on load.',
    state: 'closed', labels: [MOCK_LABELS[0], MOCK_LABELS[1]], comments: 7,
    user: { login: 'artur_dev', avatar_url: 'https://github.com/identicons/artur.png' },
    assignees: [], created_at: new Date(Date.now() - 86400000 * 30).toISOString(), updated_at: new Date(Date.now() - 86400000 * 25).toISOString()
  },
]

export const MOCK_COMMENTS: GitHubComment[] = [
  { id: 1, body: 'Confirmed. Reproduced on staging. Priority: critical.', user: { login: 'artur_dev', avatar_url: 'https://github.com/identicons/artur.png' }, created_at: new Date(Date.now() - 3600000 * 5).toISOString(), updated_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 2, body: 'Working on a fix. ETA: tomorrow.', user: { login: 'napas666', avatar_url: 'https://github.com/identicons/napas666.png' }, created_at: new Date(Date.now() - 3600000 * 2).toISOString(), updated_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 3, body: 'Related to #35. Should be patched in the same PR.', user: { login: 'artur_dev', avatar_url: 'https://github.com/identicons/artur.png' }, created_at: new Date(Date.now() - 1800000).toISOString(), updated_at: new Date(Date.now() - 1800000).toISOString() },
]

export const MOCK_PRS: GitHubPR[] = [
  {
    number: 15, title: 'feat: JWT token rotation + refresh endpoint', body: 'Adds token rotation on each request and a `/auth/refresh` endpoint.\n\n- Access token TTL: 15min\n- Refresh token TTL: 7 days\n- Rotation on use (refresh token is single-use)',
    state: 'open', merged: false, merged_at: null, mergeable: true, mergeable_state: 'clean',
    head: { ref: 'feat/jwt-rotation', sha: 'a1b2c3d', label: 'napas666:feat/jwt-rotation' },
    base: { ref: 'main', label: 'napas666:main' },
    user: { login: 'napas666', avatar_url: 'https://github.com/identicons/napas666.png' },
    labels: [MOCK_LABELS[2]], comments: 2, commits: 4, additions: 287, deletions: 43, changed_files: 6,
    created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    number: 12, title: 'fix: patch XSS in comment renderer', body: 'Sanitizes HTML output using DOMPurify before rendering.',
    state: 'closed', merged: true, merged_at: new Date(Date.now() - 86400000 * 3).toISOString(), mergeable: null, mergeable_state: 'merged',
    head: { ref: 'fix/xss-comments', sha: 'dead1337', label: 'napas666:fix/xss-comments' },
    base: { ref: 'main', label: 'napas666:main' },
    user: { login: 'artur_dev', avatar_url: 'https://github.com/identicons/artur.png' },
    labels: [MOCK_LABELS[0], MOCK_LABELS[1]], comments: 3, commits: 2, additions: 54, deletions: 12, changed_files: 3,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(), updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
]

export const MOCK_COMMITS: GitHubCommit[] = [
  { sha: 'a1b2c3d4e5f6', commit: { message: 'feat: JWT token rotation + refresh endpoint', author: { name: 'napas666', date: new Date(Date.now() - 3600000 * 2).toISOString() } }, author: { login: 'napas666', avatar_url: 'https://github.com/identicons/napas666.png' }, html_url: '#' },
  { sha: 'b2c3d4e5f6a1', commit: { message: 'fix: rate limit bypass via X-Forwarded-For header\n\nAlways use rightmost IP from trusted proxy chain, not first.', author: { name: 'artur_dev', date: new Date(Date.now() - 3600000 * 8).toISOString() } }, author: { login: 'artur_dev', avatar_url: 'https://github.com/identicons/artur.png' }, html_url: '#' },
  { sha: 'c3d4e5f6a1b2', commit: { message: 'chore: update dependencies (security patches)', author: { name: 'napas666', date: new Date(Date.now() - 86400000).toISOString() } }, author: { login: 'napas666', avatar_url: 'https://github.com/identicons/napas666.png' }, html_url: '#' },
  { sha: 'd4e5f6a1b2c3', commit: { message: 'fix: patch XSS in comment renderer\n\nUse DOMPurify.sanitize() before innerHTML assignment.', author: { name: 'artur_dev', date: new Date(Date.now() - 86400000 * 3).toISOString() } }, author: { login: 'artur_dev', avatar_url: 'https://github.com/identicons/artur.png' }, html_url: '#' },
  { sha: 'e5f6a1b2c3d4', commit: { message: 'feat: add CSRF token middleware', author: { name: 'napas666', date: new Date(Date.now() - 86400000 * 5).toISOString() } }, author: { login: 'napas666', avatar_url: 'https://github.com/identicons/napas666.png' }, html_url: '#' },
  { sha: 'f6a1b2c3d4e5', commit: { message: 'init: project scaffold', author: { name: 'napas666', date: new Date(Date.now() - 86400000 * 14).toISOString() } }, author: { login: 'napas666', avatar_url: 'https://github.com/identicons/napas666.png' }, html_url: '#' },
]
