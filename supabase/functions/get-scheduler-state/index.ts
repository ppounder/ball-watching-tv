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
      throw new Error('Redis credentials not configured');
    }

    const schedulerKey = 'bw:schedule:channel:BALL_WATCHING:now_bundle';
    
    console.log(`Fetching scheduler state from Redis key: ${schedulerKey}`);

    // Fetch the now_bundle from Redis
    const response = await fetch(`${UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(schedulerKey)}`, {
      headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
    });

    if (!response.ok) {
      console.error(`Redis request failed with status ${response.status}`);
      throw new Error(`Redis request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw Redis response:', JSON.stringify(data));

    if (!data.result) {
      console.log('No scheduler state found in Redis, defaulting to OFF_AIR');
      return new Response(
        JSON.stringify({
          mode: 'OFF_AIR',
          lastUpdated: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON stored in Redis
    let nowBundle;
    try {
      nowBundle = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
    } catch (parseError) {
      console.error('Failed to parse now_bundle JSON:', parseError);
      throw new Error('Invalid JSON in scheduler state');
    }

    console.log('Parsed now_bundle:', JSON.stringify(nowBundle));

    const mode = nowBundle?.channel_state?.mode || 'OFF_AIR';
    
    console.log(`Channel mode: ${mode}`);

    return new Response(
      JSON.stringify({
        mode,
        lastUpdated: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching scheduler state:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        mode: 'OFF_AIR', // Fallback to OFF_AIR on error
        lastUpdated: new Date().toISOString(),
      }),
      { 
        status: 200, // Return 200 with fallback mode to not break the UI
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
