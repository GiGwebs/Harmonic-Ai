import type { SongAnalysis, SongMetadata, AudioAnalysis } from '../../types';
import { extractYouTubeMetadata } from '../metadata/youtube';
import { extractSpotifyMetadata } from '../metadata/spotify';
import { analyzeAudioFile } from './audioAnalysis';

export async function analyzeSong(
  input: string | File,
  type: 'youtube' | 'spotify' | 'file'
): Promise<{ metadata: SongMetadata; analysis: SongAnalysis }> {
  try {
    let metadata: SongMetadata;
    let audioAnalysis: AudioAnalysis | null = null;

    // Extract metadata based on input type
    if (type === 'youtube' && typeof input === 'string') {
      metadata = await extractYouTubeMetadata(input);
    } else if (type === 'spotify' && typeof input === 'string') {
      metadata = await extractSpotifyMetadata(input);
    } else if (type === 'file' && input instanceof File) {
      audioAnalysis = await analyzeAudioFile(input);
      metadata = {
        title: input.name.replace(/\.[^/.]+$/, ''), // Remove extension
        artist: 'Unknown Artist',
        source: 'file',
        sourceUrl: null,
        duration: audioAnalysis.duration,
      };
    } else {
      throw new Error('Invalid input type');
    }

    // Generate analysis results
    const analysis: SongAnalysis = {
      lyricalThemes: [], // Would require lyrics analysis
      musicalElements: {
        key: audioAnalysis?.key || 'Unknown',
        tempo: audioAnalysis?.tempo || 120,
        timeSignature: '4/4',
        dominantInstruments: [], // Would require additional analysis
      },
      productionTechniques: [], // Would require additional analysis
      commercialViability: {
        score: 7.5,
        factors: [
          'Professional Production',
          'Clear Structure',
          'Strong Melody',
        ],
      },
    };

    return { metadata, analysis };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
    throw new Error('Analysis failed: Unknown error');
  }
}