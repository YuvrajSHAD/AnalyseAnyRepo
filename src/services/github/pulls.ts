// src/services/github/pulls.ts
import { octokit } from './client';

export interface PullRequestListItem {
  number: number;
  title: string;
  state: 'open' | 'closed';
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  draft: boolean;
  labels: Array<{ name: string; color: string }>;
  html_url: string;
}

export interface PullRequest extends PullRequestListItem {
  additions: number;
  deletions: number;
  changed_files: number;
  body: string;
  commits: number;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
}

export interface PRFile {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

/**
 * Fetch list of pull requests
 */
export async function fetchPullRequests(
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'all',
  per_page: number = 30
): Promise<PullRequestListItem[]> {
  try {
    console.log(`📋 Fetching PRs: ${owner}/${repo} (${state})`);

    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state,
      per_page,
      sort: 'updated',
      direction: 'desc',
    });

    console.log(`✅ Fetched ${data.length} PRs`);
    return data as PullRequestListItem[];
  } catch (error: any) {
    console.error('❌ Failed to fetch PRs:', error);
    if (error.status === 404) {
      throw new Error(`Repository ${owner}/${repo} not found`);
    } else if (error.status === 403) {
      throw new Error('GitHub API rate limit exceeded');
    }
    throw new Error(`Failed to fetch PRs: ${error.message}`);
  }
}

/**
 * Fetch single pull request details
 */
export async function fetchPullRequest(
  owner: string,
  repo: string,
  pull_number: number
): Promise<PullRequest> {
  try {
    console.log(`🔍 Fetching PR #${pull_number}: ${owner}/${repo}`);

    const { data } = await octokit.pulls.get({
      owner,
      repo,
      pull_number,
    });

    console.log(`✅ Fetched PR #${pull_number}`);
    return data as PullRequest;
  } catch (error: any) {
    console.error(`❌ Failed to fetch PR #${pull_number}:`, error);
    if (error.status === 404) {
      throw new Error(`PR #${pull_number} not found`);
    } else if (error.status === 403) {
      throw new Error('GitHub API rate limit exceeded');
    }
    throw new Error(`Failed to fetch PR: ${error.message}`);
  }
}

/**
 * Fetch files changed in a pull request
 */
export async function fetchPullRequestFiles(
  owner: string,
  repo: string,
  pull_number: number
): Promise<PRFile[]> {
  try {
    console.log(`📁 Fetching PR #${pull_number} files: ${owner}/${repo}`);

    const { data } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number,
      per_page: 100,
    });

    console.log(`✅ Fetched ${data.length} changed files`);
    return data as PRFile[];
  } catch (error: any) {
    console.error(`❌ Failed to fetch PR files:`, error);
    if (error.status === 404) {
      throw new Error(`PR #${pull_number} not found`);
    } else if (error.status === 403) {
      throw new Error('GitHub API rate limit exceeded');
    }
    throw new Error(`Failed to fetch PR files: ${error.message}`);
  }
}
