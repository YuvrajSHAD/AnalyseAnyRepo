import { FileMetadata, RepoIndex } from '@/types/contracts'

export function resolveQuery(
  query: string,
  repoIndex: RepoIndex
): FileMetadata[] {
  console.log(`🔍 Resolving query: "${query}"`)
  
  const intent = extractIntent(query)
  const domain = extractDomain(query)
  
  console.log(`Intent: ${intent}, Domain: ${domain}`)
  
  // Get files from relevant category
  const candidates = domain === 'all' 
    ? Object.values(repoIndex).flat()
    : repoIndex[domain] || []
  
  if (candidates.length === 0) {
    console.warn(`No files found for domain: ${domain}`)
    return []
  }
  
  // Score each candidate
  const scored = candidates.map(file => ({
    ...file,
    score: calculateRelevance(file, query, intent)
  }))
  
  // Sort by score and return top results
  const results = scored
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 10)
  
  console.log(`✅ Found ${results.length} relevant files`)
  
  return results
}

function extractIntent(query: string): 'find' | 'modify' | 'understand' | 'add' {
  const lower = query.toLowerCase()
  
  if (lower.includes('where') || lower.includes('find') || lower.includes('locate')) {
    return 'find'
  }
  if (lower.includes('modify') || lower.includes('change') || lower.includes('update') || lower.includes('edit')) {
    return 'modify'
  }
  if (lower.includes('add') || lower.includes('create') || lower.includes('implement') || lower.includes('new')) {
    return 'add'
  }
  
  return 'understand'
}

function extractDomain(query: string): keyof RepoIndex | 'all' {
  const lower = query.toLowerCase()
  
  if (lower.includes('auth') || lower.includes('login') || lower.includes('session') || lower.includes('jwt')) {
    return 'authentication'
  }
  if (lower.includes('payment') || lower.includes('stripe') || lower.includes('checkout') || lower.includes('billing')) {
    return 'payments'
  }
  if (lower.includes('api') || lower.includes('endpoint') || lower.includes('route')) {
    return 'api'
  }
  if (lower.includes('database') || lower.includes('schema') || lower.includes('migration') || lower.includes('model')) {
    return 'database'
  }
  if (lower.includes('test') || lower.includes('spec')) {
    return 'testing'
  }
  if (lower.includes('config') || lower.includes('env') || lower.includes('setting')) {
    return 'config'
  }
  
  return 'all'
}

function calculateRelevance(
  file: FileMetadata,
  query: string,
  intent: string
): number {
  let score = 0
  const queryWords = query.toLowerCase().split(' ')
  const filePath = file.path.toLowerCase()
  
  // Keyword matching (30%)
  queryWords.forEach(word => {
    if (word.length < 3) return // Skip short words
    
    if (filePath.includes(word)) score += 15
    if (file.keywords.some(k => k.includes(word))) score += 10
    if (file.functions.some(f => f.toLowerCase().includes(word))) score += 5
  })
  
  // Pattern matching based on intent (40%)
  if (intent === 'find') {
    if (file.exports.length > 0) score += 20 // Files that export things
    if (file.functions.length > 3) score += 10 // Files with multiple functions
  }
  
  if (intent === 'modify' || intent === 'add') {
    if (!filePath.includes('node_modules')) score += 20
    if (filePath.includes('src/')) score += 10
  }
  
  // File importance (30%)
  if (filePath.includes('src/')) score += 10
  if (file.imports.length > 3) score += 10 // Central files with many dependencies
  if (filePath.split('/').length < 4) score += 5 // Not too nested
  if (filePath.includes('index') || filePath.includes('main')) score += 5
  
  return score
}
