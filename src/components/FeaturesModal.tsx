// src/components/FeaturesModal.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  FileText, 
  GitBranch, 
  Sparkles, 
  Zap, 
  Code2 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FeaturesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FeaturesModal({ open, onOpenChange }: FeaturesModalProps) {
  const features = [
    {
      icon: Search,
      title: 'Intelligent Code Search',
      description: 'Natural language queries to find files instantly',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      icon: FileText,
      title: 'File Viewer',
      description: 'View any file with syntax highlighting and line numbers',
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      icon: GitBranch,
      title: 'Repository Structure',
      description: 'Interactive folder tree and file organization',
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      icon: Sparkles,
      title: 'Dependency Graph',
      description: 'Visual dependency tree and package relationships',
      color: 'text-cyan-500',
      bg: 'bg-cyan-50 dark:bg-cyan-950',
    },
    {
      icon: Zap,
      title: 'Context-Aware AI',
      description: 'Understands your questions and provides relevant answers',
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      icon: Code2,
      title: 'Code Pattern Search',
      description: 'Find patterns, functions, and imports across the repository',
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-950',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-xl z-[200]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Sparkles className="h-6 w-6 text-primary" />
            ContextHub Features
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Powerful tools for exploring and understanding any GitHub repository
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="border-2 border-border hover:border-primary/50 transition-all bg-card">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${feature.bg}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2 text-foreground">{feature.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <Badge className="mt-0.5 bg-primary text-primary-foreground">New</Badge>
            <div>
              <p className="font-semibold mb-1 text-foreground">🔥 Real-time Updates</p>
              <p className="text-sm text-muted-foreground">
                Get instant insights without overwhelming the AI with large datasets.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Badge variant="outline" className="border-border text-foreground">🔥 Lightning Fast</Badge>
          <Badge variant="outline" className="border-border text-foreground">🧠 Context-Aware</Badge>
          <Badge variant="outline" className="border-border text-foreground">🎨 Zero Setup</Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
}
