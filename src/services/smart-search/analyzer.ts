import { FileMetadata } from '@/types/contracts'
import { detectCategory, extractKeywords } from './patterns'

export function analyzeFile(
  path: string,
  content: string
): FileMetadata {
  return {
    path,
    content,
    keywords: extractKeywords(path, content),
    imports: extractImports(content),
    exports: extractExports(content),
    functions: extractFunctions(content),
    category: detectCategory(path, content)
  }
}

export function extractImports(content: string): string[] {
  const imports = new Set<string>()
  
  // ES6 imports: import ... from '...'
  const es6Regex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g
  let match
  while ((match = es6Regex.exec(content)) !== null) {
    imports.add(match[1])
  }
  
  // require: require('...')
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((match = requireRegex.exec(content)) !== null) {
    imports.add(match[1])
  }
  
  return Array.from(imports)
}

export function extractExports(content: string): string[] {
  const exports = new Set<string>()
  
  // export function/const/class name
  const exportRegex = /export\s+(?:default\s+)?(?:async\s+)?(?:function|const|let|class)\s+(\w+)/g
  let match
  while ((match = exportRegex.exec(content)) !== null) {
    exports.add(match[1])
  }
  
  // export { name1, name2 }
  const namedExportRegex = /export\s+\{\s*([\w\s,]+)\s*\}/g
  while ((match = namedExportRegex.exec(content)) !== null) {
    const names = match[1].split(',').map(n => n.trim())
    names.forEach(name => exports.add(name))
  }
  
  return Array.from(exports)
}

export function extractFunctions(content: string): string[] {
  const functions = new Set<string>()
  
  // function name() {}
  const funcRegex = /function\s+(\w+)\s*\(/g
  let match
  while ((match = funcRegex.exec(content)) !== null) {
    functions.add(match[1])
  }
  
  // const/let name = () => {} or function
  const arrowRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g
  while ((match = arrowRegex.exec(content)) !== null) {
    functions.add(match[1])
  }
  
  return Array.from(functions)
}
