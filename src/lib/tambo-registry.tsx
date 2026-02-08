// src/lib/tambo-registry.tsx - UPDATED with IssueExplorerResultsCard
import { z } from 'zod';
import type { TamboComponent } from "@tambo-ai/react";
import ListCard from '@/components/cards/ListCard';
import InfoCard from '@/components/cards/InfoCard';
import DiagramCard from '@/components/cards/DiagramCard';
import FileDetailCard from '@/components/cards/FileDetailCard';
import READMESummaryCard from '@/components/cards/READMESummaryCard';
import DependencyGraphCard from '@/components/cards/DependencyGraphCard';
import QuickLinksCard from '@/components/cards/QuickLinksCard';
import PRListCard from '@/components/cards/PRListCard';
import PRDetailCard from '@/components/cards/PRDetailCard';
import PRFilesCard from '@/components/cards/PRFilesCard';
import IssueExplorerResultsCard from '@/components/cards/IssueExplorerResultsCard';

export const components: TamboComponent[] = [
  {
    name: 'InfoCard',
    description: 'Display text explanations, summaries, or documentation. Use for general answers.',
    component: InfoCard,
    propsSchema: z.object({
      title: z.string().default('Information').describe('Card title'),
      content: z.string().default('').describe('Content to display'),
    }),
  },
  {
    name: 'ListCard',
    description: 'Display lists of files, folders, or functions. Use when showing search results or multiple items.',
    component: ListCard,
    propsSchema: z.object({
      title: z.string().default('Results').describe('Card title'),
      items: z.array(
        z.object({
          name: z.string(),
          path: z.string(),
          type: z.enum(['file', 'folder', 'function']),
        })
      ).default([]).describe('Array of items to display'),
    }),
  },
  {
    name: 'DiagramCard',
    description: 'Display folder structure as ASCII tree. Use when user asks about repository structure. Will auto-load from current repository if no structure provided.',
    component: DiagramCard,
    propsSchema: z.object({
      title: z.string().default('Repository Structure').describe('Title'),
      structure: z.string().default('').describe('ASCII tree structure (leave empty to auto-load from current repo)'),
    }),
  },
  {
    name: 'QuickLinksCard',
    description: 'Display quick access links to important files.',
    component: QuickLinksCard,
    propsSchema: z.object({
      links: z.array(
        z.object({
          label: z.string().default('').describe('Link label'),
          path: z.string().default('').describe('File path'),
          category: z.enum(['entry', 'config', 'test', 'important']).default('entry').describe('Link category'),
        })
      ).default([]).describe('Array of quick links'),
      title: z.string().default('Quick Links').describe('Card title'),
    }),
  },
  {
    name: 'FileDetailCard',
    description: `Display and analyze file content from the repository.
                  
                  ## When to Use:
                  ✅ User asks to see/open/display a file: "show setup.py", "display README.md"
                  ✅ User asks about file content: "what's in requirements.txt"
                  ✅ User wants file explanation: "explain the setup.py file"
                  
                  ## How to Use:
                  1. Extract FULL filename WITH extension
                    - "show setup.py" → filename: "setup.py" ✅
                    - "display setup" → filename: "setup.py" ✅ (add .py)
                    - "open README" → filename: "README.md" ✅ (add .md)
                  
                  2. Include path for subdirectories
                    - "show src/main.py" → filename: "src/main.py"
                    - "open tests/test_utils.py" → filename: "tests/test_utils.py"
                  
                  3. After displaying file, provide analysis:
                    - If README: Summarize what the repo does (2-3 sentences)
                    - If setup.py/requirements.txt: List key dependencies
                    - If code file: Explain main functions/classes
                  
                  ## Common Filename Patterns:
                  - README → README.md
                  - setup → setup.py
                  - requirements → requirements.txt
                  - config → config.yaml or config.json
                  - package → package.json
                  - .env.example → .env.example (keep as-is)`,
    component: FileDetailCard,
    propsSchema: z.object({
      filename: z.string().default('README.md').describe(
        `Full filename WITH extension (e.g., "setup.py", "README.md", "src/utils.py").
        
        Auto-add common extensions:
        - "setup" → "setup.py"
        - "README" → "README.md"
        - "requirements" → "requirements.txt"
        - "package" → "package.json"`
      ),
      repo: z.string().default('').describe('Repository (owner/repo). Leave empty to use current repo.'),
    }),
  },
  {
    name: 'READMESummaryCard',
    description: `Display README as a smart summary with key points. This is the ONLY README component to use.
                  
                  ## When to Use:
                  ✅ User clicks on README in sidebar/landing page
                  ✅ User asks "show README", "what does this repo do?"
                  ✅ User asks "show summary readme.md"
                  ✅ ANY README-related request
                  
                  ## Features:
                  - Shows 5 key bullet points automatically
                  - Expandable to show full README content
                  - Clean, scannable format
                  - GitHub-style presentation
                  
                  ## IMPORTANT:
                  - This is now the ONLY README component
                  - Do NOT use full README view by default
                  - User can expand to see full content if needed`,
    component: READMESummaryCard,
    propsSchema: z.object({
      repo: z.string().default('').describe('Repository (owner/repo). Leave empty to auto-detect from currently loaded repo.'),
      branch: z.string().default('main').describe('Branch name. Leave empty to use currently loaded branch.'),
      maxBullets: z.number().default(5).describe('Maximum number of summary points to show (default: 5)'),
    }),
  },
  {
    name: 'DependencyGraphCard',
    description: 'Show dependency tree from package.json. Use when user asks about dependencies. repo/branch will auto-detect from current loaded repository.',
    component: DependencyGraphCard,
    propsSchema: z.object({
      repo: z.string().default('').describe('Repository (owner/repo). Leave empty to auto-detect from currently loaded repo.'),
      branch: z.string().default('main').describe('Branch name. Leave empty to use currently loaded branch.'),
      focusFile: z.string().default('').describe('Optional file to focus on'),
      depth: z.number().default(2).describe('Depth of dependency tree (defaults to 2)'),
    }),
  },
  {
    name: 'PRListCard',
    description: 'Display list of pull requests. Use when user asks "show PRs", "list pull requests", "open PRs". Do not add any other components after this.',
    component: PRListCard,
    propsSchema: z.object({
      repo: z.string().default('').describe('Repository (owner/repo). Leave empty to use current repo.'),
      state: z.enum(['open', 'closed', 'all']).default('all').describe('Filter by state: open, closed, or all'),
      limit: z.number().default(100).describe('Maximum number of PRs to fetch (default: 100)'),
    }),
  },
  {
    name: 'PRDetailCard',
    description: 'Display detailed information about a specific pull request. Extract PR number from query.',
    component: PRDetailCard,
    propsSchema: z.object({
      prNumber: z.number().int().positive().describe('PR number as positive integer. Extract from: "PR #97"→97, "show PR 45"→45'),
      repo: z.string().default('').describe('Repository (owner/repo). Leave empty to use current repo.'),
    }),
  },
  {
    name: 'PRFilesCard',
    description: 'Display files changed in a pull request. Extract PR number from query.',
    component: PRFilesCard,
    propsSchema: z.object({
      prNumber: z.number().int().positive().describe('PR number as positive integer. Extract from: "PR #97"→97, "files in PR 45"→45'),
      repo: z.string().default('').describe('Repository (owner/repo). Leave empty to use current repo.'),
    }),
  },
  {
    name: 'IssueExplorerResultsCard',
    description: `Display GitHub issues matching user's skills and knowledge level from across ALL of GitHub.
                  
                  ## When to Use:
                  ✅ User asks to "explore issues", "find issues to contribute", "show me issues"
                  ✅ User wants to contribute to open source
                  ✅ User is looking for contribution opportunities
                  ✅ User clicks "Start Exploring" button
                  
                  ## How it Works:
                  1. Automatically loads on render (autoLoad: true by default)
                  2. Reads user's onboarding profile (skills, tech stack, knowledge level)
                  3. Searches ALL GitHub repositories for relevant open issues
                  4. Scores and filters issues based on skill match and difficulty
                  5. Shows top 10 best matches with navigation
                  6. Displays match reasons and difficulty indicators
                  
                  ## Features:
                  - Searches across ALL GitHub (not limited to current repo)
                  - Auto-loads issues on render (no button needed)
                  - Shows one issue at a time with Previous/Next navigation
                  - Displays why each issue matches the user's skills
                  - Color-coded difficulty badges (Beginner, Intermediate, Advanced)
                  - Links directly to GitHub issue page
                  
                  ## Important Notes:
                  - Requires user to complete onboarding first
                  - If onboarding not completed, shows error message
                  - Issues are loaded automatically when component renders
                  - Always searches ALL GitHub repos (ignores repoUrl parameter)
                  
                  ## Example Usage by Tambo AI:
                  User: "I want to explore open source issues to contribute"
                  Tambo: "I'll pull up an issue explorer for this repository so you can browse open issues that match your skills."
                  Tambo: [Renders IssueExplorerResultsCard with autoLoad: true]
                  → Component automatically fetches and displays issues`,
    component: IssueExplorerResultsCard,
    propsSchema: z.object({
      autoLoad: z.boolean().default(true).describe(
        `Whether to automatically load issues when component mounts.
        
        - true (default): Issues load automatically when rendered
        - false: User must manually trigger loading
        
        For Tambo AI: Always use true (default) so issues appear immediately.`
      ),
      repoUrl: z.string().optional().nullable().describe(
        `Repository URL - IGNORED for global search.
        
        This parameter exists for backward compatibility but is NOT used.
        The component ALWAYS searches across ALL GitHub repositories.
        
        Leave as null/undefined.`
      ),
    }),
  },
];