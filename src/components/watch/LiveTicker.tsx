import { useState, useEffect, useRef, useMemo } from 'react';
import { useLiveTicker, TickerCompetition, TickerFixture } from '@/hooks/useLiveTicker';
import bwLogo from '@/assets/bw-new-logo.png';

// Helper to get competition logo URL from storage
const getCompetitionLogoUrl = (competitionId: string | number): string => {
  return `https://pwpewpymzibnewdosxiq.supabase.co/storage/v1/object/public/ball-watching/competitions/${competitionId}.svg`;
};

// Parse goal time to a comparable number (e.g., "45+2'" -> 47, "90'" -> 90)
const parseGoalTime = (time: string): number => {
  const match = time.match(/(\d+)(?:\+(\d+))?/);
  if (!match) return 0;
  const base = parseInt(match[1], 10);
  const extra = match[2] ? parseInt(match[2], 10) : 0;
  return base + extra;
};

// Check if a goal is an own goal
const isOwnGoal = (player: string | null | undefined): boolean => {
  if (!player) return false;
  return player.toLowerCase().includes('(og)') || player.toLowerCase().includes('own goal');
};

// Find the latest goal scorer for a fixture
// For own goals, the team that benefits is the OPPOSING team to the scorer
const findLatestGoal = (fixture: TickerFixture): { team: 'home' | 'away' | null; player: string; time: string } | null => {
  let latestTime = 0;
  let latestGoal: { team: 'home' | 'away'; player: string; time: string; isOG: boolean } | null = null;

  for (const goal of fixture.homeGoalscorers) {
    const time = parseGoalTime(goal.time);
    if (time > latestTime) {
      latestTime = time;
      latestGoal = { team: 'home', player: goal.player, time: goal.time, isOG: isOwnGoal(goal.player) };
    }
  }

  for (const goal of fixture.awayGoalscorers) {
    const time = parseGoalTime(goal.time);
    if (time > latestTime) {
      latestTime = time;
      latestGoal = { team: 'away', player: goal.player, time: goal.time, isOG: isOwnGoal(goal.player) };
    }
  }

  if (!latestGoal) return null;

  // For own goals, the beneficiary is the opposing team
  // If goal is in homeGoalscorers with (OG), the home team "scored" it but away benefits
  // If goal is in awayGoalscorers with (OG), the away team "scored" it but home benefits
  const beneficiaryTeam = latestGoal.isOG 
    ? (latestGoal.team === 'home' ? 'away' : 'home')
    : latestGoal.team;

  return { team: beneficiaryTeam, player: latestGoal.player, time: latestGoal.time };
};

const LiveTicker = () => {
  const { competitions, isLoading } = useLiveTicker({ pollInterval: 120000 });
  const [londonTime, setLondonTime] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update London time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const londonTimeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Europe/London',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setLondonTime(londonTimeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format fixture for display as JSX
  const formatFixture = (fixture: TickerFixture): React.ReactNode => {
    const { homeTeam, awayTeam, homeGoals, awayGoals } = fixture;
    const latestGoal = findLatestGoal(fixture);
    
    // Build goalscorers arrays with highlighting info
    const homeGoalNodes = fixture.homeGoalscorers.map((g, i) => {
      const isLatest = latestGoal?.team === 'home' && latestGoal.player === g.player && latestGoal.time === g.time;
      return (
        <span key={`home-${i}`} className={isLatest ? 'text-[#E9C46A] font-semibold' : ''}>
          {g.player} {g.time}
        </span>
      );
    });
    
    const awayGoalNodes = fixture.awayGoalscorers.map((g, i) => {
      const isLatest = latestGoal?.team === 'away' && latestGoal.player === g.player && latestGoal.time === g.time;
      return (
        <span key={`away-${i}`} className={isLatest ? 'text-[#E9C46A] font-semibold' : ''}>
          {g.player} {g.time}
        </span>
      );
    });
    
    // Build red cards string
    const homeRedStr = fixture.homeRedCards.map(r => `${r.player} ${r.time}`).join(', ');
    const awayRedStr = fixture.awayRedCards.map(r => `${r.player} ${r.time}`).join(', ');
    
    // Check if home or away team scored the latest goal
    const homeHighlight = latestGoal?.team === 'home';
    const awayHighlight = latestGoal?.team === 'away';
    
    // Build events display
    const hasGoals = homeGoalNodes.length > 0 || awayGoalNodes.length > 0;
    const hasReds = homeRedStr || awayRedStr;
    
    return (
      <span className="inline-flex items-center">
        <span className={homeHighlight ? 'text-[#E9C46A] font-semibold' : ''}>{homeTeam}</span>
        <span className="mx-1">{homeGoals ?? 0} - {awayGoals ?? 0}</span>
        <span className={awayHighlight ? 'text-[#E9C46A] font-semibold' : ''}>{awayTeam}</span>
        {(hasGoals || hasReds) && (
          <span className="ml-1">
            (
            {homeGoalNodes.length > 0 && homeGoalNodes.reduce((prev, curr, i) => (
              <>{prev}{i > 0 ? ', ' : ''}{curr}</>
            ), <></>)}
            {homeGoalNodes.length > 0 && awayGoalNodes.length > 0 && ', '}
            {awayGoalNodes.length > 0 && awayGoalNodes.reduce((prev, curr, i) => (
              <>{prev}{i > 0 ? ', ' : ''}{curr}</>
            ), <></>)}
            {hasGoals && hasReds && ' / '}
            {hasReds && (
              <span className="text-[#E76F51]">
                {[homeRedStr, awayRedStr].filter(Boolean).join(', ')}
              </span>
            )}
            )
          </span>
        )}
      </span>
    );
  };

  // Build the full ticker content as JSX nodes
  const tickerContent = useMemo(() => {
    if (competitions.length === 0) {
      return <span>Waiting for match updates...</span>;
    }

    return competitions.map((competition, compIdx) => (
      <span key={competition.competitionId} className="inline-flex items-center">
        {compIdx > 0 && <span className="mx-6 text-muted-foreground">•</span>}
        <img
          src={getCompetitionLogoUrl(competition.competitionId)}
          alt=""
          className="w-4 h-4 object-contain mr-1.5"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <span className="font-semibold mr-2">{competition.competitionName}:</span>
        {competition.fixtures.map((fixture, fixIdx) => (
          <span key={fixture.fixtureId} className="inline-flex items-center">
            {fixIdx > 0 && <span className="mx-3 text-muted-foreground">|</span>}
            {formatFixture(fixture)}
          </span>
        ))}
      </span>
    ));
  }, [competitions]);

  // Smooth scrolling animation
  const scrollPositionRef = useRef(0);
  
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    let animationId: number;
    let lastTime = performance.now();
    const pixelsPerSecond = 50;

    const scroll = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const scrollWidth = scrollElement.scrollWidth / 2;
      scrollPositionRef.current += pixelsPerSecond * deltaTime;
      
      if (scrollPositionRef.current >= scrollWidth) {
        scrollPositionRef.current = scrollPositionRef.current - scrollWidth;
      }
      
      scrollElement.scrollLeft = scrollPositionRef.current;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [tickerContent]);

  if (isLoading && competitions.length === 0) {
    return (
      <div className="h-12 flex items-center bg-secondary/50 border-y border-border">
        <div className="flex items-center gap-3 px-4 h-full border-r border-border bg-background/80 flex-shrink-0">
          <img src={bwLogo} alt="Ball Watching" className="h-6 w-auto" />
          <span className="text-sm font-mono font-semibold text-foreground">{londonTime}</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Loading match updates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-12 flex items-center bg-secondary/50 border-y border-border overflow-hidden">
      <div className="flex items-center gap-3 px-4 h-full border-r border-border bg-background/80 flex-shrink-0 z-20">
        <img src={bwLogo} alt="Ball Watching" className="h-6 w-auto" />
        <span className="text-sm font-mono font-semibold text-foreground">{londonTime}</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-hidden whitespace-nowrap"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="inline-flex items-center h-12">
          <span className="text-sm font-medium px-4">{tickerContent}</span>
          <span className="text-sm font-medium px-4">{tickerContent}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveTicker;
