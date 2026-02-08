// src/services/github/issues.ts
// FIXED: Start Exploring always searches ALL repos, repo URL is only for repo-specific exploration

import { octokit } from './client';
import type { GitHubIssue } from '@/types/onboarding';

export interface IssueSearchParams {
  languages?: string[];
  labels?: string[];
  knowledgeLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  perPage?: number;
  sort?: 'created' | 'updated' | 'comments';
  repoUrl?: string | null;
  searchAllRepos?: boolean; // Force search all repos (for Start Exploring)
}

// In-memory cache to reduce API calls
const searchCache = new Map<string, { data: GitHubIssue[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Search for issues with retry logic and fallback mechanisms
 * FIXED: searchAllRepos=true ignores repoUrl (for Start Exploring button)
 */
export async function searchIssues(params: IssueSearchParams): Promise<GitHubIssue[]> {
  const {
    languages = [],
    labels = [],
    knowledgeLevel = 'beginner',
    perPage = 10,
    sort = 'updated',
    repoUrl = null,
    searchAllRepos = false, // NEW: Default false for backward compatibility
  } = params;

  // Create cache key (exclude repoUrl if searchAllRepos is true)
  const cacheKey = JSON.stringify({
    ...params,
    repoUrl: searchAllRepos ? null : repoUrl,
  });
  
  // Check cache first
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('✅ Using cached search results');
    return cached.data;
  }

  // IMPORTANT: If searchAllRepos is true, ignore repoUrl
  const effectiveRepoUrl = searchAllRepos ? null : repoUrl;

  console.log('🔍 Search configuration:', {
    searchAllRepos,
    effectiveRepoUrl,
    languages,
    knowledgeLevel,
  });

  // STRATEGY: Use Search API with retry logic
  return await searchIssuesWithRetry({
    languages,
    labels,
    knowledgeLevel,
    perPage,
    sort,
    repoUrl: effectiveRepoUrl,
    cacheKey,
  });
}

/**
 * Search API with exponential backoff retry
 */
async function searchIssuesWithRetry(params: {
  languages: string[];
  labels: string[];
  knowledgeLevel: string;
  perPage: number;
  sort: string;
  repoUrl: string | null;
  cacheKey: string;
}): Promise<GitHubIssue[]> {
  const { languages, labels, knowledgeLevel, perPage, sort, repoUrl, cacheKey } = params;
  
  const maxRetries = 3;
  const baseDelay = 2000; // Start with 2 seconds

  // Build search query
  const queryParts: string[] = [
    'is:issue',
    'is:open',
    'no:assignee',
  ];

  // ONLY add repo filter if repoUrl is provided (not for Start Exploring)
  if (repoUrl) {
    const repoMatch = repoUrl.match(/github\.com\/([^\/]+\/[^\/]+)|^([^\/]+\/[^\/]+)$/);
    if (repoMatch) {
      const repo = (repoMatch[1] || repoMatch[2]).replace(/\.git$/, '');
      queryParts.push(`repo:${repo}`);
      console.log('🎯 Filtering by repository:', repo);
    }
  } else {
    console.log('🌍 Searching across ALL GitHub repositories');
  }

  // Add language filters - SIMPLIFIED for better results
  if (languages.length > 0) {
    // Try each language separately for better results
    const primaryLang = languages[0]; // Use primary language
    queryParts.push(`language:${primaryLang}`);
    console.log('🔍 Searching for language:', primaryLang);
  }

  // Get appropriate labels for knowledge level
  const knowledgeLabels = getLabelsForKnowledgeLevel(knowledgeLevel);
  const allLabels = [...new Set([...labels, ...knowledgeLabels])];
  
  // Simplified label query - use only primary label
  if (allLabels.length > 0) {
    const primaryLabel = allLabels[0];
    queryParts.push(`label:"${primaryLabel}"`);
    console.log('🏷️ Using primary label:', primaryLabel);
  }

  // Add comment filter based on knowledge level
  if (knowledgeLevel === 'beginner') {
    queryParts.push('comments:<5');
  } else if (knowledgeLevel === 'intermediate') {
    queryParts.push('comments:2..15');
  }

  const query = queryParts.join(' ');
  console.log('🔍 Simplified GitHub Search Query:', query);

  // Retry loop with exponential backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await octokit.search.issuesAndPullRequests({
        q: query,
        sort: sort as any,
        order: 'desc',
        per_page: perPage,
      });

      console.log(`✅ Found ${response.data.items.length} issues`);

      const issues = response.data.items.filter(item => !item.pull_request);
      const transformedIssues = transformIssues(issues);

      // Cache the results
      searchCache.set(cacheKey, { data: transformedIssues, timestamp: Date.now() });
      
      return transformedIssues;

    } catch (error: any) {
      const isSecondaryRateLimit = error.status === 403 && 
        error.message?.includes('secondary rate limit');
      
      const isPrimaryRateLimit = error.status === 403 && 
        (error.message?.includes('rate limit') || error.message?.includes('API rate limit'));

      if (isSecondaryRateLimit && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(`⏳ Secondary rate limit hit. Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})...`);
        await sleep(delay);
        continue;
      }

      if (isPrimaryRateLimit) {
        throw new Error(
          `GitHub API rate limit exceeded. Please wait a few minutes and try again. ` +
          `Tip: Add a GitHub Personal Access Token in .env to increase your rate limit.`
        );
      }

      console.error('Failed to search issues:', error);
      throw error;
    }
  }

  throw new Error(
    'Failed to search issues after multiple retries. GitHub secondary rate limit is being enforced. ' +
    'Please wait 1-2 minutes before trying again.'
  );
}

/**
 * Transform raw GitHub issues to our format
 */
function transformIssues(items: any[]): GitHubIssue[] {
  return items.map(issue => {
    const repoUrlParts = issue.repository_url.split('/');
    const owner = repoUrlParts[repoUrlParts.length - 2];
    const name = repoUrlParts[repoUrlParts.length - 1];

    return {
      id: issue.id,
      number: issue.number,
      title: issue.title,
      html_url: issue.html_url,
      repository_url: issue.repository_url,
      labels: issue.labels.map((label: any) => ({
        name: typeof label === 'string' ? label : (label.name || ''),
        color: typeof label === 'string' ? '000000' : (label.color || '000000'),
      })),
      state: issue.state,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      body: issue.body,
      user: {
        login: issue.user?.login || 'unknown',
        avatar_url: issue.user?.avatar_url || '',
      },
      comments: issue.comments || 0,
      score: issue.score,
      repo: {
        owner,
        name,
        full_name: `${owner}/${name}`,
      },
    } as GitHubIssue;
  });
}

/**
 * Get appropriate labels based on knowledge level
 */
function getLabelsForKnowledgeLevel(level: string): string[] {
  switch (level) {
    case 'beginner':
      return [
        'good first issue',
        'good-first-issue',
        'beginner-friendly',
        'beginner',
        'easy',
        'starter',
        'newcomer',
      ];
    case 'intermediate':
      return [
        'help wanted',
        'help-wanted',
        'enhancement',
        'feature',
      ];
    case 'advanced':
      return [
        'help wanted',
        'complex',
        'architecture',
        'refactor',
      ];
    case 'expert':
      return [
        'help wanted',
        'hard',
        'complex',
        'architecture',
        'performance',
        'security',
      ];
    default:
      return ['good first issue'];
  }
}

/**
 * Get multiple tech stacks' highest knowledge level
 */
export function getEffectiveKnowledgeLevel(
  techStack: Array<{ name: string; knowledgeLevel: string }>
): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  if (techStack.length === 0) return 'beginner';

  const levels = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  };

  const maxLevel = Math.max(
    ...techStack.map(tech => levels[tech.knowledgeLevel as keyof typeof levels] || 1)
  );

  const levelMap = {
    1: 'beginner' as const,
    2: 'intermediate' as const,
    3: 'advanced' as const,
    4: 'expert' as const,
  };

  return levelMap[maxLevel as keyof typeof levelMap] || 'beginner';
}