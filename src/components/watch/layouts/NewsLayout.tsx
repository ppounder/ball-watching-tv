import { Newspaper } from 'lucide-react';
import LiveScores from '@/components/watch/LiveScores';
import Ticker from '@/components/watch/Ticker';
import UpNext from '@/components/watch/UpNext';
import { Alert } from '@/types/broadcast';
import { NowBundle, ScheduleItem } from '@/types/scheduler';
import { getNewsScope, formatScopeForDisplay } from '@/utils/scheduleUtils';

interface NewsLayoutProps {
  alerts: Alert[];
  isLoading: boolean;
  bundle: NowBundle | null;
  currentItem: ScheduleItem | null;
  nextItem: ScheduleItem | null;
}

const NewsLayout = ({ alerts, isLoading, bundle, currentItem, nextItem }: NewsLayoutProps) => {
  const newsScope = getNewsScope(bundle);
  const scopeDisplay = newsScope ? formatScopeForDisplay(newsScope) : 'General';

  return (
    <>
      {/* Top section: News content + Scores sidebar */}
      <div className="flex flex-col lg:flex-row lg:gap-4 flex-shrink-0">
        {/* Left: News main area */}
        <div className="flex-1 lg:flex-[3]">
          <div className="broadcast-card rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Newspaper className="w-8 h-8 text-blue-500" />
              <div>
                <h2 className="text-xl font-bold">Ball Watching News</h2>
                <p className="text-sm text-muted-foreground">{scopeDisplay} News</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
              <p className="text-muted-foreground text-center">
                News content for {scopeDisplay} will appear here
              </p>
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

      {/* Ticker - Full width */}
      <div className="flex-shrink-0">
        <Ticker alerts={alerts} />
      </div>

      {/* Additional content area */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:gap-4">
        <div className="flex-1 broadcast-card rounded-lg p-6">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Latest Headlines
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Top stories and breaking news from around the football world.
          </p>
        </div>
      </div>
    </>
  );
};

export default NewsLayout;
