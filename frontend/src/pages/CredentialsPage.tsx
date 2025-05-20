import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const CredentialsPage = () => {
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingClientId, setLoadingClientId] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  // Fetch clientId directly from Firestore
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setError("User not logged in");
        setLoadingClientId(false);
        return;
      }
      try {
        setLoadingClientId(true);
        setError(null);

        const db = getFirestore();
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          throw new Error("User document not found");
        }

        const data = userDocSnap.data();
        if (!data?.clientId) throw new Error("Client ID not found");

        setClientId(data.clientId);
      } catch (err: any) {
        setError(err.message || "Failed to fetch client ID");
      } finally {
        setLoadingClientId(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper to get Firebase ID token for backend calls
  // const getIdToken = async (): Promise<string> => {
  //   const user = getAuth().currentUser;
  //   if (!user) throw new Error("User not logged in");
  //   return await user.getIdToken();
  // };

  // Call backend to regenerate clientSecret
  const handleRegenerateSecret = async () => {
    try {
      setRegenerating(true);
      setError(null);
      setClientSecret(null);

      const user = getAuth().currentUser;
      if (!user) throw new Error("User not logged in");
      
      const uid = user.uid;

      const res = await fetch("http://127.0.0.1:8000/regenerate-client-secret", {
        method: "POST",
        headers: {
          "X-User-UID": uid,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to regenerate secret");
      }

      const data = await res.json();
      setClientSecret(data.client_secret);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your API Credentials</h1>

      {loadingClientId && <p>Loading client ID...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loadingClientId && clientId && (
        <div className="mb-6">
          <p>
            <strong>Client ID:</strong>
          </p>
          <code className="block bg-gray-100 text-gray-900 p-2 rounded font-mono">{clientId}</code>
        </div>
      )}

      <button
        onClick={handleRegenerateSecret}
        disabled={regenerating}
        className={`mb-4 px-4 py-2 rounded text-white ${
          regenerating ? "px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition cursor-not-allowed" : "px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition hover:bg-blue-700"
        }`}
      >
        {regenerating ? "Regenerating..." : "Regenerate Client Secret"}
      </button>

      {clientSecret && (
        <div className="mt-4">
          <p>
            <strong>Client Secret:</strong>
          </p>
          <code className="block bg-gray-100 text-gray-900 p-2 rounded border border-gray-300 font-mono mt-1">{clientSecret}</code>
          <p className="text-sm text-red-600 font-semibold">
            ⚠️ Copy your new client secret now! You won’t see it again.
          </p>
        </div>
      )}
    </div>
  );
};

export default CredentialsPage;
