// src/components/cards/IssueExplorerResultsCard.tsx
// This component is rendered by Tambo AI after fetching issues
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ExternalLink, 
  GitPullRequest, 
  MessageSquare, 
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { userProfileStorage } from '@/services/storage/userProfile';
import { searchIssues, getEffectiveKnowledgeLevel } from '@/services/github/issues';
import { matchIssuesWithProfile } from '@/services/issue-matcher/matcher';
import type { IssueMatchResult } from '@/types/onboarding';

interface IssueExplorerResultsCardProps {
  repoUrl?: string | null;
  autoLoad?: boolean; // If true, automatically load issues on mount
}

export default function IssueExplorerResultsCard({ 
  repoUrl = null,
  autoLoad = true 
}: IssueExplorerResultsCardProps) {
  const [issues, setIssues] = useState<IssueMatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-load issues when component mounts (triggered by Tambo)
  useEffect(() => {
    if (autoLoad) {
      loadIssues();
    }
  }, [autoLoad]);

  const loadIssues = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user profile
      const currentProfile = userProfileStorage.get();
      
      if (!currentProfile || !currentProfile.hasCompleted) {
        setError('Please complete onboarding first to explore issues');
        setLoading(false);
        return;
      }

      // Get user's languages/tech stack
      const languages = currentProfile.techStack.map((t: any) => t.name);
      const knowledgeLevel = getEffectiveKnowledgeLevel(currentProfile.techStack);

      console.log('🔍 Searching for issues:', { 
        languages, 
        knowledgeLevel,
        searchAllRepos: !repoUrl,
        repoUrl: repoUrl || 'all GitHub'
      });

      // Search GitHub - ALWAYS search ALL repos (ignore repoUrl)
      const searchResults = await searchIssues({
        languages,
        knowledgeLevel,
        perPage: 30,
        searchAllRepos: true, // Force global search
        repoUrl: null, // Always null for global search
      });

      console.log(`✅ Found ${searchResults.length} raw issues from GitHub`);

      if (searchResults.length === 0) {
        setError(`No matching issues found for your skills (${languages.join(', ')} at ${knowledgeLevel} level). Try adding more common languages in onboarding.`);
        setLoading(false);
        return;
      }

      // Match and score issues
      const matchedIssues = matchIssuesWithProfile(searchResults, currentProfile);
      const topIssues = matchedIssues.slice(0, 10);

      if (topIssues.length === 0) {
        setError(`Found ${searchResults.length} issues but none matched your skills closely enough.`);
        setLoading(false);
        return;
      }

      setIssues(topIssues);
    } catch (err) {
      console.error('❌ Failed to load issues:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load issues: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const nextIssue = () => {
    if (currentIndex < issues.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevIssue = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const getIssueDifficulty = (issue: IssueMatchResult): { label: string; color: string } => {
    const labels = issue.issue.labels.map(l => l.name.toLowerCase());
    
    if (labels.some(l => l.includes('good') && l.includes('first'))) {
      return { label: 'Beginner', color: 'bg-green-500' };
    }
    if (labels.some(l => l.includes('easy') || l.includes('starter'))) {
      return { label: 'Easy', color: 'bg-green-500' };
    }
    if (labels.some(l => l.includes('complex') || l.includes('hard'))) {
      return { label: 'Advanced', color: 'bg-orange-500' };
    }
    if (labels.some(l => l.includes('help') && l.includes('wanted'))) {
      return { label: 'Intermediate', color: 'bg-blue-500' };
    }
    
    return { label: 'General', color: 'bg-gray-500' };
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitPullRequest className="h-5 w-5 animate-pulse" />
            Finding issues for you...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadIssues} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No issues found
  if (issues.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitPullRequest className="h-5 w-5" />
            No Issues Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            We couldn't find any issues matching your profile right now. Try adjusting your skills or check back later!
          </p>
          <Button onClick={loadIssues} variant="outline">
            Search Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show one issue at a time with navigation
  const currentIssue = issues[currentIndex];
  const { issue, matchScore, matchReasons } = currentIssue;
  const difficulty = getIssueDifficulty(currentIssue);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <GitPullRequest className="h-5 w-5" />
            Explore Issues
          </span>
          <Badge variant="secondary" className="text-xs">
            {currentIndex + 1} of {issues.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Single Issue Card */}
        <div className="space-y-3 p-4 border-2 border-border rounded-lg bg-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {issue.repo?.full_name || 'Unknown'}
                </Badge>
                <Badge className={`text-xs ${difficulty.color} text-white`}>
                  {difficulty.label}
                </Badge>
                {matchScore > 15 && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Great Match
                  </Badge>
                )}
              </div>
              
              <h4 className="font-semibold text-sm leading-tight text-foreground">
                {issue.title}
              </h4>

              {/* Match reasons */}
              {matchReasons.length > 0 && (
                <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-primary mb-1">Why this matches:</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {matchReasons.slice(0, 2).map((reason, i) => (
                        <li key={i}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Labels */}
              {issue.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {issue.labels.slice(0, 4).map((label) => (
                    <Badge
                      key={label.name}
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: `#${label.color}`,
                        color: `#${label.color}`,
                      }}
                    >
                      {label.name}
                    </Badge>
                  ))}
                  {issue.labels.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{issue.labels.length - 4}
                    </Badge>
                  )}
                </div>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {issue.comments} comments
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(issue.updated_at)}
                </div>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="default"
            asChild
            className="w-full gap-2"
          >
            <a
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              View Issue on GitHub
            </a>
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={prevIssue}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={nextIssue}
            disabled={currentIndex === issues.length - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Quality indicator */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-400">
            ✨ Showing {issues.length} high-quality issues matched to your skills
          </p>
        </div>
      </CardContent>
    </Card>
  );
}