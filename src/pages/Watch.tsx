import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/Header';
import LastUpdated from '@/components/watch/LastUpdated';
import ChannelModeIndicator from '@/components/watch/ChannelModeIndicator';
import LayoutSwitcher from '@/components/watch/LayoutSwitcher';
import ScheduleSidebar from '@/components/watch/ScheduleSidebar';
import {
  LiveLayout,
  MatchdayLayout,
  OffAirLayout,
  PostMatchdayLayout,
  NoneMatchdayLayout,
  NewsLayout,
  PodcastLayout,
} from '@/components/watch/layouts';
import { supabase } from '@/integrations/supabase/client';
import { BroadcastData } from '@/types/broadcast';
import { useSchedulerState } from '@/hooks/useSchedulerState';
import { ChannelMode } from '@/types/scheduler';
import { getCurrentItem, getNextItem } from '@/utils/scheduleUtils';

const POLL_INTERVAL = 5000; // 5 seconds

const Watch = () => {
  const [data, setData] = useState<BroadcastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [overrideMode, setOverrideMode] = useState<ChannelMode | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  
  const { mode: schedulerMode, bundle, isLoading: isSchedulerLoading } = useSchedulerState();
  
  // Use override mode if set, otherwise use scheduler mode
  const mode = overrideMode ?? schedulerMode;

  // Derive current and next items from the bundle
  const currentItem = useMemo(() => getCurrentItem(bundle), [bundle]);
  const nextItem = useMemo(() => getNextItem(bundle), [bundle]);

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
        return (
          <LiveLayout 
            alerts={alerts} 
            isLoading={isLoading} 
            bundle={bundle}
            currentItem={currentItem}
            nextItem={nextItem}
          />
        );
      case 'NEWS':
        return (
          <NewsLayout 
            alerts={alerts} 
            isLoading={isLoading}
            bundle={bundle}
            currentItem={currentItem}
            nextItem={nextItem}
          />
        );
      case 'PODCAST':
        return (
          <PodcastLayout 
            bundle={bundle}
            currentItem={currentItem}
            nextItem={nextItem}
          />
        );
      case 'MATCHDAY':
        return <MatchdayLayout alerts={alerts} isLoading={isLoading} />;
      case 'POST_MATCHDAY':
        return <PostMatchdayLayout alerts={alerts} isLoading={isLoading} />;
      case 'NONE_MATCHDAY':
        return <NoneMatchdayLayout />;
      case 'OFF_AIR':
      default:
        return <OffAirLayout nextItem={nextItem} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header onScheduleClick={() => setScheduleOpen(true)} />
      
      {/* Schedule Sidebar */}
      <ScheduleSidebar 
        open={scheduleOpen} 
        onOpenChange={setScheduleOpen} 
        bundle={bundle} 
      />
      
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

      {/* Dev-only layout switcher */}
      <LayoutSwitcher currentMode={mode} onModeChange={setOverrideMode} />
    </div>
  );
};

export default Watch;
