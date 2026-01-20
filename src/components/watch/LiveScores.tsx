import { useState, useEffect, useCallback } from 'react';
import { Trophy, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Fixture {
  fixture_id: number;
  competition_id: number;
  competition_name: string;
  kickoff_utc: string;
  timestamp: number;
  status_short: string;
  status_long: string;
  elapsed: number | null;
  home_team_name: string;
  home_team_logo: string;
  home_goals: number | null;
  away_team_name: string;
  away_team_logo: string;
  away_goals: number | null;
}

interface LeagueFixtures {
  leagueId: string;
  leagueName: string;
  fixtures: Fixture[];
}

interface TodaysFixturesResponse {
  leagues: LeagueFixtures[];
  date: string;
  lastUpdated: number;
}

const ROTATION_INTERVAL = 10000; // 10 seconds

const LiveScores = () => {
  const [leagues, setLeagues] = useState<LeagueFixtures[]>([]);
  const [currentLeagueIndex, setCurrentLeagueIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFixtures = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase.functions.invoke('get-todays-fixtures');
      
      if (fetchError) {
        console.error('Failed to fetch fixtures:', fetchError);
        setError('Failed to load fixtures');
        return;
      }

      const response = data as TodaysFixturesResponse;
      
      // Sort fixtures within each league alphabetically by home team name
      const sortedLeagues = (response.leagues || []).map(league => ({
        ...league,
        fixtures: [...league.fixtures].sort((a, b) => 
          a.home_team_name.localeCompare(b.home_team_name)
        )
      }));
      
      setLeagues(sortedLeagues);
      setError(null);
    } catch (err) {
      console.error('Error fetching fixtures:', err);
      setError('Failed to load fixtures');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchFixtures();
    
    // Refresh data every 60 seconds
    const refreshInterval = setInterval(fetchFixtures, 60000);
    return () => clearInterval(refreshInterval);
  }, [fetchFixtures]);

  // Rotate through leagues
  useEffect(() => {
    if (leagues.length <= 1) return;

    const rotationInterval = setInterval(() => {
      setCurrentLeagueIndex((prev) => (prev + 1) % leagues.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(rotationInterval);
  }, [leagues.length]);

  const currentLeague = leagues[currentLeagueIndex];

  // Get 3-letter abbreviation for team name
  const getTeamAbbr = (teamName: string): string => {
    // Common abbreviations for well-known teams
    const abbreviations: Record<string, string> = {
      'Arsenal': 'ARS',
      'Aston Villa': 'AVL',
      'Bournemouth': 'BOU',
      'Brentford': 'BRE',
      'Brighton': 'BHA',
      'Brighton & Hove Albion': 'BHA',
      'Chelsea': 'CHE',
      'Crystal Palace': 'CRY',
      'Everton': 'EVE',
      'Fulham': 'FUL',
      'Ipswich': 'IPS',
      'Ipswich Town': 'IPS',
      'Leicester': 'LEI',
      'Leicester City': 'LEI',
      'Liverpool': 'LIV',
      'Manchester City': 'MCI',
      'Manchester United': 'MUN',
      'Newcastle': 'NEW',
      'Newcastle United': 'NEW',
      'Nottingham Forest': 'NFO',
      'Southampton': 'SOU',
      'Tottenham': 'TOT',
      'Tottenham Hotspur': 'TOT',
      'West Ham': 'WHU',
      'West Ham United': 'WHU',
      'Wolverhampton': 'WOL',
      'Wolves': 'WOL',
      'Wolverhampton Wanderers': 'WOL',
      // Championship
      'Birmingham': 'BIR',
      'Birmingham City': 'BIR',
      'Blackburn': 'BLA',
      'Blackburn Rovers': 'BLA',
      'Bristol City': 'BRC',
      'Burnley': 'BUR',
      'Cardiff': 'CAR',
      'Cardiff City': 'CAR',
      'Coventry': 'COV',
      'Coventry City': 'COV',
      'Derby': 'DER',
      'Derby County': 'DER',
      'Hull': 'HUL',
      'Hull City': 'HUL',
      'Leeds': 'LEE',
      'Leeds United': 'LEE',
      'Luton': 'LUT',
      'Luton Town': 'LUT',
      'Middlesbrough': 'MID',
      'Millwall': 'MIL',
      'Norwich': 'NOR',
      'Norwich City': 'NOR',
      'Oxford': 'OXF',
      'Oxford United': 'OXF',
      'Plymouth': 'PLY',
      'Plymouth Argyle': 'PLY',
      'Portsmouth': 'POR',
      'Preston': 'PNE',
      'Preston North End': 'PNE',
      'QPR': 'QPR',
      'Queens Park Rangers': 'QPR',
      'Sheffield United': 'SHU',
      'Sheffield Wednesday': 'SHW',
      'Stoke': 'STK',
      'Stoke City': 'STK',
      'Sunderland': 'SUN',
      'Swansea': 'SWA',
      'Swansea City': 'SWA',
      'Watford': 'WAT',
      'West Brom': 'WBA',
      'West Bromwich Albion': 'WBA',
    };
    
    if (abbreviations[teamName]) {
      return abbreviations[teamName];
    }
    
    // Fallback: take first 3 letters (uppercase)
    return teamName.substring(0, 3).toUpperCase();
  };

  const getStatusDisplay = (fixture: Fixture) => {
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

  if (error || leagues.length === 0) {
    return (
      <div className="broadcast-card p-6 text-center h-full flex flex-col items-center justify-center">
        <Trophy className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">No games scheduled today</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Check back later!</p>
      </div>
    );
  }

  return (
    <div className="broadcast-card overflow-hidden h-full flex flex-col">
      {/* Header with league indicator */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="font-display font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          Today's Games
        </h2>
        
        {/* League pagination dots */}
        {leagues.length > 1 && (
          <div className="flex items-center gap-1">
            {leagues.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentLeagueIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentLeagueIndex 
                    ? 'bg-primary w-4' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Current league name */}
      <div className="px-4 py-2 bg-secondary/30 border-b border-border/50">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {currentLeague?.leagueName}
        </h3>
      </div>

      {/* Fixtures list - compact single line format */}
      <div className="flex-1 overflow-y-auto">
        {currentLeague?.fixtures.map((fixture) => (
          <div
            key={fixture.fixture_id}
            className="px-3 py-1.5 border-b border-border/50 hover:bg-secondary/20 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs">
              {/* Status/Time */}
              <div className="w-10 flex-shrink-0 text-center">
                {getStatusDisplay(fixture)}
              </div>

              {/* Home Team Abbr */}
              <span className="font-medium w-8 text-right" title={fixture.home_team_name}>
                {getTeamAbbr(fixture.home_team_name)}
              </span>

              {/* Score */}
              <span className="font-bold text-center w-10">
                {fixture.home_goals !== null && fixture.away_goals !== null
                  ? `${fixture.home_goals}-${fixture.away_goals}`
                  : 'v'}
              </span>

              {/* Away Team Abbr */}
              <span className="font-medium w-8 text-left" title={fixture.away_team_name}>
                {getTeamAbbr(fixture.away_team_name)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with rotation indicator */}
      {leagues.length > 1 && (
        <div className="px-4 py-2 border-t border-border bg-secondary/20">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{currentLeagueIndex + 1} of {leagues.length} leagues</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveScores;
