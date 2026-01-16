import { Match } from '@/types/broadcast';
import StatusBadge from './StatusBadge';
import { cn } from '@/lib/utils';

interface MatchRowProps {
  match: Match;
}

const MatchRow = ({ match }: MatchRowProps) => {
  const isLive = match.status === 'LIVE';
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <div 
      className={cn(
        "grid grid-cols-[1fr_auto_1fr] gap-2 items-center py-2 px-3 rounded-md transition-colors",
        isLive && "bg-primary/5"
      )}
    >
      {/* Home Team */}
      <div className="text-right truncate">
        <span className="text-sm font-medium">{match.homeTeam}</span>
      </div>

      {/* Score / Time */}
      <div className="flex items-center justify-center gap-2 min-w-[80px]">
        {hasScore ? (
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-lg font-bold tabular-nums w-5 text-right",
              match.homeScore! > match.awayScore! && "text-gold"
            )}>
              {match.homeScore}
            </span>
            <span className="text-muted-foreground">-</span>
            <span className={cn(
              "text-lg font-bold tabular-nums w-5 text-left",
              match.awayScore! > match.homeScore! && "text-gold"
            )}>
              {match.awayScore}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{match.startTime || 'TBD'}</span>
        )}
      </div>

      {/* Away Team */}
      <div className="truncate">
        <span className="text-sm font-medium">{match.awayTeam}</span>
      </div>

      {/* Status Badge - Full width below on small screens */}
      <div className="col-span-3 flex justify-center mt-1">
        <StatusBadge status={match.status} minute={match.minute} />
      </div>
    </div>
  );
};

export default MatchRow;
