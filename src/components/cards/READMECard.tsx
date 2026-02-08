// src/components/cards/READMECard.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRepo } from '@/hooks/useRepo';
import { fetchREADME } from '@/services/github/content';

interface READMECardProps {
  repo?: string;
  branch?: string;
  section?: 'installation' | 'usage' | 'contributing' | 'all';
}

export default function READMECard({
  repo: propRepo = '',
  branch: propBranch = '',
  section = 'all',
}: READMECardProps) {
  const storeRepo = useRepo((state) => state.currentRepo);
  const storeBranch = useRepo((state) => state.currentBranch);
  
  const repo = propRepo || storeRepo || '';
  const branch = propBranch || storeBranch || 'main';

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track the last fetched combination to prevent duplicate fetches
  const lastFetchedRef = useRef<string>('');

  useEffect(() => {
    console.log('🔍 READMECard mounted with:', { repo, branch, section });
    
    if (repo && repo.trim() !== '') {
      // Create a unique key for this fetch
      const fetchKey = `${repo}::${branch}::${section}`;
      
      // Skip if we already fetched this exact combination
      if (lastFetchedRef.current === fetchKey) {
        console.log(`⏭️ Skipping duplicate fetch: ${fetchKey}`);
        return;
      }
      
      // Update the ref and fetch
      lastFetchedRef.current = fetchKey;
      fetchREADMEContent();
    } else {
      console.warn('⚠️ No repository provided');
      setError('No repository loaded. Please load a repository first.');
      setLoading(false);
    }
  }, [repo, branch]);

  const fetchREADMEContent = async () => {
    if (!repo || repo.trim() === '') return;
    
    setLoading(true);
    setError(null);

    try {
      // Parse owner/repo
      const parts = repo.split('/');
      const owner = parts[0];
      const repoName = parts.slice(1).join('/'); // Handle repos with / in name
      
      console.log('🔍 Parsed repo:', { owner, repoName, branch, originalRepo: repo });
      
      if (!owner || !repoName) {
        throw new Error('Invalid repository format. Expected: owner/repo');
      }

      // ✅ Use Octokit with authentication
      const text = await fetchREADME(owner, repoName, branch);
      console.log(`✅ README loaded: ${text.length} characters`);
      setContent(text);
    } catch (err) {
      console.error('❌ Failed to fetch README:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch README';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const extractSection = (content: string, sectionName: string): string => {
    const regex = new RegExp(`##?\\s+${sectionName}[\\s\\S]*?(?=##|$)`, 'i');
    const match = content.match(regex);
    return match ? match[0] : '';
  };

  const getDisplayContent = () => {
    if (section === 'all') return content;
    
    const sectionMap = {
      installation: 'Installation|Install|Getting Started|Setup',
      usage: 'Usage|How to Use|Examples',
      contributing: 'Contributing|Contribution|Development',
    };
    
    const extracted = extractSection(content, sectionMap[section]);
    return extracted || `### ${section.charAt(0).toUpperCase() + section.slice(1)} section not found`;
  };

  if (loading) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-full border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <BookOpen className="h-5 w-5" />
            Error Loading README
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          {repo && repo.trim() !== '' && (
            <Button variant="outline" onClick={() => window.open(`https://github.com/${repo}`, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View on GitHub
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const sectionTitle = section === 'all' ? 'README' : section.charAt(0).toUpperCase() + section.slice(1);

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {sectionTitle}
            </CardTitle>
            {repo && <CardDescription className="mt-1">{repo}</CardDescription>}
          </div>
          {repo && repo.trim() !== '' && (
            <Button variant="outline" size="sm" onClick={() => window.open(`https://github.com/${repo}`, '_blank')}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{getDisplayContent()}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
