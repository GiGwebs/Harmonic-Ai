import React, { useState } from 'react';
import { Play, Pause, X } from 'lucide-react';
import type { PlaybackRegion } from '../../types/playback';
import { Button } from '../common/Button';

interface PlaybackRegionControlsProps {
  regions: PlaybackRegion[];
  currentTime: number;
  duration: number;
  onAddRegion: (region: Omit<PlaybackRegion, 'id'>) => void;
  onRemoveRegion: (id: string) => void;
  onUpdateRegion: (id: string, updates: Partial<PlaybackRegion>) => void;
  onSeek: (time: number) => void;
  onPlay: (region: PlaybackRegion) => void;
  onStop: () => void;
}

export function PlaybackRegionControls({
  regions,
  currentTime,
  duration,
  onAddRegion,
  onRemoveRegion,
  onUpdateRegion,
  onSeek,
  onPlay,
  onStop
}: PlaybackRegionControlsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newRegion, setNewRegion] = useState({
    label: '',
    start: 0,
    end: duration,
    color: '#8b5cf6',
    loop: false
  });

  const handleAddRegion = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRegion(newRegion);
    setIsAdding(false);
    setNewRegion({
      label: '',
      start: 0,
      end: duration,
      color: '#8b5cf6',
      loop: false
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Playback Regions</h3>
        <Button
          variant="secondary"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? 'Cancel' : 'Add Region'}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddRegion} className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={newRegion.label}
              onChange={e => setNewRegion(prev => ({ ...prev, label: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Chorus, Verse, Bridge"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time (s)
              </label>
              <input
                type="number"
                min={0}
                max={duration}
                step={0.1}
                value={newRegion.start}
                onChange={e => setNewRegion(prev => ({ ...prev, start: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time (s)
              </label>
              <input
                type="number"
                min={0}
                max={duration}
                step={0.1}
                value={newRegion.end}
                onChange={e => setNewRegion(prev => ({ ...prev, end: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newRegion.loop}
              onChange={e => setNewRegion(prev => ({ ...prev, loop: e.target.checked }))}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm">Loop playback</span>
          </label>

          <div className="flex justify-end gap-2">
            <Button type="submit">Add Region</Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {regions.map(region => (
          <div
            key={region.id}
            className="flex items-center gap-4 p-2 bg-white rounded-lg shadow-sm"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: region.color }}
            />
            <div className="flex-1">
              <div className="font-medium">{region.label}</div>
              <div className="text-sm text-gray-500">
                {formatTime(region.start)} - {formatTime(region.end)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => region.start <= currentTime && currentTime <= region.end
                  ? onStop()
                  : onPlay(region)
                }
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {region.start <= currentTime && currentTime <= region.end
                  ? <Pause className="w-4 h-4" />
                  : <Play className="w-4 h-4" />
                }
              </button>
              <button
                onClick={() => onRemoveRegion(region.id)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}