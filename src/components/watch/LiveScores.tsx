import { useMemo } from 'react';
import { Match, LeagueGroup } from '@/types/broadcast';
import MatchRow from './MatchRow';
import { Trophy } from 'lucide-react';

interface LiveScoresProps {
  matches: Match[];
  isLoading?: boolean;
}

const LiveScores = ({ matches, isLoading }: LiveScoresProps) => {
  // Group matches by league
  const leagueGroups = useMemo(() => {
    const groups: Record<string, Match[]> = {};
    
    matches.forEach(match => {
      if (!groups[match.league]) {
        groups[match.league] = [];
      }
      groups[match.league].push(match);
    });

    // Sort: live matches first within each group
    return Object.entries(groups).map(([league, matches]) => ({
      league,
      matches: matches.sort((a, b) => {
        const statusOrder = { LIVE: 0, HT: 1, NS: 2, FT: 3, POSTPONED: 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      }),
    })) as LeagueGroup[];
  }, [matches]);

  if (isLoading) {
    return (
      <div className="broadcast-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-12 bg-muted/50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="broadcast-card p-6 text-center">
        <Trophy className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">No live games right now</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="broadcast-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-display font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          Live Scores
        </h2>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {leagueGroups.map((group, idx) => (
          <div key={group.league}>
            {idx > 0 && <div className="border-t border-border" />}
            <div className="px-4 py-2 bg-secondary/30">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {group.league}
              </h3>
            </div>
            <div className="divide-y divide-border/50">
              {group.matches.map(match => (
                <MatchRow key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveScores;
