import { useState, useCallback } from 'react';
import type { PlaybackRegion } from '../types/playback';

export function usePlaybackRegions(duration: number) {
  const [regions, setRegions] = useState<PlaybackRegion[]>([]);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const addRegion = useCallback((region: Omit<PlaybackRegion, 'id'>) => {
    setRegions(prev => [
      ...prev,
      { ...region, id: Math.random().toString(36).slice(2) }
    ]);
  }, []);

  const removeRegion = useCallback((id: string) => {
    setRegions(prev => prev.filter(r => r.id !== id));
    if (activeRegion === id) {
      setActiveRegion(null);
    }
  }, [activeRegion]);

  const updateRegion = useCallback((id: string, updates: Partial<PlaybackRegion>) => {
    setRegions(prev => prev.map(region =>
      region.id === id ? { ...region, ...updates } : region
    ));
  }, []);

  const getActiveRegion = useCallback((currentTime: number) => {
    return regions.find(region =>
      region.start <= currentTime && currentTime <= region.end
    );
  }, [regions]);

  return {
    regions,
    activeRegion,
    addRegion,
    removeRegion,
    updateRegion,
    getActiveRegion,
    setActiveRegion
  };
}