import { Calendar } from 'lucide-react';

const NoneMatchdayLayout = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="broadcast-card rounded-lg p-12 text-center max-w-md">
        <Calendar className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-4">No Matches Today</h2>
        <p className="text-muted-foreground">
          There are no matches scheduled for today. Check back on match days for live coverage and scores.
        </p>
      </div>
    </div>
  );
};

export default NoneMatchdayLayout;
