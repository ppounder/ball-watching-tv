import { ChannelMode } from '@/types/scheduler';

interface LayoutSwitcherProps {
  currentMode: ChannelMode;
  onModeChange: (mode: ChannelMode) => void;
}

const modes: ChannelMode[] = ['LIVE', 'NEWS', 'PODCAST', 'MATCHDAY', 'POST_MATCHDAY', 'NONE_MATCHDAY', 'OFF_AIR'];

const modeColors: Record<ChannelMode, string> = {
  LIVE: 'bg-red-500 hover:bg-red-600',
  NEWS: 'bg-blue-500 hover:bg-blue-600',
  PODCAST: 'bg-purple-500 hover:bg-purple-600',
  MATCHDAY: 'bg-amber-500 hover:bg-amber-600',
  POST_MATCHDAY: 'bg-orange-500 hover:bg-orange-600',
  NONE_MATCHDAY: 'bg-gray-500 hover:bg-gray-600',
  OFF_AIR: 'bg-gray-700 hover:bg-gray-800',
};

const LayoutSwitcher = ({ currentMode, onModeChange }: LayoutSwitcherProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-2 font-medium">Layout Switcher (Dev)</p>
      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
        {modes.map((mode) => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`px-2 py-1 text-xs font-medium rounded text-white transition-colors ${
              currentMode === mode 
                ? `${modeColors[mode]} ring-2 ring-white ring-offset-2 ring-offset-card` 
                : `${modeColors[mode]} opacity-60`
            }`}
          >
            {mode.replace('_', ' ')}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LayoutSwitcher;
