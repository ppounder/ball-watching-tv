import { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import StreamEmbed from '@/components/watch/StreamEmbed';
import LiveScores from '@/components/watch/LiveScores';
import Ticker from '@/components/watch/Ticker';
import Vidiprinter from '@/components/watch/Vidiprinter';
import LastUpdated from '@/components/watch/LastUpdated';
import AdPanel from '@/components/watch/AdPanel';
import { supabase } from '@/integrations/supabase/client';
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
      const { data: broadcastData, error } = await supabase.functions.invoke('get-broadcast-data');
      
      if (error) {
        console.error('Failed to fetch broadcast data:', error);
        return;
      }
      
      setData(broadcastData as BroadcastData);
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      
      {/* Main broadcast area - fills remaining height */}
      <div className="flex-1 flex flex-col min-h-0 p-4 gap-2">
        {/* Top section: Stream + Scores */}
        <div className="flex flex-col lg:flex-row lg:gap-4 flex-shrink-0">
          {/* Left: Stream */}
          <div className="flex-1 lg:flex-[3]">
            <StreamEmbed />
          </div>

          {/* Right rail - Desktop only: Live Scores */}
          <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
            <LiveScores matches={data?.matches || []} isLoading={isLoading} />
          </div>

          {/* Mobile: Collapsible Scores */}
          <div className="lg:hidden mt-4">
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
              scoresExpanded ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <LiveScores matches={data?.matches || []} isLoading={isLoading} />
            </div>
          </div>
        </div>

        {/* Ticker - Full width */}
        <div className="flex-shrink-0">
          <Ticker alerts={data?.alerts || []} />
        </div>

        {/* Vidiprinter + Ad Panel - Same layout as stream + scores */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:gap-4">
          {/* Left: Vidiprinter - matches stream width */}
          <div className="flex-1 lg:flex-[3] min-h-0">
            <Vidiprinter alerts={data?.alerts || []} isLoading={isLoading} />
          </div>

          {/* Right: Ad/Match Details Panel - matches scores width */}
          <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
            <AdPanel />
          </div>
        </div>

        {/* Last updated - Bottom aligned */}
        <div className="flex-shrink-0 flex justify-center py-2 border-t border-border">
          {data && <LastUpdated timestamp={data.lastUpdated} isPolling={isPolling} />}
        </div>
      </div>
    </div>
  );
};

export default Watch;
