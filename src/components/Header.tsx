import { Link, useLocation } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import logo from '@/assets/bw-logo-text.png';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onScheduleClick?: () => void;
}

const Header = ({ onScheduleClick }: HeaderProps) => {
  const location = useLocation();
  const isWatchPage = location.pathname === '/watch';

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Ball Watching" className="h-8 w-auto" />
        </Link>

        <nav className="flex items-center gap-4">
          {!isWatchPage && (
            <Link
              to="/watch"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Watch Live
            </Link>
          )}
          {isWatchPage && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Broadcasting
              </div>
              
              {onScheduleClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onScheduleClick}
                  className="gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Schedule</span>
                </Button>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
