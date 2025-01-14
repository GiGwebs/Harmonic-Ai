import { AudioAnalysisError } from '../../errors';

// Chromagram represents the energy distribution across the 12 pitch classes
type Chromagram = number[];

interface KeyAnalysis {
  key: string;
  mode: 'major' | 'minor';
  confidence: number;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Key profiles with enhanced major/minor differentiation
const MAJOR_PROFILE = [
  20.0,  // C  (I - Tonic)
  1.0,   // C# (non-diatonic)
  4.0,   // D  (ii)
  1.0,   // D# (non-diatonic)
  12.0,  // E  (iii - major third)
  6.0,   // F  (IV - Subdominant)
  1.0,   // F# (non-diatonic)
  10.0,  // G  (V - Dominant)
  1.0,   // G# (non-diatonic)
  4.0,   // A  (vi)
  1.0,   // A# (non-diatonic)
  2.0    // B  (vii)
];

const MINOR_PROFILE = [
  20.0,  // C  (i - Tonic)
  1.0,   // C# (non-diatonic)
  2.0,   // D  (ii)
  10.0,  // D# (III - minor third)
  1.0,   // E  (non-diatonic)
  6.0,   // F  (iv - Subdominant)
  1.0,   // F# (non-diatonic)
  8.0,   // G  (v - Dominant)
  4.0,   // G# (VI)
  1.0,   // A  (non-diatonic)
  6.0,   // A# (VII)
  1.0    // B  (non-diatonic)
];

// Harmonic weighting factors with reduced emphasis on thirds
const HARMONIC_WEIGHTS = [
  1.0,    // Fundamental
  0.6,    // 2nd harmonic (octave)
  0.4,    // 3rd harmonic (perfect fifth)
  0.3,    // 4th harmonic (double octave)
  0.05    // 5th harmonic (major third)
];

// Phase correction factors for harmonic alignment
const PHASE_CORRECTIONS = [
  0,      // Fundamental
  Math.PI, // 2nd harmonic
  Math.PI / 2, // 3rd harmonic
  Math.PI, // 4th harmonic
  Math.PI / 2  // 5th harmonic
];

/**
 * Detects the musical key of an audio buffer using chromagram analysis.
 * @param buffer The audio buffer to analyze
 * @returns Promise resolving to the detected musical key, mode, and confidence
 * @throws AudioAnalysisError if the buffer is invalid or processing fails
 */
export async function detectKey(buffer: AudioBuffer): Promise<KeyAnalysis> {
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

    const chromagram = await calculateChromagram(buffer);
    return determineKeyProfile(chromagram);
  } catch (error) {
    if (error instanceof AudioAnalysisError) {
      throw error;
    }
    throw new AudioAnalysisError('Failed to detect key', error as Error);
  }
}

async function calculateChromagram(buffer: AudioBuffer): Promise<Chromagram> {
  const context = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
  const source = context.createBufferSource();
  const analyser = context.createAnalyser();
  
  // Configure analyzer for better frequency resolution
  analyser.fftSize = 16384; // Increased for even better resolution
  analyser.smoothingTimeConstant = 0;
  
  // Connect nodes
  source.buffer = buffer;
  source.connect(analyser);
  analyser.connect(context.destination);
  
  // Initialize arrays
  const chromagram = new Array(12).fill(0);
  const frequencyData = new Float32Array(analyser.frequencyBinCount);
  
  // Start processing
  source.start(0);
  await context.startRendering();
  
  // Get frequency data
  analyser.getFloatFrequencyData(frequencyData);
  
  // Convert to power spectrum and accumulate chroma with weighted bins
  const binSize = context.sampleRate / analyser.fftSize;
  const referenceFreq = 440.0; // A4
  const referenceMidiNote = 69; // MIDI note number for A4
  
  // Process each frequency bin
  for (let i = 0; i < frequencyData.length; i++) {
    const frequency = i * binSize;
    if (frequency < 20 || frequency > 8000) continue; // Extended frequency range
    
    // Calculate harmonics
    for (let harmonicIndex = 0; harmonicIndex < HARMONIC_WEIGHTS.length; harmonicIndex++) {
      const harmonicFreq = frequency * (harmonicIndex + 1);
      if (harmonicFreq > 8000) break;
      
      // Convert frequency to MIDI note number with fractional part
      const midiNote = 12 * Math.log2(harmonicFreq / referenceFreq) + referenceMidiNote;
      const fractionalPart = midiNote - Math.floor(midiNote);
      
      // Calculate weight based on proximity to nearest semitone and harmonic weight
      const semitonalWeight = Math.cos(Math.PI * fractionalPart) * 0.5 + 0.5;
      const harmonicWeight = HARMONIC_WEIGHTS[harmonicIndex];
      const totalWeight = semitonalWeight * harmonicWeight;
      
      // Convert dB to magnitude with weighted contribution
      const magnitude = Math.pow(10, frequencyData[i] / 20) * totalWeight;
      
      // Distribute energy to neighboring pitch classes with quadratic interpolation
      const basePitch = Math.floor(midiNote) % 12;
      const nextPitch = (basePitch + 1) % 12;
      const prevPitch = (basePitch + 11) % 12;
      
      const quadraticWeight = fractionalPart * fractionalPart;
      chromagram[prevPitch] += magnitude * (1 - quadraticWeight) * 0.1;
      chromagram[basePitch] += magnitude * (1 - fractionalPart);
      chromagram[nextPitch] += magnitude * quadraticWeight;
    }
  }
  
  // Apply Gaussian smoothing with wider window
  const smoothedChromagram = new Array(12).fill(0);
  for (let i = 0; i < 12; i++) {
    for (let j = -3; j <= 3; j++) {
      const idx = (i + j + 12) % 12;
      const weight = Math.exp(-0.3 * (j * j)); // Reduced falloff for smoother transitions
      smoothedChromagram[i] += chromagram[idx] * weight;
    }
  }
  
  // Normalize chromagram with soft max to preserve relative strengths
  const max = Math.max(...smoothedChromagram);
  if (max === 0) {
    throw new AudioAnalysisError('No frequency content detected in audio');
  }
  
  const softMax = Math.log(smoothedChromagram.reduce((sum, x) => sum + Math.exp(x / max), 0));
  return smoothedChromagram.map(value => value / (max * softMax));
}

function frequencyToPitch(frequency: number): number {
  // Convert frequency to MIDI pitch number
  // A4 = 69, 440Hz
  return 12 * Math.log2(frequency / 440) + 69;
}

function determineKeyProfile(chromagram: Chromagram): KeyAnalysis {
  let bestCorrelation = -1;
  let bestKey = 0;
  let bestMode: 'major' | 'minor' = 'major';
  let secondBestCorrelation = -1;

  // Test correlations with all possible major and minor keys
  for (let i = 0; i < 12; i++) {
    const majorCorr = correlate(chromagram, rotateArray(MAJOR_PROFILE, i), 'major');
    const minorCorr = correlate(chromagram, rotateArray(MINOR_PROFILE, i), 'minor');

    // Apply mode-specific bias to favor major keys slightly
    const adjustedMajorCorr = majorCorr * 1.1;
    const adjustedMinorCorr = minorCorr;

    if (adjustedMajorCorr > bestCorrelation) {
      secondBestCorrelation = bestCorrelation;
      bestCorrelation = adjustedMajorCorr;
      bestKey = i;
      bestMode = 'major';
    } else if (adjustedMajorCorr > secondBestCorrelation) {
      secondBestCorrelation = adjustedMajorCorr;
    }

    if (adjustedMinorCorr > bestCorrelation) {
      secondBestCorrelation = bestCorrelation;
      bestCorrelation = adjustedMinorCorr;
      bestKey = i;
      bestMode = 'minor';
    } else if (adjustedMinorCorr > secondBestCorrelation) {
      secondBestCorrelation = adjustedMinorCorr;
    }
  }

  // Calculate confidence based on correlation values and mode strength
  const correlationDiff = bestCorrelation - secondBestCorrelation;
  const modeStrength = bestMode === 'major' ? 
    chromagram[4] / (chromagram[3] + 0.001) : // Major third vs minor third
    chromagram[3] / (chromagram[4] + 0.001);  // Minor third vs major third

  const confidence = Math.min(0.95, Math.max(0.5,
    (correlationDiff * 0.5 + modeStrength * 0.5)
  ));

  return {
    key: NOTES[bestKey],
    mode: bestMode,
    confidence: confidence
  };
}

function correlate(chromagram: number[], profile: number[], mode: 'major' | 'minor'): number {
  if (chromagram.length !== profile.length) {
    throw new Error('Arrays must be of equal length');
  }

  // Normalize inputs to reduce amplitude differences
  const normalizedChroma = normalizeVector(chromagram);
  const normalizedProfile = normalizeVector(profile);

  let correlation = 0;
  let weightSum = 0;

  // Calculate weighted correlation with mode-specific emphasis
  for (let i = 0; i < chromagram.length; i++) {
    // Higher weight for tonic and mode-defining intervals
    let positionWeight = 1.0;
    if (i === 0) positionWeight = 2.5; // Tonic
    else if (mode === 'major' && i === 4) positionWeight = 2.0; // Major third
    else if (mode === 'minor' && i === 3) positionWeight = 2.0; // Minor third
    else if (i === 7) positionWeight = 1.5; // Perfect fifth
    
    const weight = Math.pow(normalizedChroma[i], 2) * positionWeight;
    correlation += weight * normalizedChroma[i] * normalizedProfile[i];
    weightSum += weight;
  }

  // Apply mode-specific weighting
  if (mode === 'major') {
    // Check major third to minor third ratio
    const majorThirdRatio = (normalizedChroma[4] + 0.001) / (normalizedChroma[3] + 0.001);
    const modeBonus = Math.min(0.5, Math.max(0, majorThirdRatio - 1));
    correlation *= (1 + modeBonus);
  } else {
    // Check minor third to major third ratio
    const minorThirdRatio = (normalizedChroma[3] + 0.001) / (normalizedChroma[4] + 0.001);
    const modeBonus = Math.min(0.5, Math.max(0, minorThirdRatio - 1));
    correlation *= (1 + modeBonus);
  }

  return weightSum > 0 ? correlation / weightSum : 0;
}

function normalizeVector(vector: number[]): number[] {
  const sum = vector.reduce((acc, val) => acc + val * val, 0);
  const magnitude = Math.sqrt(sum);
  return magnitude > 0 ? vector.map(x => x / magnitude) : vector;
}

function rotateArray<T>(arr: T[], n: number): T[] {
  const rotated = [...arr];
  for (let i = 0; i < n; i++) {
    rotated.unshift(rotated.pop()!);
  }
  return rotated;
}
