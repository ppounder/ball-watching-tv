import { Trophy, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useScheduleFixtures } from '@/hooks/useScheduleFixtures';
import { FixtureData } from '@/types/scheduler';

interface ScheduleFixturesProps {
  fixtureIds: number[];
}

const ScheduleFixtures = ({ fixtureIds }: ScheduleFixturesProps) => {
  const { fixtures, isLoading, error } = useScheduleFixtures({ 
    fixtureIds, 
    enabled: fixtureIds.length > 0 
  });

  const getStatusDisplay = (fixture: FixtureData) => {
    const status = fixture.status_short;
    
    if (status === 'LIVE' || status === '1H' || status === '2H') {
      return (
        <span className="text-xs font-bold text-red-500 animate-pulse">
          {fixture.elapsed ? `${fixture.elapsed}'` : 'LIVE'}
        </span>
      );
    }
    if (status === 'HT') {
      return <span className="text-xs font-semibold text-amber-500">HT</span>;
    }
    if (status === 'FT') {
      return <span className="text-xs font-semibold text-muted-foreground">FT</span>;
    }
    if (status === 'NS') {
      const kickoff = new Date(fixture.kickoff_utc);
      return (
        <span className="text-xs text-muted-foreground">
          {format(kickoff, 'HH:mm')}
        </span>
      );
    }
    return <span className="text-xs text-muted-foreground">{status}</span>;
  };

  if (isLoading) {
    return (
      <div className="broadcast-card p-4 h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || fixtures.length === 0) {
    return (
      <div className="broadcast-card p-6 text-center h-full flex flex-col items-center justify-center">
        <Trophy className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">No live fixtures</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Waiting for match data...</p>
      </div>
    );
  }

  return (
    <div className="broadcast-card overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="font-display font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Live Now
        </h2>
        <span className="text-xs text-muted-foreground">
          {fixtures.length} {fixtures.length === 1 ? 'match' : 'matches'}
        </span>
      </div>

      {/* Fixtures list */}
      <div className="flex-1 overflow-y-auto">
        {fixtures.map((fixture) => (
          <div
            key={fixture.fixture_id}
            className="px-4 py-2.5 border-b border-border/50 hover:bg-secondary/20 transition-colors"
          >
            {/* Competition name */}
            <div className="text-xs text-muted-foreground mb-1.5">
              {fixture.competition_name}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status/Time */}
              <div className="w-10 flex-shrink-0 text-center">
                {getStatusDisplay(fixture)}
              </div>

              {/* Teams and Score */}
              <div className="flex-1 min-w-0">
                {/* Home team */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <img
                      src={fixture.home_team_logo}
                      alt={fixture.home_team_name}
                      className="w-4 h-4 object-contain flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <span className="text-sm truncate">{fixture.home_team_name}</span>
                  </div>
                  <span className="text-sm font-semibold w-6 text-right">
                    {fixture.home_goals !== null ? fixture.home_goals : '-'}
                  </span>
                </div>

                {/* Away team */}
                <div className="flex items-center justify-between gap-2 mt-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <img
                      src={fixture.away_team_logo}
                      alt={fixture.away_team_name}
                      className="w-4 h-4 object-contain flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <span className="text-sm truncate">{fixture.away_team_name}</span>
                  </div>
                  <span className="text-sm font-semibold w-6 text-right">
                    {fixture.away_goals !== null ? fixture.away_goals : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleFixtures;
