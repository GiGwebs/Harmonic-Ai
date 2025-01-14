import natural from 'natural';
import type { SentimentAnalysis } from '../types';

const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
const tokenizer = new natural.WordTokenizer();

const emotionalLexicon = {
  joy: ['happy', 'joy', 'love', 'wonderful', 'delight', 'beautiful', 'blessed', 'bliss', 'alive', 'thrive', 'rise', 'lift', 'precious', 'gift'],
  sadness: ['sad', 'lonely', 'miserable', 'depressed', 'heartbreak', 'grief', 'sorrow', 'pain', 'tears', 'broken', 'aches', 'darkness', 'bitter'],
  anger: ['angry', 'furious', 'rage', 'hate', 'mad', 'fury', 'outrage', 'bitter', 'fight'],
  fear: ['scared', 'afraid', 'fear', 'terrified', 'dread', 'horror', 'shadows'],
  hope: ['hope', 'dream', 'aspire', 'believe', 'faith', 'optimistic', 'light', 'morning'],
  power: ['strong', 'power', 'mighty', 'force', 'strength', 'powerful', 'rise', 'fight']
};

function identifyEmotionalTone(lyrics: string): string {
  const tokens = tokenizer.tokenize(lyrics.toLowerCase());
  const emotionScores = Object.entries(emotionalLexicon).map(([emotion, words]) => {
    const score = tokens.filter(token => words.includes(token)).length;
    return { emotion, score };
  });

  // Sort emotions by score in descending order
  const sortedEmotions = emotionScores
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score);

  if (sortedEmotions.length === 0) return 'Neutral';
  
  // If multiple strong emotions, indicate mixed tone
  if (sortedEmotions.length > 1 && 
      sortedEmotions[0].score === sortedEmotions[1].score) {
    return `Mixed (${sortedEmotions[0].emotion} & ${sortedEmotions[1].emotion})`;
  }
  
  // If multiple emotions but one is stronger
  if (sortedEmotions.length > 1 && 
      sortedEmotions[0].score > sortedEmotions[1].score &&
      sortedEmotions[1].score > 0) {
    return `${sortedEmotions[0].emotion} with ${sortedEmotions[1].emotion}`;
  }

  return sortedEmotions[0].emotion.charAt(0).toUpperCase() + 
         sortedEmotions[0].emotion.slice(1);
}

function getSentimentLabel(score: number): 'positive' | 'negative' | 'neutral' {
  if (score > 0.05) return 'positive';
  if (score < -0.05) return 'negative';
  return 'neutral';
}

function generateSummary(sentimentLabel: string, emotionalTone: string): string {
  return `The lyrics express a ${sentimentLabel} sentiment with a predominantly ${emotionalTone.toLowerCase()} emotional tone.`;
}

export async function analyzeLyricsSentiment(lyrics: string): Promise<SentimentAnalysis> {
  const tokens = tokenizer.tokenize(lyrics);
  const sentimentScore = analyzer.getSentiment(tokens);
  const normalizedScore = Math.max(-1, Math.min(1, sentimentScore)); // Normalize between -1 and 1
  const sentimentLabel = getSentimentLabel(normalizedScore);
  const emotionalTone = identifyEmotionalTone(lyrics);
  
  return {
    sentimentScore: normalizedScore,
    sentimentLabel,
    emotionalTone,
    summary: generateSummary(sentimentLabel, emotionalTone)
  };
}
