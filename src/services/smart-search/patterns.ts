import { FILE_PATTERNS, CATEGORY_KEYWORDS } from '@/lib/constants'

export function matchesPattern(text: string, patterns: string[]): boolean {
  const lowerText = text.toLowerCase()
  return patterns.some(pattern => lowerText.includes(pattern))
}

export function detectCategory(
  filePath: string,
  content: string
): 'auth' | 'payment' | 'api' | 'database' | 'testing' | 'config' | 'other' {
  const combined = (filePath + ' ' + content).toLowerCase()
  
  if (matchesPattern(combined, FILE_PATTERNS.auth)) return 'auth'
  if (matchesPattern(combined, FILE_PATTERNS.payment)) return 'payment'
  if (matchesPattern(combined, FILE_PATTERNS.api)) return 'api'
  if (matchesPattern(combined, FILE_PATTERNS.database)) return 'database'
  if (matchesPattern(combined, FILE_PATTERNS.testing)) return 'testing'
  if (matchesPattern(combined, FILE_PATTERNS.config)) return 'config'
  
  return 'other'
}

export function extractKeywords(filePath: string, content: string): string[] {
  const keywords = new Set<string>()
  
  // Extract from file path
  const pathWords = filePath.toLowerCase().match(/[a-z]+/g) || []
  pathWords.forEach(word => {
    if (word.length > 3) keywords.add(word) // Only meaningful words
  })
  
  // Extract from content (look for common patterns)
  const allPatterns = Object.values(FILE_PATTERNS).flat()
  allPatterns.forEach(pattern => {
    if (content.toLowerCase().includes(pattern)) {
      keywords.add(pattern)
    }
  })
  
  return Array.from(keywords)
}
