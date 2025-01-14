import React, { useRef, useEffect } from 'react';
import { LineChart } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface MelodyGraphProps {
  notes: Array<{
    pitch: number;
    startTime: number;
    duration: number;
    velocity: number;
  }>;
  currentTime: number;
  width?: number;
  height?: number;
}

export function MelodyGraph({
  notes,
  currentTime,
  width = 800,
  height = 200
}: MelodyGraphProps) {
  // Rest of the component implementation remains the same...
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw melody line
    ctx.beginPath();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;

    notes.forEach((note, index) => {
      const x = (note.startTime / notes[notes.length - 1].startTime) * width;
      const y = height - (note.pitch / 127) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw playback marker
    const markerX = (currentTime / notes[notes.length - 1].startTime) * width;
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.moveTo(markerX, 0);
    ctx.lineTo(markerX, height);
    ctx.stroke();
  }, [notes, currentTime, width, height]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Melody Graph</h3>
        <Tooltip content="Visualizes pitch changes over time">
          <LineChart className="w-4 h-4 text-gray-400" />
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