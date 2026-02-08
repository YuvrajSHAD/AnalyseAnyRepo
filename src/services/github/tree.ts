import { octokit } from './client'

export interface GitTreeItem {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url: string
}

export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<GitTreeItem[]> {
  try {
    console.log(`📦 Fetching repo tree: ${owner}/${repo}@${branch}`)
    
    // Get the branch to find the tree SHA
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    })
    
    const treeSha = refData.object.sha
    
    // Fetch the entire tree recursively
    const { data } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: treeSha,
      recursive: 'true'
    })
    
    console.log(`✅ Fetched ${data.tree.length} items from ${owner}/${repo}`)
    
    return data.tree as GitTreeItem[]
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error(`Repository ${owner}/${repo} not found or branch ${branch} doesn't exist`)
    } else if (error.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please add VITE_GITHUB_TOKEN to .env')
    }
    console.error('Error fetching repo tree:', error)
    throw new Error(`Failed to fetch repository: ${error.message}`)
  }
}

export function isCodeFile(path: string): boolean {
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs', '.rb', '.php']
  return codeExtensions.some(ext => path.endsWith(ext))
}

export function filterCodeFiles(tree: GitTreeItem[]): GitTreeItem[] {
  return tree.filter(item => 
    item.type === 'blob' && 
    isCodeFile(item.path) &&
    !item.path.includes('node_modules') &&
    !item.path.includes('dist') &&
    !item.path.includes('build') &&
    !item.path.includes('.next')
  )
}
