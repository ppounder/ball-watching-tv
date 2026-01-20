import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Goalscorer {
  player: string;
  time: string;
}

interface RedCard {
  player: string;
  time: string;
}

export interface TickerFixture {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  status: string;
  homeGoalscorers: Goalscorer[];
  awayGoalscorers: Goalscorer[];
  homeRedCards: RedCard[];
  awayRedCards: RedCard[];
}

export interface TickerCompetition {
  competitionId: string;
  competitionName: string;
  fixtures: TickerFixture[];
}

interface LiveTickerData {
  competitions: TickerCompetition[];
  date: string;
  lastUpdated: number;
}

interface UseLiveTickerOptions {
  pollInterval?: number; // in milliseconds, default 2 minutes
  enabled?: boolean;
}

export function useLiveTicker(options: UseLiveTickerOptions = {}) {
  const { pollInterval = 120000, enabled = true } = options;
  
  const [data, setData] = useState<LiveTickerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const { data: response, error: fetchError } = await supabase.functions.invoke('get-live-ticker');

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (response) {
        setData(response as LiveTickerData);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching live ticker data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Initial fetch
    fetchData();

    // Set up polling
    intervalRef.current = window.setInterval(fetchData, pollInterval);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pollInterval, fetchData]);

  return {
    competitions: data?.competitions ?? [],
    lastUpdated: data?.lastUpdated ?? null,
    isLoading,
    error,
    refetch: fetchData,
  };
}
