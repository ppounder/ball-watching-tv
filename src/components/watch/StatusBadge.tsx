import { MatchStatus } from '@/types/broadcast';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: MatchStatus;
  minute?: string;
}

const StatusBadge = ({ status, minute }: StatusBadgeProps) => {
  const baseClasses = "px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide";
  
  switch (status) {
    case 'LIVE':
      return (
        <span className={cn(baseClasses, "badge-live flex items-center gap-1.5")}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
          </span>
          {minute ? `${minute}'` : 'LIVE'}
        </span>
      );
    case 'HT':
      return <span className={cn(baseClasses, "badge-ht")}>HT</span>;
    case 'FT':
      return <span className={cn(baseClasses, "badge-ft")}>FT</span>;
    case 'NS':
      return <span className={cn(baseClasses, "badge-ns")}>NS</span>;
    case 'POSTPONED':
      return <span className={cn(baseClasses, "badge-ns")}>PPD</span>;
    default:
      return null;
  }
};

export default StatusBadge;
