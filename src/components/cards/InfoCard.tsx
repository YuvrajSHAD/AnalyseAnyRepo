// src/components/cards/InfoCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface InfoCardProps {
  title?: string | null;
  content?: string | null;
}

export default function InfoCard({ 
  title = null, 
  content = null 
}: InfoCardProps) {
  // Don't render if both are empty/null
  if (!title && !content) {
    return null;
  }

  // Don't render if content is empty (title alone isn't useful)
  if (!content) {
    return null;
  }

  const displayTitle = title || 'Information';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          {displayTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
