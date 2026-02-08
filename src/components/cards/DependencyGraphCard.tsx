// src/components/cards/DependencyGraphCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { useRepo } from '@/hooks/useRepo';
import { fetchPackageJSON } from '@/services/github/content';

interface Dependency {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
}

interface DependencyGraphCardProps {
  repo?: string;
  branch?: string;
  focusFile?: string;
  depth?: number;
}

export default function DependencyGraphCard({
  repo: propRepo = '',
  branch: propBranch = '',
  focusFile = '',
  depth = 2,
}: DependencyGraphCardProps) {
  const storeRepo = useRepo((state) => state.currentRepo);
  const storeBranch = useRepo((state) => state.currentBranch);
  
  const repo = propRepo || storeRepo || '';
  const branch = propBranch || storeBranch || 'main';

  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 DependencyGraphCard mounted with:', { repo, branch });
    
    if (repo && repo.trim() !== '') {
      fetchDependencies();
    } else {
      console.warn('⚠️ No repository provided');
      setError('No repository loaded');
      setLoading(false);
    }
  }, [repo, branch]);

  const fetchDependencies = async () => {
    if (!repo || repo.trim() === '') return;
    
    setLoading(true);
    setError(null);

    try {
      // Parse owner/repo
      const parts = repo.split('/');
      const owner = parts[0];
      const repoName = parts.slice(1).join('/');
      
      console.log('🔍 Parsed repo:', { owner, repoName, branch });
      
      if (!owner || !repoName) {
        throw new Error('Invalid repository format. Expected: owner/repo');
      }

      // ✅ Use Octokit with authentication
      const pkg = await fetchPackageJSON(owner, repoName, branch);
      const deps: Dependency[] = [];

      if (pkg.dependencies) {
        Object.entries(pkg.dependencies).forEach(([name, version]) => {
          deps.push({ name, version: version as string, type: 'dependency' });
        });
      }

      if (pkg.devDependencies) {
        Object.entries(pkg.devDependencies).forEach(([name, version]) => {
          deps.push({ name, version: version as string, type: 'devDependency' });
        });
      }

      if (pkg.peerDependencies) {
        Object.entries(pkg.peerDependencies).forEach(([name, version]) => {
          deps.push({ name, version: version as string, type: 'peerDependency' });
        });
      }

      console.log(`✅ Loaded ${deps.length} dependencies`);
      setDependencies(deps);
    } catch (err) {
      console.error('❌ Failed to fetch dependencies:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dependencies';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Package className="h-5 w-5" />
            Error Loading Dependencies
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const prodDeps = dependencies.filter(d => d.type === 'dependency');
  const devDeps = dependencies.filter(d => d.type === 'devDependency');
  const peerDeps = dependencies.filter(d => d.type === 'peerDependency');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Dependencies
        </CardTitle>
        <CardDescription>
          {prodDeps.length} production • {devDeps.length} development
          {peerDeps.length > 0 && ` • ${peerDeps.length} peer`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {prodDeps.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Production Dependencies
              </h4>
              <div className="flex flex-wrap gap-2">
                {prodDeps.map((dep, i) => (
                  <Badge key={i} variant="default" className="text-xs">
                    {dep.name}@{dep.version}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {devDeps.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                Development Dependencies
              </h4>
              <div className="flex flex-wrap gap-2">
                {devDeps.map((dep, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {dep.name}@{dep.version}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {peerDeps.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Peer Dependencies
              </h4>
              <div className="flex flex-wrap gap-2">
                {peerDeps.map((dep, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {dep.name}@{dep.version}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {dependencies.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No dependencies found in package.json</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
