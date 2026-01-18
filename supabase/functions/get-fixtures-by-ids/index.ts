import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fixtureIds } = await req.json();
    
    if (!fixtureIds || !Array.isArray(fixtureIds) || fixtureIds.length === 0) {
      console.log('No fixture IDs provided');
      return new Response(
        JSON.stringify({ fixtures: [], error: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching ${fixtureIds.length} fixtures by ID:`, fixtureIds);

    const UPSTASH_REDIS_REST_URL = Deno.env.get('UPSTASH_REDIS_REST_URL');
    const UPSTASH_REDIS_REST_TOKEN = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Redis credentials not configured');
    }

    // Build MGET command for all fixture keys
    const fixtureKeys = fixtureIds.map((id: number) => `fixture:${id}`);
    const mgetPath = `/mget/${fixtureKeys.map(encodeURIComponent).join('/')}`;
    
    console.log(`Fetching fixtures from Redis with MGET`);

    const response = await fetch(`${UPSTASH_REDIS_REST_URL}${mgetPath}`, {
      headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
    });

    if (!response.ok) {
      console.error(`Redis MGET request failed with status ${response.status}`);
      throw new Error(`Redis request failed: ${response.status}`);
    }

    const data = await response.json();
    const results = data.result || [];

    console.log(`Received ${results.length} results from Redis`);

    // Parse fixture data
    const fixtures = results
      .map((result: string | null, index: number) => {
        if (!result) {
          console.log(`No data found for fixture ID ${fixtureIds[index]}`);
          return null;
        }
        try {
          const parsed = typeof result === 'string' ? JSON.parse(result) : result;
          return parsed;
        } catch (parseError) {
          console.error(`Failed to parse fixture ${fixtureIds[index]}:`, parseError);
          return null;
        }
      })
      .filter((fixture: unknown) => fixture !== null);

    console.log(`Successfully parsed ${fixtures.length} fixtures`);

    return new Response(
      JSON.stringify({
        fixtures,
        requested: fixtureIds.length,
        found: fixtures.length,
        lastUpdated: Date.now(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching fixtures by IDs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        fixtures: [],
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
