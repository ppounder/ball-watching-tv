import StreamEmbed from '@/components/watch/StreamEmbed';
import BroadcastHeader from '@/components/watch/BroadcastHeader';
import LiveScores from '@/components/watch/LiveScores';
import Ticker from '@/components/watch/Ticker';
import { Alert } from '@/types/broadcast';

interface MatchdayLayoutProps {
  alerts: Alert[];
  isLoading: boolean;
}

const MatchdayLayout = ({ alerts, isLoading }: MatchdayLayoutProps) => {
  return (
    <>
      {/* Top section: Stream + Scores */}
      <div className="flex flex-col lg:flex-row lg:gap-4 flex-shrink-0">
        {/* Left: Stream */}
        <div className="flex-1 lg:flex-[3]">
          <BroadcastHeader mode="MATCHDAY" />
          <StreamEmbed />
        </div>

        {/* Right rail: Today's fixtures */}
        <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
          <LiveScores />
        </div>
      </div>

      {/* Ticker - Full width */}
      <div className="flex-shrink-0">
        <Ticker alerts={alerts} />
      </div>

      {/* Placeholder for matchday-specific content */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:gap-4">
        <div className="flex-1 broadcast-card rounded-lg p-6">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Matchday content will appear here
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Pre-match analysis, team news, and more coming soon.
          </p>
        </div>
      </div>
    </>
  );
};

export default MatchdayLayout;
