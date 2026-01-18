import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import LastUpdated from '@/components/watch/LastUpdated';
import ChannelModeIndicator from '@/components/watch/ChannelModeIndicator';
import {
  LiveLayout,
  MatchdayLayout,
  OffAirLayout,
  PostMatchdayLayout,
  NoneMatchdayLayout,
} from '@/components/watch/layouts';
import { supabase } from '@/integrations/supabase/client';
import { BroadcastData } from '@/types/broadcast';
import { useSchedulerState } from '@/hooks/useSchedulerState';
import { ChannelMode } from '@/types/scheduler';

const POLL_INTERVAL = 5000; // 5 seconds

const Watch = () => {
  const [data, setData] = useState<BroadcastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  
  const { mode, isLoading: isSchedulerLoading } = useSchedulerState();

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

  const renderLayout = (currentMode: ChannelMode) => {
    const alerts = data?.alerts || [];
    
    switch (currentMode) {
      case 'LIVE':
        return <LiveLayout alerts={alerts} isLoading={isLoading} />;
      case 'MATCHDAY':
        return <MatchdayLayout alerts={alerts} isLoading={isLoading} />;
      case 'POST_MATCHDAY':
        return <PostMatchdayLayout alerts={alerts} isLoading={isLoading} />;
      case 'NONE_MATCHDAY':
        return <NoneMatchdayLayout />;
      case 'OFF_AIR':
      default:
        return <OffAirLayout />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      
      {/* Main broadcast area - fills remaining height */}
      <div className="flex-1 flex flex-col min-h-0 p-4 gap-2">
        {/* Channel mode indicator */}
        <div className="flex-shrink-0 flex justify-between items-center">
          <ChannelModeIndicator mode={mode} />
          {isSchedulerLoading && (
            <span className="text-xs text-muted-foreground">Loading...</span>
          )}
        </div>

        {/* Mode-specific layout */}
        {renderLayout(mode)}

        {/* Last updated - Bottom aligned */}
        <div className="flex-shrink-0 flex justify-center py-2 border-t border-border">
          {data && <LastUpdated timestamp={data.lastUpdated} isPolling={isPolling} />}
        </div>
      </div>
    </div>
  );
};

export default Watch;
