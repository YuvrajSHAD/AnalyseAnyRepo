// src/components/QuickPrompt.tsx
'use client';

import { Button } from '@/components/ui/button';
import { FileText, GitBranch, GitPullRequest, Compass } from 'lucide-react';
import { useTamboThreadInput } from '@tambo-ai/react';
import { useState } from 'react';

interface QuickPromptsProps {
  onPromptClick?: (prompt: string) => void;
}

/**
 * QuickPrompts - 4 Fixed Essential Actions
 * Clean, simple, always visible below chat input
 */
export default function QuickPrompts({ onPromptClick }: QuickPromptsProps) {
  const { setValue, submit } = useTamboThreadInput();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FIXED prompts - these never change
  const prompts = [
    {
      id: 'readme',
      label: 'README Summary',
      icon: FileText,
      prompt: 'Show me the README summary',
      description: 'View smart README overview'
    },
    {
      id: 'structure',
      label: 'Repo Structure',
      icon: GitBranch,
      prompt: 'Show repository structure',
      description: 'View folder structure'
    },
    {
      id: 'prs',
      label: 'Open PRs',
      icon: GitPullRequest,
      prompt: 'Show open pull requests',
      description: 'View open PRs'
    },
    {
      id: 'explore',
      label: 'Explore Issues',
      icon: Compass,
      prompt: 'Show me issues to contribute',
      description: 'Find issues matching your skills'
    },
  ];

  const handlePromptClick = async (prompt: string) => {
    console.log('🎯 Quick prompt clicked:', prompt);
    
    if (onPromptClick) {
      onPromptClick(prompt);
      return;
    }

    setValue(prompt);
    
    try {
      setIsSubmitting(true);
      
      await submit({
        streamResponse: true,
        resourceNames: {},
      });
      
      setValue('');
      console.log('✅ Quick prompt submitted successfully');
    } catch (err) {
      console.error('❌ Failed to submit quick prompt:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* 4-button grid - clean and simple */}
      <div className="grid grid-cols-4 gap-2">
        {prompts.map((promptItem) => {
          const Icon = promptItem.icon;
          
          return (
            <Button
              key={promptItem.id}
              variant="outline"
              size="sm"
              onClick={() => handlePromptClick(promptItem.prompt)}
              disabled={isSubmitting}
              title={promptItem.description}
              className="gap-2 text-xs h-9 px-3 transition-all border-border bg-secondary/50 hover:bg-accent hover:border-primary/50 text-foreground disabled:opacity-50"
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{promptItem.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
