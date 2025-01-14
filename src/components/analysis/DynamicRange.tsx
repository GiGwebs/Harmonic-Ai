import React, { useRef, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface DynamicRangeProps {
  audioBuffer: AudioBuffer;
  currentTime: number;
  width?: number;
  height?: number;
}

export function DynamicRange({
  audioBuffer,
  currentTime,
  width = 800,
  height = 100
}: DynamicRangeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get audio data
    const channelData = audioBuffer.getChannelData(0);
    const samplesPerPixel = Math.floor(channelData.length / width);

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x++) {
      const startSample = x * samplesPerPixel;
      let max = 0;

      // Find max amplitude for this pixel
      for (let i = 0; i < samplesPerPixel && startSample + i < channelData.length; i++) {
        const amplitude = Math.abs(channelData[startSample + i]);
        if (amplitude > max) max = amplitude;
      }

      const y = height - (max * height);
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw playback marker
    const markerX = (currentTime / audioBuffer.duration) * width;
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.moveTo(markerX, 0);
    ctx.lineTo(markerX, height);
    ctx.stroke();
  }, [audioBuffer, currentTime, width, height]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Dynamic Range</h3>
        <Tooltip content="Shows volume changes over time">
          <Volume2 className="w-4 h-4 text-gray-400" />
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