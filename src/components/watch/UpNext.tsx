import { ChevronRight, Clock, Radio, Newspaper, Mic } from 'lucide-react';
import { ScheduleItem, ScheduleItemType } from '@/types/scheduler';
import { format, parseISO } from 'date-fns';

interface UpNextProps {
  nextItem: ScheduleItem;
}

const typeConfig: Record<ScheduleItemType, { icon: typeof Radio; label: string; color: string }> = {
  LIVE: { icon: Radio, label: 'LIVE', color: 'bg-red-500/20 text-red-400' },
  NEWS: { icon: Newspaper, label: 'NEWS', color: 'bg-blue-500/20 text-blue-400' },
  PODCAST: { icon: Mic, label: 'PODCAST', color: 'bg-purple-500/20 text-purple-400' },
  SHOW: { icon: Radio, label: 'SHOW', color: 'bg-green-500/20 text-green-400' },
  BREAK: { icon: Clock, label: 'BREAK', color: 'bg-gray-500/20 text-gray-400' },
};

const UpNext = ({ nextItem }: UpNextProps) => {
  const config = typeConfig[nextItem.schedule_item_type] || typeConfig.SHOW;
  const Icon = config.icon;

  const formatTime = (isoString?: string): string => {
    if (!isoString) return '';
    try {
      return format(parseISO(isoString), 'HH:mm');
    } catch {
      return '';
    }
  };

  const time = formatTime(nextItem.scheduled_for_uk);

  return (
    <div className="flex-shrink-0 broadcast-card rounded-lg px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ChevronRight className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wide">Up Next</span>
        </div>
        
        <div className="h-4 w-px bg-border" />
        
        <div className="flex items-center gap-2">
          {/* Type badge */}
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
          
          {/* Title */}
          <span className="text-sm font-medium">
            {nextItem.title || `${nextItem.schedule_item_type} Block`}
          </span>
        </div>
      </div>

      {/* Time */}
      {time && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-sm">{time}</span>
        </div>
      )}
    </div>
  );
};

export default UpNext;
