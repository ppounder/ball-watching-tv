import { ChannelMode } from '@/types/scheduler';
import { cn } from '@/lib/utils';

interface ChannelModeIndicatorProps {
  mode: ChannelMode;
  className?: string;
}

const modeConfig: Record<ChannelMode, { label: string; color: string }> = {
  LIVE: { label: 'LIVE', color: 'bg-red-500' },
  MATCHDAY: { label: 'MATCHDAY', color: 'bg-green-500' },
  POST_MATCHDAY: { label: 'POST-MATCH', color: 'bg-blue-500' },
  NONE_MATCHDAY: { label: 'NO MATCHES', color: 'bg-gray-500' },
  OFF_AIR: { label: 'OFF AIR', color: 'bg-gray-700' },
};

const ChannelModeIndicator = ({ mode, className }: ChannelModeIndicatorProps) => {
  const config = modeConfig[mode];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-2 h-2 rounded-full", config.color, mode === 'LIVE' && "animate-pulse")} />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {config.label}
      </span>
    </div>
  );
};

export default ChannelModeIndicator;
