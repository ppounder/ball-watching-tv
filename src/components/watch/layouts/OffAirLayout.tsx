import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { ScheduleItem } from '@/types/scheduler';

interface OffAirLayoutProps {
  nextItem?: ScheduleItem | null;
}

const OffAirLayout = ({ nextItem }: OffAirLayoutProps) => {
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    if (!nextItem?.scheduled_for_uk) {
      setCountdown('');
      return;
    }

    const calculateCountdown = () => {
      const now = new Date();
      const target = new Date(nextItem.scheduled_for_uk!);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('Starting soon...');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextItem?.scheduled_for_uk]);

  const getItemTypeLabel = (type?: string) => {
    switch (type) {
      case 'LIVE': return 'Live Coverage';
      case 'NEWS': return 'News';
      case 'PODCAST': return 'Podcast';
      default: return 'Broadcast';
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="broadcast-card rounded-lg p-12 text-center max-w-md">
        <h2 className="text-xl font-bold mb-4">Off Air</h2>
        <p className="text-muted-foreground mb-6">
          Check back later for upcoming matches and live coverage.
        </p>

        {nextItem && (
          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span>Up Next</span>
            </div>
            
            <p className="font-semibold text-foreground mb-1">
              {nextItem.title || getItemTypeLabel(nextItem.schedule_item_type)}
            </p>
            
            <span className="inline-block px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground mb-3">
              {getItemTypeLabel(nextItem.schedule_item_type)}
            </span>

            {countdown && (
              <div className="mt-2">
                <p className="text-2xl font-mono font-bold text-primary">
                  {countdown}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OffAirLayout;
