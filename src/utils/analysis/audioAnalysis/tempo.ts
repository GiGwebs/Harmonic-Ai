import { AudioAnalysisError } from '../../errors';

interface TempoAnalysis {
  bpm: number;
  confidence: number;
}

/**
 * Detects the tempo (BPM) from an audio buffer using energy-based onset detection.
 * @param buffer The audio buffer to analyze
 * @returns Promise resolving to the detected tempo in BPM and confidence score
 * @throws AudioAnalysisError if the buffer is invalid or processing fails
 */
export function detectTempo(buffer: AudioBuffer): TempoAnalysis {
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
    
    // Enhanced onset detection using energy-based algorithm
    const frameSize = 1024;
    const hopSize = 512;
    const energyThreshold = 0.01;
    
    const onsets: number[] = [];
    let prevEnergy = 0;
    
    for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
      // Calculate frame energy
      let energy = 0;
      for (let j = 0; j < frameSize; j++) {
        energy += Math.pow(channelData[i + j], 2);
      }
      energy /= frameSize;
      
      // Detect onset using energy difference
      if (energy > energyThreshold && energy > prevEnergy * 1.5) {
        onsets.push(i / buffer.sampleRate);
      }
      
      prevEnergy = energy;
    }
    
    if (onsets.length < 2) {
      throw new AudioAnalysisError('Insufficient onset points detected for tempo analysis');
    }

    // Calculate tempo using inter-onset intervals
    const intervals: number[] = [];
    for (let i = 1; i < onsets.length; i++) {
      intervals.push(onsets[i] - onsets[i - 1]);
    }
    
    // Find the most common interval range (tempo)
    const bpms = intervals.map(interval => 60 / interval);
    const { bpm, confidence } = calculateMedianBpmWithConfidence(bpms);
    
    if (isNaN(bpm)) {
      throw new AudioAnalysisError('Failed to calculate valid BPM');
    }
    
    return { bpm: Math.round(bpm), confidence };
  } catch (error) {
    if (error instanceof AudioAnalysisError) {
      throw error;
    }
    throw new AudioAnalysisError('Failed to detect tempo', error);
  }
}

interface BpmAnalysis {
  bpm: number;
  confidence: number;
}

function calculateMedianBpmWithConfidence(bpms: number[]): BpmAnalysis {
  const validBpms = bpms
    .filter(bpm => bpm >= 60 && bpm <= 200) // Filter unrealistic BPMs
    .sort((a, b) => a - b);
  
  if (validBpms.length === 0) {
    throw new AudioAnalysisError('No valid BPM values found in analysis');
  }
  
  const mid = Math.floor(validBpms.length / 2);
  const bpm = validBpms.length % 2 === 0
    ? (validBpms[mid - 1] + validBpms[mid]) / 2
    : validBpms[mid];

  // Calculate confidence based on consistency of BPM values
  const mean = validBpms.reduce((a, b) => a + b) / validBpms.length;
  const variance = validBpms.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / validBpms.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Normalize confidence score between 0 and 1
  // Lower standard deviation means higher confidence
  const confidence = Math.max(0, Math.min(1, 1 - (standardDeviation / mean)));
  
  return { bpm, confidence };
}