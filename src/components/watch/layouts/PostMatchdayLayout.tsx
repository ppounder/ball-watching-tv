import LiveScores from '@/components/watch/LiveScores';
import Vidiprinter from '@/components/watch/Vidiprinter';
import { Alert } from '@/types/broadcast';

interface PostMatchdayLayoutProps {
  alerts: Alert[];
  isLoading: boolean;
}

const PostMatchdayLayout = ({ alerts, isLoading }: PostMatchdayLayoutProps) => {
  return (
    <>
      {/* Results section */}
      <div className="flex flex-col lg:flex-row lg:gap-4 flex-shrink-0">
        <div className="flex-1">
          <div className="broadcast-card rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Today's Results</h2>
            <LiveScores />
          </div>
        </div>
      </div>

      {/* Match highlights / Vidiprinter recap */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:gap-4">
        <div className="flex-1 lg:flex-[3] min-h-0">
          <div className="broadcast-card rounded-lg p-6 h-full">
            <h3 className="text-lg font-semibold mb-4">Match Recap</h3>
            <Vidiprinter alerts={alerts} isLoading={isLoading} />
          </div>
        </div>
        
        <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
          <div className="broadcast-card rounded-lg p-6 h-full">
            <h3 className="text-lg font-semibold mb-4">Highlights</h3>
            <p className="text-sm text-muted-foreground">
              Post-match highlights and analysis coming soon.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostMatchdayLayout;
