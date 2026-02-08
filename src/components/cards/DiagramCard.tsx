// src/components/cards/DiagramCard.tsx
'use client';

import { Card } from '@/components/ui/card';
import { useRepo } from '@/hooks/useRepo';
import FileDetailCard from './FileDetailCard';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface DiagramCardProps {
  title?: string;
  structure?: string;
}

export default function DiagramCard({ 
  title = 'Repository Structure', 
  structure = '' 
}: DiagramCardProps) {
  const storeTreeStructure = useRepo((state) => state.treeStructure);
  const currentRepo = useRepo((state) => state.currentRepo);
  const displayStructure = structure || storeTreeStructure;
  
  const [hoveredFile, setHoveredFile] = useState<string>('');

  // FIXED: Correct path parsing that properly handles nested directories
  const parseTreeForFiles = (treeText: string): Map<string, string> => {
    const fileMap = new Map<string, string>();
    const lines = treeText.split('\n');
    const pathStack: string[] = [];
    
    lines.forEach(line => {
      // Skip empty lines
      if (!line.trim()) return;
      
      // Calculate depth based on indentation
      // Each level of nesting is typically 4 characters (│   or ├── or └── )
      // Root level has depth 1 in the tree format, so subtract 1 to get 0-based depth
      const withoutTreeChars = line.replace(/[├└─│]/g, ' ');
      const leadingSpaces = withoutTreeChars.match(/^\s*/)?.[0].length || 0;
      const depth = Math.floor(leadingSpaces / 4) - 1;
      
      // Extract clean name (remove tree chars and emojis)
      const cleanName = line
        .replace(/^[\s│├└─]+/, '')
        .replace(/📁\s*/g, '')
        .replace(/📄\s*/g, '')
        .trim();
      
      if (!cleanName) return;
      
      // Check if it's a file (has extension) or folder
      const isFile = /\.[a-zA-Z0-9]+$/.test(cleanName);
      
      // Adjust path stack to match current depth
      // The stack should have exactly `depth` elements before we add the current item
      while (pathStack.length > depth) {
        pathStack.pop();
      }
      
      if (isFile) {
        // Build full path from stack + filename
        const fullPath = pathStack.length > 0 
          ? [...pathStack, cleanName].join('/')
          : cleanName;
        
        fileMap.set(cleanName, fullPath);
        
        console.log(`📄 Parsed file: "${cleanName}" → "${fullPath}"`);
      } else {
        // It's a folder, add to stack
        pathStack.push(cleanName);
      }
    });
    
    return fileMap;
  };

  const fileMap = useMemo(() => parseTreeForFiles(displayStructure), [displayStructure]);

  const handleFileClick = (filename: string, fullPath: string) => {
    console.log('📂 File clicked:', {
      filename,
      fullPath,
      repo: currentRepo
    });
    
    // Dispatch custom event to show file detail in canvas
    window.dispatchEvent(
      new CustomEvent('tambo:showComponent', {
        detail: {
          messageId: `file-${fullPath}`,
          component: <FileDetailCard filename={fullPath} repo={currentRepo || undefined} />
        }
      })
    );
  };

  // Make file names clickable in the tree structure
  const renderInteractiveTree = (treeText: string) => {
    const lines = treeText.split('\n');
    
    return lines.map((line, index) => {
      // Extract the filename from the line
      const cleanLine = line
        .replace(/^[\s│├└─]+/, '')
        .replace(/📁\s*/g, '')
        .replace(/📄\s*/g, '')
        .trim();
      
      const isFile = /\.[a-zA-Z0-9]+$/.test(cleanLine);
      
      if (isFile && fileMap.has(cleanLine)) {
        const fullPath = fileMap.get(cleanLine) || '';
        const treeChars = line.substring(0, line.lastIndexOf(cleanLine));
        
        return (
          <div key={index} className="font-mono text-xs">
            <span className="text-muted-foreground">{treeChars}</span>
            <button
              className={cn(
                "cursor-pointer transition-colors inline-block",
                hoveredFile === cleanLine
                  ? 'text-primary underline'
                  : 'text-foreground hover:text-primary'
              )}
              onClick={() => handleFileClick(cleanLine, fullPath)}
              onMouseEnter={() => setHoveredFile(cleanLine)}
              onMouseLeave={() => setHoveredFile('')}
              title={`Click to view ${fullPath}`}
            >
              {cleanLine}
            </button>
          </div>
        );
      }
      
      return (
        <div key={index} className="font-mono text-xs text-foreground">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="w-full max-w-full">
      <Card className="p-4 bg-card border-border">
        <h3 className="font-semibold mb-3 text-foreground">{title}</h3>
        <div className="overflow-x-auto max-w-full">
          <div className="whitespace-pre-wrap break-words">
            {renderInteractiveTree(displayStructure)}
          </div>
        </div>
      </Card>
    </div>
  );
}