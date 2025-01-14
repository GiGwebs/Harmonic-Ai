import { useEffect, useCallback } from 'react';
import type { PlaybackRegion } from '../types/playback';
import type { AnnotationCategory } from '../types/annotation';

interface UseKeyboardShortcutsProps {
  onAddRegion?: (time: number) => void;
  onRemoveRegion?: (id: string) => void;
  onAddAnnotation?: (category: AnnotationCategory) => void;
  onEditAnnotation?: (id: string) => void;
  activeRegion?: PlaybackRegion | null;
  currentTime: number;
}

export function useKeyboardShortcuts({
  onAddRegion,
  onRemoveRegion,
  onAddAnnotation,
  onEditAnnotation,
  activeRegion,
  currentTime
}: UseKeyboardShortcutsProps) {
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.code) {
      case 'KeyR':
        if (e.shiftKey && activeRegion && onRemoveRegion) {
          e.preventDefault();
          onRemoveRegion(activeRegion.id);
        } else if (onAddRegion) {
          e.preventDefault();
          onAddRegion(currentTime);
        }
        break;

      case 'KeyA':
        if (e.shiftKey && onEditAnnotation) {
          e.preventDefault();
          // Edit last annotation (implementation needed)
        } else if (onAddAnnotation) {
          e.preventDefault();
          onAddAnnotation('general');
        }
        break;
    }
  }, [onAddRegion, onRemoveRegion, onAddAnnotation, onEditAnnotation, activeRegion, currentTime]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
}