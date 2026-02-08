// src/components/cards/PRListCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GitPullRequest, AlertCircle, ExternalLink, Eye } from 'lucide-react';
import { useRepo } from '@/hooks/useRepo';
import { fetchPullRequests, PullRequestListItem } from '@/services/github/pulls';
import { Button } from '@/components/ui/button';
import PRDetailCard from './PRDetailCard';

interface PRListCardProps {
  repo?: string;
  state?: 'open' | 'closed' | 'all';
  limit?: number;
}

export default function PRListCard({
  repo: propRepo = '',
  state: prState = 'all',
  limit = 100,
}: PRListCardProps) {
  const storeRepo = useRepo((s) => s.currentRepo);
  const repo = propRepo || storeRepo || '';

  const [prs, setPRs] = useState<PullRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Client-side filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'closed' | 'merged'>('open');
  
  // Selected PR for detail view
  const [selectedPR, setSelectedPR] = useState<number | null>(null);

  useEffect(() => {
    if (!repo || repo.trim() === '') {
      setError('No repository loaded');
      setLoading(false);
      return;
    }

    fetchPRs();
  }, [repo, prState, limit]);

  const fetchPRs = async () => {
    setLoading(true);
    setError(null);

    try {
      const [owner, repoName] = repo.split('/');
      if (!owner || !repoName) {
        throw new Error('Invalid repository format');
      }

      // Always fetch ALL PRs
      const data = await fetchPullRequests(owner, repoName, 'all', limit);
      setPRs(data);
    } catch (err: any) {
      console.error('❌ Failed to fetch PRs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (pr: PullRequestListItem) => {
    if (pr.merged_at) return 'bg-github-merged';
    if (pr.state === 'open') return 'bg-github-success';
    return 'bg-github-danger';
  };

  const getStateText = (pr: PullRequestListItem) => {
    if (pr.merged_at) return 'Merged';
    if (pr.draft) return 'Draft';
    return pr.state === 'open' ? 'Open' : 'Closed';
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString();
  };

  const handleViewPR = (prNumber: number) => {
    setSelectedPR(prNumber);
    
    // Dispatch custom event to show PR detail in canvas
    window.dispatchEvent(
      new CustomEvent('tambo:showComponent', {
        detail: {
          messageId: `pr-${prNumber}`,
          component: <PRDetailCard prNumber={prNumber} repo={repo} />
        }
      })
    );
  };

  // Client-side filtering
  const filteredPRs = prs.filter((pr) => {
    if (activeFilter === 'open') return pr.state === 'open' && !pr.merged_at;
    if (activeFilter === 'merged') return pr.merged_at;
    if (activeFilter === 'closed') return pr.state === 'closed' && !pr.merged_at;
    return true;
  });

  // Calculate stats
  const openCount = prs.filter((pr) => pr.state === 'open' && !pr.merged_at).length;
  const mergedCount = prs.filter((pr) => pr.merged_at).length;
  const closedCount = prs.filter((pr) => pr.state === 'closed' && !pr.merged_at).length;

  if (loading) {
    return (
      <Card className="w-full h-full bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-1/3 bg-muted" />
          <Skeleton className="h-4 w-1/2 bg-muted" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full bg-muted" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading PRs
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-full">
      <Card className="w-full bg-card border-border">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <GitPullRequest className="h-5 w-5" />
                Pull Requests
              </CardTitle>
              <CardDescription className="mt-1">
                {openCount} open • {mergedCount} merged • {closedCount} closed
              </CardDescription>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              variant={activeFilter === 'open' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('open')}
              className="text-xs h-8"
            >
              <div className="w-2 h-2 rounded-full bg-github-success mr-2" />
              Open ({openCount})
            </Button>
            <Button
              variant={activeFilter === 'merged' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('merged')}
              className="text-xs h-8"
            >
              <div className="w-2 h-2 rounded-full bg-github-merged mr-2" />
              Merged ({mergedCount})
            </Button>
            <Button
              variant={activeFilter === 'closed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('closed')}
              className="text-xs h-8"
            >
              <div className="w-2 h-2 rounded-full bg-github-danger mr-2" />
              Closed ({closedCount})
            </Button>
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('all')}
              className="text-xs h-8"
            >
              All ({prs.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPRs.length > 0 ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredPRs.map((pr) => (
                <div
                  key={pr.number}
                  className={cn(
                    "flex items-start gap-3 p-3 border border-border rounded-lg transition-colors cursor-pointer",
                    selectedPR === pr.number 
                      ? "bg-muted border-primary" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => handleViewPR(pr.number)}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getStateColor(pr)}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h4 className="font-semibold text-sm flex-1 text-foreground">
                        #{pr.number} {pr.title}
                      </h4>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPR(pr.number);
                          }}
                          title="View details"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(pr.html_url, '_blank');
                          }}
                          title="Open on GitHub"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={pr.user.avatar_url} />
                        <AvatarFallback>{pr.user.login[0]}</AvatarFallback>
                      </Avatar>
                      <span>{pr.user.login}</span>
                      <span>•</span>
                      <span>{formatDate(pr.updated_at)}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant={pr.merged_at ? 'default' : pr.state === 'open' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {getStateText(pr)}
                      </Badge>

                      {pr.labels.slice(0, 3).map((label) => (
                        <Badge
                          key={label.name}
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: `#${label.color}` }}
                        >
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GitPullRequest className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No {activeFilter !== 'all' ? activeFilter : ''} pull requests found
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}