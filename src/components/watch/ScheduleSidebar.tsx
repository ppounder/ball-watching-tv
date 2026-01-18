import { format } from 'date-fns';
import { Radio, Mic, Newspaper, Clock, CheckCircle, Play } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { NowBundle, ScheduleItem } from '@/types/scheduler';
import { cn } from '@/lib/utils';

interface ScheduleSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundle: NowBundle | null;
}

const getItemIcon = (type: string) => {
  switch (type) {
    case 'LIVE':
      return Radio;
    case 'PODCAST':
      return Mic;
    case 'NEWS':
      return Newspaper;
    default:
      return Clock;
  }
};

const getItemStatus = (
  item: ScheduleItem,
  currentItemId: string | null,
  now: Date
): 'completed' | 'live' | 'upcoming' => {
  if (item.schedule_item_id === currentItemId) {
    return 'live';
  }
  
  if (item.scheduled_for_uk) {
    const scheduledTime = new Date(item.scheduled_for_uk);
    if (scheduledTime < now && item.schedule_item_id !== currentItemId) {
      return 'completed';
    }
  }
  
  return 'upcoming';
};

const ScheduleSidebar = ({ open, onOpenChange, bundle }: ScheduleSidebarProps) => {
  const items = bundle?.items || [];
  const currentItemId = bundle?.now.current_schedule_item_id || null;
  const now = new Date();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 sm:w-96 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Today's Schedule
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No schedule available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const status = getItemStatus(item, currentItemId, now);
              const Icon = getItemIcon(item.schedule_item_type);
              const scheduledTime = item.scheduled_for_uk 
                ? format(new Date(item.scheduled_for_uk), 'HH:mm')
                : '--:--';

              return (
                <div
                  key={item.schedule_item_id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                    status === 'completed' && 'opacity-50 bg-muted/30 border-border/50',
                    status === 'live' && 'bg-primary/10 border-primary/50 ring-1 ring-primary/30',
                    status === 'upcoming' && 'bg-card border-border hover:bg-muted/50'
                  )}
                >
                  {/* Time column */}
                  <div className="flex-shrink-0 w-12 text-center">
                    <span className={cn(
                      'text-sm font-mono',
                      status === 'completed' && 'text-muted-foreground',
                      status === 'live' && 'text-primary font-bold',
                      status === 'upcoming' && 'text-foreground'
                    )}>
                      {scheduledTime}
                    </span>
                  </div>

                  {/* Status indicator */}
                  <div className="flex-shrink-0 mt-0.5">
                    {status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    {status === 'live' && (
                      <div className="relative">
                        <Play className="w-4 h-4 text-primary fill-primary" />
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                      </div>
                    )}
                    {status === 'upcoming' && (
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium text-sm truncate',
                      status === 'completed' && 'text-muted-foreground',
                      status === 'live' && 'text-primary',
                      status === 'upcoming' && 'text-foreground'
                    )}>
                      {item.title || item.schedule_item_type}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded',
                        status === 'live' 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      )}>
                        <Icon className="w-3 h-3" />
                        {item.schedule_item_type}
                      </span>
                      
                      {status === 'live' && (
                        <span className="text-xs font-medium text-primary uppercase tracking-wide">
                          Live Now
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ScheduleSidebar;
