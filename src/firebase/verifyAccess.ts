import { getFirestore, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface FirestoreVerificationResult {
  read: {
    success: boolean;
    details: string;
    errorCode?: string;
    timestamp: string;
  };
  write: {
    success: boolean;
    details: string;
    errorCode?: string;
    timestamp: string;
  };
  environment: 'development' | 'production';
}

// Add IndexedDB check helper
async function checkIndexedDBAccess(): Promise<boolean> {
  return new Promise((resolve) => {
    console.log('[Verify] Checking IndexedDB access...');
    const request = indexedDB.open('firestore_check');
    
    request.onerror = () => {
      console.error('[Verify] IndexedDB access denied:', request.error);
      resolve(false);
    };
    
    request.onsuccess = () => {
      console.log('[Verify] IndexedDB access granted');
      const db = request.result;
      db.close();
      resolve(true);
    };
  });
}

export async function verifyFirestoreAccess(): Promise<FirestoreVerificationResult> {
  console.log('[Verify] Starting verification process...');
  console.log('[Verify] Browser:', navigator.userAgent);
  
  // Check IndexedDB access first
  const hasIndexedDB = await checkIndexedDBAccess();
  if (!hasIndexedDB) {
    throw new Error('IndexedDB access is required but not available. If using Safari, check if Private Browsing is disabled.');
  }
  
  const result: FirestoreVerificationResult = {
    read: { success: false, details: '', timestamp: new Date().toISOString() },
    write: { success: false, details: '', timestamp: new Date().toISOString() },
    environment: process.env.NODE_ENV as 'development' | 'production'
  };

  // Create a timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Firestore verification timed out after 10 seconds'));
    }, 10000);
  });

  try {
    // Race between verification and timeout
    return await Promise.race([
      (async () => {
        console.group('🔍 Firestore Access Verification');
        console.log(`[Verify] Environment: ${result.environment}`);
        console.log('[Verify] Firestore instance:', db);
        
        let lyricsRef;
        try {
          console.log('[Verify] Getting collection reference...');
          lyricsRef = collection(db, 'lyrics');
          console.log('[Verify] Collection reference obtained:', lyricsRef);
        } catch (error) {
          console.error('[Verify] Failed to get collection reference:', error);
          throw error;
        }

        // Test Read Access
        try {
          console.log('[Verify] Testing read access...');
          console.log('[Verify] Calling getDocs...');
          const snapshot = await getDocs(lyricsRef);
          console.log('[Verify] getDocs completed. Size:', snapshot.size);
          result.read = {
            success: true,
            details: `Successfully read ${snapshot.size} documents from lyrics collection`,
            timestamp: new Date().toISOString()
          };
          console.log('✅ [Verify] Read access verified');
        } catch (error: any) {
          console.error('[Verify] Read access error:', { 
            message: error.message,
            code: error.code,
            stack: error.stack,
            name: error.name
          });
          result.read = {
            success: false,
            details: `${error.name}: ${error.message}`,
            errorCode: error.code,
            timestamp: new Date().toISOString()
          };
        }

        // Test Write Access
        try {
          console.log('[Verify] Testing write access...');
          const testDoc = {
            _test: true,
            content: 'Access verification test',
            options: {
              genre: 'test',
              mood: 'test'
            },
            timestamp: new Date().toISOString()
          };

          console.log('[Verify] Attempting to add test document...');
          const docRef = await addDoc(lyricsRef, testDoc);
          console.log('[Verify] Test document created:', docRef.id);
          
          console.log('[Verify] Attempting to delete test document...');
          await deleteDoc(docRef);
          console.log('[Verify] Test document cleaned up');
          
          result.write = {
            success: true,
            details: `Successfully wrote and cleaned up test document (ID: ${docRef.id})`,
            timestamp: new Date().toISOString()
          };
        } catch (error: any) {
          console.error('[Verify] Write access error:', {
            message: error.message,
            code: error.code,
            stack: error.stack,
            name: error.name
          });
          result.write = {
            success: false,
            details: `${error.name}: ${error.message}`,
            errorCode: error.code,
            timestamp: new Date().toISOString()
          };
        }

        console.groupEnd();
        return result;
      })(),
      timeoutPromise
    ]);
  } catch (error: any) {
    console.error('[Verify] Fatal error:', error);
    throw error;
  }
}
