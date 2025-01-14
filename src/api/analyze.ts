import type { Request, Response } from 'express';
import { saveSongAnalysisFirebase } from '../lib/db/songs.js';
import type { SongAnalysis } from '../types';
import { extractLyricsFromYouTube } from '../services/lyricsExtraction.js';
import { analyzeLyricsSentiment } from '../services/sentimentAnalysis.js';

async function extractSongMetadata(url: string) {
  try {
    const { lyrics, error } = await extractLyricsFromYouTube(url);
    if (error) {
      console.error('Error extracting lyrics:', error);
      throw new Error(error);
    }
    
    // Analyze the lyrics sentiment
    const sentimentAnalysis = await analyzeLyricsSentiment(lyrics);
    
    return {
      title: 'Song Title', // TODO: Extract from YouTube metadata
      artist: 'Artist Name', // TODO: Extract from YouTube metadata
      url: url,
      lyrics,
      sentimentAnalysis
    };
  } catch (error) {
    console.error('Error in metadata extraction:', error);
    throw error;
  }
}

async function analyzeSong(url: string): Promise<SongAnalysis> {
  const { title, artist, url: songUrl, lyrics, sentimentAnalysis } = await extractSongMetadata(url);
  
  return {
    metadata: {
      title,
      artist,
      url: songUrl
    },
    musicalElements: {
      key: 'D Minor',
      timeSignature: '4/4',
      tempo: '120 BPM',
      dominantInstruments: [
        'Synthesizer',
        'Electronic Drums',
        'Bass',
      ],
    },
    commercialViability: {
      score: 8.5,
      factors: [
        'Strong melodic progression with memorable hooks',
        'Modern production style aligned with current trends',
        'Optimal song length and structure for radio play',
      ],
    },
    lyricalThemes: [
      'Personal growth and transformation',
      'Overcoming challenges',
      'Finding inner strength',
    ],
    productionTechniques: [
      'Dynamic compression enhancing the overall energy',
      'Layered synthesizers creating depth and atmosphere',
      'Modern vocal processing with subtle harmonies',
      'Punchy drum programming with tight quantization',
    ],
    sections: [
      {
        id: '1',
        type: 'intro',
        content: 'Instrumental introduction with building energy',
        analysis: {
          complexity: 'simple',
          moods: ['energetic'],
          impact: 75,
          recommendations: ['Consider adding a subtle riser for more tension']
        }
      },
      {
        id: '2',
        type: 'verse',
        content: 'First verse introducing the main theme',
        analysis: {
          complexity: 'intermediate',
          moods: ['neutral', 'melancholic'],
          impact: 85,
          recommendations: ['Try adding more dynamic variation']
        }
      },
      {
        id: '3',
        type: 'chorus',
        content: 'Powerful chorus with memorable hook',
        analysis: {
          complexity: 'complex',
          moods: ['joyful', 'energetic'],
          impact: 95,
          recommendations: ['Perfect as is - maintains high energy']
        }
      },
      {
        id: '4',
        type: 'bridge',
        content: 'Bridge section with contrasting elements',
        analysis: {
          complexity: 'intermediate',
          moods: ['somber'],
          impact: 80,
          recommendations: ['Consider extending for more impact']
        }
      }
    ],
    sentimentAnalysis,
    uniqueCharacteristics: [
      'Innovative use of synthesizer textures',
      'Strong emotional progression throughout',
      'Effective use of dynamic contrast',
    ],
    createdAt: new Date().toISOString(),
  };
}

export async function analyzeHandler(req: Request, res: Response) {
  try {
    console.log('Received analyze request:', JSON.stringify(req.body, null, 2));
    
    const { url } = req.body;
    
    if (!url || typeof url !== 'string') {
      console.log('Invalid URL provided:', url);
      return res.status(400).json({
        success: false,
        error: 'Invalid URL',
        details: 'Please provide a valid URL for analysis',
        timestamp: new Date().toISOString()
      });
    }

    // Analyze the song
    const analysis = await analyzeSong(url);
    console.log('Generated analysis:', JSON.stringify(analysis, null, 2));

    // Save to Firebase
    try {
      await saveSongAnalysisFirebase(analysis);
      console.log('Analysis saved to Firebase successfully');
    } catch (dbError) {
      console.error('Firebase save error:', dbError);
      // Continue even if save fails, but log it
    }

    // Send the response
    const response = {
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    };

    console.log('Sending response:', JSON.stringify(response, null, 2));
    return res.status(200).json(response);

  } catch (error) {
    console.error('Analysis error:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  }
}
