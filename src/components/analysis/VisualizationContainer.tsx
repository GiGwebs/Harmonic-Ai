import React from 'react';
import { useVisualizationSync } from '../../hooks/useVisualizationSync';
import { useVisualizationLayout } from '../../hooks/useVisualizationLayout';
import { DndProvider } from '../dnd/DndProvider';
import { DraggableVisualization } from './DraggableVisualization';
import { VisualizationControls } from './VisualizationControls';
import { VisualizationExport } from './VisualizationExport';
import { ChordTimeline } from './ChordTimeline';
import { PianoRoll } from './PianoRoll';
import { FrequencySpectrum } from './FrequencySpectrum';
import { MelodyGraph } from './MelodyGraph';
import { TempoGraph } from './TempoGraph';
import { DynamicRange } from './DynamicRange';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import type { SongAnalysis } from '../../types';

interface VisualizationContainerProps {
  audioBuffer: AudioBuffer;
  analysis: SongAnalysis;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onTimeUpdate: (time: number) => void;
  onPlayPause: (isPlaying: boolean) => void;
  onSpeedChange: (speed: number) => void;
}

export function VisualizationContainer({
  audioBuffer,
  analysis,
  currentTime,
  isPlaying,
  playbackSpeed,
  onTimeUpdate,
  onPlayPause,
  onSpeedChange
}: VisualizationContainerProps) {
  const { layout, moveVisualization, toggleVisualization } = useVisualizationLayout();
  const sync = useVisualizationSync({
    duration: audioBuffer.duration,
    onTimeUpdate,
    onPlayPause,
    onSpeedChange
  });

  const renderVisualization = (type: string) => {
    switch (type) {
      case 'timeline':
        return (
          <ChordTimeline
            chords={analysis.chords}
            currentTime={currentTime}
            duration={audioBuffer.duration}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            analysis={analysis}
            onSeek={onTimeUpdate}
            onPlayPause={() => onPlayPause(!isPlaying)}
            onSpeedChange={onSpeedChange}
          />
        );
      case 'pianoRoll':
        return (
          <PianoRoll
            notes={analysis.notes}
            currentTime={currentTime}
            width={800}
            height={400}
          />
        );
      case 'spectrum':
        return (
          <FrequencySpectrum
            audioBuffer={audioBuffer}
            width={800}
            height={200}
          />
        );
      case 'melody':
        return (
          <MelodyGraph
            notes={analysis.notes}
            currentTime={currentTime}
            width={800}
            height={200}
          />
        );
      case 'tempo':
        return (
          <TempoGraph
            tempoChanges={analysis.tempoChanges}
            currentTime={currentTime}
            width={800}
            height={150}
          />
        );
      case 'dynamic':
        return (
          <DynamicRange
            audioBuffer={audioBuffer}
            currentTime={currentTime}
            width={800}
            height={100}
          />
        );
    }
  };

  return (
    <DndProvider>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Analysis Visualizations</h2>
          <KeyboardShortcuts />
        </div>

        <VisualizationControls
          visible={layout.visible}
          onToggle={toggleVisualization}
          onExport={() => {}}
          onSettings={() => {}}
        />

        <div className="space-y-4">
          {layout.order.map((type, index) => (
            layout.visible.has(type) && (
              <DraggableVisualization
                key={type}
                type={type}
                index={index}
                moveVisualization={moveVisualization}
              >
                {renderVisualization(type)}
              </DraggableVisualization>
            )
          ))}
        </div>

        <VisualizationExport
          onExport={async () => {}}
          availableVisualizations={layout.order}
        />
      </div>
    </DndProvider>
  );
}