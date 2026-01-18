import { Radio } from 'lucide-react';

const OffAirLayout = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="broadcast-card rounded-lg p-12 text-center max-w-md">
        <Radio className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-4">Off Air</h2>
        <p className="text-muted-foreground">
          No live broadcasts at the moment. Check back later for upcoming matches and live coverage.
        </p>
      </div>
    </div>
  );
};

export default OffAirLayout;
