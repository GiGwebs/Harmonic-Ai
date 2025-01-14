import React, { useRef, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface TempoGraphProps {
  tempoChanges: Array<{
    time: number;
    bpm: number;
  }>;
  currentTime: number;
  width?: number;
  height?: number;
}

export function TempoGraph({
  tempoChanges,
  currentTime,
  width = 800,
  height = 150
}: TempoGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw tempo changes
    ctx.beginPath();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;

    const maxBpm = Math.max(...tempoChanges.map(t => t.bpm));
    const minBpm = Math.min(...tempoChanges.map(t => t.bpm));
    const bpmRange = maxBpm - minBpm;

    tempoChanges.forEach((tempo, index) => {
      const x = (tempo.time / tempoChanges[tempoChanges.length - 1].time) * width;
      const y = height - ((tempo.bpm - minBpm) / bpmRange) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw playback marker
    const markerX = (currentTime / tempoChanges[tempoChanges.length - 1].time) * width;
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.moveTo(markerX, 0);
    ctx.lineTo(markerX, height);
    ctx.stroke();
  }, [tempoChanges, currentTime, width, height]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Tempo Changes</h3>
        <Tooltip content="Shows tempo variations over time">
          <Activity className="w-4 h-4 text-gray-400" />
        </Tooltip>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="bg-white rounded-lg shadow-sm"
      />
    </div>
  );
}