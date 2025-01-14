import React from 'react';
import { Music } from 'lucide-react';

interface ChordVisualizerProps {
  chords: string[];
  currentTime?: number;
}

export function ChordVisualizer({ chords, currentTime = 0 }: ChordVisualizerProps) {
  if (!chords.length) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <Music className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No chord data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Chord Progression</h3>
      <div className="flex flex-wrap gap-2">
        {chords.map((chord, index) => (
          <div
            key={`${chord}-${index}`}
            className={`px-4 py-2 rounded-lg ${
              index === Math.floor(currentTime / 2) % chords.length
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {chord}
          </div>
        ))}
      </div>
    </div>
  );
}