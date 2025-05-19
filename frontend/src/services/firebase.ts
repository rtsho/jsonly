import { initializeApp } from 'firebase/app';
import { initializeFirestore, getDoc, doc, collection, addDoc } from 'firebase/firestore';
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
/**
 * Retrieves a user document from the 'users' collection.
 * @param userId The UID of the user.
 * @returns The user document data, or undefined if the document does not exist or an error occurs.
 */
export const getUserDocument = async (userId: string) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // Document exists, return its data
      return userDocSnap.data();
    } else {
      // Document does not exist
      console.log("No such user document!");
      return undefined;
    }
  } catch (error) {
    console.error("Error getting user document:", error);
    // Return undefined in case of error
    return undefined;
  }
};

/**
 * Adds a document analysis record to a user's documentAnalysis subcollection.
 * @param userId The UID of the user.
 * @param documentName The name of the analyzed document.
 * @param runAt The date/time the analysis was run (as a string).
 * @returns The ID of the created analysis document, or undefined if an error occurs.
 */
export const addUserDocumentAnalysis = async (
  userId: string,
  documentName: string,
  runAt: string,
  nbPages: number
) => {
  try {
    const analysisCollectionRef = collection(db, "users", userId, "documentAnalysis");
    const docRef = await addDoc(analysisCollectionRef, {
      documentName,
      runAt,
      nbPages
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document analysis:", error);
    return undefined;
  }
};

/**
 * Counts the number of document analyses a user has run in the last 30 days.
 * @param userId The UID of the user.
 * @returns The count of analyses in the last 30 days.
 */
import { query, where, getDocs, Timestamp } from 'firebase/firestore';

export const countUserPageAnalysesLast30Days = async (userId: string): Promise<number> => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const analysisCollectionRef = collection(db, "users", userId, "documentAnalysis");
    // We store runAt as a string, so we need to filter in JS after fetching
    const snapshot = await getDocs(analysisCollectionRef);
    let count = 0;
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.runAt) {
        const runAtDate = new Date(data.runAt);
        if (runAtDate >= thirtyDaysAgo) {
          count += data.nbPages;
        }
      }
    });
    return count;
  } catch (error) {
    console.error("Error counting user analyses:", error);
    return 0;
  }
};

// TEMP: Minimal Firestore write test for debugging
// Paste this in your browser console after the app loads:
// import { doc, setDoc } from "firebase/firestore";
// import { db } from "./services/firebase";
// setDoc(doc(db, "testCollection", "testDoc"), { test: "value" }).then(() => console.log("Minimal setDoc success")).catch(console.error);