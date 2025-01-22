import type { GenerateOptions } from '../../types/lyrics';

export async function generateTitle(options: GenerateOptions): Promise<string> {
  try {
    console.log('[Title] Starting title generation:', { options });
    
    const url = '/api/title';
    console.log('[Title] Making request to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ options })
    });

    console.log('[Title] Response status:', response.status);
    const responseData = await response.json();
    console.log('[Title] Response data:', responseData);

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to generate title');
    }

    if (!responseData.title) {
      throw new Error('No title received from server');
    }

    return responseData.title;
  } catch (error) {
    console.error('[Title] Generation failed:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to generate title. Please try again later.');
  }
}
