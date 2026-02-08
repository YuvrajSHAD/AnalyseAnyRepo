// src/hooks/useRepo.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RepoState } from '@/types/contracts';
import { fetchRepoTree } from '@/services/github/tree';
import { buildRepoIndex } from '@/services/smart-search/indexer';
import { generateTreeDiagram } from '@/lib/tree-builder'; // ✅ ADD THIS

interface RepoStore extends RepoState {
  loadRepo: (owner: string, repo: string, branch?: string) => Promise<void>;
  clearRepo: () => void;
}

export const useRepo = create<RepoStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentRepo: null,
      currentBranch: 'main',
      repoIndex: {
        authentication: [],
        payments: [],
        api: [],
        database: [],
        testing: [],
        config: [],
        other: []
      },
      treeStructure: '', // ✅ ADD THIS
      isIndexing: false,
      error: null,
      
      // Load repo action
      loadRepo: async (owner: string, repo: string, branch: string = 'main') => {
        const newRepoName = `${owner}/${repo}`;
        const currentState = get();
        
        // Check if repo is already loaded
        if (currentState.currentRepo === newRepoName && 
            currentState.currentBranch === branch &&
            currentState.repoIndex.authentication.length > 0) {
          console.log('✅ Repo already loaded from cache!');
          return;
        }
        
        set({ isIndexing: true, error: null });
        
        try {
          console.log(`🚀 Loading repo: ${owner}/${repo}@${branch}`);
          
          // Step 1: Fetch repo tree
          const tree = await fetchRepoTree(owner, repo, branch);
          console.log(`✅ Fetched ${tree.length} files`);
          
          // Step 2: Build smart index
          const index = await buildRepoIndex(tree, owner, repo, branch);
          console.log('✅ Index built:', index);
          
          // ✅ Step 3: Generate tree structure
          const allPaths = tree.map((item) => item.path);
          const treeStructure = generateTreeDiagram(allPaths, 4);
          console.log('🌳 Tree structure generated');
          
          set({
            currentRepo: newRepoName,
            currentBranch: branch,
            repoIndex: index,
            treeStructure, // ✅ ADD THIS
            isIndexing: false,
            error: null
          });
          
          console.log('✅ Repo loaded and cached!');
        } catch (error: any) {
          console.error('❌ Failed to load repo:', error);
          set({
            isIndexing: false,
            error: error.message
          });
        }
      },
      
      // Clear repo action
      clearRepo: () => {
        set({
          currentRepo: null,
          currentBranch: 'main',
          repoIndex: {
            authentication: [],
            payments: [],
            api: [],
            database: [],
            testing: [],
            config: [],
            other: []
          },
          treeStructure: '', // ✅ ADD THIS
          isIndexing: false,
          error: null
        });
      }
    }),
    {
      name: 'contexthub-repo-storage',
      partialize: (state) => ({
        currentRepo: state.currentRepo,
        currentBranch: state.currentBranch,
        repoIndex: state.repoIndex,
        treeStructure: state.treeStructure, // ✅ ADD THIS
      }),
    }
  )
);
