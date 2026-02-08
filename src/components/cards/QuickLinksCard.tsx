// src/components/cards/QuickLinksCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCode, Settings, TestTube, Star } from 'lucide-react';

interface QuickLink {
  label: string;
  path: string;
  category: 'entry' | 'config' | 'test' | 'important';
}

interface QuickLinksCardProps {
  links?: QuickLink[];
  title?: string;
}

export default function QuickLinksCard({ 
  links = [], 
  title = 'Quick Links' 
}: QuickLinksCardProps) {
  const getIcon = (category: string) => {
    switch (category) {
      case 'entry': return <FileCode className="h-4 w-4 text-blue-500" />;
      case 'config': return <Settings className="h-4 w-4 text-gray-500" />;
      case 'test': return <TestTube className="h-4 w-4 text-green-500" />;
      case 'important': return <Star className="h-4 w-4 text-yellow-500" />;
      default: return <FileCode className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'entry': return 'bg-blue-50 border-blue-200';
      case 'config': return 'bg-gray-50 border-gray-200';
      case 'test': return 'bg-green-50 border-green-200';
      case 'important': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No quick links available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${getCategoryColor(link.category)}`}
              >
                {getIcon(link.category)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900">{link.label || 'Unnamed'}</div>
                  <div className="text-xs text-gray-600 font-mono truncate">{link.path || 'No path'}</div>
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {link.category}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
