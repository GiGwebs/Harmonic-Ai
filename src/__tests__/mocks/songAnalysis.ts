import { SongAnalysis } from '../../types';

export const mockSongAnalysis: SongAnalysis = {
  metadata: {
    title: 'Test Song',
    artist: 'Test Artist',
    url: 'https://example.com/song',
  },
  musicalElements: {
    key: 'C Major',
    timeSignature: '4/4',
    tempo: '120 BPM',
    dominantInstruments: ['Piano', 'Guitar', 'Drums'],
  },
  commercialViability: {
    score: 85,
    factors: [
      'Strong melodic hooks',
      'Professional production quality',
      'Radio-friendly structure',
    ],
  },
  lyricalThemes: [
    'Love and relationships',
    'Personal growth',
    'Overcoming challenges',
  ],
  productionTechniques: [
    'Modern vocal processing',
    'Dynamic compression',
    'Layered harmonies',
  ],
  sections: [
    {
      id: '1',
      type: 'intro',
      content: 'Instrumental introduction',
      analysis: {
        complexity: 'simple',
        moods: ['energetic'],
        impact: 70,
        recommendations: ['Consider adding more tension'],
      },
    },
    {
      id: '2',
      type: 'verse',
      content: 'First verse with main theme',
      analysis: {
        complexity: 'intermediate',
        moods: ['neutral'],
        impact: 80,
        recommendations: ['Add more dynamic variation'],
      },
    },
    {
      id: '3',
      type: 'chorus',
      content: 'Powerful chorus hook',
      analysis: {
        complexity: 'complex',
        moods: ['joyful', 'energetic'],
        impact: 95,
        recommendations: ['Perfect as is'],
      },
    },
  ],
  uniqueCharacteristics: [
    'Innovative chord progressions',
    'Memorable melody',
    'Strong hook',
  ],
  sentimentAnalysis: {
    sentimentScore: 0.8,
    sentimentLabel: 'positive',
    emotionalTone: 'uplifting',
    summary: 'The song conveys a positive and uplifting message',
  },
  createdAt: new Date().toISOString(),
};

describe('SongAnalysis Mock', () => {
  it('should have the correct structure', () => {
    expect(mockSongAnalysis).toBeDefined();
    expect(mockSongAnalysis.metadata).toBeDefined();
    expect(mockSongAnalysis.metadata.title).toBe('Test Song');
    expect(mockSongAnalysis.metadata.artist).toBe('Test Artist');
    expect(mockSongAnalysis.metadata.url).toBe('https://example.com/song');
    expect(mockSongAnalysis.musicalElements).toBeDefined();
    expect(mockSongAnalysis.musicalElements.key).toBe('C Major');
    expect(mockSongAnalysis.musicalElements.timeSignature).toBe('4/4');
    expect(mockSongAnalysis.musicalElements.tempo).toBe('120 BPM');
    expect(mockSongAnalysis.musicalElements.dominantInstruments).toHaveLength(3);
    expect(mockSongAnalysis.commercialViability).toBeDefined();
    expect(mockSongAnalysis.commercialViability.score).toBe(85);
    expect(mockSongAnalysis.commercialViability.factors).toHaveLength(3);
    expect(mockSongAnalysis.lyricalThemes).toHaveLength(3);
    expect(mockSongAnalysis.productionTechniques).toHaveLength(3);
    expect(mockSongAnalysis.sections).toHaveLength(3);
    expect(mockSongAnalysis.uniqueCharacteristics).toHaveLength(3);
    expect(mockSongAnalysis.sentimentAnalysis).toBeDefined();
    expect(mockSongAnalysis.sentimentAnalysis.sentimentScore).toBe(0.8);
    expect(mockSongAnalysis.sentimentAnalysis.sentimentLabel).toBe('positive');
    expect(mockSongAnalysis.sentimentAnalysis.emotionalTone).toBe('uplifting');
    expect(typeof mockSongAnalysis.createdAt).toBe('string');
  });
});
