import { Section, Preferences, SectionInsight } from '../../../types';

export const mockSections: Section[] = [
  {
    id: 'verse-1',
    type: 'verse',
    content: 'Walking down these city streets\nLights flashing all around\nEvery face I meet\nTells a story without a sound',
    duration: 30,
  },
  {
    id: 'chorus-1',
    type: 'chorus',
    content: "We're alive, we're alive tonight\nDancing under neon lights\nWe're alive, we're alive and free\nThis is where we're meant to be",
    duration: 25,
  },
  {
    id: 'bridge-1',
    type: 'bridge',
    content: 'Time stands still\nHearts beating as one\nMemories we build\nUntil the night is done',
    duration: 20,
  },
];

export const mockPreferences: Preferences = {
  advancedFilters: {
    sectionTypes: [],
    complexity: [],
    mood: [],
    themes: [],
  },
  filterPresets: [
    {
      id: 'default-1',
      name: 'Dance Hits',
      filters: {
        sectionTypes: ['verse', 'chorus'],
        complexity: ['simple', 'intermediate'],
        mood: ['energetic', 'joyful'],
        themes: [],
      },
    },
    {
      id: 'default-2',
      name: 'Acoustic Favorites',
      filters: {
        sectionTypes: ['verse', 'chorus', 'bridge'],
        complexity: ['simple'],
        mood: ['melancholic', 'neutral'],
        themes: [],
      },
    },
  ],
  activePresetId: null,
  snapScrollingEnabled: true,
};

export const mockSectionInsights: Record<string, SectionInsight> = {
  verse: {
    title: 'Verse Structure',
    description: 'Verses tell the story and set up the emotional context of the song.',
    themes: ['narrative', 'descriptive'],
    tips: [
      'Focus on storytelling and scene-setting',
      'Build tension towards the chorus',
      'Use descriptive language and imagery',
    ],
  },
  chorus: {
    title: 'Chorus Impact',
    description: 'The chorus delivers the main message and hook of the song.',
    themes: ['emotional', 'repetitive'],
    tips: [
      'Keep it memorable and catchy',
      'Emphasize the central theme',
      'Use strong, emotive language',
    ],
  },
  bridge: {
    title: 'Bridge Dynamics',
    description: 'The bridge provides contrast and builds tension in the song structure.',
    themes: ['contrast', 'transition'],
    tips: [
      'Create musical or lyrical contrast',
      'Build tension or release',
      'Connect different parts of the song',
    ],
  },
  intro: {
    title: 'Introduction',
    description: 'Sets the tone and atmosphere for the song.',
    themes: ['opening', 'setup'],
    tips: [
      'Establish the mood',
      'Introduce key musical elements',
      'Capture attention quickly',
    ],
  },
  outro: {
    title: 'Outro/Ending',
    description: 'Brings the song to a satisfying conclusion.',
    themes: ['closing', 'resolution'],
    tips: [
      'Provide resolution',
      'Echo main themes',
      'Create a memorable ending',
    ],
  },
};
