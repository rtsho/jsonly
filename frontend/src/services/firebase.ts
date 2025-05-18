import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBma43HVlcFMhpFQDp9rxM4LSJNZe2l524",
  authDomain: "structureddocuments.firebaseapp.com",
  projectId: "structureddocuments",
  storageBucket: "structureddocuments.firebaseapp.com",
  messagingSenderId: "1094693560251",
  appId: "1:1094693560251:web:c8759ca15c8c18b733ae9e",
  measurementId: "G-4ZXNGQSBQC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
export const db = getFirestore(app);
export const storage = getStorage(app);