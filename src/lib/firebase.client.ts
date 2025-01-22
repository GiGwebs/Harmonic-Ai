/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
console.log('[Firebase] Starting initialization:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasProjectId: !!firebaseConfig.projectId,
  hasAppId: !!firebaseConfig.appId,
  existingApps: getApps().length
});

let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log('[Firebase] App initialized:', {
    name: app.name,
    options: {
      projectId: app.options.projectId,
      databaseURL: app.options.databaseURL,
      storageBucket: app.options.storageBucket
    },
    automaticDataCollectionEnabled: app.automaticDataCollectionEnabled
  });
} catch (error) {
  console.error('[Firebase] Error initializing app:', error);
  throw error;
}

let db;
try {
  db = getFirestore(app);
  console.log('[Firebase] Firestore initialized:', {
    type: db.type,
    app: db.app.name
  });
} catch (error) {
  console.error('[Firebase] Error initializing Firestore:', error);
  throw error;
}

export { db };
