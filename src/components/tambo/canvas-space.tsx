"use client";

import type { TamboThreadMessage } from "@tambo-ai/react";
import { useTamboThread } from "@tambo-ai/react";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { History, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Props for the CanvasSpace component
 */
interface CanvasSpaceProps {
  className?: string;
}

interface ComponentHistoryItem {
  id: string;
  component: React.ReactNode;
  messageId?: string;
  timestamp: number;
}

/**
 * FIXED: CanvasSpace with clean navigation bar (History and Clear buttons only)
 * History/Clear are in the compact nav bar, not blocking canvas space
 */
export function CanvasSpace({ className }: CanvasSpaceProps) {
  const { thread } = useTamboThread();

  // Component history management
  const [componentHistory, setComponentHistory] = useState<ComponentHistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [showHistory, setShowHistory] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousThreadId = useRef<string>('');

  /**
   * Clear canvas when switching threads
   */
  useEffect(() => {
    if (!thread || (previousThreadId.current && previousThreadId.current !== thread.id)) {
      setComponentHistory([]);
      setCurrentIndex(-1);
    }
    previousThreadId.current = thread?.id ?? '';
  }, [thread]);

  /**
   * Handle custom tambo:showComponent events
   */
  useEffect(() => {
    const handleShowComponent = (
      event: CustomEvent<{ messageId: string; component: React.ReactNode }>,
    ) => {
      try {
        const newItem: ComponentHistoryItem = {
          id: `${Date.now()}-${Math.random()}`,
          component: event.detail.component,
          messageId: event.detail.messageId,
          timestamp: Date.now(),
        };
        
        // If we're not at the end of history, remove future items
        setComponentHistory(prev => {
          const newHistory = currentIndex >= 0 
            ? [...prev.slice(0, currentIndex + 1), newItem]
            : [...prev, newItem];
          return newHistory;
        });
        
        setCurrentIndex(prev => prev + 1);
      } catch (error) {
        console.error("Failed to render component:", error);
      }
    };

    window.addEventListener(
      "tambo:showComponent",
      handleShowComponent as EventListener,
    );

    return () => {
      window.removeEventListener(
        "tambo:showComponent",
        handleShowComponent as EventListener,
      );
    };
  }, [currentIndex]);

  /**
   * Build history from thread messages
   */
  useEffect(() => {
    if (!thread?.messages) {
      setComponentHistory([]);
      setCurrentIndex(-1);
      return;
    }

    const messagesWithComponents = thread.messages.filter(
      (msg: TamboThreadMessage) => msg.renderedComponent,
    );

    if (messagesWithComponents.length > 0) {
      const items: ComponentHistoryItem[] = messagesWithComponents.map((msg, idx) => ({
        id: `${msg.id || idx}`,
        component: msg.renderedComponent,
        messageId: msg.id,
        timestamp: Date.now() - (messagesWithComponents.length - idx) * 1000,
      }));
      
      setComponentHistory(items);
      setCurrentIndex(items.length - 1);
    }
  }, [thread?.messages]);

  /**
   * Auto-scroll on component change
   */
  useEffect(() => {
    if (scrollContainerRef.current && currentIndex >= 0) {
      const timeoutId = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex]);

  const handleSelectFromHistory = (index: number) => {
    setCurrentIndex(index);
    setShowHistory(false);
  };

  const handleClearCanvas = () => {
    setComponentHistory([]);
    setCurrentIndex(-1);
  };

  const currentComponent = componentHistory[currentIndex] || null;

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-background border-l border-border relative",
        className,
      )}
      data-canvas-space="true"
    >
      {/* FIXED: Clean Navigation Bar - Only History and Clear buttons in compact bar */}
      {componentHistory.length > 0 && (
        <div className="flex-shrink-0 border-b border-border bg-card px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="h-7 px-2.5 gap-1.5 relative"
                title="View component history"
              >
                <History className="h-3.5 w-3.5" />
                <span className="text-xs font-medium text-muted-foreground">
                  History ({componentHistory.length})
                </span>
              </Button>

              <div className="h-4 w-px bg-border mx-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCanvas}
                className="h-7 px-2.5 gap-1.5 hover:bg-destructive/10 hover:text-destructive"
                title="Clear all components"
              >
                <X className="h-3.5 w-3.5" />
                <span className="text-xs">Clear</span>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground hidden sm:block">
              Use "View Component" buttons in chat to display components here
            </p>
          </div>

          {/* History Dropdown */}
          {showHistory && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowHistory(false)}
              />
              
              {/* Dropdown */}
              <div className="absolute top-14 left-4 z-50 bg-card border border-border rounded-md shadow-lg max-h-96 overflow-y-auto w-72">
                <div className="p-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                    Component History ({componentHistory.length})
                  </p>
                  {componentHistory.map((item, index) => {
                    const isActive = index === currentIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectFromHistory(index)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors",
                          isActive && "bg-muted font-medium border-l-2 border-primary"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">
                            Component {index + 1}
                            {isActive && (
                              <span className="text-xs text-primary ml-2">(current)</span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {new Date(item.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="p-6 min-h-full">
          {currentComponent ? (
            <div className="w-full max-w-full mx-auto">
              {currentComponent.component}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6">
              <div className="space-y-3 max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <History className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground">
                  No component displayed
                </p>
                <p className="text-sm text-muted-foreground">
                  Click "View Component" buttons in the chat to display interactive components here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}