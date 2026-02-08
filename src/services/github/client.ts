// src/services/github/client.ts
// FIXED: Enhanced rate limit checking and warnings

import { Octokit } from '@octokit/rest';

// Initialize Octokit with optional token
export const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN || undefined,
  userAgent: 'ContextHub/1.0.0',
  baseUrl: 'https://api.github.com',
  // Add request retries for transient errors
  retry: {
    enabled: true,
  },
  throttle: {
    onRateLimit: (retryAfter: number, options: any) => {
      console.warn(
        `⚠️ Primary rate limit hit for ${options.method} ${options.url}. ` +
        `Retrying after ${retryAfter} seconds.`
      );
      return true; // Retry once
    },
    onSecondaryRateLimit: (retryAfter: number, options: any) => {
      console.warn(
        `⚠️ Secondary rate limit hit for ${options.method} ${options.url}. ` +
        `This is common for search queries. Retrying after ${retryAfter} seconds.`
      );
      return true; // Retry once
    },
  },
});

export interface RateLimitInfo {
  limit: number;
  used: number;
  remaining: number;
  reset: number;
  percentage: number;
}

/**
 * Check GitHub API rate limit
 * Returns detailed rate limit information
 */
export async function checkRateLimit(): Promise<RateLimitInfo | null> {
  try {
    const { data } = await octokit.rateLimit.get();
    
    const info: RateLimitInfo = {
      limit: data.rate.limit,
      used: data.rate.used,
      remaining: data.rate.remaining,
      reset: data.rate.reset,
      percentage: Math.round((data.rate.remaining / data.rate.limit) * 100),
    };

    console.log('GitHub API Rate Limit:', {
      remaining: info.remaining,
      limit: info.limit,
      reset: new Date(info.reset * 1000),
      percentage: `${info.percentage}%`,
    });

    // Warn if running low
    if (info.percentage < 20) {
      console.warn(
        `⚠️ Low on API requests: ${info.remaining}/${info.limit} remaining. ` +
        `Resets at ${new Date(info.reset * 1000).toLocaleTimeString()}`
      );
      
      if (!import.meta.env.VITE_GITHUB_TOKEN) {
        console.info(
          '💡 Tip: Add a GitHub Personal Access Token to .env as VITE_GITHUB_TOKEN ' +
          'to increase your rate limit from 60/hour to 5000/hour'
        );
      }
    }

    return info;
  } catch (error) {
    console.error('Failed to check rate limit:', error);
    return null;
  }
}