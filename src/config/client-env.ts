/**
 * Validates required client-side environment variables
 * @throws {Error} If any required environment variables are missing
 */
export function validateClientEnv() {
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID'
  ] as const;

  const missing = requiredVars.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    console.error('[Environment] Missing required client environment variables:', {
      missing,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Missing required client environment variables: ${missing.join(', ')}`);
  }

  // Log successful validation in development
  if (import.meta.env.DEV) {
    console.log('[Environment] Client environment variables validated successfully');
  }
}

/**
 * Get the API base URL from environment
 * @returns {string} The API base URL
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL;
}

/**
 * Get Firebase configuration from environment
 */
export function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  };
}