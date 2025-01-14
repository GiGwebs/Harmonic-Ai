import React from 'react';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface PlaybackControlsProps {
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
}

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

export function PlaybackControls({
  isPlaying,
  speed,
  onPlayPause,
  onSpeedChange,
  onReset
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-4 p-2 bg-white rounded-lg shadow-sm">
      <button
        onClick={onPlayPause}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>

      <button
        onClick={onReset}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2">
        <FastForward className="w-4 h-4 text-gray-400" />
        <select
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="px-2 py-1 rounded border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {SPEED_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}