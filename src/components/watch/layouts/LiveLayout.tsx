import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import StreamEmbed from '@/components/watch/StreamEmbed';
import BroadcastHeader from '@/components/watch/BroadcastHeader';
import LiveScores from '@/components/watch/LiveScores';
import ScheduleFixtures from '@/components/watch/ScheduleFixtures';
import Ticker from '@/components/watch/Ticker';
import Vidiprinter from '@/components/watch/Vidiprinter';
import AdPanel from '@/components/watch/AdPanel';
import UpNext from '@/components/watch/UpNext';
import { Alert } from '@/types/broadcast';
import { NowBundle, ScheduleItem } from '@/types/scheduler';
import { cn } from '@/lib/utils';
import { getFixtureIdsForLive } from '@/utils/scheduleUtils';

interface LiveLayoutProps {
  alerts: Alert[];
  isLoading: boolean;
  bundle: NowBundle | null;
  currentItem: ScheduleItem | null;
  nextItem: ScheduleItem | null;
}

const LiveLayout = ({ alerts, isLoading, bundle, currentItem, nextItem }: LiveLayoutProps) => {
  const [scoresExpanded, setScoresExpanded] = useState(true);

  // Get fixture IDs from the active LIVE block
  const liveFixtureIds = useMemo(() => getFixtureIdsForLive(bundle), [bundle]);
  const hasScheduleFixtures = liveFixtureIds.length > 0;

  return (
    <>
      {/* Top section: Stream + Scores */}
      <div className="flex flex-col lg:flex-row lg:gap-4 flex-shrink-0">
        {/* Left: Stream */}
        <div className="flex-1 lg:flex-[3]">
          <BroadcastHeader mode="LIVE" />
          <StreamEmbed />
        </div>

        {/* Right rail - Desktop only: Schedule Fixtures or rotating LiveScores */}
        <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
          {hasScheduleFixtures ? (
            <ScheduleFixtures fixtureIds={liveFixtureIds} />
          ) : (
            <LiveScores />
          )}
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
            {hasScheduleFixtures ? (
              <ScheduleFixtures fixtureIds={liveFixtureIds} />
            ) : (
              <LiveScores />
            )}
          </div>
        </div>
      </div>

      {/* Up Next strip */}
      {nextItem && <UpNext nextItem={nextItem} />}

      {/* Ticker - Full width */}
      <div className="flex-shrink-0">
        <Ticker alerts={alerts} />
      </div>

      {/* Vidiprinter + Ad Panel - Same layout as stream + scores */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:gap-4">
        {/* Left: Vidiprinter - matches stream width */}
        <div className="flex-1 lg:flex-[3] min-h-0">
          <Vidiprinter alerts={alerts} isLoading={isLoading} />
        </div>

        {/* Right: Ad/Match Details Panel - matches scores width */}
        <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
          <AdPanel />
        </div>
      </div>
    </>
  );
};

export default LiveLayout;
