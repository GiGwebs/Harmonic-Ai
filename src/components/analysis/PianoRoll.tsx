import React, { useEffect, useRef } from 'react';

interface Note {
  pitch: number;
  startTime: number;
  endTime: number;
  velocity: number;
}

interface PianoRollProps {
  width: number;
  height: number;
  notes: Note[];
  startTime: number;
  endTime: number;
  minPitch: number;
  maxPitch: number;
}

export const PianoRoll: React.FC<PianoRollProps> = ({
  width,
  height,
  notes,
  startTime,
  endTime,
  minPitch,
  maxPitch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;

    // Draw horizontal lines for each pitch
    const pitchRange = maxPitch - minPitch + 1;
    const pitchHeight = height / pitchRange;

    for (let i = 0; i <= pitchRange; i++) {
      const y = i * pitchHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw vertical lines for time divisions
    const timeRange = endTime - startTime;
    const pixelsPerSecond = width / timeRange;
    const divisions = Math.ceil(timeRange);

    for (let i = 0; i <= divisions; i++) {
      const x = i * pixelsPerSecond;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw notes
    ctx.fillStyle = '#4a90e2';
    notes.forEach(note => {
      // Skip notes outside time range
      if (note.endTime < startTime || note.startTime > endTime) return;

      const x = ((note.startTime - startTime) / timeRange) * width;
      const noteWidth = ((note.endTime - note.startTime) / timeRange) * width;
      const y = height - ((note.pitch - minPitch + 1) * pitchHeight);
      
      ctx.fillRect(x, y, noteWidth, pitchHeight);
    });
  }, [width, height, notes, startTime, endTime, minPitch, maxPitch]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      data-testid="piano-roll-canvas"
      style={{ border: '1px solid #ccc' }}
    />
  );
};