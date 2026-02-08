// src/components/layout/TopBar.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Github,
  Settings,
  User,
  LogOut,
  Sparkles,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import FeaturesModal from '@/components/FeaturesModal';
import { useRepo } from '@/hooks/useRepo';

export default function TopBar() {
  const [showFeatures, setShowFeatures] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const { loadRepo, clearRepo, currentRepo, currentBranch, isIndexing } = useRepo();

  const handleLoadRepo = async () => {
    // Parse GitHub URL: https://github.com/owner/repo
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    
    if (!match) {
      alert('Invalid GitHub URL.\nFormat: https://github.com/owner/repo');
      return;
    }

    try {
      const [, owner, repo] = match;
      await loadRepo(owner, repo.replace('.git', ''), 'main');
      setRepoUrl(''); // Clear input after loading
      setIsEditing(false); // Exit edit mode
    } catch (error: any) {
      alert(`Failed to load repository:\n${error.message}`);
    }
  };

  const handleReloadRepo = () => {
    clearRepo(); // Clear cache
    setIsEditing(true); // Show input field
    setRepoUrl(`https://github.com/${currentRepo}`); // Pre-fill current repo
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setRepoUrl('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && repoUrl.trim()) {
      handleLoadRepo();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <>
      <div className="sticky top-0 z-[100] w-full border-b border-border bg-background">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 gap-4">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Github className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:block">ContextHub</span>
          </div>

          {/* Center Section - Repo Loader or Current Repo */}
          <div className="flex-1 max-w-2xl">
            {currentRepo && !isEditing ? (
              // Show current repo info with reload button
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                <Github className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-mono text-sm truncate">{currentRepo}</span>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {currentBranch}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReloadRepo}
                  className="ml-auto flex-shrink-0"
                  title="Load different repository"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // Show repo input with load button
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="https://github.com/owner/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isIndexing}
                    className="pr-8"
                  />
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Button 
                  onClick={handleLoadRepo} 
                  disabled={isIndexing || !repoUrl.trim()}
                  className="flex-shrink-0"
                >
                  {isIndexing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load Repo'
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Features Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFeatures(true)}
              className="hidden md:flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Features
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Settings className="h-5 w-5" />
            </Button>

            {/* User Menu - Fixed with solid background */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-lg z-[200]">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowFeatures(true)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Features
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Loading Progress Bar */}
        {isIndexing && (
          <div className="h-1 w-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" style={{ width: '70%' }} />
          </div>
        )}
      </div>

      {/* Features Modal - Fixed z-index */}
      <FeaturesModal open={showFeatures} onOpenChange={setShowFeatures} />
    </>
  );
}