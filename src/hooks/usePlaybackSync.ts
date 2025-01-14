import { useEffect, useCallback } from 'react';

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  speed: number;
}

interface UsePlaybackSyncProps {
  onTimeUpdate: (time: number) => void;
  onPlayPause: (isPlaying: boolean) => void;
  onSpeedChange: (speed: number) => void;
  duration: number;
}

export function usePlaybackSync({
  onTimeUpdate,
  onPlayPause,
  onSpeedChange,
  duration
}: UsePlaybackSyncProps) {
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        onPlayPause(state => !state);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onTimeUpdate(time => Math.max(0, time - (e.shiftKey ? 10 : 5)));
        break;
      case 'ArrowRight':
        e.preventDefault();
        onTimeUpdate(time => Math.min(duration, time + (e.shiftKey ? 10 : 5)));
        break;
      case 'ArrowUp':
        if (e.shiftKey) {
          e.preventDefault();
          onSpeedChange(speed => Math.min(2, speed + 0.5));
        }
        break;
      case 'ArrowDown':
        if (e.shiftKey) {
          e.preventDefault();
          onSpeedChange(speed => Math.max(0.5, speed - 0.5));
        }
        break;
    }
  }, [onTimeUpdate, onPlayPause, onSpeedChange, duration]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
}