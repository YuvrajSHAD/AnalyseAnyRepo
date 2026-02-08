// src/services/issue-matcher/matcher.ts

import type { GitHubIssue, IssueMatchResult, UserProfile } from '@/types/onboarding';

/**
 * Smart matcher that scores issues based on user profile
 * Returns issues sorted by relevance
 */
export function matchIssuesWithProfile(
  issues: GitHubIssue[],
  profile: UserProfile
): IssueMatchResult[] {
  const results: IssueMatchResult[] = [];

  for (const issue of issues) {
    const matchResult = scoreIssue(issue, profile);
    if (matchResult.matchScore > 0) {
      results.push(matchResult);
    }
  }

  // Sort by match score (highest first)
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Score an individual issue based on user profile
 */
function scoreIssue(issue: GitHubIssue, profile: UserProfile): IssueMatchResult {
  let score = 0;
  const reasons: string[] = [];

  // Extract tech keywords from issue title and body
  const issueText = `${issue.title} ${issue.body || ''}`.toLowerCase();
  
  // 1. Check skill set matches (highest weight)
  const skillMatches = profile.skills.filter(skill => 
    issueText.includes(skill.toLowerCase())
  );
  
  if (skillMatches.length > 0) {
    score += skillMatches.length * 10;
    reasons.push(`Matches your skills: ${skillMatches.join(', ')}`);
  }

  // 2. Check tech stack matches (medium-high weight)
  const techMatches = profile.techStack.filter(tech =>
    issueText.includes(tech.name.toLowerCase())
  );

  for (const tech of techMatches) {
    score += 8;
    reasons.push(`Matches ${tech.name} (${tech.knowledgeLevel} level)`);
  }

  // 3. Check labels match knowledge level (medium weight)
  const labelNames = issue.labels.map(l => l.name.toLowerCase());
  const knowledgeLevels = profile.techStack.map(t => t.knowledgeLevel);
  const maxKnowledgeLevel = getMaxKnowledgeLevel(knowledgeLevels);

  const appropriateLabels = getAppropriateLabels(maxKnowledgeLevel);
  const labelMatches = labelNames.filter(label =>
    appropriateLabels.some(appropriate => label.includes(appropriate))
  );

  if (labelMatches.length > 0) {
    score += labelMatches.length * 5;
    reasons.push(`Difficulty matches your level (${maxKnowledgeLevel})`);
  }

  // 4. Penalize old issues (low weight)
  const daysSinceUpdate = getDaysSinceUpdate(issue.updated_at);
  if (daysSinceUpdate > 90) {
    score -= 2;
  } else if (daysSinceUpdate < 7) {
    score += 2;
    reasons.push('Recently active');
  }

  // 5. Prefer issues with some engagement but not too much
  if (issue.comments >= 2 && issue.comments <= 10) {
    score += 3;
    reasons.push('Active discussion');
  } else if (issue.comments === 0) {
    score += 1;
    reasons.push('Fresh issue');
  }

  // 6. Boost good-first-issue for beginners
  if (maxKnowledgeLevel === 'beginner' && 
      labelNames.some(l => l.includes('good') && l.includes('first'))) {
    score += 5;
    reasons.push('Great for beginners');
  }

  return {
    issue,
    matchScore: score,
    matchReasons: reasons,
  };
}

/**
 * Get max knowledge level from array
 */
function getMaxKnowledgeLevel(levels: string[]): string {
  const levelOrder = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  };

  const maxValue = Math.max(...levels.map(l => 
    levelOrder[l as keyof typeof levelOrder] || 1
  ));

  const reverseMap: Record<number, string> = {
    1: 'beginner',
    2: 'intermediate',
    3: 'advanced',
    4: 'expert',
  };

  return reverseMap[maxValue] || 'beginner';
}

/**
 * Get appropriate label keywords for knowledge level
 */
function getAppropriateLabels(level: string): string[] {
  switch (level) {
    case 'beginner':
      return ['good first', 'beginner', 'easy', 'starter', 'newcomer'];
    case 'intermediate':
      return ['help wanted', 'enhancement', 'feature'];
    case 'advanced':
      return ['help wanted', 'complex', 'refactor'];
    case 'expert':
      return ['complex', 'architecture', 'performance', 'security'];
    default:
      return ['good first'];
  }
}

/**
 * Get days since last update
 */
function getDaysSinceUpdate(updatedAt: string): number {
  const updated = new Date(updatedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - updated.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generate profile hash for cache validation
 */
export function generateProfileHash(profile: UserProfile): string {
  const data = {
    skills: profile.skills.sort(),
    techStack: profile.techStack
      .map(t => `${t.name}:${t.knowledgeLevel}`)
      .sort(),
  };
  return JSON.stringify(data);
}
