import React, { useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';
import { PlaybackControls } from './PlaybackControls';
import { ExportPanel } from './ExportPanel';
import { ChordType, getChordColor } from '../../utils/analysis/chords';
import type { SongAnalysis } from '../../types';

interface ChordTimelineProps {
  chords: Array<{
    name: string;
    type: ChordType;
    startTime: number;
    duration: number;
  }>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackSpeed: number;
  analysis: SongAnalysis;
  onSeek?: (time: number) => void;
  onPlayPause?: () => void;
  onSpeedChange?: (speed: number) => void;
  onReset?: () => void;
}

export function ChordTimeline({ 
  chords, 
  currentTime, 
  duration,
  isPlaying,
  playbackSpeed,
  analysis,
  onSeek,
  onPlayPause,
  onSpeedChange,
  onReset
}: ChordTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Previous implementation remains the same...

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Chord Progression</h3>
        <ExportPanel analysis={analysis} timelineRef={timelineRef} />
      </div>

      <PlaybackControls
        isPlaying={isPlaying}
        speed={playbackSpeed}
        onPlayPause={onPlayPause || (() => {})}
        onSpeedChange={onSpeedChange || (() => {})}
        onReset={onReset || (() => {})}
      />

      {/* Previous timeline implementation remains the same... */}
    </div>
  );
}