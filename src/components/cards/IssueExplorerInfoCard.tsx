// src/components/cards/IssueExplorerInfoCard.tsx
// Alternative version that displays like README/Repository Structure cards in sidebar
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ExternalLink, 
  GitPullRequest, 
  Compass,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { userProfileStorage, issueCacheStorage } from '@/services/storage/userProfile';
import { searchIssues, getEffectiveKnowledgeLevel } from '@/services/github/issues';
import { matchIssuesWithProfile, generateProfileHash } from '@/services/issue-matcher/matcher';
import type { IssueMatchResult } from '@/types/onboarding';

interface IssueExplorerInfoCardProps {
  autoLoad?: boolean;
  limit?: number; // How many issues to show in sidebar (default: 5)
}

/**
 * Sidebar-style info card showing issue summaries
 * Like README/Repository Structure cards in your UI
 */
export default function IssueExplorerInfoCard({ 
  autoLoad = true,
  limit = 5 
}: IssueExplorerInfoCardProps) {
  const [issues, setIssues] = useState<IssueMatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoLoad) {
      loadIssues();
    }
  }, [autoLoad]);

  const loadIssues = async () => {
    setLoading(true);
    setError(null);

    try {
      const profile = userProfileStorage.get();
      if (!profile) {
        setError('Complete onboarding to see personalized issues');
        setLoading(false);
        return;
      }

      const profileHash = generateProfileHash(profile);
      const cachedIssues = issueCacheStorage.get(profileHash);
      
      if (cachedIssues) {
        console.log('✅ Using cached issues');
        setIssues(cachedIssues.slice(0, limit));
        setLoading(false);
        return;
      }

      const languages = profile.techStack.map(t => t.name);
      const knowledgeLevel = getEffectiveKnowledgeLevel(profile.techStack);

      const searchResults = await searchIssues({
        languages,
        knowledgeLevel,
        perPage: 30,
      });

      const matchedIssues = matchIssuesWithProfile(searchResults, profile);
      const topIssues = matchedIssues.slice(0, 10);

      issueCacheStorage.set(topIssues, profileHash);
      setIssues(topIssues.slice(0, limit));
    } catch (err) {
      console.error('Failed to load issues:', err);
      setError(err instanceof Error ? err.message : 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Compass className="h-5 w-5 animate-pulse text-primary" />
            Explore Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Finding issues for you...</p>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-card/50 backdrop-blur border-destructive/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button onClick={loadIssues} variant="outline" size="sm" className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (issues.length === 0) {
    return (
      <Card className="w-full bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Explore Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            No issues found matching your profile
          </p>
          <Button onClick={loadIssues} variant="outline" size="sm" className="w-full">
            Search Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Explore Issues
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {issues.length} matches
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Click to see full details
        </p>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {issues.map((matchResult, index) => {
          const { issue } = matchResult;
          
          return (
            <a
              key={issue.id}
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="p-2 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {issue.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground truncate">
                        {issue.repo?.name || 'Unknown'}
                      </span>
                      {issue.labels.length > 0 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs h-4 px-1"
                          style={{
                            borderColor: `#${issue.labels[0].color}`,
                            color: `#${issue.labels[0].color}`,
                          }}
                        >
                          {issue.labels[0].name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </div>
            </a>
          );
        })}

        <Button 
          onClick={loadIssues} 
          variant="outline" 
          size="sm" 
          className="w-full mt-2 gap-2"
        >
          <GitPullRequest className="h-3 w-3" />
          View All Issues
        </Button>
      </CardContent>
    </Card>
  );
}
