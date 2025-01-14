interface EnvConfig {
  YOUTUBE_API_KEY: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
}

export const env: EnvConfig = {
  YOUTUBE_API_KEY: import.meta.env.VITE_YOUTUBE_API_KEY || '',
  SPOTIFY_CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
  SPOTIFY_CLIENT_SECRET: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '',
};

export function validateEnv() {
  const missing = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}