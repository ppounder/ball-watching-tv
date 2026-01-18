import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChannelMode, SchedulerData, NowBundle } from '@/types/scheduler';
import { deriveChannelMode } from '@/utils/deriveChannelMode';

const SCHEDULER_POLL_INTERVAL = 45 * 1000; // 45 seconds (between 30-60s as requested)

export const useSchedulerState = () => {
  const [bundle, setBundle] = useState<NowBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derive mode from current schedule item, falling back to channel_state.mode
  const mode = useMemo(() => deriveChannelMode(bundle), [bundle]);

  const fetchSchedulerState = useCallback(async () => {
    try {
      console.log('Fetching scheduler state...');
      const { data, error } = await supabase.functions.invoke('get-scheduler-state');
      
      if (error) {
        console.error('Failed to fetch scheduler state:', error);
        setError(error.message);
        return;
      }
      
      const schedulerData = data as SchedulerData;
      const derivedMode = deriveChannelMode(schedulerData.bundle);
      console.log('Scheduler state received - derived mode:', derivedMode, '(channel_state.mode:', schedulerData.mode, ')');
      
      setBundle(schedulerData.bundle);
      setLastUpdated(schedulerData.lastUpdated);
      setError(null);
    } catch (err) {
      console.error('Error fetching scheduler state:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedulerState();
    
    // Poll for scheduler state every 45 seconds
    const interval = setInterval(fetchSchedulerState, SCHEDULER_POLL_INTERVAL);
    
    return () => clearInterval(interval);
  }, [fetchSchedulerState]);

  return {
    mode,
    bundle,
    isLoading,
    lastUpdated,
    error,
    refetch: fetchSchedulerState,
  };
};
