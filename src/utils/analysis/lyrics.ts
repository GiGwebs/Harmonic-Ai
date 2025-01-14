import { AudioAnalysisError } from '../errors';

export interface LyricsAnalysis {
  sentiment: {
    mood: string;
    intensity: number;
    keywords: string[];
  };
  style: {
    genre: string[];
    themes: string[];
    artistInfluences: string[];
  };
  structure: {
    verses: number;
    hasChorus: boolean;
    hasBridge: boolean;
    estimatedDuration: number;
  };
}

/**
 * Analyzes lyrics content to extract meaningful features for SUNO AI integration
 * @param lyrics Raw lyrics text
 * @returns Promise resolving to LyricsAnalysis object
 */
export async function analyzeLyrics(lyrics: string): Promise<LyricsAnalysis> {
  if (!lyrics || typeof lyrics !== 'string') {
    throw new AudioAnalysisError('Invalid lyrics input');
  }

  try {
    // Basic sentiment analysis based on keyword matching
    const sentiment = analyzeTextSentiment(lyrics);
    
    // Detect musical style and genre indicators
    const style = detectMusicStyle(lyrics);
    
    // Analyze song structure
    const structure = detectVerses(lyrics);

    return {
      sentiment,
      style,
      structure
    };
  } catch (error) {
    throw new AudioAnalysisError('Failed to analyze lyrics', error);
  }
}

/**
 * Analyzes the emotional content and mood of the lyrics
 */
function analyzeTextSentiment(text: string) {
  const keywords = extractKeywords(text.toLowerCase());
  const words = text.toLowerCase().split(/\s+/);
  
  // Enhanced mood detection with weighted keywords and context
  const moodKeywords = {
    happy: {
      primary: ['happy', 'joy', 'dance', 'fun', 'bright', 'alive', 'smile', 'party'],
      secondary: ['light', 'shine', 'good', 'great', 'wonderful', 'laugh', 'play'],
      context: ['together', 'friends', 'celebrate', 'tonight', 'dance']
    },
    romantic: {
      primary: ['love', 'heart', 'kiss', 'soul', 'forever', 'tender', 'embrace', 'passion'],
      secondary: ['close', 'hold', 'touch', 'sweet', 'gentle', 'dream', 'together'],
      context: ['baby', 'tonight', 'eyes', 'feel', 'soul']
    },
    sad: {
      primary: ['cry', 'tears', 'pain', 'hurt', 'lonely', 'broken', 'gone', 'empty'],
      secondary: ['rain', 'dark', 'miss', 'cold', 'lost', 'without', 'never'],
      context: ['anymore', 'remember', 'away', 'alone', 'night']
    }
  };

  // Calculate weighted mood scores with context and proximity
  const moodScores = Object.entries(moodKeywords).map(([mood, { primary, secondary, context }]) => {
    let score = 0;
    let contextMultiplier = 1;
    let lineCount = 0;
    
    // Check each line for mood words and their proximity
    const lines = text.toLowerCase().split('\n');
    for (const line of lines) {
      if (line.trim().length === 0) continue;
      lineCount++;
      
      const lineWords = line.split(/\s+/);
      
      // Count primary and secondary keywords in this line
      const primaryInLine = primary.filter(word => lineWords.includes(word)).length;
      const secondaryInLine = secondary.filter(word => lineWords.includes(word)).length;
      const contextInLine = context.filter(word => lineWords.includes(word)).length;
      
      // Apply proximity bonus when multiple mood words appear in the same line
      if (primaryInLine + secondaryInLine > 1) {
        score += (primaryInLine * 4 + secondaryInLine * 2) * 1.5;
      } else {
        score += primaryInLine * 4 + secondaryInLine * 2;
      }
      
      // Add context multiplier
      if (contextInLine > 0) {
        contextMultiplier += 0.3 * contextInLine;
      }
    }
    
    // Apply final context multiplier
    score *= contextMultiplier;
    
    // Special handling for romantic vs happy
    if (mood === 'romantic' && text.toLowerCase().includes('love')) {
      score *= 1.5; // Stronger boost for romantic when "love" is present
    }
    
    // Special handling for sad mood
    if (mood === 'sad') {
      const sadWordDensity = score / (lineCount || 1);
      if (sadWordDensity > 2) {
        score *= 1.3; // Boost sad score when there's a high density of sad words
      }
    }
    
    return {
      mood,
      score,
      totalPossible: (primary.length * 4 + secondary.length * 2) * 1.5 // Adjusted for more realistic scoring
    };
  });

  const dominantMood = moodScores.reduce((a, b) => 
    a.score > b.score ? a : b);

  return {
    mood: dominantMood.mood,
    intensity: Math.min(1, dominantMood.score / dominantMood.totalPossible),
    keywords
  };
}

/**
 * Detects musical style indicators from lyrics
 */
function detectMusicStyle(text: string) {
  const words = text.toLowerCase().split(/\s+/);
  
  // Genre detection based on keyword frequency
  const genreKeywords = {
    pop: ['love', 'baby', 'dance', 'night', 'party'],
    rock: ['rock', 'wild', 'fire', 'freedom', 'fight'],
    hiphop: ['rap', 'beat', 'street', 'flow', 'rhyme'],
    rnb: ['baby', 'love', 'soul', 'heart', 'groove'],
    country: ['heart', 'home', 'road', 'truck', 'beer']
  };

  const genres = Object.entries(genreKeywords)
    .filter(([_, keywords]) => 
      keywords.some(keyword => words.includes(keyword)))
    .map(([genre]) => genre);

  // Theme detection
  const themeKeywords = {
    love: ['love', 'heart', 'romance', 'forever'],
    party: ['party', 'dance', 'night', 'club'],
    life: ['life', 'world', 'dream', 'hope'],
    struggle: ['fight', 'pain', 'strong', 'survive']
  };

  const themes = Object.entries(themeKeywords)
    .filter(([_, keywords]) => 
      keywords.some(keyword => words.includes(keyword)))
    .map(([theme]) => theme);

  return {
    genre: genres.length > 0 ? genres : ['pop'], // Default to pop if no clear genre
    themes: themes.length > 0 ? themes : ['general'],
    artistInfluences: [] // To be implemented with artist similarity API
  };
}

/**
 * Analyzes the structure of the song lyrics
 */
function detectVerses(lyrics: string): { verses: number; hasChorus: boolean; hasBridge: boolean } {
  const lines = lyrics.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  let verses = 0;
  let hasChorus = false;
  let hasBridge = false;
  let inVerse = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Explicit section markers
    if (line.includes('verse') || line.match(/v\d+/)) {
      verses++;
      inVerse = true;
      continue;
    }
    
    if (line.includes('chorus') || line.includes('[chorus]')) {
      hasChorus = true;
      inVerse = false;
      continue;
    }
    
    if (line.includes('bridge')) {
      hasBridge = true;
      inVerse = false;
      continue;
    }
    
    // Implicit verse detection
    if (!inVerse && line.length > 0 && !hasChorus && !hasBridge) {
      const nextLines = lines.slice(i, i + 4);
      const averageLength = nextLines.reduce((sum, l) => sum + l.length, 0) / nextLines.length;
      
      if (averageLength > 20) { // Typical verse line length
        verses++;
        inVerse = true;
      }
    }
  }
  
  // Ensure at least one verse if there's content
  verses = Math.max(1, verses);
  
  return { verses, hasChorus, hasBridge };
}

/**
 * Extracts significant keywords from text
 */
function extractKeywords(text: string): string[] {
  // Normalize text and split into words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  // Remove common stop words
  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
    'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
    'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they',
    'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
    'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out',
    'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
    'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some',
    'could', 'them', 'see', 'other', 'than', 'then', 'now',
    'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work',
    'first', 'well', 'way', 'even', 'new', 'want', 'because',
    'any', 'these', 'give', 'day', 'most', 'us'
  ]);
  
  // Count word frequency excluding stop words
  const wordCount = words
    .filter(word => !stopWords.has(word))
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  // Sort by frequency and return words
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .map(([word]) => word);
}
