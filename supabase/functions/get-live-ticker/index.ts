import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Fixture {
  fixture_id: number;
  competition_id: number;
  competition_name: string;
  home_team_id: number;
  home_team_name: string;
  home_goals: number | null;
  away_team_id: number;
  away_team_name: string;
  away_goals: number | null;
  status_short: string;
}

interface FixtureEvent {
  type: string;
  minute: number;
  extra_time: number | null;
  team_id: number;
  player_name: string;
  detail?: string;
}

interface TickerFixture {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  status: string;
  homeGoalscorers: Array<{ player: string; time: string }>;
  awayGoalscorers: Array<{ player: string; time: string }>;
  homeRedCards: Array<{ player: string; time: string }>;
  awayRedCards: Array<{ player: string; time: string }>;
}

interface TickerCompetition {
  competitionId: string;
  competitionName: string;
  fixtures: TickerFixture[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const UPSTASH_REDIS_REST_URL = Deno.env.get('UPSTASH_REDIS_REST_URL');
    const UPSTASH_REDIS_REST_TOKEN = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Missing Upstash Redis configuration');
    }

    const today = new Date().toISOString().split('T')[0];
    console.log('Fetching live ticker data for date:', today);

    // Get all competitions from the hash
    const competitionsResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/hgetall/bw:competitions`, {
      headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
    });

    if (!competitionsResponse.ok) {
      throw new Error(`Failed to fetch competitions: ${competitionsResponse.status}`);
    }

    const competitionsData = await competitionsResponse.json();
    
    // Parse competitions - result is an array of [key, value, key, value, ...]
    const competitionsMap: Record<string, string> = {};
    if (competitionsData.result && Array.isArray(competitionsData.result)) {
      for (let i = 0; i < competitionsData.result.length; i += 2) {
        competitionsMap[competitionsData.result[i]] = competitionsData.result[i + 1];
      }
    }

    console.log('Found competitions:', Object.keys(competitionsMap).length);

    const tickerCompetitions: TickerCompetition[] = [];

    // For each competition, get today's fixtures
    for (const [competitionId, competitionName] of Object.entries(competitionsMap)) {
      const fixturesSetKey = `bw:matchday:${today}:comp:${competitionId}:fixtures`;
      
      // Get fixture IDs from the set
      const fixtureIdsResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/smembers/${encodeURIComponent(fixturesSetKey)}`, {
        headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
      });

      if (!fixtureIdsResponse.ok) {
        continue;
      }

      const fixtureIdsData = await fixtureIdsResponse.json();
      
      // Handle both properly stored IDs and space-separated strings
      let fixtureIds: string[] = [];
      if (fixtureIdsData.result && Array.isArray(fixtureIdsData.result)) {
        for (const item of fixtureIdsData.result) {
          const splitIds = item.toString().trim().split(/\s+/);
          fixtureIds.push(...splitIds.filter((id: string) => id.length > 0));
        }
      }

      if (fixtureIds.length === 0) {
        continue;
      }

      const tickerFixtures: TickerFixture[] = [];

      // Fetch each fixture's details and events
      for (const fixtureId of fixtureIds) {
        // Fetch fixture details
        const fixtureKey = `fixture:${fixtureId}`;
        const fixtureResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(fixtureKey)}`, {
          headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
        });

        if (!fixtureResponse.ok) {
          continue;
        }

        const fixtureData = await fixtureResponse.json();
        if (!fixtureData.result) {
          continue;
        }

        let fixture: Fixture;
        try {
          fixture = JSON.parse(fixtureData.result) as Fixture;
        } catch (e) {
          console.error(`Failed to parse fixture ${fixtureId}:`, e);
          continue;
        }

        // Fetch fixture events
        const eventsKey = `fixture:${fixtureId}:events`;
        const eventsResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/lrange/${encodeURIComponent(eventsKey)}/0/-1`, {
          headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
        });

        let events: FixtureEvent[] = [];
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          if (eventsData.result && Array.isArray(eventsData.result)) {
            for (const eventStr of eventsData.result) {
              try {
                const event = JSON.parse(eventStr) as FixtureEvent;
                events.push(event);
              } catch (e) {
                console.error(`Failed to parse event for fixture ${fixtureId}:`, e);
              }
            }
          }
        }

        // Filter events to goals and red cards, organize by team
        const homeGoalscorers: Array<{ player: string; time: string }> = [];
        const awayGoalscorers: Array<{ player: string; time: string }> = [];
        const homeRedCards: Array<{ player: string; time: string }> = [];
        const awayRedCards: Array<{ player: string; time: string }> = [];

        for (const event of events) {
          const timeDisplay = event.extra_time 
            ? `${event.minute}+${event.extra_time}'` 
            : `${event.minute}'`;

          const isHomeTeam = event.team_id === fixture.home_team_id;

          if (event.type === 'Goal') {
            // Exclude own goals from goalscorers display (or mark them)
            const isOwnGoal = event.detail?.toLowerCase().includes('own goal');
            const playerDisplay = isOwnGoal ? `${event.player_name} (OG)` : event.player_name;
            
            if (isHomeTeam) {
              if (isOwnGoal) {
                // Own goal goes to opposing team's scorers
                awayGoalscorers.push({ player: playerDisplay, time: timeDisplay });
              } else {
                homeGoalscorers.push({ player: event.player_name, time: timeDisplay });
              }
            } else {
              if (isOwnGoal) {
                homeGoalscorers.push({ player: playerDisplay, time: timeDisplay });
              } else {
                awayGoalscorers.push({ player: event.player_name, time: timeDisplay });
              }
            }
          } else if (event.type === 'Card' && event.detail?.toLowerCase().includes('red')) {
            if (isHomeTeam) {
              homeRedCards.push({ player: event.player_name, time: timeDisplay });
            } else {
              awayRedCards.push({ player: event.player_name, time: timeDisplay });
            }
          }
        }

        // Skip postponed fixtures
        if (fixture.status_short === 'PST') {
          continue;
        }

        tickerFixtures.push({
          fixtureId: fixture.fixture_id,
          homeTeam: fixture.home_team_name,
          awayTeam: fixture.away_team_name,
          homeGoals: fixture.home_goals,
          awayGoals: fixture.away_goals,
          status: fixture.status_short,
          homeGoalscorers,
          awayGoalscorers,
          homeRedCards,
          awayRedCards,
        });
      }

      if (tickerFixtures.length > 0) {
        // Sort fixtures by home team name alphabetically
        tickerFixtures.sort((a, b) => a.homeTeam.localeCompare(b.homeTeam));

        tickerCompetitions.push({
          competitionId,
          competitionName: competitionName.toUpperCase(),
          fixtures: tickerFixtures,
        });
      }
    }

    // Sort competitions by competition ID (numeric order)
    tickerCompetitions.sort((a, b) => parseInt(a.competitionId, 10) - parseInt(b.competitionId, 10));

    console.log(`Returning ${tickerCompetitions.length} competitions with fixtures`);

    return new Response(JSON.stringify({
      competitions: tickerCompetitions,
      date: today,
      lastUpdated: Date.now(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-live-ticker:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        competitions: [],
        date: new Date().toISOString().split('T')[0],
        lastUpdated: Date.now(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
