// src/types/onboarding.ts

export type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface TechStack {
  name: string;
  knowledgeLevel: KnowledgeLevel;
}

export interface UserProfile {
  skills: string[]; // e.g., ["React", "TypeScript", "Node.js"]
  techStack: TechStack[];
  hasCompleted: boolean;
  lastUpdated: number;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  repository_url: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
  state: string;
  created_at: string;
  updated_at: string;
  body: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  comments: number;
  score?: number; // For ranking by relevance
  repo?: {
    owner: string;
    name: string;
    full_name: string;
  };
}

export interface IssueMatchResult {
  issue: GitHubIssue;
  matchScore: number;
  matchReasons: string[];
  aiSummary?: string;
}
