import { useState, useMemo } from 'react';
import { Alert, AlertType } from '@/types/broadcast';
import { cn } from '@/lib/utils';
import { Radio, Target, Square } from 'lucide-react';

interface VidiprinterProps {
  alerts: Alert[];
  isLoading?: boolean;
}

type FilterType = 'ALL' | 'GOAL' | 'RED';

const Vidiprinter = ({ alerts, isLoading }: VidiprinterProps) => {
  const [filter, setFilter] = useState<FilterType>('ALL');

  const filteredAlerts = useMemo(() => {
    if (filter === 'ALL') return alerts.slice(0, 100);
    return alerts.filter(a => a.type === filter).slice(0, 100);
  }, [alerts, filter]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filterButtons: { label: string; value: FilterType; icon: React.ReactNode }[] = [
    { label: 'All', value: 'ALL', icon: <Radio className="w-3 h-3" /> },
    { label: 'Goals', value: 'GOAL', icon: <Target className="w-3 h-3" /> },
    { label: 'Reds', value: 'RED', icon: <Square className="w-3 h-3" /> },
  ];

  if (isLoading) {
    return (
      <div className="broadcast-card p-4 space-y-3">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="broadcast-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="font-display font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          Vidiprinter
        </h2>
        
        {/* Filter toggles */}
        <div className="flex gap-1">
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={cn(
                "px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors",
                filter === btn.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground text-sm">No updates yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredAlerts.map(alert => (
              <div 
                key={alert.id} 
                className={cn(
                  "px-4 py-3 animate-fade-slide-in",
                  alert.type === 'GOAL' && "border-l-2 border-l-gold",
                  alert.type === 'RED' && "border-l-2 border-l-coral"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">
                    {alert.type === 'GOAL' ? '⚽' : '🟥'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">{alert.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(alert.timestamp)} • {alert.minute}'
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vidiprinter;
