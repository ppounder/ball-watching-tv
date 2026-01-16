import { Alert } from '@/types/broadcast';
import { cn } from '@/lib/utils';

interface TickerProps {
  alerts: Alert[];
}

const Ticker = ({ alerts }: TickerProps) => {
  // Take latest 15 alerts for ticker
  const tickerAlerts = alerts.slice(0, 15);

  if (tickerAlerts.length === 0) {
    return (
      <div className="h-10 flex items-center justify-center bg-secondary/50 border-y border-border">
        <span className="text-muted-foreground text-sm">Waiting for updates...</span>
      </div>
    );
  }

  // Duplicate for seamless scroll
  const duplicatedAlerts = [...tickerAlerts, ...tickerAlerts];

  return (
    <div className="relative h-10 bg-secondary/50 border-y border-border overflow-hidden">
      {/* Gradient overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
      
      <div className="flex items-center h-full ticker-scroll whitespace-nowrap">
        {duplicatedAlerts.map((alert, idx) => (
          <div
            key={`${alert.id}-${idx}`}
            className={cn(
              "flex items-center gap-2 px-6",
              alert.type === 'GOAL' && "text-gold",
              alert.type === 'RED' && "text-coral"
            )}
          >
            <span className="text-lg">
              {alert.type === 'GOAL' ? '⚽' : '🟥'}
            </span>
            <span className="text-sm font-medium">
              {alert.homeTeam} vs {alert.awayTeam}
            </span>
            <span className="text-muted-foreground text-sm">•</span>
            <span className="text-sm">{alert.minute}'</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ticker;
