// src/components/layout/ChatArea.tsx
import { useTamboThread, useTamboThreadInput } from '@tambo-ai/react'
import { useRepo } from '@/hooks/useRepo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import QuickPrompts from '@/components/QuickPrompt'

export function ChatArea() {
  const currentRepo = useRepo((state) => state.currentRepo)
  const tamboThread = useTamboThread()
  const { value, setValue, submit, isPending } = useTamboThreadInput()
  
  const handleSend = async () => {
    if (!value.trim() || !currentRepo) return;
    submit();
  };
  
  if (!currentRepo) {
    return (
      <div className="w-[30%] flex flex-col bg-background border-r border-border h-screen">
        {/* Empty state with Quick Prompts at bottom */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground max-w-xs px-4">
            <h2 className="text-xl font-bold mb-2 text-foreground">💬 Chat</h2>
            <p className="text-sm">Load a repository to start</p>
            <div className="mt-6 text-xs space-y-2">
              <p>✨ Ask questions about code</p>
              <p>🔍 Find files intelligently</p>
              <p>📊 Analyze repository structure</p>
              <p>📝 View PRs and issues</p>
            </div>
          </div>
        </div>

        {/* Quick Prompts visible even without repo */}
        <div className="border-t border-border bg-background shadow-lg">
          <div className="p-3 bg-background border-b border-border">
            <div className="flex gap-2">
              <Input 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Load a repository first..."
                disabled={true}
                className="text-sm flex-1 bg-input border-border text-muted-foreground"
              />
              <Button 
                disabled={true}
                size="sm"
                className="bg-muted text-muted-foreground cursor-not-allowed"
              >
                Send
              </Button>
            </div>
          </div>
          
          <div className="px-3 py-3 bg-muted/30">
            <QuickPrompts onPromptClick={(prompt) => {
              // Do nothing if no repo loaded
              console.log('Load a repository first');
            }} />
          </div>
        </div>
      </div>
    )
  }
  
  const messages = (tamboThread as any)?.messages || []
  
  return (
    <div className="w-[30%] flex flex-col bg-background border-r border-border h-screen">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-16 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Repository Loaded! 🎉</h3>
            <p className="mb-4 text-sm">Try the quick actions below or ask anything!</p>
            <div className="mt-6 text-xs space-y-2 text-left bg-card p-4 rounded-lg border border-border">
              <p className="font-semibold text-primary">💡 Try asking:</p>
              <p className="text-foreground">• "Show me the README"</p>
              <p className="text-foreground">• "List all open pull requests"</p>
              <p className="text-foreground">• "What's in the src folder?"</p>
              <p className="text-foreground">• "Show repository structure"</p>
            </div>
          </div>
        ) : (
          messages.map((message: any) => (
            <div key={message.id} className="space-y-2">
              {/* User Message */}
              {message.role === 'user' && (
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg max-w-[90%] text-sm">
                    {typeof message.content === 'string' ? message.content : 
                      Array.isArray(message.content) ? 
                        message.content.find((p: any) => p.type === 'text')?.text : 
                        'Message'}
                  </div>
                </div>
              )}
              
              {/* AI Message */}
              {message.role === 'assistant' && (
                <div className="flex justify-start">
                  <Card className="p-3 max-w-[90%] bg-card border-border">
                    {Array.isArray(message.content) && message.content.map((part: any, i: number) => 
                      part.type === 'text' ? (
                        <p key={i} className="text-foreground text-sm mb-2 whitespace-pre-wrap">{part.text}</p>
                      ) : null
                    )}
                    
                    {message.renderedComponent && (
                      <div className="mt-2 text-xs">
                        {message.renderedComponent}
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </div>
          ))
        )}
        
        {isPending && (
          <div className="flex justify-start">
            <Card className="p-3 bg-card border-border">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </Card>
          </div>
        )}
      </div>
      
      {/* Fixed Bottom Section - Input + QuickPrompts */}
      <div className="fixed bottom-0 w-[30%] border-t border-border bg-background shadow-lg">
        {/* Input Area */}
        <div className="p-3 bg-background border-b border-border">
          <div className="flex gap-2">
            <Input 
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything about this repository..."
              disabled={isPending}
              className="text-sm flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button 
              onClick={handleSend}
              disabled={isPending || !value.trim()}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? '...' : 'Send'}
            </Button>
          </div>
        </div>
        
        {/* Quick Prompts */}
        <div className="px-3 py-3 bg-muted/30">
          <QuickPrompts onPromptClick={(prompt) => {
            setValue(prompt);
            if (!isPending) {
              handleSend();
            }
          }} />
        </div>
      </div>
    </div>
  )
}