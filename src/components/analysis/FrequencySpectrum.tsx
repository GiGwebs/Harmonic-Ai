import React, { useEffect, useRef } from 'react';

interface FrequencySpectrumProps {
  audioBuffer: AudioBuffer;
  width: number;
  height: number;
}

export const FrequencySpectrum: React.FC<FrequencySpectrumProps> = ({
  audioBuffer,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get frequency data from audio buffer
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Set up frequency analysis
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    // Draw frequency spectrum
    const draw = () => {
      analyser.getFloatFrequencyData(dataArray);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] + 140) * 2;
        ctx.fillStyle = `rgb(${barHeight + 100},50,50)`;
        ctx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }

      requestAnimationFrame(draw);
    };

    source.start();
    draw();

    return () => {
      source.stop();
      audioContext.close();
    };
  }, [audioBuffer, width, height]);

  return (
    <div className="rounded-lg overflow-hidden shadow-lg">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="bg-gray-900"
      />
    </div>
  );
};