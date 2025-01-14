import type { GenerateOptions, GeneratedLyrics, LyricsSection } from '../../types/lyrics';
import { SONG_STRUCTURES } from '../../constants/genres';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateLyrics(
  title: string,
  options: GenerateOptions
): Promise<GeneratedLyrics> {
  try {
    // Create a detailed prompt for OpenAI
    const prompt = `Generate lyrics for a song with the following specifications:
      Title: "${title}"
      Genre: ${options.genre}${options.subGenre ? ` (${options.subGenre})` : ''}
      Mood: ${options.mood}
      Theme: ${options.theme}
      Structure: ${options.structure}
      ${options.featuredGenre ? `Featured Artist Genre: ${options.featuredGenre}` : ''}

      Please follow these guidelines:
      1. Create lyrics that authentically represent the ${options.genre} genre
      2. Maintain a ${options.mood} mood throughout
      3. Explore the theme of ${options.theme}
      4. Follow a ${options.structure} song structure
      5. Include appropriate genre-specific elements and slang
      6. Create memorable hooks and catchy phrases
      
      Format the output with clear section labels (Verse 1, Chorus, etc.)`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.8,
      max_tokens: 1000
    });

    const generatedContent = response.choices[0].message?.content;
    if (!generatedContent) throw new Error('Failed to generate lyrics');

    // Process the generated content into sections
    const sections = parseGeneratedContent(generatedContent);
    const content = formatLyrics(sections, options);

    return {
      title,
      content,
      options,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Lyrics generation failed:', error);
    throw new Error('Failed to generate lyrics. Please try again later.');
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