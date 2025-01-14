import { useState, useCallback, useRef, useEffect } from 'react';

export type VisualizationType = 'timeline' | 'pianoRoll' | 'spectrum' | 'melody' | 'tempo' | 'dynamic';

interface UseVisualizationSyncProps {
  duration: number;
  onTimeUpdate?: (time: number) => void;
  onPlayPause?: (isPlaying: boolean) => void;
  onSpeedChange?: (speed: number) => void;
}

export function useVisualizationSync({
  duration,
  onTimeUpdate,
  onPlayPause,
  onSpeedChange
}: UseVisualizationSyncProps) {
  const [activeVisualizations, setActiveVisualizations] = useState<Set<VisualizationType>>(
    new Set(['timeline', 'pianoRoll'])
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; time: number } | null>(null);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        onPlayPause?.(state => !state);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onTimeUpdate?.(time => Math.max(0, time - (e.shiftKey ? 10 : 5)));
        break;
      case 'ArrowRight':
        e.preventDefault();
        onTimeUpdate?.(time => Math.min(duration, time + (e.shiftKey ? 10 : 5)));
        break;
      case 'ArrowUp':
        if (e.shiftKey) {
          e.preventDefault();
          onSpeedChange?.(speed => Math.min(2, speed + 0.25));
        }
        break;
      case 'ArrowDown':
        if (e.shiftKey) {
          e.preventDefault();
          onSpeedChange?.(speed => Math.max(0.25, speed - 0.25));
        }
        break;
      case 'Tab':
        e.preventDefault();
        cycleActiveVisualization();
        break;
      case 'Escape':
        e.preventDefault();
        onTimeUpdate?.(0);
        break;
    }
  }, [duration, onTimeUpdate, onPlayPause, onSpeedChange]);

  const cycleActiveVisualization = useCallback(() => {
    const types: VisualizationType[] = ['timeline', 'pianoRoll', 'spectrum', 'melody', 'tempo', 'dynamic'];
    const currentIndex = types.findIndex(type => activeVisualizations.has(type));
    const nextIndex = (currentIndex + 1) % types.length;
    
    setActiveVisualizations(new Set([types[nextIndex]]));
  }, [activeVisualizations]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleDragStart = useCallback((e: MouseEvent, currentTime: number) => {
    dragStartRef.current = { x: e.clientX, time: currentTime };
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartRef.current || !onTimeUpdate) return;

    const dx = e.clientX - dragStartRef.current.x;
    const timeChange = (dx / window.innerWidth) * duration;
    const newTime = Math.max(0, Math.min(duration, dragStartRef.current.time + timeChange));
    
    onTimeUpdate(newTime);
  }, [isDragging, duration, onTimeUpdate]);

  const handleDragEnd = useCallback(() => {
    dragStartRef.current = null;
    setIsDragging(false);
  }, []);

  return {
    activeVisualizations,
    isDragging,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    toggleVisualization: useCallback((type: VisualizationType) => {
      setActiveVisualizations(prev => {
        const next = new Set(prev);
        if (next.has(type)) {
          next.delete(type);
        } else {
          next.add(type);
        }
        return next;
      });
    }, [])
  };
}