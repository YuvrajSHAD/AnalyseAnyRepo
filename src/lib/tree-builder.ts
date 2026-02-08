// src/lib/tree-builder.ts
export function generateTreeDiagram(paths: string[], maxDepth: number = 4): string {
  if (!paths || paths.length === 0) {
    return 'No files found';
  }

  // Build tree structure
  interface TreeNode {
    [key: string]: TreeNode | null;
  }

  const tree: TreeNode = {};

  paths.forEach((path) => {
    const parts = path.split('/');
    let current: TreeNode = tree;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {};
      }
      if (current[part] !== null) {
        current = current[part] as TreeNode;
      }
    });
  });

  // Convert tree to ASCII
  function buildAscii(obj: TreeNode, prefix: string = '', depth: number = 0): string {
    if (depth >= maxDepth) return '';
    
    const entries = Object.entries(obj).sort(([a], [b]) => a.localeCompare(b));
    let result = '';

    entries.forEach(([name, value], index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const icon = value === null ? '📄 ' : '📁 ';
      
      result += prefix + connector + icon + name + '\n';

      if (value !== null && typeof value === 'object') {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        result += buildAscii(value, newPrefix, depth + 1);
      }
    });

    return result;
  }

  return buildAscii(tree).trim();
}
