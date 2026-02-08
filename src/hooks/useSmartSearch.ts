import { useState, useCallback } from 'react'
import { FileMetadata, RepoIndex } from '@/types/contracts'
import { resolveQuery } from '@/services/smart-search/resolver'

export function useSmartSearch(repoIndex: RepoIndex) {
  const [results, setResults] = useState<FileMetadata[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const search = useCallback((query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }
    
    setIsSearching(true)
    
    try {
      const searchResults = resolveQuery(query, repoIndex)
      setResults(searchResults)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [repoIndex])
  
  const clearResults = useCallback(() => {
    setResults([])
  }, [])
  
  return {
    results,
    isSearching,
    search,
    clearResults
  }
}
