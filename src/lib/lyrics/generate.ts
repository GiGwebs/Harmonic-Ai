import type { GenerateOptions, GeneratedLyrics, LyricsSection } from '../../types/lyrics';
import { SONG_STRUCTURES } from '../../constants/genres';

export async function generateLyrics(
  title: string,
  options: GenerateOptions
): Promise<GeneratedLyrics> {
  try {
    console.log('[Lyrics] Starting lyrics generation:', { 
      title, 
      options,
      timestamp: new Date().toISOString()
    });
    
    const url = '/api/generate';
    const requestBody = { title, options };
    console.log('[Lyrics] Making request to:', url, 'with body:', requestBody);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, options })
    });

    console.log('[Lyrics] Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    const responseData = await response.json();
    console.log('[Lyrics] Response data:', {
      hasLyrics: !!responseData.lyrics,
      responseKeys: Object.keys(responseData),
      data: responseData
    });

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to generate lyrics');
    }

    if (!responseData.lyrics) {
      throw new Error('No lyrics received from server');
    }

    // Process the generated content into sections
    const sections = parseGeneratedContent(responseData.lyrics);
    const content = formatLyrics(sections, options);

    return {
      title,
      content,
      options,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Lyrics] Generation failed:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to generate lyrics. Please try again later.');
  }
}

function parseGeneratedContent(content: string): LyricsSection[] {
  const sections: LyricsSection[] = [];
  const lines = content.split('\n');
  let currentType: 'verse' | 'chorus' | 'bridge' | 'outro' | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim().toLowerCase();
    
    // Check for section headers
    if (trimmedLine.includes('verse') || 
        trimmedLine.includes('chorus') || 
        trimmedLine.includes('bridge') || 
        trimmedLine.includes('outro')) {
      
      // Save previous section if exists
      if (currentType && currentContent.length > 0) {
        sections.push({
          type: currentType,
          content: currentContent.join('\n')
        });
        currentContent = [];
      }

      // Set new section type
      if (trimmedLine.includes('verse')) currentType = 'verse';
      else if (trimmedLine.includes('chorus')) currentType = 'chorus';
      else if (trimmedLine.includes('bridge')) currentType = 'bridge';
      else if (trimmedLine.includes('outro')) currentType = 'outro';
      
    } else if (line.trim() && currentType) {
      currentContent.push(line);
    }
  }

  // Add final section
  if (currentType && currentContent.length > 0) {
    sections.push({
      type: currentType,
      content: currentContent.join('\n')
    });
  }

  return sections;
}

function formatLyrics(sections: LyricsSection[], options: GenerateOptions): string {
  return sections.map(section => {
    const header = section.type.charAt(0).toUpperCase() + section.type.slice(1);
    return `${header}:\n${section.content}\n`;
  }).join('\n');
}
