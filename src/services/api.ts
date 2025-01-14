import { SongAnalysis } from '../types';

export const analyzeSong = async (lyrics: string): Promise<SongAnalysis> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lyrics }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze song');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing song:', error);
    throw error;
  }
};
