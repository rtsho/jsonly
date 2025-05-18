import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore'; 
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

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: false,
});

export const storage = getStorage(app);
// TEMP: Minimal Firestore write test for debugging
// Paste this in your browser console after the app loads:
// import { doc, setDoc } from "firebase/firestore";
// import { db } from "./services/firebase";
// setDoc(doc(db, "testCollection", "testDoc"), { test: "value" }).then(() => console.log("Minimal setDoc success")).catch(console.error);