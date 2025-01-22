import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db: ReturnType<typeof getFirestore>;

export async function initializeFirebaseAdmin() {
  console.log('[Firebase Server] Initializing admin SDK...');
  console.log('[Firebase Server] Environment check:', {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ? 'present' : 'missing',
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? 'present' : 'missing',
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'present' : 'missing'
  });

  try {
    if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
      throw new Error('Missing FIREBASE_ADMIN_PROJECT_ID environment variable');
    }
    if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
      throw new Error('Missing FIREBASE_ADMIN_CLIENT_EMAIL environment variable');
    }
    if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      throw new Error('Missing FIREBASE_ADMIN_PRIVATE_KEY environment variable');
    }

    const app = initializeApp({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });

    // Initialize Firestore with emulator connection if in development
    db = getFirestore(app);
    if (process.env.NODE_ENV === 'development') {
      const host = 'localhost';
      const port = 8080;
      db.settings({
        host: `${host}:${port}`,
        ssl: false
      });
      console.log(`[Firebase Server] Connected to Firestore emulator at ${host}:${port}`);
    }

    return db;
  } catch (error) {
    console.error('[Firebase Server] Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

export { db };
