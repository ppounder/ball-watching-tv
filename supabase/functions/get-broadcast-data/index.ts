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
    const UPSTASH_REDIS_REST_URL = Deno.env.get('UPSTASH_REDIS_REST_URL');
    const UPSTASH_REDIS_REST_TOKEN = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      console.error('Missing Upstash Redis configuration');
      throw new Error('Missing Upstash Redis configuration');
    }

    console.log('Fetching broadcast data from Upstash Redis...');

    // Fetch matches data
    const matchesResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/get/broadcast:matches`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    if (!matchesResponse.ok) {
      console.error('Failed to fetch matches:', matchesResponse.status, await matchesResponse.text());
      throw new Error(`Failed to fetch matches: ${matchesResponse.status}`);
    }

    const matchesData = await matchesResponse.json();
    console.log('Matches response:', JSON.stringify(matchesData));

    // Fetch alerts data
    const alertsResponse = await fetch(`${UPSTASH_REDIS_REST_URL}/get/broadcast:alerts`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    if (!alertsResponse.ok) {
      console.error('Failed to fetch alerts:', alertsResponse.status, await alertsResponse.text());
      throw new Error(`Failed to fetch alerts: ${alertsResponse.status}`);
    }

    const alertsData = await alertsResponse.json();
    console.log('Alerts response:', JSON.stringify(alertsData));

    // Parse the data - Upstash returns { result: "stringified JSON" }
    const matches = matchesData.result ? JSON.parse(matchesData.result) : [];
    const alerts = alertsData.result ? JSON.parse(alertsData.result) : [];

    const broadcastData = {
      matches,
      alerts,
      lastUpdated: Date.now(),
    };

    console.log('Returning broadcast data with', matches.length, 'matches and', alerts.length, 'alerts');

    return new Response(JSON.stringify(broadcastData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-broadcast-data:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        matches: [],
        alerts: [],
        lastUpdated: Date.now(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
