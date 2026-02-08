// src/components/cards/PRFilesCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileCode, FilePlus, FileMinus, FileEdit, AlertCircle, Shield } from 'lucide-react';
import { useRepo } from '@/hooks/useRepo';
import { fetchPullRequestFiles, PRFile } from '@/services/github/pulls';

interface PRFilesCardProps {
  prNumber?: number;
  repo?: string;
}

export default function PRFilesCard({ prNumber, repo: propRepo = '' }: PRFilesCardProps) {
  const storeRepo = useRepo((state) => state.currentRepo);
  const repo = propRepo || storeRepo || '';

  const [files, setFiles] = useState<PRFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validation
    if (!prNumber || prNumber <= 0) {
      setError('Invalid PR number. Please provide a valid PR number (e.g., "show files of PR #97")');
      setLoading(false);
      return;
    }

    if (!repo || !repo.includes('/')) {
      setError(`Invalid repository format: "${repo}". Expected "owner/repo"`);
      setLoading(false);
      return;
    }

    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
      setError(`Could not parse repository: "${repo}"`);
      setLoading(false);
      return;
    }

    fetchFiles();
  }, [repo, prNumber]);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const [owner, repoName] = repo.split('/');
      
      if (!owner || !repoName) {
        throw new Error(`Invalid repository format: "${repo}"`);
      }

      console.log(`📁 Fetching PR #${prNumber} files: ${owner}/${repoName}`);
      
      const data = await fetchPullRequestFiles(owner, repoName, prNumber!);
      setFiles(data);
      
      console.log(`✅ Fetched ${data.length} changed files`);
    } catch (err: any) {
      console.error('❌ Failed to fetch PR files:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <FilePlus className="h-4 w-4 text-green-500" />;
      case 'removed':
        return <FileMinus className="h-4 w-4 text-red-500" />;
      case 'modified':
        return <FileEdit className="h-4 w-4 text-blue-500" />;
      case 'renamed':
        return <FileCode className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileCode className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { text: string; className: string }> = {
      added: { text: 'Added', className: 'bg-green-500/10 text-green-700 border-green-500' },
      removed: { text: 'Removed', className: 'bg-red-500/10 text-red-700 border-red-500' },
      modified: { text: 'Modified', className: 'bg-blue-500/10 text-blue-700 border-blue-500' },
      renamed: { text: 'Renamed', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500' },
    };

    const variant = variants[status] || { text: status, className: '' };

    return (
      <Badge variant="outline" className={`text-xs ${variant.className}`}>
        {variant.text}
      </Badge>
    );
  };

  const isRiskyFile = (filename: string): { risky: boolean; reason: string } => {
    if (filename.includes('auth') || filename.includes('security') || filename.includes('permission')) {
      return { risky: true, reason: 'Security' };
    }
    
    if (filename.match(/\.(env|config|yml|yaml|json)$/i) || filename.includes('settings')) {
      return { risky: true, reason: 'Config' };
    }
    
    if (filename.includes('migration') || filename.includes('schema') || filename.includes('database')) {
      return { risky: true, reason: 'Database' };
    }

    if (filename === 'package.json' || filename === 'requirements.txt' || filename === 'setup.py') {
      return { risky: true, reason: 'Dependencies' };
    }

    return { risky: false, reason: '' };
  };

  const categorizeFiles = () => {
    const risky: PRFile[] = [];
    const large: PRFile[] = [];
    const normal: PRFile[] = [];

    files.forEach((file) => {
      const { risky: isRisky } = isRiskyFile(file.filename);
      const isLarge = file.changes > 100;

      if (isRisky) {
        risky.push(file);
      } else if (isLarge) {
        large.push(file);
      } else {
        normal.push(file);
      }
    });

    return { risky, large, normal };
  };

  if (loading) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Files
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { risky, large, normal } = categorizeFiles();
  const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);

  const FileItem = ({ file }: { file: PRFile }) => {
    const { risky: isRisky, reason } = isRiskyFile(file.filename);

    return (
      <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted transition-colors">
        {getFileIcon(file.status)}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <p className="font-mono text-sm flex-1 truncate">{file.filename}</p>
            {isRisky && (
              <Badge variant="outline" className="text-xs flex-shrink-0 bg-orange-500/10 text-orange-700 border-orange-500">
                <Shield className="h-3 w-3 mr-1" />
                {reason}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(file.status)}
            
            <Badge variant="outline" className="text-xs text-green-600">
              +{file.additions}
            </Badge>
            
            <Badge variant="outline" className="text-xs text-red-600">
              -{file.deletions}
            </Badge>

            {file.changes > 100 && (
              <Badge variant="outline" className="text-xs text-orange-600">
                {file.changes} changes
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          Files Changed in PR #{prNumber}
        </CardTitle>
        <CardDescription>
          {files.length} files • +{totalAdditions} / -{totalDeletions} lines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {risky.length > 0 && (
          <div className="p-3 bg-orange-500/10 border border-orange-500 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <p className="font-semibold text-sm text-orange-700">
                {risky.length} critical {risky.length === 1 ? 'file' : 'files'} changed
              </p>
            </div>
            <p className="text-xs text-orange-600">
              Security, config, or database files modified. Review carefully.
            </p>
          </div>
        )}

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {risky.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                Critical Files ({risky.length})
              </h4>
              <div className="space-y-2">
                {risky.map((file, index) => (
                  <FileItem key={index} file={file} />
                ))}
              </div>
            </div>
          )}

          {large.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FileCode className="h-4 w-4 text-blue-500" />
                Large Changes ({large.length})
              </h4>
              <div className="space-y-2">
                {large.map((file, index) => (
                  <FileItem key={index} file={file} />
                ))}
              </div>
            </div>
          )}

          {normal.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">
                Other Files ({normal.length})
              </h4>
              <div className="space-y-2">
                {normal.map((file, index) => (
                  <FileItem key={index} file={file} />
                ))}
              </div>
            </div>
          )}
        </div>

        {files.length === 0 && (
          <div className="text-center py-8">
            <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No files changed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
