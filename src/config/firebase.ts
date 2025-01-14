import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDKLE7gXYaAbM0qWs5_Y2h7fKIKM1fwKA4",
  authDomain: "harmonic-ai.firebaseapp.com",
  projectId: "harmonic-ai",
  storageBucket: "harmonic-ai.firebasestorage.app",
  messagingSenderId: "1020918797778",
  appId: "1:1020918797778:web:341fa5da070b22dbe7240b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
