import { ChannelMode } from '@/types/scheduler';
import { cn } from '@/lib/utils';

interface ChannelModeIndicatorProps {
  mode: ChannelMode;
  className?: string;
}

const modeConfig: Record<ChannelMode, { label: string; color: string }> = {
  LIVE: { label: 'LIVE', color: 'bg-red-500' },
  NEWS: { label: 'NEWS', color: 'bg-blue-500' },
  PODCAST: { label: 'PODCAST', color: 'bg-purple-500' },
  MATCHDAY: { label: 'MATCHDAY', color: 'bg-green-500' },
  POST_MATCHDAY: { label: 'POST-MATCH', color: 'bg-blue-500' },
  NONE_MATCHDAY: { label: 'NO MATCHES', color: 'bg-gray-500' },
  OFF_AIR: { label: 'OFF AIR', color: 'bg-gray-700' },
};

const ChannelModeIndicator = ({ mode, className }: ChannelModeIndicatorProps) => {
  const config = modeConfig[mode] || modeConfig.OFF_AIR;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "w-2 h-2 rounded-full", 
        config.color, 
        (mode === 'LIVE' || mode === 'NEWS' || mode === 'PODCAST') && "animate-pulse"
      )} />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {config.label}
      </span>
    </div>
  );
};

export default ChannelModeIndicator;
