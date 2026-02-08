// src/services/storage/userProfile.ts

import type { UserProfile } from '@/types/onboarding';

const STORAGE_KEY = 'tambo_user_profile';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export const userProfileStorage = {
  get(): UserProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const profile = JSON.parse(stored) as UserProfile;
      
      // Check if profile is stale (30 days old)
      const isStale = Date.now() - profile.lastUpdated > CACHE_DURATION;
      if (isStale) {
        this.clear();
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Failed to read user profile:', error);
      return null;
    }
  },

  set(profile: Omit<UserProfile, 'lastUpdated'>): void {
    try {
      const profileWithTimestamp: UserProfile = {
        ...profile,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profileWithTimestamp));
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  },

  update(updates: Partial<Omit<UserProfile, 'lastUpdated'>>): void {
    const current = this.get();
    if (!current) {
      console.warn('Cannot update: No existing profile found');
      return;
    }

    this.set({
      ...current,
      ...updates,
    });
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  hasCompleted(): boolean {
    const profile = this.get();
    return profile?.hasCompleted ?? false;
  },
};

// Cache for issue results
const ISSUE_CACHE_KEY = 'tambo_issue_cache';
const ISSUE_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export interface IssueCache {
  issues: any[];
  timestamp: number;
  profileHash: string; // Hash of user profile to invalidate on profile change
}

export const issueCacheStorage = {
  get(profileHash: string): any[] | null {
    try {
      const stored = localStorage.getItem(ISSUE_CACHE_KEY);
      if (!stored) return null;

      const cache = JSON.parse(stored) as IssueCache;
      
      // Check if cache is stale or profile changed
      const isStale = Date.now() - cache.timestamp > ISSUE_CACHE_DURATION;
      const profileChanged = cache.profileHash !== profileHash;
      
      if (isStale || profileChanged) {
        this.clear();
        return null;
      }

      return cache.issues;
    } catch (error) {
      console.error('Failed to read issue cache:', error);
      return null;
    }
  },

  set(issues: any[], profileHash: string): void {
    try {
      const cache: IssueCache = {
        issues,
        timestamp: Date.now(),
        profileHash,
      };
      localStorage.setItem(ISSUE_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to save issue cache:', error);
    }
  },

  clear(): void {
    localStorage.removeItem(ISSUE_CACHE_KEY);
  },
};
