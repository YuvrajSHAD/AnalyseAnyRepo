import { RepoIndex, FileMetadata } from '@/types/contracts'
import { fetchFileContent } from '../github/content'
import { GitTreeItem, filterCodeFiles } from '../github/tree'
import { analyzeFile } from './analyzer'

export async function buildRepoIndex(
  tree: GitTreeItem[],
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<RepoIndex> {
  console.log('🔍 Building smart index...')
  
  const index: RepoIndex = {
    authentication: [],
    payments: [],
    api: [],
    database: [],
    testing: [],
    config: [],
    other: []
  }
  
  // Filter to only code files
  const codeFiles = filterCodeFiles(tree)
  
  // Limit to first 150 files to avoid rate limits (prioritize important ones)
  const prioritizedFiles = prioritizeFiles(codeFiles).slice(0, 150)
  
  console.log(`📊 Analyzing ${prioritizedFiles.length} files...`)
  
  // Analyze files in batches
  const batchSize = 10
  let analyzed = 0
  
  for (let i = 0; i < prioritizedFiles.length; i += batchSize) {
    const batch = prioritizedFiles.slice(i, i + batchSize)
    
    const promises = batch.map(async (file) => {
      try {
        const content = await fetchFileContent(owner, repo, file.path, branch)
        const metadata = analyzeFile(file.path, content)
        return metadata
      } catch (error) {
        console.warn(`Failed to analyze ${file.path}`)
        return null
      }
    })
    
    const results = await Promise.all(promises)
    
    results.forEach(metadata => {
      if (metadata) {
        const category = metadata.category === 'auth' ? 'authentication' : metadata.category + 's' as keyof RepoIndex
        if (index[category]) {
          index[category].push(metadata)
        } else {
          index.other.push(metadata)
        }
        analyzed++
      }
    })
    
    console.log(`✅ Analyzed ${analyzed}/${prioritizedFiles.length} files`)
  }
  
  console.log('🎉 Index complete:', {
    authentication: index.authentication.length,
    payments: index.payments.length,
    api: index.api.length,
    database: index.database.length,
    testing: index.testing.length,
    config: index.config.length,
    other: index.other.length
  })
  
  return index
}

function prioritizeFiles(files: GitTreeItem[]): GitTreeItem[] {
  // Score files by importance
  const scored = files.map(file => {
    let score = 0
    const path = file.path.toLowerCase()
    
    // Prioritize src/ files
    if (path.includes('src/')) score += 10
    
    // Prioritize short paths (closer to root)
    const depth = path.split('/').length
    score += Math.max(0, 10 - depth)
    
    // Prioritize important keywords
    if (path.includes('auth') || path.includes('api') || path.includes('payment')) score += 5
    if (path.includes('util') || path.includes('helper') || path.includes('lib')) score += 3
    
    // Deprioritize test files slightly
    if (path.includes('test') || path.includes('spec')) score -= 2
    
    return { file, score }
  })
  
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)
  
  return scored.map(s => s.file)
}
