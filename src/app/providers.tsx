// src/app/providers.tsx
'use client';

import { TamboProvider } from '@tambo-ai/react';
import { components } from '@/lib/tambo-registry';
import { useRepo } from '@/hooks/useRepo';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * FIXED: Enhanced Tambo Provider with state-aware context helpers
 * Following Tambo docs: https://docs.tambo.co/guides/give-context/make-ai-aware-of-state
 */
export default function Providers({ children }: ProvidersProps) {
  const { currentRepo, currentBranch, repoIndex, treeStructure } = useRepo();

  /**
   * Context helper for repository data
   * This makes the AI aware of the current repository state
   */
  const getRepoContext = () => {
    if (!currentRepo) {
      return 'No repository loaded. Please load a repository first by using the input field.';
    }

    const authCount = repoIndex.authentication?.length || 0;
    const apiCount = repoIndex.api?.length || 0;
    const dbCount = repoIndex.database?.length || 0;
    const totalCount = Object.values(repoIndex).flat().length || 0;

    return `Currently viewing repository: ${currentRepo}
Branch: ${currentBranch}
Total indexed files: ${totalCount}

File categories:
- Authentication: ${authCount} files
- API/Routes: ${apiCount} files  
- Database: ${dbCount} files
- Other: ${totalCount - authCount - apiCount - dbCount} files

The repository structure is available and you can use DiagramCard to display it.
When users ask about files, use FileDetailCard to display file contents.
For pull requests, use PRListCard, PRDetailCard, or PRFilesCard.`;
  };

  /**
   * Context helper for available actions
   * Helps AI suggest what users can do
   */
  const getAvailableActions = () => {
    if (!currentRepo) {
      return `Available actions:
- Load a repository by entering "owner/repo" in the input
- Examples: "tensorflow/tensorflow", "facebook/react", "microsoft/vscode"`;
    }

    return `Available actions with ${currentRepo}:
- View file structure: "show repository structure"
- Read files: "show README.md", "open setup.py"
- Search code: "find authentication code", "search for database queries"
- View PRs: "show pull requests", "list open PRs"
- Analyze dependencies: "show package dependencies"
- Ask questions: "what does this repo do?", "how is authentication handled?"

All components are interactable - users can click on files, PRs, and use "Ask AI" buttons.`;
  };

  return (
    <TamboProvider
      apiKey={import.meta.env.VITE_TAMBO_API_KEY!}
      components={components}
      contextHelpers={{
        repositoryData: getRepoContext,
        availableActions: getAvailableActions,
      }}
    >
      {children}
    </TamboProvider>
  );
}