import { useState, useEffect, useRef, useMemo } from 'react';
import { useLiveTicker, TickerCompetition, TickerFixture } from '@/hooks/useLiveTicker';
import bwLogo from '@/assets/bw-new-logo.png';

const LiveTicker = () => {
  const { competitions, isLoading } = useLiveTicker({ pollInterval: 120000 });
  const [londonTime, setLondonTime] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

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

  // Format fixture for display
  const formatFixture = (fixture: TickerFixture): string => {
    const { homeTeam, awayTeam, homeGoals, awayGoals } = fixture;
    const score = `${homeGoals ?? 0} - ${awayGoals ?? 0}`;
    
    // Build goalscorers string
    const homeGoalStr = fixture.homeGoalscorers.map(g => `${g.player} ${g.time}`).join(', ');
    const awayGoalStr = fixture.awayGoalscorers.map(g => `${g.player} ${g.time}`).join(', ');
    
    // Build red cards string
    const homeRedStr = fixture.homeRedCards.map(r => `${r.player} ${r.time}`).join(', ');
    const awayRedStr = fixture.awayRedCards.map(r => `${r.player} ${r.time}`).join(', ');
    
    // Combine goals
    const goalParts: string[] = [];
    if (homeGoalStr) goalParts.push(homeGoalStr);
    if (awayGoalStr) goalParts.push(awayGoalStr);
    const goalsDisplay = goalParts.join(', ');
    
    // Combine red cards
    const redParts: string[] = [];
    if (homeRedStr) redParts.push(homeRedStr);
    if (awayRedStr) redParts.push(awayRedStr);
    const redsDisplay = redParts.join(', ');
    
    // Build events display
    let eventsDisplay = '';
    if (goalsDisplay || redsDisplay) {
      const eventParts: string[] = [];
      if (goalsDisplay) eventParts.push(goalsDisplay);
      if (redsDisplay) eventParts.push(redsDisplay);
      eventsDisplay = ` (${eventParts.join(' / ')})`;
    }
    
    return `${homeTeam} ${score} ${awayTeam}${eventsDisplay}`;
  };

  // Build the full ticker content string
  const tickerContent = useMemo(() => {
    if (competitions.length === 0) {
      return 'Waiting for match updates...';
    }

    const parts: string[] = [];
    
    for (const competition of competitions) {
      const fixtureStrings = competition.fixtures.map(formatFixture);
      parts.push(`${competition.competitionName}: ${fixtureStrings.join(' | ')}`);
    }
    
    return parts.join('  •  ');
  }, [competitions]);

  // Save scroll position before data update and restore after
  const scrollPositionRef = useRef(0);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollPositionRef.current = scrollRef.current.scrollLeft;
    }
  }, [competitions]);

  // Smooth scrolling animation
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    let animationId: number;
    let lastTime = performance.now();
    const pixelsPerSecond = 50; // Adjust scroll speed

    const scroll = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const scrollWidth = scrollElement.scrollWidth / 2; // Half because content is duplicated
      scrollPositionRef.current += pixelsPerSecond * deltaTime;
      
      // Reset position seamlessly when we've scrolled through one full set
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
        {/* Fixed logo + time block */}
        <div className="flex items-center gap-3 px-4 h-full border-r border-border bg-background/80 flex-shrink-0">
          <img src={bwLogo} alt="Ball Watching" className="h-6 w-auto" />
          <span className="text-sm font-mono font-semibold text-foreground">{londonTime}</span>
        </div>
        {/* Loading state */}
        <div className="flex-1 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Loading match updates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-12 flex items-center bg-secondary/50 border-y border-border overflow-hidden">
      {/* Fixed logo + time block */}
      <div className="flex items-center gap-3 px-4 h-full border-r border-border bg-background/80 flex-shrink-0 z-20">
        <img src={bwLogo} alt="Ball Watching" className="h-6 w-auto" />
        <span className="text-sm font-mono font-semibold text-foreground">{londonTime}</span>
      </div>
      
      {/* Scrolling content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-hidden whitespace-nowrap"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="inline-flex items-center h-12">
          {/* Duplicate content for seamless loop */}
          <span className="text-sm font-medium px-4">{tickerContent}</span>
          <span className="text-sm font-medium px-4">{tickerContent}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveTicker;
