import { AudioAnalysisError } from '../errors';

/**
 * Detects chord progressions from an audio buffer using chromagram analysis.
 * @param buffer The audio buffer to analyze
 * @returns Promise resolving to an array of detected chord names
 * @throws AudioAnalysisError if the buffer is invalid or processing fails
 */
export async function detectChords(buffer: AudioBuffer): Promise<string[]> {
  // Input validation
  if (!buffer) {
    throw new AudioAnalysisError('Audio buffer is null or undefined');
  }
  if (buffer.length === 0) {
    throw new AudioAnalysisError('Audio buffer is empty');
  }
  if (buffer.sampleRate <= 0) {
    throw new AudioAnalysisError('Invalid sample rate');
  }

  try {
    const channelData = buffer.getChannelData(0);
    if (!channelData || channelData.length === 0) {
      throw new AudioAnalysisError('No audio data available in buffer');
    }

    const frameSize = 4096;
    const hopSize = 2048;
    const chordSequence: string[] = [];
    
    // Process audio in frames
    for (let i = 0; i < buffer.length; i += hopSize) {
      const frame = extractFrame(buffer, i, frameSize);
      if (!frame || frame.length === 0) {
        throw new AudioAnalysisError('Failed to extract valid frame from buffer');
      }

      const chromagram = await calculateFrameChromagram(frame);
      if (!chromagram || chromagram.length !== 12) {
        throw new AudioAnalysisError('Invalid chromagram calculation result');
      }

      const chord = identifyChord(chromagram);
      if (chord) {
        chordSequence.push(chord);
      }
    }
    
    if (chordSequence.length === 0) {
      throw new AudioAnalysisError('No chords detected in audio');
    }
    
    const simplified = simplifyChordSequence(chordSequence);
    if (!simplified || simplified.length === 0) {
      throw new AudioAnalysisError('Failed to simplify chord sequence');
    }
    
    return simplified;
  } catch (error) {
    if (error instanceof AudioAnalysisError) {
      throw error;
    }
    throw new AudioAnalysisError('Failed to detect chords', error);
  }
}

function extractFrame(buffer: AudioBuffer, start: number, size: number): Float32Array {
  const frame = new Float32Array(size);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < size; i++) {
    if (start + i < data.length) {
      frame[i] = data[start + i];
    }
  }
  
  return frame;
}

async function calculateFrameChromagram(frame: Float32Array): Promise<number[]> {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = context.createAnalyser();
  analyser.fftSize = frame.length * 2;
  
  const source = context.createBufferSource();
  const buffer = context.createBuffer(1, frame.length, context.sampleRate);
  buffer.getChannelData(0).set(frame);
  source.buffer = buffer;
  
  source.connect(analyser);
  const spectrum = new Float32Array(analyser.frequencyBinCount);
  analyser.getFloatFrequencyData(spectrum);
  
  const chromagram = new Array(12).fill(0);
  const binSize = context.sampleRate / frame.length;
  
  for (let i = 0; i < spectrum.length; i++) {
    const frequency = i * binSize;
    if (frequency > 0) {
      const pitch = Math.round(12 * Math.log2(frequency / 440) + 69) % 12;
      chromagram[pitch] += Math.pow(10, spectrum[i] / 20);
    }
  }
  
  await context.close();
  return chromagram;
}

function identifyChord(chromagram: number[]): string | null {
  // Common chord templates (simplified for example)
  const templates = {
    major: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    minor: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    diminished: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
    augmented: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  };
  
  const pitchClasses = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  let bestMatch = { root: 0, quality: '', correlation: -1 };
  
  // Find best matching chord
  for (let root = 0; root < 12; root++) {
    for (const [quality, template] of Object.entries(templates)) {
      const rotatedTemplate = [...template.slice(root), ...template.slice(0, root)];
      const correlation = correlate(chromagram, rotatedTemplate);
      
      if (correlation > bestMatch.correlation) {
        bestMatch = { root, quality, correlation };
      }
    }
  }
  
  // Return null if correlation is too low
  if (bestMatch.correlation < 0.5) {
    return null;
  }
  
  const suffix = bestMatch.quality === 'major' ? '' : 'm';
  return `${pitchClasses[bestMatch.root]}${suffix}`;
}

function correlate(a: number[], b: number[]): number {
  const n = a.length;
  let sum = 0;
  let sumA = 0;
  let sumB = 0;
  let sumAsq = 0;
  let sumBsq = 0;
  
  for (let i = 0; i < n; i++) {
    sum += a[i] * b[i];
    sumA += a[i];
    sumB += b[i];
    sumAsq += a[i] * a[i];
    sumBsq += b[i] * b[i];
  }
  
  const num = n * sum - sumA * sumB;
  const den = Math.sqrt((n * sumAsq - sumA * sumA) * (n * sumBsq - sumB * sumB));
  return num / den;
}

function simplifyChordSequence(chords: string[]): string[] {
  // Remove consecutive duplicates and short duration chords
  const simplified: string[] = [];
  let currentChord = '';
  let count = 0;
  
  for (const chord of chords) {
    if (chord === currentChord) {
      count++;
    } else {
      if (count >= 4) { // Minimum duration threshold
        simplified.push(currentChord);
      }
      currentChord = chord;
      count = 1;
    }
  }
  
  if (count >= 4) {
    simplified.push(currentChord);
  }
  
  return simplified;
}