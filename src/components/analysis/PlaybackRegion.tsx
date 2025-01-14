import React, { useState, useRef } from 'react';
import { Play } from 'lucide-react';

interface PlaybackRegionProps {
  duration: number;
  onRegionChange: (start: number, end: number) => void;
  onPlay: () => void;
}

export function PlaybackRegion({
  duration,
  onRegionChange,
  onPlay
}: PlaybackRegionProps) {
  const [region, setRegion] = useState({ start: 0, end: duration });
  const dragRef = useRef<'start' | 'end' | null>(null);

  const handleMouseDown = (handle: 'start' | 'end') => {
    dragRef.current = handle;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width * duration;

    setRegion(prev => {
      const next = {
        ...prev,
        [dragRef.current]: Math.max(0, Math.min(duration, position))
      };
      onRegionChange(next.start, next.end);
      return next;
    });
  };

  const handleMouseUp = () => {
    dragRef.current = null;
  };

  return (
    <div
      className="relative h-8 bg-gray-100 rounded-lg cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute h-full bg-purple-200"
        style={{
          left: `${(region.start / duration) * 100}%`,
          width: `${((region.end - region.start) / duration) * 100}%`
        }}
      />
      <div
        className="absolute w-2 h-full bg-purple-500 cursor-ew-resize"
        style={{ left: `${(region.start / duration) * 100}%` }}
        onMouseDown={() => handleMouseDown('start')}
      />
      <div
        className="absolute w-2 h-full bg-purple-500 cursor-ew-resize"
        style={{ left: `${(region.end / duration) * 100}%` }}
        onMouseDown={() => handleMouseDown('end')}
      />
      <button
        onClick={onPlay}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-full shadow-md hover:bg-purple-700 transition-colors"
      >
        <Play className="w-4 h-4" />
      </button>
    </div>
  );
}