import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only initialize Firebase in browser environment
function initializeClientFirebase() {
  // Skip initialization in non-browser environments
  if (!isBrowser) {
    console.log('[Firebase] Skipping client initialization in non-browser environment');
    return null;
  }

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  // Validate configuration
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(`
      Missing Firebase configuration. Check your .env file.
      Required variables:
      - VITE_FIREBASE_API_KEY
      - VITE_FIREBASE_PROJECT_ID
    `);
  }

  // Debug: Log configuration
  console.log('[Firebase] Client configuration:', {
    hasApiKey: !!firebaseConfig.apiKey,
    projectId: firebaseConfig.projectId,
    hasAppId: !!firebaseConfig.appId
  });

  // Initialize Firebase
  const apps = getApps();
  if (apps.length === 0) {
    console.log('[Firebase] Initializing new client app');
    return initializeApp(firebaseConfig);
  }
  
  console.log('[Firebase] Using existing client app');
  return getApp();
}

// Initialize Firebase and Firestore only in browser
const app = initializeClientFirebase();
const db = app ? getFirestore(app) : null;

export { db };

// Debug helper
export function getFirebaseStatus() {
  if (!isBrowser) {
    return { initialized: false, environment: 'server' };
  }
  return {
    initialized: !!app,
    environment: 'browser',
    config: app ? {
      projectId: app.options.projectId,
      authDomain: app.options.authDomain
    } : null
  };
}
