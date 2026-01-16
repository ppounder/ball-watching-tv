import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Fixture {
  fixture_id: number;
  competition_id: number;
  competition_name: string;
  competition_country: string;
  season: number;
  round: string;
  kickoff_utc: string;
  timestamp: number;
  timezone: string;
  status_short: string;
  status_long: string;
  elapsed: number | null;
  status_extra: string | null;
  venue_id: number;
  venue_name: string;
  venue_city: string;
  home_team_id: number;
  home_team_name: string;
  home_team_logo: string;
  home_goals: number | null;
  away_team_id: number;
  away_team_name: string;
  away_team_logo: string;
  away_goals: number | null;
  last_updated_utc: string;
}

interface LeagueFixtures {
  leagueId: string;
  leagueName: string;
  fixtures: Fixture[];
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

    // Get today's date in yyyy-mm-dd format
    const today = new Date().toISOString().split('T')[0];
    console.log('Fetching fixtures for date:', today);

    // First, get all competitions from the hash
    const competitionsResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/hgetall/bw:competitions`, {
      headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
    });

    if (!competitionsResponse.ok) {
      throw new Error(`Failed to fetch competitions: ${competitionsResponse.status}`);
    }

    const competitionsData = await competitionsResponse.json();
    console.log('Competitions response:', JSON.stringify(competitionsData));

    // Parse competitions - result is an array of [key, value, key, value, ...]
    const competitionsMap: Record<string, string> = {};
    if (competitionsData.result && Array.isArray(competitionsData.result)) {
      for (let i = 0; i < competitionsData.result.length; i += 2) {
        competitionsMap[competitionsData.result[i]] = competitionsData.result[i + 1];
      }
    }

    console.log('Parsed competitions:', Object.keys(competitionsMap).length);

    const leagueFixtures: LeagueFixtures[] = [];

    // For each competition, get today's fixtures
    for (const [leagueId, leagueName] of Object.entries(competitionsMap)) {
      const fixturesSetKey = `bw:matchday:${today}:comp:${leagueId}:fixtures`;
      
      // Get fixture IDs from the set
      const fixtureIdsResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/smembers/${encodeURIComponent(fixturesSetKey)}`, {
        headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
      });

      if (!fixtureIdsResponse.ok) {
        console.log(`No fixtures found for league ${leagueId}`);
        continue;
      }

      const fixtureIdsData = await fixtureIdsResponse.json();
      const fixtureIds: string[] = fixtureIdsData.result || [];

      if (fixtureIds.length === 0) {
        continue;
      }

      console.log(`Found ${fixtureIds.length} fixtures for league ${leagueName}`);

      // Fetch each fixture's details
      const fixtures: Fixture[] = [];
      for (const fixtureId of fixtureIds) {
        const fixtureKey = `fixture:${fixtureId}`;
        const fixtureResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(fixtureKey)}`, {
          headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
        });

        if (fixtureResponse.ok) {
          const fixtureData = await fixtureResponse.json();
          if (fixtureData.result) {
            try {
              const fixture = JSON.parse(fixtureData.result) as Fixture;
              fixtures.push(fixture);
            } catch (e) {
              console.error(`Failed to parse fixture ${fixtureId}:`, e);
            }
          }
        }
      }

      if (fixtures.length > 0) {
        // Sort fixtures by kickoff time
        fixtures.sort((a, b) => a.timestamp - b.timestamp);
        
        leagueFixtures.push({
          leagueId,
          leagueName,
          fixtures,
        });
      }
    }

    // Sort leagues alphabetically
    leagueFixtures.sort((a, b) => a.leagueName.localeCompare(b.leagueName));

    console.log(`Returning ${leagueFixtures.length} leagues with fixtures`);

    return new Response(JSON.stringify({
      leagues: leagueFixtures,
      date: today,
      lastUpdated: Date.now(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-todays-fixtures:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        leagues: [],
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
