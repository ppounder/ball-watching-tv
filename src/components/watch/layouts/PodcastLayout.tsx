import { Mic, Play } from 'lucide-react';
import StreamEmbed from '@/components/watch/StreamEmbed';
import BroadcastHeader from '@/components/watch/BroadcastHeader';
import LiveScores from '@/components/watch/LiveScores';
import UpNext from '@/components/watch/UpNext';
import { NowBundle, ScheduleItem } from '@/types/scheduler';
import { getPodcastShowKey, formatScopeForDisplay } from '@/utils/scheduleUtils';

interface PodcastLayoutProps {
  bundle: NowBundle | null;
  currentItem: ScheduleItem | null;
  nextItem: ScheduleItem | null;
}

const showDisplayNames: Record<string, { title: string; description: string }> = {
  full_kit_shankers: {
    title: 'Full Kit Shankers',
    description: 'The ultimate football podcast for passionate fans',
  },
};

const PodcastLayout = ({ bundle, currentItem, nextItem }: PodcastLayoutProps) => {
  const showKey = getPodcastShowKey(bundle);
  const showInfo = showKey ? showDisplayNames[showKey] : null;
  const title = showInfo?.title || formatScopeForDisplay(showKey || 'Podcast');
  const description = showInfo?.description || 'Football podcast';

  return (
    <>
      {/* Top section: Stream + Scores sidebar */}
      <div className="flex flex-col lg:flex-row lg:gap-4 flex-shrink-0">
        {/* Left: Stream */}
        <div className="flex-1 lg:flex-[3]">
          <BroadcastHeader mode="PODCAST" subtitle={title} />
          <StreamEmbed />
        </div>

        {/* Right rail: Live Scores */}
        <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
          <LiveScores />
        </div>
      </div>

      {/* Up Next strip */}
      {nextItem && <UpNext nextItem={nextItem} />}

      {/* Additional content area */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:gap-4">
        <div className="flex-1 broadcast-card rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Episode Details</h3>
          <p className="text-sm text-muted-foreground">
            Episode information and show notes will appear here.
          </p>
        </div>
        
        <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
          <div className="broadcast-card rounded-lg p-6 h-full">
            <h3 className="text-lg font-semibold mb-4">Previous Episodes</h3>
            <p className="text-sm text-muted-foreground">
              Past episodes and archive coming soon.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PodcastLayout;
