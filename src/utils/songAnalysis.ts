import OpenAI from 'openai';
import type { SongAnalysis, SongMetadata } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

async function extractMetadataFromUrl(url: string): Promise<SongMetadata> {
  try {
    // Extract metadata from URL using noembed
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    
    const data = await response.json();
    if (!data.title) {
      throw new Error('No title found in metadata');
    }

    // Try to parse artist and title
    const match = data.title.match(/^(.+?)\s*[-–]\s*(.+)$/);
    if (match) {
      return {
        artist: match[1].trim(),
        title: match[2].trim(),
        url
      };
    }

    // If no clear separator, use the whole title as the song title
    return {
      title: data.title.trim(),
      artist: data.author_name?.trim() || 'Unknown Artist',
      url
    };
  } catch (error) {
    console.error('Metadata extraction failed:', error);
    throw new Error('Failed to extract song metadata. Please check the URL and try again.');
  }
}

export async function analyzeSong(input: string, type: 'url' | 'file'): Promise<SongAnalysis> {
  try {
    // Extract metadata
    const metadata = type === 'url' 
      ? await extractMetadataFromUrl(input)
      : {
          title: 'Unknown Title',
          artist: 'Unknown Artist',
          url: undefined
        };

    // Analyze song using OpenAI
    const prompt = `Analyze the following song:
Title: ${metadata.title}
Artist: ${metadata.artist}
${metadata.url ? `URL: ${metadata.url}` : ''}

Please provide a detailed analysis in the following format:

1. Musical Elements
- Key:
- Time Signature:
- Tempo:
- Dominant Instruments:

2. Production Techniques
(List the main production techniques used)

3. Commercial Viability
Score: X/10
Factors:
- Factor 1
- Factor 2
etc.

4. Lyrical Themes
(List the main themes explored in the lyrics)

5. Unique Characteristics
(List any standout elements or unique aspects)

Please be specific and detailed in your analysis.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 1000
    });

    const analysis = response.choices[0].message?.content;
    if (!analysis) {
      throw new Error('Failed to generate analysis');
    }

    // Parse the analysis into structured data
    const sections = analysis.split('\n\n');
    const musicalElements: Record<string, any> = {};
    const productionTechniques: string[] = [];
    const commercialViability: { score: number; factors: string[] } = { score: 0, factors: [] };
    const lyricalThemes: string[] = [];
    const uniqueCharacteristics: string[] = [];

    let currentSection = '';
    for (const line of analysis.split('\n')) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('1. Musical Elements')) {
        currentSection = 'musical';
      } else if (trimmedLine.startsWith('2. Production Techniques')) {
        currentSection = 'production';
      } else if (trimmedLine.startsWith('3. Commercial Viability')) {
        currentSection = 'commercial';
      } else if (trimmedLine.startsWith('4. Lyrical Themes')) {
        currentSection = 'lyrical';
      } else if (trimmedLine.startsWith('5. Unique Characteristics')) {
        currentSection = 'unique';
      } else if (trimmedLine) {
        switch (currentSection) {
          case 'musical':
            if (trimmedLine.includes(':')) {
              const [key, value] = trimmedLine.split(':').map(s => s.trim());
              if (key && value) {
                musicalElements[key.toLowerCase().replace(/[^a-z]/g, '')] = value;
              }
            }
            break;
          case 'production':
            if (trimmedLine.startsWith('-')) {
              productionTechniques.push(trimmedLine.slice(1).trim());
            }
            break;
          case 'commercial':
            if (trimmedLine.startsWith('Score:')) {
              const score = parseInt(trimmedLine.match(/\d+/)?.[0] || '0');
              commercialViability.score = score;
            } else if (trimmedLine.startsWith('-')) {
              commercialViability.factors.push(trimmedLine.slice(1).trim());
            }
            break;
          case 'lyrical':
            if (trimmedLine.startsWith('-')) {
              lyricalThemes.push(trimmedLine.slice(1).trim());
            }
            break;
          case 'unique':
            if (trimmedLine.startsWith('-')) {
              uniqueCharacteristics.push(trimmedLine.slice(1).trim());
            }
            break;
        }
      }
    }

    return {
      metadata,
      musicalElements: {
        key: musicalElements.key || 'Unknown',
        timeSignature: musicalElements.timesignature || '4/4',
        tempo: musicalElements.tempo || 'Unknown',
        dominantInstruments: musicalElements.dominantinstruments?.split(',').map((i: string) => i.trim()) || []
      },
      productionTechniques,
      commercialViability,
      lyricalThemes,
      uniqueCharacteristics,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Analysis failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to analyze song. Please try again.');
  }
}