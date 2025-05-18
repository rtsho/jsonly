import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAndAnalyzeDocument } from '../services/api';
import { auth, googleProvider } from '../services/firebase';
import { db } from '../services/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';

interface AppContextType {
  summary: any;
  loading: boolean;
  error: string | null;
  user: User | null;
  message: string | null; // Added message state
  isAuthModalOpen: boolean; // Added auth modal state
  uploadDocument: (file: File) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setMessage: (message: string | null) => void; // Added setMessage function
  setIsAuthModalOpen: (isOpen: boolean) => void; // Added setIsAuthModalOpen function
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

// Type for Firestore write request
interface FirestoreWriteRequest {
  collectionName: string;
  docId: string;
  data: any;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null); // Added message state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false); // Added auth modal state
  
  // State for Firestore write requests
  const [firestoreWriteRequest, setFirestoreWriteRequest] = useState<FirestoreWriteRequest | null>(null);

  // Process Firestore write requests
  useEffect(() => {
    if (!firestoreWriteRequest) return;
    
    let isMounted = true;
    const { collectionName, docId, data, onSuccess, onError } = firestoreWriteRequest;
    
    const writeToFirestore = async () => {
      if (!isMounted) return;
      
      try {
        console.log(`Processing write to ${collectionName}/${docId}...`);
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data);
        console.log(`Write to ${collectionName}/${docId} succeeded!`);
        if (isMounted && onSuccess) {
          onSuccess();
        }
      } catch (err) {
        console.error(`Write to ${collectionName}/${docId} failed:`, err);
        if (isMounted && onError) {
          onError(err);
        }
      } finally {
        if (isMounted) {
          // Clear the request after processing
          setFirestoreWriteRequest(null);
        }
      }
    };
    
    writeToFirestore();
    
    return () => {
      isMounted = false;
    };
  }, [firestoreWriteRequest]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && !user.emailVerified) {
        firebaseSignOut(auth);
        setUser(null);
      } else {
        setUser(user);
      }
      setError(null);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // User signed in with Google, now add to Firestore
      const user = auth.currentUser; // Get the current user
      if (user) {
        // Generate clientId and clientSecret
        const clientId = uuidv4();
        const clientSecret = uuidv4();

        // Logging before Firestore write
        console.log("Attempting to write new Google user to Firestore:", {
          uid: user.uid,
          clientId,
          clientSecret,
          email: user.email,
        });

        // Queue the write to Firestore
        setFirestoreWriteRequest({
          collectionName: "users",
          docId: user.uid,
          data: {
            clientId,
            clientSecret,
            email: user.email,
            createdAt: new Date().toISOString(),
          },
          onSuccess: () => {
            console.log("Successfully wrote new Google user to Firestore:", user.uid);
            navigate('/'); // Navigate after successful write
          },
          onError: (firestoreError) => {
            console.error("Firestore write error for Google user:", firestoreError);
            setError(
              firestoreError instanceof Error
                ? firestoreError.message
                : 'Failed to save Google user credentials to Firestore'
            );
            navigate('/'); // Navigate even on error, but show error
          }
        });
      } else {
        // Should not happen if signInWithPopup was successful
        console.error("Google sign-in successful, but user is null.");
        setError("Google sign-in failed: User not found after authentication.");
        navigate('/'); // Navigate even on error
      }
    } catch (error) {
      console.error("Error in signInWithGoogle:", error);
      setError('Failed to sign in with Google');
      navigate('/'); // Navigate on error
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        // Generate clientId and clientSecret
        const clientId = uuidv4();
        const clientSecret = uuidv4();

        // Logging before Firestore write
        console.log("Attempting to write new user to Firestore:", {
          uid: userCredential.user.uid,
          clientId,
          clientSecret,
          email: userCredential.user.email,
        });

        // Queue the write to Firestore
        setFirestoreWriteRequest({
          collectionName: "users",
          docId: userCredential.user.uid,
          data: {
            clientId,
            clientSecret,
            email: userCredential.user.email,
            createdAt: new Date().toISOString(),
          },
          onSuccess: () => {
            console.log("Successfully wrote new user to Firestore:", userCredential.user.uid);
          },
          onError: (firestoreError) => {
            console.error("Firestore write error:", firestoreError);
            setError(
              firestoreError instanceof Error
                ? firestoreError.message
                : 'Failed to save user credentials to Firestore'
            );
          }
        });

        const actionCodeSettings = {
          url: 'http://localhost:5173/verify-email',
          handleCodeInApp: false,
        };
        sendEmailVerification(userCredential.user, actionCodeSettings);
        setUser(null);
      }
    } catch (error: any) {
      console.error("Error in signUpWithEmail main try/catch:", error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to create account');
      }
    } finally {
      console.log("signUpWithEmail function completed (success or error).");
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Clear app contents on sign out
      setSummary(null);
      setMessage(null); // Clear message on sign out
      // The FileUploader component will handle clearing its selectedFile state
      // based on the user state change.
    } catch (error) {
      setError('Failed to sign out');
    }
  };

  const uploadDocument = async (file: File) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null); // Clear message on new upload
    
    try {
      const result = await uploadAndAnalyzeDocument(file);
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    summary,
    loading,
    error,
    user,
    message, // Added message to context value
    isAuthModalOpen, // Added isAuthModalOpen to context value
    uploadDocument,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    setMessage, // Added setMessage to context value
    setIsAuthModalOpen, // Added setIsAuthModalOpen to context value
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};