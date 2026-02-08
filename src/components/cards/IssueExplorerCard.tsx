// src/components/cards/IssueExplorerCard.tsx
// SIMPLIFIED: Just a button that triggers Tambo AI to render IssueExplorerResultsCard
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, GitPullRequest, Sparkles } from 'lucide-react';
import { userProfileStorage } from '@/services/storage/userProfile';
import { useState, useEffect } from 'react';
import { useTamboThreadInput } from '@tambo-ai/react';

interface IssueExplorerCardProps {
  repoUrl?: string | null;
}

export default function IssueExplorerCard({ repoUrl }: IssueExplorerCardProps) {
  const [profile, setProfile] = useState<any>(null);
  const { setValue, submit } = useTamboThreadInput();

  // Load profile on mount
  useEffect(() => {
    const userProfile = userProfileStorage.get();
    setProfile(userProfile);
  }, []);

  // Helper to send query to Tambo
  const askTambo = (query: string) => {
    setValue(query);
    setTimeout(() => submit(), 100);
  };

  const handleStartExploring = () => {
    // Send message to Tambo AI to render the IssueExplorerResultsCard
    askTambo("I want to explore open source issues to contribute. Show me issues that match my skills and knowledge level.");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitPullRequest className="h-5 w-5" />
          Explore Issues to Contribute
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8 space-y-4">
          <Star className="h-12 w-12 text-primary mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Ready to contribute?
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Find open source issues across GitHub matched to your skills
            </p>
          </div>

          {profile && profile.hasCompleted ? (
            <>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-2">Your skills:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {profile.techStack.slice(0, 3).map((tech: any) => (
                    <Badge key={tech.name} variant="secondary" className="text-xs">
                      {tech.name}
                    </Badge>
                  ))}
                  {profile.techStack.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.techStack.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <Button 
                onClick={handleStartExploring} 
                className="gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              >
                <Sparkles className="h-4 w-4" />
                Start Exploring
              </Button>
            </>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                ⚠️ Please complete onboarding first
              </p>
              <p className="text-xs text-muted-foreground">
                We need to know your skills and experience level to find the best issues for you.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}