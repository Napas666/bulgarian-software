export interface GitHubLabel {
  id: number
  name: string
  color: string
  description?: string
}

export interface GitHubUser {
  login: string
  avatar_url: string
}

export interface GitHubIssue {
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  labels: GitHubLabel[]
  comments: number
  user: GitHubUser
  assignees: GitHubUser[]
  created_at: string
  updated_at: string
  pull_request?: object
}

export interface GitHubComment {
  id: number
  body: string
  user: GitHubUser
  created_at: string
  updated_at: string
}

export interface GitHubPR {
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  merged: boolean
  merged_at: string | null
  mergeable: boolean | null
  mergeable_state: string
  head: { ref: string; sha: string; label: string }
  base: { ref: string; label: string }
  user: GitHubUser
  labels: GitHubLabel[]
  comments: number
  commits: number
  additions: number
  deletions: number
  changed_files: number
  created_at: string
  updated_at: string
}

export interface GitHubRepo {
  full_name: string
  name: string
  description: string | null
  private: boolean
  open_issues_count: number
  stargazers_count: number
  forks_count: number
  default_branch: string
  owner: GitHubUser
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: { name: string; date: string }
  }
  author: GitHubUser | null
  html_url: string
}

export type View = 'issues' | 'issue-detail' | 'prs' | 'pr-detail' | 'commits'
