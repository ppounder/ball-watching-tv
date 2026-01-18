import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChannelMode, SchedulerData } from '@/types/scheduler';

const SCHEDULER_POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useSchedulerState = () => {
  const [mode, setMode] = useState<ChannelMode>('OFF_AIR');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      console.log('Scheduler state received:', schedulerData);
      
      setMode(schedulerData.mode);
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
    
    // Poll for scheduler state every 5 minutes
    const interval = setInterval(fetchSchedulerState, SCHEDULER_POLL_INTERVAL);
    
    return () => clearInterval(interval);
  }, [fetchSchedulerState]);

  return {
    mode,
    isLoading,
    lastUpdated,
    error,
    refetch: fetchSchedulerState,
  };
};
