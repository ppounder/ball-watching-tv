import { Mic, Play } from 'lucide-react';
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
      {/* Top section: Podcast player + Scores sidebar */}
      <div className="flex flex-col lg:flex-row lg:gap-4 flex-shrink-0">
        {/* Left: Podcast main area */}
        <div className="flex-1 lg:flex-[3]">
          <div className="broadcast-card rounded-lg p-8">
            <div className="flex flex-col items-center text-center">
              {/* Podcast artwork */}
              <div className="w-48 h-48 bg-gradient-to-br from-purple-600 to-purple-900 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Mic className="w-24 h-24 text-white/90" />
              </div>

              {/* Now Playing badge */}
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-400 px-4 py-1.5 rounded-full mb-4">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Now Playing</span>
              </div>

              {/* Show title */}
              <h2 className="text-2xl font-bold mb-2">{title}</h2>
              <p className="text-muted-foreground mb-6">{description}</p>

              {/* Play button placeholder */}
              <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full transition-colors">
                <Play className="w-5 h-5" />
                <span className="font-medium">Listen Now</span>
              </button>
            </div>
          </div>
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
