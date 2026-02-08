// src/components/cards/PRDetailCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GitPullRequest, GitMerge, Calendar, User, FileText, AlertCircle, ExternalLink, MessageSquare } from 'lucide-react';
import { useRepo } from '@/hooks/useRepo';
import { fetchPullRequest, PullRequest } from '@/services/github/pulls';
import { useTamboThread, useTamboThreadInput } from '@tambo-ai/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PRFilesCard from './PRFilesCard';

interface PRDetailCardProps {
  prNumber?: number;
  repo?: string;
}

/**
 * Enhanced PRDetailCard with:
 * - Proper markdown rendering with GitHub Flavored Markdown
 * - Image rendering in PR descriptions
 * - Enhanced AI interaction with smart prompts
 * - Better dark theme support
 */
export default function PRDetailCard({ prNumber, repo: propRepo = '' }: PRDetailCardProps) {
  const storeRepo = useRepo((state) => state.currentRepo);
  const repo = propRepo || storeRepo || '';

  const [pr, setPR] = useState<PullRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tambo integration for interactability
  const { thread } = useTamboThread();
  const { setValue, submit } = useTamboThreadInput();

  useEffect(() => {
    console.log('🔍 PRDetailCard useEffect triggered:', { prNumber, repo });

    // Validation inside useEffect
    if (!prNumber || prNumber <= 0) {
      console.error('❌ Invalid PR number:', prNumber);
      setError('Invalid PR number. Please provide a valid PR number (e.g., "show PR #97")');
      setLoading(false);
      return;
    }

    if (!repo || repo.trim() === '') {
      console.error('❌ No repository loaded');
      setError('No repository loaded');
      setLoading(false);
      return;
    }

    console.log(`✅ Starting PR fetch for #${prNumber} in ${repo}`);
    fetchPR();
  }, [repo, prNumber]);

  const fetchPR = async () => {
    setLoading(true);
    setError(null);

    try {
      const [owner, repoName] = repo.split('/');
      if (!owner || !repoName) {
        throw new Error('Invalid repository format');
      }

      console.log(`📥 Fetching PR details:`, {
        owner,
        repo: repoName,
        prNumber
      });

      const data = await fetchPullRequest(owner, repoName, prNumber!);
      setPR(data);

      console.log(`✅ PR fetched successfully:`, {
        number: data.number,
        title: data.title,
        state: data.state,
        merged: !!data.merged_at
      });
    } catch (err: any) {
      console.error('❌ PR fetch error:', {
        prNumber,
        repo,
        error: err,
        message: err.message
      });
      setError(err.message);
    } finally {
      setLoading(false);
      console.log(`🏁 PR fetch completed for #${prNumber}`);
    }
  };

  // Enhanced "Ask about this PR" with smart analysis
  const handleAskAboutPR = async () => {
    if (!pr) {
      console.warn('⚠️ Cannot ask about PR: PR data not loaded');
      return;
    }

    console.log('🤖 Ask AI triggered for PR:', pr.number);

    // Smart prompt that works with or without web search
    const message = `I'm analyzing Pull Request #${pr.number} from the repository ${repo}.

**PR Title:** ${pr.title}

**Status:** ${pr.merged_at ? 'Merged' : pr.state}
**Author:** ${pr.user.login}
**Created:** ${formatDate(pr.created_at)}
${pr.merged_at ? `**Merged:** ${formatDate(pr.merged_at)}` : ''}

**Changes:**
- ${pr.changed_files} files changed
- ${pr.additions} additions
- ${pr.deletions} deletions

**Labels:** ${pr.labels.map(l => l.name).join(', ') || 'None'}

**Description:**
${pr.body || 'No description provided'}

Please help me understand this pull request by providing:

1. **Analysis:**
   - What problem this PR is solving
   - The approach taken and why it might be effective
   - Potential impact on the codebase
   - Any risks or considerations

2. **Key Insights:**
   - Main technologies or frameworks involved
   - Notable changes or patterns
   - Potential areas of concern

3. **Context** (if you can search the web, please do):
   - Related best practices
   - Similar approaches in the industry
   - Relevant documentation or resources

If web search is not available, provide your best analysis based on the PR description and your knowledge.`;

    console.log('💬 Sending PR analysis message to AI');
    setValue(message);
    
    try {
      await submit({
        streamResponse: true,
        resourceNames: {},
      });
      setValue('');
      console.log('✅ PR analysis message sent successfully');
    } catch (err) {
      console.error('❌ Failed to send PR analysis message:', err);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="w-full h-full bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-1/2 bg-muted" />
            <Skeleton className="h-4 w-1/3 bg-muted" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !pr) {
    return (
      <Card className="w-full border-destructive bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading PR
          </CardTitle>
          <CardDescription className="text-muted-foreground">{error || 'PR not found'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusIcon = () => {
    if (pr.merged_at) return <GitMerge className="h-5 w-5 text-purple-400" />;
    if (pr.state === 'open') return <GitPullRequest className="h-5 w-5 text-green-400" />;
    return <GitPullRequest className="h-5 w-5 text-red-400" />;
  };

  const getStatusText = () => {
    if (pr.merged_at) return 'Merged';
    if (pr.draft) return 'Draft';
    return pr.state === 'open' ? 'Open' : 'Closed';
  };

  const getStatusColor = () => {
    if (pr.merged_at) return 'bg-purple-500/90';
    if (pr.state === 'open') return 'bg-green-500/90';
    return 'bg-red-500/90';
  };

  return (
    <div className="space-y-4">
      {/* PR Details Card */}
      <Card className="w-full bg-card border-border">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-foreground">
                {getStatusIcon()}
                #{pr.number} {pr.title}
              </CardTitle>
              <CardDescription className="mt-1">
                <Badge className={getStatusColor()}>{getStatusText()}</Badge>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {/* Ask AI button */}
              <Button
                variant="default"
                size="sm"
                onClick={handleAskAboutPR}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <MessageSquare className="h-4 w-4" />
                Ask AI
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(pr.html_url, '_blank')}
                className="border-border hover:bg-muted"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Author & Date Info */}
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={pr.user.avatar_url} />
                <AvatarFallback className="bg-muted text-foreground">{pr.user.login[0]}</AvatarFallback>
              </Avatar>
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{pr.user.login}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(pr.created_at)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="bg-muted/30 border-border">
              <FileText className="h-3 w-3 mr-1" />
              {pr.changed_files} files
            </Badge>
            <Badge variant="outline" className="text-green-400 bg-green-500/10 border-green-500/30">
              +{pr.additions} additions
            </Badge>
            <Badge variant="outline" className="text-red-400 bg-red-500/10 border-red-500/30">
              -{pr.deletions} deletions
            </Badge>
          </div>

          {/* Labels */}
          {pr.labels.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {pr.labels.map((label) => (
                <Badge
                  key={label.name}
                  variant="secondary"
                  style={{ 
                    backgroundColor: `#${label.color}20`, 
                    borderColor: `#${label.color}`,
                    color: `#${label.color}` 
                  }}
                  className="border"
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Description with proper markdown rendering */}
          {pr.body && (
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom image renderer to handle GitHub images
                    img: ({ node, ...props }) => (
                      <img
                        {...props}
                        className="max-w-full h-auto rounded-lg border border-border my-2"
                        loading="lazy"
                        onError={(e) => {
                          console.error('Failed to load image:', props.src);
                          // Optionally show placeholder or hide
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ),
                    // Custom link renderer
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                    // Custom code block renderer
                    code: ({ node, inline, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline ? (
                        <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto border border-border">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                    // Headings
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 text-foreground" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-foreground" {...props} />,
                    // Lists
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2 text-foreground" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2 text-foreground" {...props} />,
                    // Tables
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border border-border rounded-lg" {...props} />
                      </div>
                    ),
                    th: ({ node, ...props }) => (
                      <th className="border border-border bg-muted px-4 py-2 text-left font-semibold text-foreground" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border border-border px-4 py-2 text-foreground" {...props} />
                    ),
                  }}
                >
                  {pr.body}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {pr.merged_at && (
            <div className="flex items-center gap-2 text-sm text-purple-400">
              <GitMerge className="h-4 w-4" />
              <span>Merged on {formatDate(pr.merged_at)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PR Files Card */}
      <PRFilesCard prNumber={prNumber} repo={repo} />
    </div>
  );
}