import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAndAnalyzeDocument } from '../services/api';
import { auth, googleProvider } from '../services/firebase';
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
  uploadDocument: (file: File) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

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
      navigate('/');
    } catch (error) {
      setError('Failed to sign in with Google');
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
        const actionCodeSettings = {
          url: 'http://localhost:5173/verify-email',
          handleCodeInApp: false,
        };
        sendEmailVerification(userCredential.user, actionCodeSettings);
        setUser(null);
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else {
        setError('Failed to create account');
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Clear app contents on sign out
      setSummary(null);
      // The FileUploader component will handle clearing its selectedFile state
      // based on the user state change.
    } catch (error) {
      setError('Failed to sign out');
    }
  };

  const uploadDocument = async (file: File) => {
    if (!user) {
      setError('Please sign in to upload documents');
      return;
    }
    
    setLoading(true);
    setError(null);
    
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
    uploadDocument,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};