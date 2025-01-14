import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { detectTempo } from '../../utils/analysis/audioAnalysis/tempo';
import { AudioAnalysisError } from '../../utils/errors';
import { mockWebAudio } from '../mocks/webAudio';

// Set up Web Audio API mock
mockWebAudio();

describe('Tempo Detection', () => {
  let audioContext: AudioContext;

  beforeEach(() => {
    audioContext = new AudioContext();
  });

  afterEach(() => {
    audioContext.close();
  });

  describe('Input Validation', () => {
    it('throws error for null buffer', () => {
      expect(() => detectTempo(null as any)).toThrow(AudioAnalysisError);
      expect(() => detectTempo(null as any)).toThrow('Audio buffer is null or undefined');
    });

    it('throws error for undefined buffer', () => {
      expect(() => detectTempo(undefined as any)).toThrow(AudioAnalysisError);
      expect(() => detectTempo(undefined as any)).toThrow('Audio buffer is null or undefined');
    });

    it('throws error for empty buffer', () => {
      const emptyBuffer = audioContext.createBuffer(1, 0, 44100);
      expect(() => detectTempo(emptyBuffer)).toThrow(AudioAnalysisError);
      expect(() => detectTempo(emptyBuffer)).toThrow('Audio buffer is empty');
    });

    it('throws error for invalid sample rate', () => {
      const invalidBuffer = audioContext.createBuffer(1, 1024, 0);
      expect(() => detectTempo(invalidBuffer)).toThrow(AudioAnalysisError);
      expect(() => detectTempo(invalidBuffer)).toThrow('Invalid sample rate');
    });
  });

  describe('Processing Tests', () => {
    it('detects tempo from valid audio buffer with clear beat pattern', () => {
      const buffer = audioContext.createBuffer(1, 44100 * 4, 44100); // 4 seconds
      const channelData = buffer.getChannelData(0);
      
      // Create a 120 BPM pattern (2 beats per second)
      for (let i = 0; i < buffer.length; i++) {
        // Add strong beats every 22050 samples (0.5 seconds at 44.1kHz)
        if (i % 22050 === 0) {
          // Create a short impulse
          for (let j = 0; j < 100; j++) {
            channelData[i + j] = Math.sin(j * 0.1) * Math.exp(-j * 0.1);
          }
        }
      }

      const result = detectTempo(buffer);
      expect(result).toBeDefined();
      expect(result.bpm).toBeCloseTo(120, 1);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('detects varying tempos', () => {
      const buffer = audioContext.createBuffer(1, 44100 * 8, 44100); // 8 seconds
      const channelData = buffer.getChannelData(0);
      
      // First 4 seconds: 120 BPM
      for (let i = 0; i < buffer.length / 2; i++) {
        if (i % 22050 === 0) {
          for (let j = 0; j < 100; j++) {
            channelData[i + j] = Math.sin(j * 0.1) * Math.exp(-j * 0.1);
          }
        }
      }
      
      // Last 4 seconds: 160 BPM
      for (let i = buffer.length / 2; i < buffer.length; i++) {
        if (i % 16537 === 0) { // ~0.375 seconds between beats
          for (let j = 0; j < 100; j++) {
            channelData[i + j] = Math.sin(j * 0.1) * Math.exp(-j * 0.1);
          }
        }
      }

      const result = detectTempo(buffer);
      expect(result).toBeDefined();
      expect(result.bpm).toBeGreaterThan(120);
      expect(result.bpm).toBeLessThan(160);
      expect(result.confidence).toBeGreaterThan(0.3);
    });
  });

  describe('Error Handling', () => {
    it('handles buffer with no clear beat pattern', () => {
      const buffer = audioContext.createBuffer(1, 44100 * 2, 44100);
      const channelData = buffer.getChannelData(0);
      
      // Fill with random noise
      for (let i = 0; i < buffer.length; i++) {
        channelData[i] = Math.random() * 2 - 1;
      }

      expect(() => detectTempo(buffer)).toThrow(AudioAnalysisError);
    });

    it('handles very short buffer', () => {
      const buffer = audioContext.createBuffer(1, 4410, 44100); // 0.1 seconds
      expect(() => detectTempo(buffer)).toThrow(AudioAnalysisError);
    });
  });

  describe('Edge Cases', () => {
    it('handles extremely slow tempo', () => {
      const buffer = audioContext.createBuffer(1, 44100 * 10, 44100); // 10 seconds
      const channelData = buffer.getChannelData(0);
      
      // Create a 30 BPM pattern (0.5 beats per second)
      for (let i = 0; i < buffer.length; i++) {
        if (i % 88200 === 0) { // 2 seconds between beats
          for (let j = 0; j < 100; j++) {
            channelData[i + j] = Math.sin(j * 0.1) * Math.exp(-j * 0.1);
          }
        }
      }

      const result = detectTempo(buffer);
      expect(result).toBeDefined();
      expect(result.bpm).toBeCloseTo(30, 1);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('handles extremely fast tempo', () => {
      const buffer = audioContext.createBuffer(1, 44100 * 4, 44100); // 4 seconds
      const channelData = buffer.getChannelData(0);
      
      // Create a 300 BPM pattern (5 beats per second)
      for (let i = 0; i < buffer.length; i++) {
        if (i % 8820 === 0) { // 0.2 seconds between beats
          for (let j = 0; j < 100; j++) {
            channelData[i + j] = Math.sin(j * 0.1) * Math.exp(-j * 0.1);
          }
        }
      }

      const result = detectTempo(buffer);
      expect(result).toBeDefined();
      expect(result.bpm).toBeCloseTo(300, 1);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });
});