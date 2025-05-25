import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const CredentialsPage = () => {
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingClientId, setLoadingClientId] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('curl'); // 'curl', 'python', or 'postman'

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

      {/* How to use the API Section */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h2 className="text-xl font-bold mb-4">How to use the API</h2>
        <div className="text-gray-400">
          <h3 className="text-lg font-semibold mb-2">📤 How to Call /analyze-with-template/</h3>
          <p><strong>Method:</strong> POST</p>
          <p><strong>URL:</strong> <code>https://your-api.com/analyze-with-template/</code></p>

          <h4 className="text-md font-semibold mt-4 mb-2">Headers:</h4>
          <ul className="list-disc list-inside ml-4">
            <li><code>client_id</code>: Your client ID</li>
            <li><code>client_secret</code>: Your client secret</li>
          </ul>

          <h4 className="text-md font-semibold mt-4 mb-2">Form Data:</h4>
          <ul className="list-disc list-inside ml-4">
            <li><code>file</code>: The file to analyze (e.g., PDF, image, etc.)</li>
            <li><code>template_id</code>: The ID of the analysis template to use</li>
          </ul>

          {/* Tabs */}
          <div className="flex border-b border-gray-700 mt-6 mb-4">
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === 'curl' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('curl')}
            >
              curl Example
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === 'python' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('python')}
            >
              Python Example
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === 'postman' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('postman')}
            >
              Postman Collection
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'curl' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">✅ Example Using curl</h3>
                <pre className="bg-gray-800 text-gray-200 p-3 rounded-md overflow-x-auto">
                  <code>
curl -X POST https://your-api.com/analyze-with-template/ \<br/>
  -H "client_id: YOUR_CLIENT_ID" \<br/>
  -H "client_secret: YOUR_CLIENT_SECRET" \<br/>
  -F "file=@/path/to/your/file.pdf" \<br/>
  -F "template_id=your-template-id"
                  </code>
                </pre>
              </div>
            )}
            {activeTab === 'python' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">🧪 Example Using Python and requests</h3>
                <pre className="bg-gray-800 text-gray-200 p-3 rounded-md overflow-x-auto">
                  <code className="language-python">
{`import requests

url = "https://your-api.com/analyze-with-template/"
headers = {
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
}
files = {
    "file": open("file.pdf", "rb")
}
data = {
    "template_id": "your-template-id"
}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())`}
                  </code>
                </pre>
              </div>
            )}
            {activeTab === 'postman' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">📦 Postman Collection</h3>
                <p className="mb-4">
                  Download the Postman collection below to easily test the <code>/analyze-with-template/</code> endpoint.
                  Import it into Postman and follow these steps:
                </p>
                <ul className="list-disc list-inside ml-4 mb-4">
                  <li>Update the request with your <code>client_id</code> and <code>client_secret</code> in the Authorization tab (using Basic Auth).</li>
                  <li>Upload your file in the Body tab (using form-data).</li>
                  <li>Specify the <code>template_id</code>.</li>
                </ul>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  onClick={() => {
                    const collectionContent = `{
  "info": {
    "name": "Analyze with Template API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Analyze with Template",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": ""
            },
            {
              "key": "template_id",
              "type": "text",
              "value": "your-template-id"
            }
          ]
        },
        "url": {
          "raw": "https://your-api.com/analyze-with-template/",
          "protocol": "https",
          "host": [
            "your-api",
            "com"
          ],
          "path": [
            "analyze-with-template",
            ""
          ]
        },
        "auth": {
          "type": "basic",
          "basic": [
            {
              "key": "username",
              "value": "YOUR_CLIENT_ID",
              "type": "string"
            },
            {
              "key": "password",
              "value": "YOUR_CLIENT_SECRET",
              "type": "string"
            }
          ]
        }
      }
    }
  ]
}`;
                    const blob = new Blob([collectionContent], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'analyze_with_template.postman_collection.json';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download Postman Collection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialsPage;
