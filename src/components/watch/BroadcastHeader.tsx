import { Radio, Newspaper, Mic, Calendar, Clock, Trophy } from 'lucide-react';
import { ChannelMode } from '@/types/scheduler';

interface BroadcastHeaderProps {
  mode: ChannelMode;
  subtitle?: string;
}

const modeConfig: Record<ChannelMode, { icon: React.ElementType; label: string; color: string }> = {
  LIVE: { icon: Radio, label: 'Live', color: 'text-red-500' },
  NEWS: { icon: Newspaper, label: 'News', color: 'text-blue-500' },
  PODCAST: { icon: Mic, label: 'Podcast', color: 'text-purple-500' },
  MATCHDAY: { icon: Trophy, label: 'Matchday', color: 'text-amber-500' },
  POST_MATCHDAY: { icon: Clock, label: 'Post Match', color: 'text-orange-500' },
  NONE_MATCHDAY: { icon: Calendar, label: 'No Matches', color: 'text-muted-foreground' },
  OFF_AIR: { icon: Radio, label: 'Off Air', color: 'text-muted-foreground' },
};

const BroadcastHeader = ({ mode, subtitle }: BroadcastHeaderProps) => {
  const config = modeConfig[mode] || modeConfig.OFF_AIR;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 mb-3">
      <Icon className={`w-6 h-6 ${config.color}`} />
      <div className="flex items-baseline gap-2">
        <h2 className="text-lg font-bold">Ball Watching</h2>
        <span className={`text-sm font-medium ${config.color}`}>
          {subtitle || config.label}
        </span>
      </div>
    </div>
  );
};

export default BroadcastHeader;
