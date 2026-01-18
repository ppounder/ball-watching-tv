import { Calendar } from 'lucide-react';
import StreamEmbed from '@/components/watch/StreamEmbed';
import BroadcastHeader from '@/components/watch/BroadcastHeader';

const NoneMatchdayLayout = () => {
  return (
    <>
      {/* Top section: Stream */}
      <div className="flex flex-col lg:flex-row lg:gap-4 flex-shrink-0">
        <div className="flex-1 lg:flex-[3]">
          <BroadcastHeader mode="NONE_MATCHDAY" subtitle="No Matches" />
          <StreamEmbed />
        </div>

        {/* Right rail: Empty placeholder */}
        <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
          <div className="broadcast-card rounded-lg p-6 h-full flex items-center justify-center">
            <div className="text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">
                No matches scheduled today
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content placeholder */}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="broadcast-card rounded-lg p-12 text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">No Matches Today</h2>
          <p className="text-muted-foreground">
            Check back on match days for live coverage and scores.
          </p>
        </div>
      </div>
    </>
  );
};

export default NoneMatchdayLayout;
