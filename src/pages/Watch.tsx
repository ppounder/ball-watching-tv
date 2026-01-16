import { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import StreamEmbed from '@/components/watch/StreamEmbed';
import LiveScores from '@/components/watch/LiveScores';
import Ticker from '@/components/watch/Ticker';
import Vidiprinter from '@/components/watch/Vidiprinter';
import LastUpdated from '@/components/watch/LastUpdated';
import { getMockBroadcastData } from '@/data/mockData';
import { BroadcastData } from '@/types/broadcast';
import { cn } from '@/lib/utils';

const POLL_INTERVAL = 5000; // 5 seconds

const Watch = () => {
  const [data, setData] = useState<BroadcastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [scoresExpanded, setScoresExpanded] = useState(true);

  const fetchData = useCallback(async () => {
    setIsPolling(true);
    try {
      // In production, this would call the Supabase edge function
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      const newData = getMockBroadcastData();
      setData(newData);
    } catch (error) {
      console.error('Failed to fetch broadcast data:', error);
    } finally {
      setIsLoading(false);
      setIsPolling(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Main broadcast area */}
      <div className="flex-1 flex flex-col">
        {/* Top section: Stream + Scores */}
        <div className="flex-1 flex flex-col lg:flex-row lg:gap-4 p-4">
          {/* Left: Stream + Mobile Scores Toggle */}
          <div className="flex-1 lg:flex-[3] flex flex-col gap-4">
            {/* Stream - Main focus */}
            <div className="flex-shrink-0">
              <StreamEmbed />
            </div>

            {/* Mobile: Collapsible Scores */}
            <div className="lg:hidden">
              <button
                onClick={() => setScoresExpanded(!scoresExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 broadcast-card rounded-lg"
              >
                <span className="font-medium text-sm">Live Scores</span>
                {scoresExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <div className={cn(
                "mt-2 transition-all duration-300 overflow-hidden",
                scoresExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              )}>
                <LiveScores matches={data?.matches || []} isLoading={isLoading} />
              </div>
            </div>
          </div>

          {/* Right rail - Desktop only: Live Scores */}
          <div className="hidden lg:flex flex-col gap-4 w-80 xl:w-96 flex-shrink-0">
            <LiveScores matches={data?.matches || []} isLoading={isLoading} />
            
            {/* Last updated */}
            {data && (
              <div className="flex justify-end">
                <LastUpdated timestamp={data.lastUpdated} isPolling={isPolling} />
              </div>
            )}
          </div>
        </div>

        {/* Ticker - Full width above Vidiprinter */}
        <div className="px-4">
          <Ticker alerts={data?.alerts || []} />
        </div>

        {/* Vidiprinter - Full width */}
        <div className="p-4">
          <Vidiprinter alerts={data?.alerts || []} isLoading={isLoading} />
        </div>

        {/* Mobile: Last updated */}
        <div className="lg:hidden flex justify-center py-2 bg-background border-t border-border">
          {data && <LastUpdated timestamp={data.lastUpdated} isPolling={isPolling} />}
        </div>
      </div>
    </div>
  );
};

export default Watch;
