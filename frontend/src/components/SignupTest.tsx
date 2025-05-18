import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
    onSuccess?: () => void;
    onError?: (error: any) => void;
  } | null>(null);
  
  // Process write in useEffect when writeRequest changes
  useEffect(() => {
    if (!writeRequest) return;
    
    let isMounted = true;
    const { collectionName, docId, data, onSuccess, onError } = writeRequest;
    
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
          if (onSuccess) onSuccess();
        }
      } catch (err) {
        console.error(`Write to ${collectionName}/${docId} failed:`, err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          if (onError) onError(err);
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
  const queueWrite = (
    collectionName: string, 
    docId: string, 
    data: any, 
    onSuccess?: () => void, 
    onError?: (error: any) => void
  ) => {
    setWriteRequest({ collectionName, docId, data, onSuccess, onError });
  };
  
  return { queueWrite, isWriting, error, success };
}

// Test component that simulates a signup flow
const SignupTest: React.FC = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [status, setStatus] = useState('');
  const { queueWrite, isWriting, error, success } = useFirestoreWrite();
  
  const handleSignup = async () => {
    setStatus('Creating user...');
    
    try {
      // Generate a random email to avoid "already exists" errors
      const randomEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
      
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, randomEmail, password);
      
      if (userCredential.user) {
        setStatus('User created, writing to Firestore...');
        
        // Generate clientId and clientSecret
        const clientId = uuidv4();
        const clientSecret = uuidv4();
        
        // Queue the write to Firestore using our hook
        queueWrite(
          "users",
          userCredential.user.uid,
          {
            clientId,
            clientSecret,
            email: userCredential.user.email,
            createdAt: new Date().toISOString(),
          },
          () => {
            setStatus('Successfully wrote user data to Firestore!');
          },
          (err) => {
            setStatus(`Error writing to Firestore: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        );
      }
    } catch (err) {
      setStatus(`Error creating user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', margin: '20px' }}>
      <h3>Signup Test with useFirestoreWrite Hook</h3>
      <p>This demonstrates using a custom hook to write to Firestore during signup</p>
      
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={handleSignup}
          disabled={isWriting}
          style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Test Signup Flow
        </button>
      </div>
      
      <div>
        <p><strong>Status:</strong> {status}</p>
        {isWriting && <p>Writing to Firestore...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
        {success && <p style={{ color: 'green' }}>Write successful!</p>}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h4>How to fix your code:</h4>
        <ol>
          <li>Copy the useFirestoreWrite hook to your AppContext.tsx</li>
          <li>Replace the direct setDoc calls in signUpWithEmail with queueWrite</li>
          <li>The hook uses useEffect to perform the write, which resolves the hanging issue</li>
        </ol>
      </div>
    </div>
  );
};

export default SignupTest;