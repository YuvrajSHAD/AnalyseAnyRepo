// src/components/cards/FileDetailCard.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FileCode, Copy, ExternalLink, AlertCircle, CheckCircle, MessageSquare, Info, Download, Image as ImageIcon } from 'lucide-react';
import { useRepo } from '@/hooks/useRepo';
import { fetchFileContent } from '@/services/github/content';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTamboThread, useTamboThreadInput } from '@tambo-ai/react';

interface FileDetailCardProps {
  filename?: string;
  repo?: string;
}

/**
 * Enhanced FileDetailCard with:
 * - Binary file support (images, PDFs, etc.)
 * - Better path handling for nested files
 * - Enhanced AI interaction with web search capability
 * - Improved error handling with detailed troubleshooting
 */
export default function FileDetailCard({ filename, repo: propRepo = '' }: FileDetailCardProps) {
  const storeRepo = useRepo((state) => state.currentRepo);
  const repo = propRepo || storeRepo || '';

  const [fileContent, setFileContent] = useState<string>('');
  const [isBinaryFile, setIsBinaryFile] = useState(false);
  const [binaryFileUrl, setBinaryFileUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Use proper Tambo hooks for interaction
  const { thread } = useTamboThread();
  const { setValue, submit } = useTamboThreadInput();
  
  // Track the last fetched combination to prevent duplicate fetches
  const lastFetchedRef = useRef<string>('');

  useEffect(() => {
    console.log('🔍 FileDetailCard useEffect triggered:', { filename, repo });

    if (!filename) {
      console.error('❌ No filename provided');
      setError('No filename provided');
      setLoading(false);
      return;
    }

    if (!repo || !repo.includes('/')) {
      console.error('❌ Invalid repository format:', repo);
      setError('No repository loaded or invalid format');
      setLoading(false);
      return;
    }

    const parts = repo.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      console.error('❌ Repository format error:', { repo, parts });
      setError(`Invalid repository format: "${repo}". Expected "owner/repo"`);
      setLoading(false);
      return;
    }

    const fetchKey = `${repo}::${filename}`;
    
    if (lastFetchedRef.current === fetchKey) {
      console.log(`⏭️ Skipping duplicate fetch: ${fetchKey}`);
      return;
    }
    
    lastFetchedRef.current = fetchKey;
    console.log(`✅ Starting fetch for: ${fetchKey}`);
    fetchFile();
  }, [repo, filename]);

  const fetchFile = async () => {
    setLoading(true);
    setError(null);
    setIsBinaryFile(false);
    setBinaryFileUrl('');

    try {
      const [owner, repoName] = repo.split('/');
      
      if (!owner || !repoName) {
        throw new Error(`Invalid repository format: "${repo}". Expected "owner/repo"`);
      }

      console.log(`📄 Fetching file details:`, {
        owner,
        repo: repoName,
        filename,
        fullPath: `${owner}/${repoName}/${filename}`
      });
      
      // Normalize the filename path - remove leading slashes
      const normalizedPath = filename!.replace(/^\/+/, '');
      console.log(`🔧 Normalized path: "${filename}" → "${normalizedPath}"`);
      
      const content = await fetchFileContent(owner, repoName, normalizedPath);
      
      // Check if it's a binary file
      if (content.startsWith('[BINARY_FILE]')) {
        const downloadUrl = content.replace('[BINARY_FILE]', '');
        console.log(`🖼️ Binary file detected, download URL:`, downloadUrl);
        setIsBinaryFile(true);
        setBinaryFileUrl(downloadUrl || `https://github.com/${repo}/blob/main/${normalizedPath}`);
        setFileContent('');
      } else {
        setFileContent(content);
        setIsBinaryFile(false);
      }
      
      console.log(`✅ File fetched successfully:`, {
        filename: normalizedPath,
        contentLength: content.length,
        lines: content.split('\n').length,
        isBinary: content.startsWith('[BINARY_FILE]')
      });
    } catch (err: any) {
      console.error('❌ File fetch error details:', {
        filename,
        repo,
        error: err,
        message: err.message,
        status: err.status,
        stack: err.stack
      });
      
      if (err.message.includes('404') || err.message.includes('not found')) {
        setError(`File "${filename}" not found in repository. The file may not exist or the path may be incorrect.`);
      } else if (err.message.includes('403') || err.message.includes('rate limit')) {
        setError('GitHub API rate limit exceeded. Please try again later or add a GitHub token.');
      } else {
        setError(err.message || 'Failed to fetch file');
      }
    } finally {
      setLoading(false);
      console.log(`🏁 Fetch completed for: ${filename}`);
    }
  };

  // Enhanced "Ask about this file" with web search when available
  const handleAskAboutFile = async () => {
    if (isBinaryFile) {
      console.log('🤖 Ask AI triggered for binary file:', filename);
      const message = `I'm looking at a binary file "${filename}" from the repository ${repo}.

File type: ${getLanguage(filename || '')}
Download URL: ${binaryFileUrl}

Can you help me understand:
1. What this file type is typically used for
2. How it might be used in this project
3. Any best practices for this file type
4. If web search is available, search for information about this specific file type and common uses`;

      setValue(message);
    } else if (!fileContent || !filename) {
      console.warn('⚠️ Cannot ask about file: missing content or filename');
      return;
    } else {
      console.log('🤖 Ask AI triggered for file:', filename);

      // Get file extension for better context
      const ext = filename.split('.').pop()?.toLowerCase() || 'unknown';
      const language = getLanguage(filename);

      // Enhanced prompt with web search request (AI will try if available)
      const message = `I'm looking at the file "${filename}" (${language}) from the repository ${repo}.

Here's the file content (first 4000 characters):

\`\`\`${language}
${fileContent.substring(0, 4000)}${fileContent.length > 4000 ? '\n... (truncated)' : ''}
\`\`\`

Please help me understand this file by:

1. **If web search is available**, search for additional context about:
   - What framework, library, or technology this file uses (based on imports, patterns, etc.)
   - Common patterns or best practices for this type of file
   - Any relevant documentation for the technologies used

2. **Then explain**:
   - What this file does and its purpose
   - Key components, functions, or classes
   - How it fits into a typical ${language} project
   - Any notable patterns or techniques used

3. **If web search worked**, provide insights about:
   - Similar implementations or examples
   - Potential improvements or modern alternatives
   - Common issues or gotchas with this approach

If web search is not available, just analyze the code directly and provide your best insights.`;

      setValue(message);
    }
    
    // Submit the message
    try {
      await submit({
        streamResponse: true,
        resourceNames: {},
      });
      setValue(''); // Clear after submit
      console.log('✅ Message sent successfully');
    } catch (err) {
      console.error('❌ Failed to send message to AI:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    console.log('📋 File content copied to clipboard');
  };

  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      py: 'python',
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      json: 'json',
      md: 'markdown',
      yaml: 'yaml',
      yml: 'yaml',
      sh: 'bash',
      bash: 'bash',
      css: 'css',
      html: 'html',
      xml: 'xml',
      sql: 'sql',
      go: 'go',
      rs: 'rust',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      rb: 'ruby',
      php: 'php',
      txt: 'text',
      toml: 'toml',
      ini: 'ini',
      env: 'bash',
      png: 'image',
      jpg: 'image',
      jpeg: 'image',
      gif: 'image',
      svg: 'svg',
      pdf: 'pdf',
    };
    return languageMap[ext || ''] || 'text';
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const colors: Record<string, string> = {
      py: 'text-blue-400',
      js: 'text-yellow-400',
      ts: 'text-blue-500',
      jsx: 'text-yellow-400',
      tsx: 'text-blue-500',
      json: 'text-green-400',
      md: 'text-gray-400',
      yaml: 'text-purple-400',
      yml: 'text-purple-400',
      css: 'text-pink-400',
      html: 'text-orange-400',
      png: 'text-purple-500',
      jpg: 'text-purple-500',
      jpeg: 'text-purple-500',
      gif: 'text-purple-500',
      svg: 'text-orange-500',
      pdf: 'text-red-500',
    };
    return colors[ext || ''] || 'text-gray-400';
  };

  const isImageFile = (filename: string): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '');
  };

  if (loading) {
    return (
      <Card className="w-full h-full bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-1/2 bg-muted" />
          <Skeleton className="h-4 w-1/3 bg-muted" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-full border-destructive bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading File
          </CardTitle>
          <CardDescription className="text-muted-foreground">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-muted/30 rounded-md border border-border">
              <p className="text-foreground"><strong>File:</strong> {filename}</p>
              <p className="text-foreground"><strong>Repository:</strong> {repo}</p>
            </div>
            
            <div className="p-3 bg-blue-500/10 rounded-md border border-blue-500/30">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-300">
                  <p className="font-semibold mb-1">Troubleshooting:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Check if the file exists in the repository on GitHub</li>
                    <li>Verify the file path is correct (check for typos)</li>
                    <li>File might be in a different branch (we tried main and master)</li>
                    <li>Check browser console for detailed error logs</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFile()}
              className="mt-4 border-border hover:bg-muted"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const language = getLanguage(filename || '');
  const fileSize = isBinaryFile ? 0 : new Blob([fileContent]).size;
  const lineCount = isBinaryFile ? 0 : fileContent.split('\n').length;

  return (
    <Card className="w-full h-full bg-card border-border">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-foreground">
              {isBinaryFile ? (
                <ImageIcon className={`h-5 w-5 ${getFileIcon(filename || '')}`} />
              ) : (
                <FileCode className={`h-5 w-5 ${getFileIcon(filename || '')}`} />
              )}
              {filename}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-3">
              <Badge variant="outline" className="bg-muted/50 border-border">
                {isBinaryFile ? 'binary' : language}
              </Badge>
              {!isBinaryFile && (
                <>
                  <span className="text-xs text-muted-foreground">{lineCount} lines</span>
                  <span className="text-xs text-muted-foreground">{(fileSize / 1024).toFixed(2)} KB</span>
                </>
              )}
            </CardDescription>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {/* Ask AI button */}
            <Button
              variant="default"
              size="sm"
              onClick={handleAskAboutFile}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <MessageSquare className="h-4 w-4" />
              Ask AI
            </Button>
            
            {!isBinaryFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="border-border hover:bg-muted"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            )}
            
            {isBinaryFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(binaryFileUrl, '_blank')}
                className="border-border hover:bg-muted"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://github.com/${repo}/blob/main/${filename}`, '_blank')}
              className="border-border hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isBinaryFile ? (
          <div className="space-y-4">
            <div className="p-6 bg-muted/30 rounded-lg border border-border text-center">
              <ImageIcon className="h-16 w-16 mx-auto mb-3 text-muted-foreground" />
              <p className="text-foreground font-medium mb-2">Binary File Detected</p>
              <p className="text-sm text-muted-foreground mb-4">
                This file cannot be displayed as text. {isImageFile(filename || '') && 'It appears to be an image file.'}
              </p>
              {isImageFile(filename || '') && binaryFileUrl && (
                <div className="mt-4">
                  <img 
                    src={binaryFileUrl} 
                    alt={filename}
                    className="max-w-full max-h-96 mx-auto rounded-lg border border-border"
                    onError={(e) => {
                      console.error('Failed to load image:', binaryFileUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(binaryFileUrl, '_blank')}
                className="mt-4 border-border hover:bg-muted"
              >
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden border border-border">
            
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              showLineNumbers
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: '14px',
                maxHeight: '600px',
                background: 'hsl(var(--card))',
                // ✅ ADDED: Force high contrast text colors
                color: '#d4d4d4',  // Light gray text for dark mode
              }}
              lineNumberStyle={{
                minWidth: '3em',
                paddingRight: '1em',
                color: 'hsl(var(--muted-foreground))',
                userSelect: 'none',
              }}
              // ✅ ADDED: Override token styles for better contrast
              codeTagProps={{
                style: {
                  color: '#d4d4d4',  // Ensure code text is visible
                  fontFamily: 'monospace',
                }
              }}
              // ✅ ADDED: Apply styles to pre tag for better visibility
              PreTag={({ children, ...props }) => (
                <pre {...props} style={{ 
                  ...props.style, 
                  color: '#d4d4d4',
                  backgroundColor: 'transparent'
                }}>
                  {children}
                </pre>
              )}
            >
              {fileContent}
            </SyntaxHighlighter>
          </div>
        )}
      </CardContent>
    </Card>
  );
}