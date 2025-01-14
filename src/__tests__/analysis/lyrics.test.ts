import { analyzeLyrics, LyricsAnalysis } from '../../utils/analysis/lyrics';
import { AudioAnalysisError } from '../../utils/errors';

describe('Lyrics Analysis', () => {
  describe('Input Validation', () => {
    it('throws error for null input', async () => {
      await expect(analyzeLyrics(null as any)).rejects.toThrow(AudioAnalysisError);
    });

    it('throws error for empty input', async () => {
      await expect(analyzeLyrics('')).rejects.toThrow(AudioAnalysisError);
    });
  });

  describe('Sentiment Analysis', () => {
    it('detects happy mood correctly', async () => {
      const lyrics = `
        Dancing through the night
        Everything's so bright and clear
        Joy in every step we take
        Smiling, laughing, feeling great
        
        Life is such a wonderful ride
        Happy moments side by side
        Nothing can bring us down tonight
        As we dance under starlight
      `;

      const result = await analyzeLyrics(lyrics);
      expect(result.sentiment.mood).toBe('happy');
      expect(result.sentiment.intensity).toBeGreaterThan(0.3); // Adjusted threshold
      expect(result.sentiment.keywords).toContain('happy');
    });

    it('detects romantic mood correctly', async () => {
      const lyrics = `
        Heart beats like a drum
        When you're close to me, my love
        Every tender touch we share
        Makes me feel our souls entwined
        
        Baby, hold me close tonight
        Let our hearts beat as one
        Forever in this sweet embrace
        Our love has just begun
      `;

      const result = await analyzeLyrics(lyrics);
      expect(result.sentiment.mood).toBe('romantic');
      expect(result.sentiment.keywords).toContain('love');
    });

    it('detects sad mood correctly', async () => {
      const lyrics = `
        Tears falling in the rain
        Heart broken once again
        Nothing but pain and sorrow
        Will I ever heal tomorrow
        
        Darkness fills my empty soul
        These wounds won't let me go
        Memories of what we had
        Now everything feels so sad
      `;

      const result = await analyzeLyrics(lyrics);
      expect(result.sentiment.mood).toBe('sad');
      expect(result.sentiment.keywords).toContain('tears');
      expect(result.sentiment.intensity).toBeGreaterThan(0.3);
    });
  });

  describe('Style Detection', () => {
    it('identifies pop genre correctly', async () => {
      const lyrics = `
        Baby, let's dance all night
        Under the disco light
        Your love makes me feel so right
        Party till the morning light
        
        [Chorus]
        Dance, dance, dance with me
        Let the music set us free
        Tonight we're gonna be
        Everything we want to be
      `;

      const result = await analyzeLyrics(lyrics);
      expect(result.style.genre).toContain('pop');
      expect(result.style.themes).toContain('party');
      expect(result.structure.hasChorus).toBe(true);
    });

    it('identifies rock genre correctly', async () => {
      const lyrics = `
        Verse 1:
        Breaking through the walls tonight
        Freedom calling, time to fight
        Wild hearts racing to the edge
        Never backing down from any pledge
        
        Chorus:
        Rock this world with all our might
        Flames of passion burning bright
        Nothing's gonna stop us now
        As we make our sacred vow
      `;

      const result = await analyzeLyrics(lyrics);
      expect(result.style.genre).toContain('rock');
      expect(result.structure.hasChorus).toBe(true);
      expect(result.structure.verses).toBe(1);
    });
  });

  describe('Structure Analysis', () => {
    it('detects complex song structure correctly', async () => {
      const lyrics = `
        Verse 1:
        First we start the story
        Setting up the scene
        Building up emotion
        Showing what we mean
        
        Chorus:
        This is where we peak
        The message that we seek
        This is where we shine
        Everything aligned
        
        Verse 2:
        Moving through the middle
        Story getting deep
        Tension slowly rising
        Promises to keep
        
        Bridge:
        Change it up completely
        Different point of view
        Shifting all perspective
        Something fresh and new
        
        Chorus:
        This is where we peak
        The message that we seek
        This is where we shine
        Everything aligned
      `;

      const result = await analyzeLyrics(lyrics);
      expect(result.structure.hasChorus).toBe(true);
      expect(result.structure.hasBridge).toBe(true);
      expect(result.structure.verses).toBe(2);
    });
  });

  describe('Integration Tests', () => {
    it('provides comprehensive analysis for modern pop song', async () => {
      const lyrics = `
        Verse 1:
        My heart beats like thunder tonight
        As your love fills every part of me
        In your eyes I see our destiny
        Baby, let's make this moment last eternally
        
        Pre-Chorus:
        Every touch, every gentle sigh
        Makes me feel like we can touch the sky
        
        Chorus:
        Forever in your arms
        Where I'm meant to be
        Our hearts beating as one
        Just you and me
        
        Verse 2:
        The world fades away when you're near
        Nothing else matters, my love so dear
        Together we'll write our love story
        In the stars above, just you and me
        
        Bridge:
        Time stands still
        When you hold me close
        Promise me this love
        Will never let go
        
        Chorus:
        Forever in your arms
        Where I'm meant to be
        Our hearts beating as one
        Just you and me
      `;

      const result = await analyzeLyrics(lyrics);
      
      // Verify comprehensive analysis
      expect(result.sentiment.mood).toBe('romantic');
      expect(result.style.genre).toContain('pop');
      expect(result.style.themes).toContain('love');
      expect(result.structure.hasChorus).toBe(true);
      expect(result.structure.hasBridge).toBe(true);
      expect(result.structure.verses).toBe(2);
      expect(result.sentiment.keywords).toContain('love');
      expect(result.sentiment.intensity).toBeGreaterThan(0.3);
    });
  });
});
