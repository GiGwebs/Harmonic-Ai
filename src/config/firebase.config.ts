interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const getFirebaseConfig = (): FirebaseConfig => {
  console.log('[Firebase Config] Environment check:', {
    processEnv: {
      apiKey: process.env.VITE_FIREBASE_API_KEY ? 'present' : 'missing',
      projectId: process.env.VITE_FIREBASE_PROJECT_ID ? 'present' : 'missing'
    },
    isNode: typeof process !== 'undefined' && process.versions && process.versions.node,
    isBrowser: typeof window !== 'undefined'
  });

  // Get config from process.env (server-side)
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    console.log('[Firebase Config] Using server-side configuration');
    return {
      apiKey: process.env.VITE_FIREBASE_API_KEY as string,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN as string,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID as string,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET as string,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
      appId: process.env.VITE_FIREBASE_APP_ID as string
    };
  }

  // Get config from import.meta.env (client-side)
  console.log('[Firebase Config] Using client-side configuration');
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
};
