import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FixtureData } from '@/types/scheduler';

const FIXTURE_POLL_INTERVAL = 20 * 1000; // 20 seconds (between 15-30s as requested)

interface UseScheduleFixturesOptions {
  fixtureIds: number[];
  enabled?: boolean;
}

export const useScheduleFixtures = ({ fixtureIds, enabled = true }: UseScheduleFixturesOptions) => {
  const [fixtures, setFixtures] = useState<FixtureData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFixtures = useCallback(async () => {
    if (!fixtureIds.length) {
      setFixtures([]);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Fetching schedule fixtures:', fixtureIds);
      const { data, error: fetchError } = await supabase.functions.invoke('get-fixtures-by-ids', {
        body: { fixtureIds },
      });
      
      if (fetchError) {
        console.error('Failed to fetch fixtures by IDs:', fetchError);
        setError(fetchError.message);
        return;
      }
      
      const fixturesData = data?.fixtures || [];
      console.log(`Received ${fixturesData.length} fixtures for schedule`);
      
      setFixtures(fixturesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching schedule fixtures:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [fixtureIds]);

  useEffect(() => {
    if (!enabled) {
      setFixtures([]);
      setIsLoading(false);
      return;
    }

    fetchFixtures();
    
    // Poll for fixture updates while in LIVE mode
    const interval = setInterval(fetchFixtures, FIXTURE_POLL_INTERVAL);
    
    return () => clearInterval(interval);
  }, [fetchFixtures, enabled]);

  return {
    fixtures,
    isLoading,
    error,
    refetch: fetchFixtures,
  };
};
