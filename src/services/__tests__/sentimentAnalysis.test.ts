import { analyzeSentiment } from '../sentimentAnalysis';

const mockLyrics = {
  positive: `
    Dancing in the sunlight, feeling so alive
    Love fills my heart, making my spirit thrive
    Every moment's precious, every day's a gift
    Together we rise, our souls begin to lift
  `,
  
  negative: `
    Darkness surrounds me, pain is all I know
    Tears fall like rain, as bitter winds blow
    Lost in the shadows of what used to be
    Broken promises are all I can see
  `,
  
  neutral: `
    Walking down the street on a regular day
    People pass by, going their separate way
    Time keeps moving as the clock strikes noon
    Cars and buildings under the afternoon
  `,
  
  mixed: `
    Through the storm clouds breaks a ray of light
    Though my heart aches, I'll keep up the fight
    Memories of joy mixed with tears of pain
    After the darkness comes the morning rain
  `
};

async function runSentimentTests() {
  console.log('\n=== Running Sentiment Analysis Tests ===\n');

  for (const [type, lyrics] of Object.entries(mockLyrics)) {
    console.log(`Testing ${type.toUpperCase()} lyrics:`);
    console.log('Lyrics:', lyrics.trim());
    
    const analysis = await analyzeSentiment(lyrics);
    
    console.log('\nResults:');
    console.log('- Sentiment Score:', analysis.sentimentScore.toFixed(2));
    console.log('- Sentiment Label:', analysis.sentimentLabel);
    console.log('- Emotional Tone:', analysis.emotionalTone);
    console.log('- Summary:', analysis.summary);
    console.log('\n---\n');
  }
}

describe('Sentiment Analysis', () => {
  const runSentimentTests = async (lyrics: string) => {
    console.log(`Testing lyrics:\n${lyrics}\n`);
    const result = await analyzeSentiment(lyrics);
    console.log('\nResults:');
    console.log(`- Sentiment Score: ${result.sentimentScore}`);
    console.log(`- Sentiment Label: ${result.sentimentLabel}`);
    console.log(`- Emotional Tone: ${result.emotionalTone}`);
    console.log(`- Summary: ${result.summary}\n`);
    console.log('---');
    return result;
  };

  it('analyzes positive sentiment correctly', async () => {
    const lyrics = `Dancing in the sunlight, feeling so alive
        Love fills my heart, making my spirit thrive
        Every moment's precious, every day's a gift
        Together we rise, our souls begin to lift`;

    const result = await runSentimentTests(lyrics);
    expect(result.sentimentScore).toBeGreaterThan(0);
    expect(result.sentimentLabel).toBe('positive');
    expect(result.emotionalTone.toLowerCase()).toContain('joy');
    expect(result.summary).toContain('positive');
  });

  it('analyzes negative sentiment correctly', async () => {
    const lyrics = `Darkness surrounds me, pain is all I know
        Tears fall like rain, as bitter winds blow
        Lost in the shadows of what used to be
        Broken promises are all I can see`;

    const result = await runSentimentTests(lyrics);
    expect(result.sentimentScore).toBeLessThan(0);
    expect(result.sentimentLabel).toBe('negative');
    expect(result.emotionalTone.toLowerCase()).toContain('sadness');
    expect(result.summary).toContain('negative');
  });

  it('analyzes neutral sentiment correctly', async () => {
    const lyrics = `Walking down the street on a regular day
        People pass by, going their separate way
        Time keeps moving as the clock strikes noon
        Cars and buildings under the afternoon`;

    const result = await runSentimentTests(lyrics);
    expect(result.sentimentScore).toBeCloseTo(0, 1);
    expect(result.sentimentLabel).toBe('neutral');
    expect(result.emotionalTone.toLowerCase()).toBe('neutral');
    expect(result.summary).toContain('neutral');
  });

  it('analyzes mixed sentiment correctly', async () => {
    const lyrics = `Through the storm clouds breaks a ray of light
        Though my heart aches, I'll keep up the fight
        Memories of joy mixed with tears of pain
        After the darkness comes the morning rain`;

    const result = await runSentimentTests(lyrics);
    expect(result.sentimentScore).toBeDefined();
    expect(['positive', 'negative', 'neutral']).toContain(result.sentimentLabel);
    expect(result.emotionalTone).toBeDefined();
    expect(result.summary).toBeDefined();
  });

  it('should handle empty lyrics', async () => {
    const result = await analyzeSentiment('');
    
    expect(result).toBeDefined();
    expect(result.sentimentScore).toBe(0);
    expect(result.sentimentLabel).toBe('neutral');
    expect(result.emotionalTone.toLowerCase()).toBe('neutral');
    expect(result.summary).toBe('No lyrics provided for analysis');
  });

  it('should handle non-text input', async () => {
    const result = await analyzeSentiment('123 456 789');
    
    expect(result.sentimentScore).toBe(0);
    expect(result.sentimentLabel).toBe('neutral');
    expect(result.emotionalTone.toLowerCase()).toBe('neutral');
    expect(result.summary).toBe('No meaningful text found for sentiment analysis');
  });
});

// Run the tests
runSentimentTests();
