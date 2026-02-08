// Interface contract between Person 1 (backend) and Person 2 (frontend)

export interface FileMetadata {
  path: string;
  content?: string;
  keywords: string[];
  imports: string[];
  exports: string[];
  functions: string[];
  category: 'auth' | 'payment' | 'api' | 'database' | 'testing' | 'config' | 'other';
  score?: number;
}

export interface RepoIndex {
  authentication: FileMetadata[];
  payments: FileMetadata[];
  api: FileMetadata[];
  database: FileMetadata[];
  testing: FileMetadata[];
  config: FileMetadata[];
  other: FileMetadata[];
}

export interface RepoState {
  currentRepo: string | null;
  currentBranch: string;
  repoIndex: RepoIndex;
  treeStructure: string; // ✅ ADD THIS LINE
  isIndexing: boolean;
  error: string | null;
}

export interface PRData {
  number: number;
  title: string;
  author: string;
  state: 'open' | 'closed' | 'merged';
  filesChanged: number;
  additions: number;
  deletions: number;
  changedFiles: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
  }>;
}
