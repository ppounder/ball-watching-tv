import { Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

const BallWatchingGPTPanel = () => {
  return (
    <div className="h-full broadcast-card rounded-lg flex flex-col overflow-hidden">
      {/* Header - matches Vidiprinter header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 flex-shrink-0 bg-secondary/30">
        <Bot className="w-4 h-4 text-primary" />
        <h2 className="font-display font-semibold text-sm uppercase tracking-wide">
          Ball Watching GPT
        </h2>
      </div>

      {/* Scrollable content area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-3">
          {/* Placeholder response blocks - UI only */}
          <div className="text-sm text-muted-foreground">
            <p className="leading-relaxed">
              Ask me about live scores, league standings, match stats, or upcoming fixtures.
            </p>
          </div>
          
          {/* Example response block styling */}
          <div className="p-3 rounded-md bg-secondary/20 border border-border/50">
            <p className="text-sm leading-relaxed text-foreground/90">
              Welcome to Ball Watching GPT. I'm here to help you track the action across today's matches.
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* Fixed input area */}
      <div className="flex-shrink-0 p-3 border-t border-border bg-secondary/20">
        <Input
          type="text"
          placeholder="Ask Ball Watching…"
          className="w-full h-10 bg-background/50 border-border/50 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/50"
        />
      </div>
    </div>
  );
};

export default BallWatchingGPTPanel;
