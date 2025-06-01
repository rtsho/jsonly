import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';

// Custom hook for Firestore writes
function useFirestoreWrite() {
  const [isWriting, setIsWriting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  const [writeRequest, setWriteRequest] = useState<{
    collectionName: string;
    docId: string;
    data: any;
  } | null>(null);
  
  // Process write in useEffect when writeRequest changes
  React.useEffect(() => {
    if (!writeRequest) return;
    
    let isMounted = true;
    const { collectionName, docId, data } = writeRequest;
    
    const writeToFirestore = async () => {
      if (!isMounted) return;
      
      setIsWriting(true);
      setError(null);
      setSuccess(false);
      
      try {
        console.log(`Processing write to ${collectionName}/${docId}...`);
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data);
        console.log(`Write to ${collectionName}/${docId} succeeded!`);
        if (isMounted) {
          setSuccess(true);
        }
      } catch (err) {
        console.error(`Write to ${collectionName}/${docId} failed:`, err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setIsWriting(false);
          // Clear the request after processing
          setWriteRequest(null);
        }
      }
    };
    
    writeToFirestore();
    
    return () => {
      isMounted = false;
    };
  }, [writeRequest]);
  
  // Function to queue a write request
  const writeDocument = (collectionName: string, docId: string, data: any) => {
    setWriteRequest({ collectionName, docId, data });
  };
  
  return { writeDocument, isWriting, error, success };
}

// Test component
const FirestoreWriteTest: React.FC = () => {
  const [testId] = useState(() => uuidv4());
  const { writeDocument, isWriting, error, success } = useFirestoreWrite();
  
  const handleTestWrite = () => {
    const testData = {
      test: "value",
      timestamp: new Date().toISOString()
    };
    
    // This will trigger the useEffect in the hook
    writeDocument("testCollection", testId, testData);
  };
  
  const handleUsersWrite = () => {
    const testData = {
      test: "value",
      timestamp: new Date().toISOString()
    };
    
    // This will trigger the useEffect in the hook
    writeDocument("users", testId, testData);
  };
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', margin: '20px' }}>
      <h3>Firestore Write Test</h3>
      <p>Test ID: {testId}</p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleTestWrite}
          disabled={isWriting}
          style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Write to testCollection
        </button>
        <button 
          onClick={handleUsersWrite}
          disabled={isWriting}
          style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Write to users collection
        </button>
      </div>
      {isWriting && <p>Writing to Firestore...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {success && <p style={{ color: 'green' }}>Write successful!</p>}
    </div>
  );
};

export default FirestoreWriteTest;