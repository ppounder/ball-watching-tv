import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LastUpdatedProps {
  timestamp: number;
  isPolling?: boolean;
}

const LastUpdated = ({ timestamp, isPolling }: LastUpdatedProps) => {
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <RefreshCw className={cn(
        "w-3 h-3",
        isPolling && "animate-spin"
      )} />
      <span>Last updated: {formatTime(timestamp)}</span>
    </div>
  );
};

export default LastUpdated;
