import { storage, db, auth } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { delay } from '../utils/helpers';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const uploadAndAnalyzeDocument = async (file: File, templateId: string | null = null): Promise<any> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    const idToken = await user.getIdToken();

    const formData = new FormData();
    formData.append("file", file);

    let response; // Declare response here

    if (templateId) { // Add templateId to formData if provided
      formData.append("template_id", templateId);
      response = await fetch(`${backendUrl}/extract-with-template`, {
                                  method: "POST",
                                  body: formData,
                                  headers: {
                                    Authorization: `Bearer ${idToken}`,
                                  },
                                });
    }
    else{
      response = await fetch(`${backendUrl}/extract`, {
                                  method: "POST",
                                  body: formData,
                                  headers: {
                                    Authorization: `Bearer ${idToken}`,
                                  },
                                });
    }

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