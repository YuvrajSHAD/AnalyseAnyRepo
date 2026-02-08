export interface GitHubRepository {
  owner: string
  repo: string
  branch: string
}

export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
}

export interface GitHubError {
  message: string
  status: number
  documentation_url?: string
}

export interface RateLimit {
  remaining: number
  limit: number
  reset: Date
}
