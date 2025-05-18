import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const { signInWithEmail, signUpWithEmail, error, user, signInWithGoogle } = useAppContext();
  const [isAttemptingSignIn, setIsAttemptingSignIn] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAttemptingSignIn(true);
    if (isSignUp) {
      setIsVerificationSent(true);
      await signUpWithEmail(email, password);
    } else {
      await signInWithEmail(email, password);
    }
    setIsAttemptingSignIn(false);
    if (!error) {
      onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAttemptingSignIn(true);
    await signInWithGoogle();
    setIsAttemptingSignIn(false);
    if (!error) {
      onClose();
    }
  };

  if (!isOpen) return null;

  if (isSignUp && isVerificationSent) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-300"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-100 mb-6">
            Check your email
          </h2>
          <p className="text-gray-400">
            We've sent a verification link to your email address. Please click the link to verify your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-300"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold text-gray-100 mb-6">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M44.5 20H24V28.8H36.4C35.4 33.1 32.1 36.4 27.8 37.8V44.1C34.7 43.4 40.3 39.2 43.5 33.1L44.5 20Z" fill="#4285F4"/>
              <path d="M24 45C30.6 45 36.2 42.8 40.5 39.1L36.4 33.1C33.1 35.8 28.9 37.5 24 37.5C16.3 37.5 9.7 32.1 7.3 24.8L1 29.6C3.8 36.9 13.2 45 24 45Z" fill="#34A853"/>
              <path d="M7.3 24.8C6.7 23.1 6.3 21.2 6.3 19.3C6.3 17.4 6.7 15.5 7.3 13.8L1 9C1 10.9 0.6 12.8 0.6 14.7C0.6 16.6 1 18.5 1.6 20.4L7.3 24.8Z" fill="#F9BC05"/>
              <path d="M24 10.5C28.1 10.5 31.7 12.1 34.4 14.7L40.7 8.4C36.2 4.6 30.6 2.5 24 2.5C13.2 2.5 3.8 10.6 1 17.9L7.3 22.7C9.7 15.4 16.3 10.5 24 10.5Z" fill="#EA4335"/>
            </svg>
            Sign In with Google
          </button>
          <div className="text-center text-gray-400 text-sm">or</div>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              {isSignUp ? 'Sign Up with Email' : 'Sign In with Email'}
            </button>
          </form>
          {isAttemptingSignIn && error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-4 text-sm text-purple-400 hover:text-purple-300"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;