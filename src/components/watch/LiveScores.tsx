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
  status_extra: number | null;
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

// Helper to get competition logo URL from storage
const getCompetitionLogoUrl = (competitionId: string | number): string => {
  return `https://pwpewpymzibnewdosxiq.supabase.co/storage/v1/object/public/ball-watching/competitions/${competitionId}.svg`;
};

interface SlideData {
  leagueId: string;
  leagueName: string;
  fixtures: Fixture[];
  pageNumber?: number;
  totalPages?: number;
}

const MAX_FIXTURES_PER_SLIDE = 12;
const CUP_COMPETITION_IDS = [45, 46, 48];

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
      // Reset to first slide when data changes
      setCurrentLeagueIndex(0);
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

  // Create slides - split cup competitions with more than 12 fixtures
  const slides: SlideData[] = leagues.flatMap(league => {
    const leagueIdNum = parseInt(league.leagueId, 10);
    const isCupCompetition = CUP_COMPETITION_IDS.includes(leagueIdNum);
    
    // Only paginate cup competitions with more than 12 fixtures
    if (isCupCompetition && league.fixtures.length > MAX_FIXTURES_PER_SLIDE) {
      const totalPages = Math.ceil(league.fixtures.length / MAX_FIXTURES_PER_SLIDE);
      const pages: SlideData[] = [];
      
      for (let i = 0; i < totalPages; i++) {
        pages.push({
          leagueId: league.leagueId,
          leagueName: league.leagueName,
          fixtures: league.fixtures.slice(i * MAX_FIXTURES_PER_SLIDE, (i + 1) * MAX_FIXTURES_PER_SLIDE),
          pageNumber: i + 1,
          totalPages
        });
      }
      return pages;
    }
    
    // Non-cup or under 12 fixtures - single slide
    return [{
      leagueId: league.leagueId,
      leagueName: league.leagueName,
      fixtures: league.fixtures
    }];
  });

  // Rotate through slides
  useEffect(() => {
    if (slides.length <= 1) return;

    const rotationInterval = setInterval(() => {
      setCurrentLeagueIndex((prev) => (prev + 1) % slides.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(rotationInterval);
  }, [slides.length]);

  const currentSlide = slides[currentLeagueIndex];

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

  // Get elapsed time display with extra time if applicable
  const getElapsedDisplay = (fixture: Fixture) => {
    if (!fixture.elapsed) return null;
    
    if (fixture.status_extra && fixture.status_extra > 0) {
      return `${fixture.elapsed}+${fixture.status_extra}'`;
    }
    return `${fixture.elapsed}'`;
  };

  // Check if fixture is currently live/in-play
  const isLive = (fixture: Fixture) => {
    const status = fixture.status_short;
    return status === 'LIVE' || status === '1H' || status === '2H' || status === 'ET';
  };

  // Get left column display (always kickoff time)
  const getLeftDisplay = (fixture: Fixture) => {
    const kickoff = new Date(fixture.kickoff_utc);
    const timeStr = format(kickoff, 'HH:mm');
    return <span className="text-xs text-muted-foreground">{timeStr}</span>;
  };

  // Get right column display (elapsed time for live, status for HT/FT/PST/CANC/SUSP)
  const getRightDisplay = (fixture: Fixture) => {
    const status = fixture.status_short;
    
    // Live games show pulsing elapsed time
    if (isLive(fixture)) {
      const elapsed = getElapsedDisplay(fixture);
      return (
        <span className="text-xs font-bold text-red-500 animate-pulse">
          {elapsed || 'LIVE'}
        </span>
      );
    }
    
    // Half time - amber color
    if (status === 'HT') {
      return <span className="text-xs font-semibold text-amber-500">HT</span>;
    }
    
    // Full time - muted color
    if (status === 'FT') {
      return <span className="text-xs text-muted-foreground">FT</span>;
    }
    
    // Postponed, Cancelled, Suspended - muted color (same as kickoff time)
    if (status === 'PST' || status === 'CANC' || status === 'SUSP') {
      return <span className="text-xs text-muted-foreground">{status}</span>;
    }
    
    // Nothing on right for NS (not started) games
    return null;
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
        
        {/* Slide pagination dots */}
        {slides.length > 1 && (
          <div className="flex items-center gap-1">
            {slides.map((_, idx) => (
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

      {/* Current league name with page indicator for paginated cups */}
      <div className="px-4 py-2 bg-secondary/30 border-b border-border/50 flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          {currentSlide && (
            <img
              src={getCompetitionLogoUrl(currentSlide.leagueId)}
              alt=""
              className="w-4 h-4 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          {currentSlide?.leagueName}
        </h3>
        {currentSlide?.totalPages && (
          <span className="text-xs text-muted-foreground/60">
            {currentSlide.pageNumber}/{currentSlide.totalPages}
          </span>
        )}
      </div>

      {/* Fixtures list - compact single line format */}
      <div className="flex-1 overflow-y-auto">
        {currentSlide?.fixtures.map((fixture) => (
          <div
            key={fixture.fixture_id}
            className="px-3 py-2.5 border-b border-border/50 hover:bg-secondary/20 transition-colors"
          >
            <div className="flex items-center text-xs">
              {/* Left: Kickoff time or status (HT/FT) */}
              <div className="w-12 flex-shrink-0 text-center">
                {getLeftDisplay(fixture)}
              </div>

              {/* Match info - centered and spread */}
              <div className="flex-1 flex items-center justify-center gap-2">
                {/* Home Team: Logo + Abbr */}
                <div className="flex items-center gap-1.5 justify-end min-w-[60px]">
                  <img
                    src={fixture.home_team_logo}
                    alt={fixture.home_team_name}
                    className="w-4 h-4 object-contain flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <span className="font-medium" title={fixture.home_team_name}>
                    {getTeamAbbr(fixture.home_team_name)}
                  </span>
                </div>

                {/* Score */}
                <span className="font-bold text-center min-w-[36px]">
                  {fixture.home_goals !== null && fixture.away_goals !== null
                    ? `${fixture.home_goals} - ${fixture.away_goals}`
                    : 'v'}
                </span>

                {/* Away Team: Abbr + Logo */}
                <div className="flex items-center gap-1.5 justify-start min-w-[60px]">
                  <span className="font-medium" title={fixture.away_team_name}>
                    {getTeamAbbr(fixture.away_team_name)}
                  </span>
                  <img
                    src={fixture.away_team_logo}
                    alt={fixture.away_team_name}
                    className="w-4 h-4 object-contain flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              </div>

              {/* Right: Pulsing elapsed time for live games */}
              <div className="w-14 flex-shrink-0 text-right">
                {getRightDisplay(fixture)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with rotation indicator */}
      {slides.length > 1 && (
        <div className="px-4 py-2 border-t border-border bg-secondary/20">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{currentLeagueIndex + 1} of {slides.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveScores;
