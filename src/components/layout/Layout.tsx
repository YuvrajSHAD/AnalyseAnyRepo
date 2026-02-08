import TopBar from './TopBar'
import { Sidebar } from './Sidebar'
import { useRepo } from '@/hooks/useRepo'
import { MessageThreadPanel } from '../tambo/message-thread-panel'
import { CanvasSpace } from "@/components/tambo/canvas-space";
import { useTamboThread } from '@tambo-ai/react';

export function Layout() {
  const currentRepo = useRepo((state) => state.currentRepo)
  const isIndexing = useRepo((state) => state.isIndexing)
  const { thread } = useTamboThread();
  
  // Check if there's any rendered component in the thread
  const hasRenderedComponent = thread?.messages?.some((msg: any) => msg.renderedComponent);
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <TopBar />
      
      {/* Main Content: Chat + Canvas Space OR Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat Area - Using Tambo's max-w-xl for ~30% width */}
        <MessageThreadPanel className="max-w-xl" />
        
        {/* Right: Canvas Space OR Sidebar - Takes remaining ~70% */}
        <div className="flex-1 relative">
          {hasRenderedComponent ? (
            /* Show Canvas Space when there's a rendered component */
            <CanvasSpace className="absolute inset-0 w-full h-full" />
          ) : (
            /* Show Sidebar when there's no rendered component */
            <Sidebar />
          )}
        </div>
      </div>
      
      {/* Loading Overlay */}
      {isIndexing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-8 text-center border border-border">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-foreground">Analyzing Repository...</p>
            <p className="text-sm text-muted-foreground mt-2">This may take 30-60 seconds</p>
          </div>
        </div>
      )}
    </div>
  )
}