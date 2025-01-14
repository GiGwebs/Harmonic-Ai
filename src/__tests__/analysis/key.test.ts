import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { detectKey } from '../../utils/analysis/audioAnalysis/key';
import { AudioAnalysisError } from '../../utils/errors';

// Mock AudioContext and related Web Audio API functionality
// Mock Web Audio API classes
class MockAnalyserNode {
  private _fftSize: number = 2048;
  private _frequencyBinCount: number;
  private _smoothingTimeConstant: number = 0.8;
  private _frequencyData: Float32Array;

  constructor() {
    this._frequencyBinCount = this._fftSize / 2;
    this._frequencyData = new Float32Array(this._frequencyBinCount);
  }

  set fftSize(size: number) {
    this._fftSize = size;
    this._frequencyBinCount = size / 2;
    this._frequencyData = new Float32Array(this._frequencyBinCount);
  }

  get fftSize(): number {
    return this._fftSize;
  }

  get frequencyBinCount(): number {
    return this._frequencyBinCount;
  }

  set smoothingTimeConstant(value: number) {
    this._smoothingTimeConstant = value;
  }

  get smoothingTimeConstant(): number {
    return this._smoothingTimeConstant;
  }

  connect() {} // No-op for mock

  getFloatFrequencyData(array: Float32Array) {
    if (!this.buffer?.getChannelData) return;
    const channelData = this.buffer.getChannelData(0);
    const fftSize = this._fftSize;
    const sampleRate = this.buffer.sampleRate;
    const binSize = sampleRate / fftSize;

    // Clear the array
    array.fill(-120); // Lower noise floor for better dynamic range

    // Calculate frequency content from the buffer
    for (let i = 0; i < array.length; i++) {
      const frequency = i * binSize;
      let magnitude = -120; // Start at noise floor

      // Check each input frequency and its harmonics
      this._frequencies.forEach(fundamentalFreq => {
        // Check harmonics up to the 5th
        for (let harmonic = 1; harmonic <= 5; harmonic++) {
          const harmonicFreq = fundamentalFreq * harmonic;
          const binFreq = frequency;
          const diff = Math.abs(binFreq - harmonicFreq);
          
          // Use a narrower frequency window for better pitch resolution
          const binWindow = binSize * 0.5;
          if (diff < binWindow) {
            // Calculate magnitude based on harmonic number and proximity
            const harmonicWeight = Math.pow(0.5, harmonic - 1); // Exponential decay for harmonics
            const proximityWeight = Math.cos((Math.PI * diff) / (2 * binWindow)); // Cosine window
            const baseAmplitude = -20; // Stronger signal for better detection
            
            // Calculate phase-corrected magnitude
            const phase = (2 * Math.PI * diff) / binSize;
            const phaseFactor = Math.cos(phase);
            
            // Combine all factors
            const totalMagnitude = baseAmplitude * harmonicWeight * proximityWeight * phaseFactor;
            
            // Keep the strongest magnitude for this bin
            magnitude = Math.max(magnitude, totalMagnitude);
          }
        }
      });

      // Add some natural variation but keep it minimal
      array[i] = magnitude + (Math.random() - 0.5) * 2;
    }
  }

  private _frequencies: Set<number> = new Set();
  private buffer: AudioBuffer | null = null;

  setBuffer(buffer: AudioBuffer) {
    this.buffer = buffer;
    // Extract fundamental frequencies from the buffer using autocorrelation
    const channelData = buffer.getChannelData(0);
    this._frequencies = this.extractFrequencies(channelData, buffer.sampleRate);
  }

  private extractFrequencies(data: Float32Array, sampleRate: number): Set<number> {
    const frequencies = new Set<number>();
    const windowSize = Math.min(8192, data.length); // Larger window for better frequency resolution
    const hopSize = windowSize / 4; // 75% overlap for better time resolution
    
    // Process multiple windows
    for (let offset = 0; offset < data.length - windowSize; offset += hopSize) {
      const window = data.slice(offset, offset + windowSize);
      
      // Apply Blackman-Harris window for better frequency resolution
      for (let i = 0; i < windowSize; i++) {
        const a0 = 0.35875;
        const a1 = 0.48829;
        const a2 = 0.14128;
        const a3 = 0.01168;
        window[i] *= a0 
          - a1 * Math.cos((2 * Math.PI * i) / (windowSize - 1))
          + a2 * Math.cos((4 * Math.PI * i) / (windowSize - 1))
          - a3 * Math.cos((6 * Math.PI * i) / (windowSize - 1));
      }
      
      // Compute autocorrelation with phase correction
      const maxLag = Math.min(windowSize / 2, Math.floor(sampleRate / 20)); // Limit to 20Hz minimum
      for (let lag = Math.floor(sampleRate / 4000); lag < maxLag; lag++) {
        let correlation = 0;
        let normalization = 0;
        
        for (let i = 0; i < windowSize - lag; i++) {
          correlation += window[i] * window[i + lag];
          normalization += window[i] * window[i];
        }
        
        // Normalize correlation
        correlation = normalization > 0 ? correlation / Math.sqrt(normalization) : 0;
        
        // Find peaks with quadratic interpolation
        if (lag > 1 && correlation > 0.5) { // Higher threshold for cleaner detection
          const prevCorr = this.autocorrelate(window, lag - 1);
          const nextCorr = this.autocorrelate(window, lag + 1);
          
          if (correlation > prevCorr && correlation > nextCorr) {
            // Quadratic interpolation for better frequency accuracy
            const alpha = 0.5 * (prevCorr - nextCorr);
            const beta = 2 * correlation - prevCorr - nextCorr;
            const peakOffset = alpha / (2 * beta);
            
            const refinedLag = lag + peakOffset;
            const frequency = sampleRate / refinedLag;
            
            if (frequency >= 20 && frequency <= 8000) {
              frequencies.add(Math.round(frequency * 100) / 100); // Round to 2 decimal places
            }
          }
        }
      }
    }
    
    return frequencies;
  }

  private autocorrelate(data: Float32Array, lag: number): number {
    let correlation = 0;
    for (let i = 0; i < data.length - lag; i++) {
      correlation += data[i] * data[i + lag];
    }
    return correlation;
  }
}

class MockAudioContext {
  createBuffer(channels: number, length: number, sampleRate: number): AudioBuffer {
    return new MockAudioBuffer(channels, length, sampleRate);
  }
}

class MockAudioBufferSourceNode {
  buffer: AudioBuffer | null = null;
  private analyser: MockAnalyserNode | null = null;

  connect(node: MockAnalyserNode) {
    this.analyser = node;
    if (this.buffer) {
      this.analyser.setBuffer(this.buffer);
    }
  }

  start() {} // No-op for mock
}

class MockOfflineAudioContext {
  length: number;
  sampleRate: number;
  
  constructor(channels: number, length: number, sampleRate: number) {
    this.length = length;
    this.sampleRate = sampleRate;
  }

  createAnalyser() {
    return new MockAnalyserNode();
  }

  createBufferSource() {
    return new MockAudioBufferSourceNode();
  }

  startRendering() {
    return Promise.resolve(new MockAudioBuffer(1, this.length, this.sampleRate));
  }

  get destination() {
    return {};
  }
}

class MockAudioBuffer implements AudioBuffer {
  private channels: Float32Array[];
  readonly length: number;
  readonly sampleRate: number;
  readonly numberOfChannels: number;
  readonly duration: number;

  constructor(channels: number, length: number, sampleRate: number) {
    this.channels = Array(channels).fill(null).map(() => new Float32Array(length));
    this.length = length;
    this.sampleRate = sampleRate;
    this.numberOfChannels = channels;
    this.duration = length / sampleRate;
  }

  getChannelData(channel: number): Float32Array {
    return this.channels[channel];
  }

  copyFromChannel(destination: Float32Array, channelNumber: number, startInChannel?: number): void {
    const source = this.channels[channelNumber];
    const start = startInChannel || 0;
    for (let i = 0; i < destination.length; i++) {
      destination[i] = source[start + i];
    }
  }

  copyToChannel(source: Float32Array, channelNumber: number, startInChannel?: number): void {
    const dest = this.channels[channelNumber];
    const start = startInChannel || 0;
    for (let i = 0; i < source.length; i++) {
      dest[start + i] = source[i];
    }
  }
}

// Replace global Web Audio API classes with mocks
(global as any).OfflineAudioContext = MockOfflineAudioContext;
(global as any).AudioBuffer = MockAudioBuffer;
(global as any).AudioContext = MockAudioContext;

describe('Key Detection', () => {
  let audioContext: MockAudioContext;

  beforeEach(() => {
    audioContext = new MockAudioContext();
  });

  // Helper to create an audio buffer with a sine wave
  function createTestBuffer(frequency: number, duration: number = 1, sampleRate: number = 44100): AudioBuffer {
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      channelData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }
    
    return buffer;
  }

  // Helper to create a buffer with multiple frequencies (a chord)
  function createChordBuffer(frequencies: number[], duration: number = 1, sampleRate: number = 44100): AudioBuffer {
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      channelData[i] = frequencies.reduce((sum, freq) => 
        sum + Math.sin(2 * Math.PI * freq * i / sampleRate) / frequencies.length, 0);
    }
    
    return buffer;
  }

  describe('Input Validation', () => {
    it('throws error for null buffer', async () => {
      await expect(detectKey(null as any)).rejects.toThrow(AudioAnalysisError);
      await expect(detectKey(null as any)).rejects.toThrow('Audio buffer is null or undefined');
    });

    it('throws error for undefined buffer', async () => {
      await expect(detectKey(undefined as any)).rejects.toThrow(AudioAnalysisError);
      await expect(detectKey(undefined as any)).rejects.toThrow('Audio buffer is null or undefined');
    });

    it('throws error for empty buffer', async () => {
      const emptyBuffer = audioContext.createBuffer(1, 0, 44100);
      await expect(detectKey(emptyBuffer)).rejects.toThrow(AudioAnalysisError);
      await expect(detectKey(emptyBuffer)).rejects.toThrow('Audio buffer is empty');
    });

    it('throws error for invalid sample rate', async () => {
      const invalidBuffer = audioContext.createBuffer(1, 1024, 0);
      await expect(detectKey(invalidBuffer)).rejects.toThrow(AudioAnalysisError);
      await expect(detectKey(invalidBuffer)).rejects.toThrow('Invalid sample rate');
    });
  });

  describe('Key Detection Tests', () => {
    it('detects C major from a simple C major scale', async () => {
      // Create a buffer with C major triad (C4, E4, G4)
      const cMajorFreqs = [261.63, 329.63, 392.00]; // C4, E4, G4
      const buffer = createChordBuffer(cMajorFreqs);
      
      const result = await detectKey(buffer);
      expect(result.key).toBe('C');
      expect(result.mode).toBe('major');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('detects A minor from an A minor scale', async () => {
      // Create a buffer with A minor triad (A3, C4, E4)
      const aMinorFreqs = [220.00, 261.63, 329.63]; // A3, C4, E4
      const buffer = createChordBuffer(aMinorFreqs);
      
      const result = await detectKey(buffer);
      expect(result.key).toBe('A');
      expect(result.mode).toBe('minor');
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Sample Rate Tests', () => {
    const sampleRates = [22050, 44100, 48000, 96000];
    
    test.each(sampleRates)('detects key correctly at %ihz sample rate', async (sampleRate) => {
      const duration = 0.5; // Reduced duration for faster tests
      const cMajorFreqs = [261.63, 329.63, 392.00]; // C4, E4, G4
      const buffer = createChordBuffer(cMajorFreqs, duration, sampleRate);
      
      const result = await detectKey(buffer);
      expect(result.key).toBe('C');
      expect(result.mode).toBe('major');
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Edge Cases', () => {
    it('handles ambiguous key centers', async () => {
      // Create a diminished chord (equally spaced intervals)
      const diminishedFreqs = [261.63, 311.13, 369.99]; // C4, Eb4, Gb4
      const buffer = createChordBuffer(diminishedFreqs, 0.5); // Reduced duration
      
      const result = await detectKey(buffer);
      expect(result.confidence).toBeLessThan(0.7); // Should have lower confidence
    });

    it('detects key from complex harmonic content', async () => {
      // Create a complex chord progression (C-G-Am-F)
      const progressionFreqs = [
        [261.63, 329.63, 392.00], // C major
        [392.00, 493.88, 587.33], // G major
        [220.00, 261.63, 329.63], // A minor
        [349.23, 440.00, 523.25]  // F major
      ];
      
      const buffer = audioContext.createBuffer(1, 22050, 44100); // 0.5 seconds
      const channelData = buffer.getChannelData(0);
      
      progressionFreqs.forEach((chord, chordIndex) => {
        const startSample = Math.floor(chordIndex * buffer.length / progressionFreqs.length);
        const endSample = Math.floor((chordIndex + 1) * buffer.length / progressionFreqs.length);
        
        for (let i = startSample; i < endSample; i++) {
          chord.forEach(freq => {
            channelData[i] += Math.sin(2 * Math.PI * freq * (i / buffer.sampleRate)) / chord.length;
          });
        }
      });

      const result = await detectKey(buffer);
      expect(['C', 'G']).toContain(result.key);
      expect(result.mode).toBe('major');
    });

    it('handles microtonal content', async () => {
      const microtonalFreqs = [
        261.63 * 1.02, // Slightly sharp C4
        329.63 * 0.98, // Slightly flat E4
        392.00 * 1.01  // Slightly sharp G4
      ];
      const buffer = createChordBuffer(microtonalFreqs, 0.5);
      
      const result = await detectKey(buffer);
      expect(result.key).toBe('C');
      expect(result.mode).toBe('major');
      expect(result.confidence).toBeLessThan(0.8); // Lower confidence due to detuning
    });
  });

  describe('Real-world Scenarios', () => {
    it('detects key from chord progression with passing tones', async () => {
      const buffer = audioContext.createBuffer(1, 22050, 44100); // 0.5 seconds
      const channelData = buffer.getChannelData(0);
      
      // C major progression with chromatic passing tones
      const progression = [
        [261.63, 329.63, 392.00], // C major
        [277.18, 349.23, 415.30], // C#/Db passing
        [293.66, 369.99, 440.00], // D minor
        [311.13, 392.00, 466.16]  // Eb passing
      ];
      
      progression.forEach((chord, index) => {
        const start = Math.floor(index * buffer.length / progression.length);
        const end = Math.floor((index + 1) * buffer.length / progression.length);
        
        for (let i = start; i < end; i++) {
          chord.forEach(freq => {
            channelData[i] += Math.sin(2 * Math.PI * freq * (i / buffer.sampleRate)) / chord.length;
          });
        }
      });

      const result = await detectKey(buffer);
      expect(result.key).toBe('C');
      expect(result.mode).toBe('major');
    });

    it('detects key from polyphonic audio with noise', async () => {
      const buffer = audioContext.createBuffer(1, 22050, 44100); // 0.5 seconds
      const channelData = buffer.getChannelData(0);
      
      // Create a complex signal with noise
      const fundamentalFreqs = [261.63, 329.63, 392.00]; // C major
      for (let i = 0; i < buffer.length; i++) {
        // Add fundamental frequencies
        fundamentalFreqs.forEach(freq => {
          channelData[i] += 0.5 * Math.sin(2 * Math.PI * freq * (i / buffer.sampleRate));
        });
        
        // Add harmonics
        fundamentalFreqs.forEach(freq => {
          channelData[i] += 0.25 * Math.sin(4 * Math.PI * freq * (i / buffer.sampleRate)); // 2nd harmonic
          channelData[i] += 0.125 * Math.sin(6 * Math.PI * freq * (i / buffer.sampleRate)); // 3rd harmonic
        });
        
        // Add noise
        channelData[i] += (Math.random() - 0.5) * 0.1;
      }

      const result = await detectKey(buffer);
      expect(result.key).toBe('C');
      expect(result.mode).toBe('major');
    });
  });
});
