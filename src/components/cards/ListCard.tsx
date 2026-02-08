// src/components/cards/ListCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Folder, Code } from 'lucide-react';

interface ListItem {
  name: string;
  path: string;
  type: 'file' | 'folder' | 'function';
}

interface ListCardProps {
  title?: string | null;
  items?: ListItem[] | null;
}

export default function ListCard({ 
  title = null, 
  items = null 
}: ListCardProps) {
  // Don't render if items is null/empty
  if (!items || items.length === 0) {
    return null;
  }

  const displayTitle = title || 'Items';

  const getIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return <Folder className="h-4 w-4" />;
      case 'function':
        return <Code className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{displayTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
            >
              {getIcon(item.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground truncate">{item.path}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
