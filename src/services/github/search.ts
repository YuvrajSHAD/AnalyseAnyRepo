import { octokit } from './client'

export async function searchCode(
  owner: string,
  repo: string,
  query: string
): Promise<Array<{ path: string; score: number }>> {
  try {
    const { data } = await octokit.search.code({
      q: `${query} repo:${owner}/${repo}`,
      per_page: 20
    })
    
    return data.items.map(item => ({
      path: item.path,
      score: item.score
    }))
  } catch (error) {
    console.error('GitHub code search failed:', error)
    return []
  }
}
