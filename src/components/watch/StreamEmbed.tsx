import { useState } from 'react';
import { Play, Volume2, Maximize2 } from 'lucide-react';

interface StreamEmbedProps {
  videoId?: string;
}

const StreamEmbed = ({ videoId = 'jfKfPfyJRdk' }: StreamEmbedProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden broadcast-card">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm">Loading stream...</p>
          <div className="mt-4 flex items-center gap-4 text-muted-foreground/50">
            <Volume2 className="w-4 h-4" />
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>
      )}
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
        title="Live Stream"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default StreamEmbed;
