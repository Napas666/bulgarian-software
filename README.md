# Bulgarian Software

GitHub operations desktop app for macOS. Connect a GitHub token — all actions (merge, comment, close, label) are performed on behalf of that token's owner.

---

## Quick Start (macOS)

**Requirements:** [Node.js 18+](https://nodejs.org)

```bash
# 1. Clone
git clone https://github.com/Napas666/bulgarian-software.git
cd bulgarian-software

# 2. Install dependencies
npm install

# 3. Run
npm run dev
```

App window opens automatically.

---

## First Launch

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Generate new token, select scopes: `repo`, `read:user`
3. Copy the token (`ghp_...`)
4. Paste token + repo URL into the app → Connect

---

## What it does

| Section | Actions |
|---------|---------|
| Issues | List, search, create, open/close, edit, labels, comments |
| Pull Requests | List, search, merge (merge/squash/rebase), review, close, comments |
| Commits | Paginated log, click SHA → opens on GitHub |

All requests go directly to GitHub API using your token — no backend, no data stored anywhere except locally.

---

## Themes

Switch in the sidebar bottom: **Neon Red / Neon Yellow / Cold Blue / Neon White**
