import { SectionInsight } from '../types';

export const sectionInsights: Record<string, SectionInsight> = {
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
