import React, { useEffect, useRef, useState } from 'react';
import { getAuth, applyActionCode } from 'firebase/auth';

const VerifyEmail = () => {
  const [message, setMessage] = useState('Verifying email...');
  const [error, setError] = useState<string | null>(null);
  const verificationAttempted = useRef(false); // ✅ useRef instead of useState

  useEffect(() => {
    if (verificationAttempted.current) return;
    verificationAttempted.current = true; // ✅ guard against re-execution

    const auth = getAuth();
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');

    console.log('Mode:', mode);
    console.log('OobCode:', oobCode);

    if (mode === 'verifyEmail' && oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setMessage('Email verified successfully! You can now sign in.');
        })
        .catch((error: any) => {
          console.error('Verification error full:', error);
          if (error.code === 'auth/invalid-action-code') {
            setError('This verification link is invalid, expired, or already used.');
          } else {
            setError('Failed to verify email: ' + error.message);
          }
          setMessage('Verification failed.');
        });
    } else {
      setError('Invalid verification link.');
      setMessage('Verification failed.');
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">{message}</h1>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default VerifyEmail;
