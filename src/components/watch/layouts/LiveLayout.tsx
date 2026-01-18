import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import StreamEmbed from '@/components/watch/StreamEmbed';
import LiveScores from '@/components/watch/LiveScores';
import Ticker from '@/components/watch/Ticker';
import Vidiprinter from '@/components/watch/Vidiprinter';
import AdPanel from '@/components/watch/AdPanel';
import { Alert } from '@/types/broadcast';
import { cn } from '@/lib/utils';

interface LiveLayoutProps {
  alerts: Alert[];
  isLoading: boolean;
}

const LiveLayout = ({ alerts, isLoading }: LiveLayoutProps) => {
  const [scoresExpanded, setScoresExpanded] = useState(true);

  return (
    <>
      {/* Top section: Stream + Scores */}
      <div className="flex flex-col lg:flex-row lg:gap-4 flex-shrink-0">
        {/* Left: Stream */}
        <div className="flex-1 lg:flex-[3]">
          <StreamEmbed />
        </div>

        {/* Right rail - Desktop only: Live Scores */}
        <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
          <LiveScores />
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
            <LiveScores />
          </div>
        </div>
      </div>

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
