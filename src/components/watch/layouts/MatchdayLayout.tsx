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
      {/* Today's fixtures - Prominent display */}
      <div className="flex flex-col lg:flex-row lg:gap-4 flex-shrink-0">
        <div className="flex-1">
          <div className="broadcast-card rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Today's Matches</h2>
            <LiveScores />
          </div>
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
