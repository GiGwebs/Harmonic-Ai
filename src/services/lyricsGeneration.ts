import type { GenerateOptions } from '../types/lyrics';

interface GenerationResponse {
  lyrics: string;
  error?: string;
}

export async function generateLyrics(
  title: string,
  options: GenerateOptions
): Promise<GenerationResponse> {
  try {
    const response = await fetch('/api/generate-lyrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        options,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to generate lyrics');
    }

    const data = await response.json();
    return { lyrics: data.lyrics };
  } catch (error: any) {
    console.error('Error generating lyrics:', error);
    return {
      lyrics: '',
      error: error.message || 'Failed to generate lyrics'
    };
  }
}
