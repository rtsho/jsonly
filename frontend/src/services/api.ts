import { storage, db, auth } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { delay } from '../utils/helpers';

export const uploadAndAnalyzeDocument = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://127.0.0.1:8000/upload-document/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to upload and analyze document');
    }

    const result = await response.json();
    // In a real application, you would process the backend response here
    // and potentially update the UI with the summarization results.
    // For now, we'll just return the raw response.
    return result;

  } catch (error) {
    console.error('Error uploading document:', error);
    throw error; // Re-throw the error to be caught by the AppContext
  }
};

// Removed the mock summary function as it's no longer needed