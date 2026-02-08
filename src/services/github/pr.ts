import { octokit } from './client'
import { PRData } from '@/types/contracts'

export async function fetchPullRequest(
  owner: string,
  repo: string,
  prNumber: number
): Promise<PRData> {
  try {
    console.log(`🔍 Fetching PR #${prNumber} from ${owner}/${repo}`)
    
    // Fetch PR details
    const { data: pr } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber
    })
    
    // Fetch PR files
    const { data: files } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber
    })
    
    const prData: PRData = {
      number: pr.number,
      title: pr.title,
      author: pr.user?.login || 'unknown',
      state: pr.merged_at ? 'merged' : pr.state as 'open' | 'closed',
      filesChanged: pr.changed_files,
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: files.map(file => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions
      }))
    }
    
    console.log(`✅ Fetched PR #${prNumber}: ${pr.title}`)
    return prData
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error(`PR #${prNumber} not found in ${owner}/${repo}`)
    }
    console.error('Error fetching PR:', error)
    throw new Error(`Failed to fetch PR: ${error.message}`)
  }
}

export async function analyzePRImpact(
  prData: PRData,
  repoIndex: any
): Promise<Record<string, string[]>> {
  const impact: Record<string, string[]> = {
    authentication: [],
    payments: [],
    api: [],
    database: [],
    testing: [],
    config: [],
    other: []
  }
  
  prData.changedFiles.forEach(file => {
    const path = file.filename.toLowerCase()
    
    // Categorize changed files
    if (path.includes('auth') || path.includes('login') || path.includes('session')) {
      impact.authentication.push(file.filename)
    } else if (path.includes('payment') || path.includes('stripe') || path.includes('checkout')) {
      impact.payments.push(file.filename)
    } else if (path.includes('api') || path.includes('route') || path.includes('endpoint')) {
      impact.api.push(file.filename)
    } else if (path.includes('schema') || path.includes('migration') || path.includes('model')) {
      impact.database.push(file.filename)
    } else if (path.includes('test') || path.includes('spec')) {
      impact.testing.push(file.filename)
    } else if (path.includes('config') || path.includes('.env')) {
      impact.config.push(file.filename)
    } else {
      impact.other.push(file.filename)
    }
  })
  
  return impact
}
