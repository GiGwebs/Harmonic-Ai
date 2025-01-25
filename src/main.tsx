import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { validateClientEnv } from './config/client-env';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Validate CLIENT-SPECIFIC environment variables
validateClientEnv();

// Initialize Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log('[Firebase] Initializing app with config:', {
  hasApiKey: !!firebaseConfig.apiKey,
  projectId: !!firebaseConfig.projectId,
  hasAppId: !!firebaseConfig.appId
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('[Firebase] App initialized successfully');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
