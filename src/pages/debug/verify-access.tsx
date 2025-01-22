import { useState } from 'react';
import { verifyFirestoreAccess, type FirestoreVerificationResult } from '../../firebase/verifyAccess';

function getErrorHelp(errorCode: string): string {
  const errorHelp: Record<string, string> = {
    'permission-denied': 'Firestore rules are preventing access. Check security rules configuration.',
    'not-found': 'Collection or document does not exist.',
    'unauthenticated': 'Authentication is required but user is not signed in.',
    'invalid-argument': 'Invalid data format or missing required fields.',
    'failed-precondition': 'Operation failed due to document state.',
    'unavailable': 'Service is temporarily unavailable. Check your connection.'
  };
  
  return errorHelp[errorCode] || 'Unknown error. Check console for details.';
}

export default function VerifyAccessPage() {
  const [result, setResult] = useState<FirestoreVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runVerification = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const verificationResult = await verifyFirestoreAccess();
      setResult(verificationResult);
      console.log('Detailed verification result:', verificationResult);
    } catch (error: any) {
      console.error('Verification failed:', error);
      setError(error.message || 'Unknown error occurred');
      setResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Firestore Access Verification</h1>
        <p className="text-gray-600 mt-2">
          Environment: {process.env.NODE_ENV}
        </p>
      </div>

      <div className="space-y-6">
        <button
          onClick={runVerification}
          disabled={isVerifying}
          className={`px-4 py-2 rounded ${
            isVerifying ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {isVerifying ? 'Verifying Access...' : 'Run Verification'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Verification Error</h3>
            <p className="mt-1 text-red-600">{error}</p>
            {error.includes('IndexedDB') && (
              <div className="mt-2 text-sm text-red-700">
                <p>Safari users: Please ensure Private Browsing is disabled and that you have:</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>Enabled cross-site tracking</li>
                  <li>Disabled "Prevent cross-site tracking" in Safari preferences</li>
                  <li>Allowed cookies and website data</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Verification Results</h2>
              
              {/* Read Access Results */}
              <div className={`mb-4 p-4 rounded-lg ${
                result.read.success ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <h3 className="font-medium">Read Access</h3>
                <p className="mt-1">{result.read.details}</p>
                {result.read.errorCode && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-700">Error Code: {result.read.errorCode}</p>
                    <p className="text-gray-600 mt-1">{getErrorHelp(result.read.errorCode)}</p>
                  </div>
                )}
              </div>

              {/* Write Access Results */}
              <div className={`mb-4 p-4 rounded-lg ${
                result.write.success ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <h3 className="font-medium">Write Access</h3>
                <p className="mt-1">{result.write.details}</p>
                {result.write.errorCode && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-700">Error Code: {result.write.errorCode}</p>
                    <p className="text-gray-600 mt-1">{getErrorHelp(result.write.errorCode)}</p>
                  </div>
                )}
              </div>

              {/* Timestamp Information */}
              <div className="mt-4 text-sm text-gray-500">
                <p>Last Read Attempt: {new Date(result.read.timestamp).toLocaleString()}</p>
                <p>Last Write Attempt: {new Date(result.write.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
