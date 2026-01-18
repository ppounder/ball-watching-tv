import StreamEmbed from '@/components/watch/StreamEmbed';
import BroadcastHeader from '@/components/watch/BroadcastHeader';

const OffAirLayout = () => {
  return (
    <>
      {/* Top section: Stream */}
      <div className="flex flex-col lg:flex-row lg:gap-4 flex-shrink-0">
        <div className="flex-1 lg:flex-[3]">
          <BroadcastHeader mode="OFF_AIR" />
          <StreamEmbed />
        </div>

        {/* Right rail: Empty placeholder */}
        <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
          <div className="broadcast-card rounded-lg p-6 h-full flex items-center justify-center">
            <p className="text-muted-foreground text-sm text-center">
              No live broadcasts at the moment
            </p>
          </div>
        </div>
      </div>

      {/* Content placeholder */}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="broadcast-card rounded-lg p-12 text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">Off Air</h2>
          <p className="text-muted-foreground">
            Check back later for upcoming matches and live coverage.
          </p>
        </div>
      </div>
    </>
  );
};

export default OffAirLayout;
