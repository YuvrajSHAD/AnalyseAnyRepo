// src/components/layout/Sidebar.tsx
// FIXED: Shows IssueExplorerCard ALWAYS - even without a repo loaded

import { useRepo } from '@/hooks/useRepo'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTamboThreadInput } from '@tambo-ai/react'
import IssueExplorerCard from '@/components/cards/IssueExplorerCard'

export function Sidebar() {
  const currentRepo = useRepo((state) => state.currentRepo)
  const repoIndex = useRepo((state) => state.repoIndex)
  const { setValue, submit } = useTamboThreadInput()
  
  // Helper to send query to Tambo
  const askTambo = (query: string) => {
    setValue(query)
    setTimeout(() => submit(), 100)
  }
  
  // CASE 1: No repo loaded - Show only IssueExplorerCard
  if (!currentRepo) {
    return (
      <div className="w-full h-full bg-background p-6 overflow-y-auto space-y-4">
        <Card className="p-6 text-center bg-card border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Load a repository to see details, or explore open source issues below
          </p>
        </Card>
        
        {/* FIXED: Show IssueExplorerCard even without repo */}
        <IssueExplorerCard repoUrl={null} />
      </div>
    )
  }
  
  // CASE 2: Repo loaded - Show repo cards + IssueExplorerCard with repo filter
  const totalFiles = Object.values(repoIndex).flat().length
  
  return (
    <div className="w-full h-full bg-background p-6 overflow-y-auto space-y-4">
      {/* README Card - CLICKABLE */}
      <Card 
        className="p-4 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all bg-card border-border"
        onClick={() => askTambo("Show me the README.md file content and explain what this repository does")}
      >
        <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
          📄 README
          <Badge variant="outline" className="ml-auto text-xs">Click to view</Badge>
        </h3>
        <p className="text-sm text-muted-foreground">
          Repository: <span className="font-mono text-xs text-foreground">{currentRepo}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Click to see repository documentation
        </p>
      </Card>
      
      {/* Repo Structure Card - CLICKABLE */}
      <Card 
        className="p-4 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all bg-card border-border"
        onClick={() => askTambo("Show me the complete repository folder structure as a tree diagram. Include main directories and important files.")}
      >
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
          📁 Repository Structure
          <Badge variant="outline" className="ml-auto text-xs">Click to view</Badge>
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center p-2 bg-secondary/50 rounded border border-border">
            <span className="text-foreground">🔐 Authentication</span>
            <Badge variant="secondary">{repoIndex.authentication.length}</Badge>
          </div>
          <div className="flex justify-between items-center p-2 bg-secondary/50 rounded border border-border">
            <span className="text-foreground">🌐 API</span>
            <Badge variant="secondary">{repoIndex.api.length}</Badge>
          </div>
          <div className="flex justify-between items-center p-2 bg-secondary/50 rounded border border-border">
            <span className="text-foreground">💾 Database</span>
            <Badge variant="secondary">{repoIndex.database.length}</Badge>
          </div>
          <div className="flex justify-between items-center p-2 bg-secondary/50 rounded border border-border">
            <span className="text-foreground">🧪 Testing</span>
            <Badge variant="secondary">{repoIndex.testing.length}</Badge>
          </div>
          <div className="flex justify-between items-center p-2 bg-secondary/50 rounded border border-border">
            <span className="text-foreground">⚙️ Config</span>
            <Badge variant="secondary">{repoIndex.config.length}</Badge>
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex justify-between font-semibold text-foreground">
              <span>Total Files Analyzed</span>
              <Badge>{totalFiles}</Badge>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Click to see full folder tree
        </p>
      </Card>

      {/* FIXED: Issue Explorer Card with repo filter */}
      <IssueExplorerCard repoUrl={currentRepo} />
    </div>
  )
}