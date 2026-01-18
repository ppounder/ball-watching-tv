import { useState, useMemo } from 'react';
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
import { useSchedulerState } from '@/hooks/useSchedulerState';
import { useScheduleFixtures } from '@/hooks/useScheduleFixtures';
import { ChannelMode } from '@/types/scheduler';
import { getCurrentItem, getNextItem, getFixtureIdsForLive } from '@/utils/scheduleUtils';

const Watch = () => {
  const [overrideMode, setOverrideMode] = useState<ChannelMode | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  
  const { mode: schedulerMode, bundle, isLoading: isSchedulerLoading, lastUpdated: schedulerLastUpdated } = useSchedulerState();
  
  // Use override mode if set, otherwise use scheduler mode
  const mode = overrideMode ?? schedulerMode;

  // Derive current and next items from the bundle
  const currentItem = useMemo(() => getCurrentItem(bundle), [bundle]);
  const nextItem = useMemo(() => getNextItem(bundle), [bundle]);

  // Get fixture IDs for LIVE mode polling
  const liveFixtureIds = useMemo(() => getFixtureIdsForLive(bundle), [bundle]);
  
  // Poll fixtures when in LIVE mode (this provides the faster polling for live scores)
  const { lastUpdated: fixturesLastUpdated } = useScheduleFixtures({
    fixtureIds: liveFixtureIds,
    enabled: mode === 'LIVE' && liveFixtureIds.length > 0,
  });

  // Use fixtures timestamp for LIVE mode, scheduler timestamp for other modes
  const displayLastUpdated = useMemo(() => {
    if (mode === 'LIVE' && fixturesLastUpdated) {
      return fixturesLastUpdated;
    }
    // Convert scheduler lastUpdated (ISO string) to timestamp
    return schedulerLastUpdated ? new Date(schedulerLastUpdated).getTime() : null;
  }, [mode, fixturesLastUpdated, schedulerLastUpdated]);

  const renderLayout = (currentMode: ChannelMode) => {
    // Alerts are no longer fetched - passing empty array for now
    const alerts: never[] = [];
    
    switch (currentMode) {
      case 'LIVE':
        return (
          <LiveLayout 
            alerts={alerts} 
            isLoading={isSchedulerLoading} 
            bundle={bundle}
            currentItem={currentItem}
            nextItem={nextItem}
          />
        );
      case 'NEWS':
        return (
          <NewsLayout 
            alerts={alerts} 
            isLoading={isSchedulerLoading}
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
        return <MatchdayLayout alerts={alerts} isLoading={isSchedulerLoading} />;
      case 'POST_MATCHDAY':
        return <PostMatchdayLayout alerts={alerts} isLoading={isSchedulerLoading} />;
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
          {displayLastUpdated && <LastUpdated timestamp={displayLastUpdated} isPolling={false} />}
        </div>
      </div>

      {/* Dev-only layout switcher */}
      <LayoutSwitcher currentMode={mode} onModeChange={setOverrideMode} />
    </div>
  );
};

export default Watch;
