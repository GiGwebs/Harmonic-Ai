export const MUSIC_GENRES = {
  pop: {
    label: 'Pop',
    subGenres: ['Contemporary Pop', 'Dance Pop', 'Pop Rock']
  },
  afrobeats: {
    label: 'Afrobeats',
    subGenres: ['Afropop', 'Afrofusion', 'Afrotrap']
  },
  dancehall: {
    label: 'Dancehall',
    subGenres: ['Modern Dancehall', 'Ragga', 'Bashment']
  },
  reggae: {
    label: 'Reggae',
    subGenres: ['Roots Reggae', 'Lovers Rock', 'Dub']
  },
  rnb: {
    label: 'R&B',
    subGenres: ['90s R&B', 'Neo Soul', 'Contemporary R&B']
  },
  hiphop: {
    label: 'Hip-Hop',
    subGenres: ['Trap', 'Boom Bap', 'Melodic Rap']
  }
} as const;

export const SONG_STRUCTURES = {
  'verse-chorus': 'Verse-Chorus-Verse-Chorus (ABAB)',
  'verse-chorus-bridge': 'Verse-Chorus-Verse-Chorus-Bridge-Chorus (ABABCB)',
  'verse-pre-chorus': 'Verse-Pre-Chorus-Chorus-Verse-Pre-Chorus-Chorus-Bridge-Chorus',
  'intro-verse-chorus': 'Intro-Verse-Chorus-Verse-Chorus-Bridge-Chorus-Outro',
  'triple-verse': 'Verse-Chorus-Verse-Chorus-Verse-Chorus (ABABAB)',
  'hook-verse': 'Hook-Verse-Hook-Verse-Hook',
  'modern-pop': 'Intro-Verse-Chorus-Post-Chorus-Verse-Chorus-Post-Chorus-Bridge-Chorus-Outro'
} as const;

export type Genre = keyof typeof MUSIC_GENRES;
export type Structure = keyof typeof SONG_STRUCTURES;