import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { detectChords } from '../../utils/analysis/chords';
import { AudioAnalysisError } from '../../utils/analysis/errors';

describe('Chord Detection', () => {
  let audioContext: AudioContext;

  beforeEach(() => {
    jest.clearAllMocks();
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  });

  afterEach(() => {
    audioContext.close();
  });

  describe('Input Validation', () => {
    it('throws error for null buffer', async () => {
      await expect(detectChords(null)).rejects.toThrow(AudioAnalysisError);
      await expect(detectChords(null)).rejects.toThrow('Audio buffer is null or undefined');
    });

    it('throws error for undefined buffer', async () => {
      await expect(detectChords(undefined)).rejects.toThrow(AudioAnalysisError);
      await expect(detectChords(undefined)).rejects.toThrow('Audio buffer is null or undefined');
    });

    it('throws error for empty buffer', async () => {
      const emptyBuffer = audioContext.createBuffer(1, 0, 44100);
      await expect(detectChords(emptyBuffer)).rejects.toThrow(AudioAnalysisError);
      await expect(detectChords(emptyBuffer)).rejects.toThrow('Audio buffer is empty');
    });

    it('throws error for invalid sample rate', async () => {
      const invalidBuffer = audioContext.createBuffer(1, 1024, 0);
      await expect(detectChords(invalidBuffer)).rejects.toThrow(AudioAnalysisError);
      await expect(detectChords(invalidBuffer)).rejects.toThrow('Invalid sample rate');
    });
  });

  describe('Processing Tests', () => {
    it('detects chords from valid audio buffer with clear triads', async () => {
      const buffer = audioContext.createBuffer(1, 44100 * 4, 44100); // 4 seconds
      const channelData = buffer.getChannelData(0);
      
      // Create a simple chord progression (C - F - G - C)
      const chords = [
        [261.63, 329.63, 392.00], // C major
        [349.23, 440.00, 523.25], // F major
        [392.00, 493.88, 587.33], // G major
        [261.63, 329.63, 392.00]  // C major
      ];
      
      const segmentLength = buffer.length / chords.length;
      for (let i = 0; i < buffer.length; i++) {
        const chordIndex = Math.floor(i / segmentLength);
        let sample = 0;
        for (const freq of chords[chordIndex]) {
          sample += Math.sin(2 * Math.PI * freq * i / buffer.sampleRate);
        }
        channelData[i] = sample / chords[chordIndex].length;
      }

      const detectedChords = await detectChords(buffer);
      expect(detectedChords).toHaveLength(4);
      expect(detectedChords[0]).toBe('C');
      expect(detectedChords[1]).toBe('F');
      expect(detectedChords[2]).toBe('G');
      expect(detectedChords[3]).toBe('C');
    });

    it('detects complex chord progression', async () => {
      const buffer = audioContext.createBuffer(1, 44100 * 8, 44100); // 8 seconds
      const channelData = buffer.getChannelData(0);
      
      // Create a jazz progression (ii-V-I in C)
      const chords = [
        [293.66, 349.23, 440.00], // Dm7 (D, F, A)
        [392.00, 493.88, 587.33], // G7  (G, B, D)
        [261.63, 329.63, 392.00], // CMaj7 (C, E, G)
        [261.63, 329.63, 392.00]  // CMaj7 (C, E, G)
      ];
      
      const segmentLength = buffer.length / chords.length;
      for (let i = 0; i < buffer.length; i++) {
        const chordIndex = Math.floor(i / segmentLength);
        let sample = 0;
        for (const freq of chords[chordIndex]) {
          sample += Math.sin(2 * Math.PI * freq * i / buffer.sampleRate);
        }
        channelData[i] = sample / chords[chordIndex].length;
      }

      const detectedChords = await detectChords(buffer);
      expect(detectedChords).toHaveLength(4);
      expect(detectedChords[0]).toMatch(/Dm/);
      expect(detectedChords[1]).toMatch(/G/);
      expect(detectedChords[2]).toMatch(/C/);
      expect(detectedChords[3]).toMatch(/C/);
    });
  });

  describe('Error Handling', () => {
    it('throws error for buffer with no clear harmonic content', async () => {
      const buffer = audioContext.createBuffer(1, 44100, 44100);
      const channelData = buffer.getChannelData(0);
      // Fill with noise
      for (let i = 0; i < buffer.length; i++) {
        channelData[i] = Math.random() * 0.1;
      }

      await expect(detectChords(buffer)).rejects.toThrow(AudioAnalysisError);
      await expect(detectChords(buffer)).rejects.toThrow('No chords detected');
    });

    it('throws error for invalid frame extraction', async () => {
      const buffer = audioContext.createBuffer(1, 100, 44100); // Too short for proper analysis
      const channelData = buffer.getChannelData(0);
      channelData.fill(1.0);

      await expect(detectChords(buffer)).rejects.toThrow(AudioAnalysisError);
      await expect(detectChords(buffer)).rejects.toThrow('Failed to extract valid frame');
    });
  });

  describe('Edge Cases', () => {
    it('handles single sustained chord correctly', async () => {
      const buffer = audioContext.createBuffer(1, 44100 * 2, 44100);
      const channelData = buffer.getChannelData(0);
      
      // Single C major chord
      const frequencies = [261.63, 329.63, 392.00]; // C4, E4, G4
      for (let i = 0; i < buffer.length; i++) {
        let sample = 0;
        for (const freq of frequencies) {
          sample += Math.sin(2 * Math.PI * freq * i / buffer.sampleRate);
        }
        channelData[i] = sample / frequencies.length;
      }

      const detectedChords = await detectChords(buffer);
      expect(detectedChords).toHaveLength(1);
      expect(detectedChords[0]).toBe('C');
    });

    it('handles rapid chord changes', async () => {
      const buffer = audioContext.createBuffer(1, 44100 * 4, 44100);
      const channelData = buffer.getChannelData(0);
      
      // Rapid changes between C and G
      const chords = [
        [261.63, 329.63, 392.00], // C
        [392.00, 493.88, 587.33], // G
      ];
      
      const changeInterval = buffer.sampleRate / 4; // Change every 0.25 seconds
      for (let i = 0; i < buffer.length; i++) {
        const chordIndex = Math.floor((i % changeInterval) / changeInterval * chords.length);
        let sample = 0;
        for (const freq of chords[chordIndex]) {
          sample += Math.sin(2 * Math.PI * freq * i / buffer.sampleRate);
        }
        channelData[i] = sample / chords[chordIndex].length;
      }

      const detectedChords = await detectChords(buffer);
      expect(detectedChords.length).toBeGreaterThan(0);
      expect(detectedChords.every(chord => ['C', 'G'].includes(chord))).toBe(true);
    });

    it('handles extended chords', async () => {
      const buffer = audioContext.createBuffer(1, 44100 * 2, 44100);
      const channelData = buffer.getChannelData(0);
      
      // CMaj7 chord (C E G B)
      const frequencies = [261.63, 329.63, 392.00, 493.88];
      for (let i = 0; i < buffer.length; i++) {
        let sample = 0;
        for (const freq of frequencies) {
          sample += Math.sin(2 * Math.PI * freq * i / buffer.sampleRate);
        }
        channelData[i] = sample / frequencies.length;
      }

      const detectedChords = await detectChords(buffer);
      expect(detectedChords).toHaveLength(1);
      expect(detectedChords[0]).toMatch(/C/);
    });
  });
});