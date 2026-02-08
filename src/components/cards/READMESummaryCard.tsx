// src/components/cards/READMESummaryCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useRepo } from '@/hooks/useRepo';
import { fetchREADME } from '@/services/github/content';

interface READMESummaryCardProps {
  repo?: string;
  branch?: string;
  maxBullets?: number;
}

export default function READMESummaryCard({
  repo: propRepo = '',
  branch: propBranch = '',
  maxBullets = 5,
}: READMESummaryCardProps) {
  const storeRepo = useRepo((state) => state.currentRepo);
  const storeBranch = useRepo((state) => state.currentBranch);
  
  const repo = propRepo || storeRepo || '';
  const branch = propBranch || storeBranch || 'main';

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    if (repo && repo.trim() !== '') {
      fetchREADMEContent();
    } else {
      setError('No repository loaded. Please load a repository first.');
      setLoading(false);
    }
  }, [repo, branch]);

  const fetchREADMEContent = async () => {
    if (!repo || repo.trim() === '') return;
    
    setLoading(true);
    setError(null);

    try {
      const parts = repo.split('/');
      const owner = parts[0];
      const repoName = parts.slice(1).join('/');
      
      if (!owner || !repoName) {
        throw new Error('Invalid repository format. Expected: owner/repo');
      }

      const text = await fetchREADME(owner, repoName, branch);
      setContent(text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch README';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Smart extraction of key points
  const extractKeyPoints = (markdown: string): string[] => {
    const lines = markdown.split('\n');
    const points: string[] = [];
    
    // Extract title/first header
    const title = lines.find(line => line.startsWith('# '));
    if (title) {
      points.push(title.replace('# ', '').trim());
    }

    // Extract first meaningful paragraph (description)
    const firstParagraph = lines.find(line => 
      line.trim() && 
      !line.startsWith('#') && 
      !line.startsWith('!') &&
      !line.startsWith('[') &&
      !line.startsWith('```') &&
      line.length > 30
    );
    if (firstParagraph && points.length < maxBullets) {
      points.push(firstParagraph.trim());
    }

    // Extract key section headers (## level)
    const headers = lines
      .filter(line => line.match(/^##\s+/))
      .map(h => h.replace(/^##\s+/, '').trim())
      .filter(h => !h.toLowerCase().includes('table of contents'))
      .slice(0, 3);
    
    headers.forEach(h => {
      if (points.length < maxBullets) {
        points.push(`📌 ${h}`);
      }
    });

    // Extract installation command if exists
    const installLine = lines.find(line => 
      (line.includes('pip install') || 
       line.includes('npm install') ||
       line.includes('yarn add') ||
       line.includes('cargo install')) &&
      !line.startsWith('#')
    );
    if (installLine && points.length < maxBullets) {
      const cleanInstall = installLine.trim().replace(/`/g, '').replace(/\$/g, '').trim();
      points.push(`⚙️ ${cleanInstall}`);
    }

    // Extract features if there's a features section
    const featuresIdx = lines.findIndex(line => 
      line.toLowerCase().includes('## features') || 
      line.toLowerCase().includes('## key features')
    );
    if (featuresIdx !== -1 && points.length < maxBullets) {
      const featuresSection = lines.slice(featuresIdx + 1, featuresIdx + 10);
      const features = featuresSection
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(f => f.replace(/^[-*]\s+/, '').trim())
        .slice(0, maxBullets - points.length);
      
      features.forEach(f => points.push(`✨ ${f}`));
    }

    return points.slice(0, maxBullets);
  };

  if (loading) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
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
      </Card>
    );
  }

  const keyPoints = extractKeyPoints(content);

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              README Overview
            </CardTitle>
            {repo && (
              <CardDescription className="mt-1 font-mono text-xs">
                {repo}
              </CardDescription>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(`https://github.com/${repo}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!showFull ? (
          <div className="space-y-3">
            <div className="space-y-2.5">
              {keyPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="text-primary mt-0.5 text-lg">•</span>
                  <p className="text-sm text-foreground/90 flex-1 leading-relaxed">
                    {point}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFull(true)}
                className="w-full hover:bg-accent"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Show Full README
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="prose prose-sm dark:prose-invert max-w-none max-h-[600px] overflow-y-auto border rounded-lg p-4 bg-muted/30">
              <pre className="whitespace-pre-wrap text-xs font-mono">
                {content}
              </pre>
            </div>
            
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFull(false)}
                className="w-full hover:bg-accent"
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Show Summary
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
