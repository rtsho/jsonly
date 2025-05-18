import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface JsonViewerProps {
  summary: any;
  loading: boolean;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ summary, loading }) => {
  const jsonRef = useRef<HTMLPreElement>(null);
const [enableWebhook, setEnableWebhook] = React.useState(false); // New state for webhook toggle
  const [webhookUrl, setWebhookUrl] = React.useState(''); // New state for webhook URL

  useEffect(() => {
    // Add a subtle animation when new data arrives
    if (summary && jsonRef.current) {
      jsonRef.current.classList.add('animate-pulse');
      setTimeout(() => {
        jsonRef.current?.classList.remove('animate-pulse');
      }, 500);
    }
  }, [summary]);

  const formatJson = (json: any): string => {
    if (!json) return '';
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return String(json);
    }
  };

  // Function to syntax highlight JSON
  const syntaxHighlight = (json: string): string => {
    // This is a simple implementation, could be expanded
    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
        (match) => {
          let cls = 'text-orange-400'; // number
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'text-purple-300'; // key
            } else {
              cls = 'text-green-400'; // string
            }
          } else if (/true|false/.test(match)) {
            cls = 'text-blue-400'; // boolean
          } else if (/null/.test(match)) {
            cls = 'text-gray-400'; // null
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gray-900 rounded-lg h-[400px] overflow-auto relative text-sm">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <Loader2 size={36} className="text-purple-500 animate-spin mb-4" />
              <p className="text-gray-300">Analyzing PDF...</p>
            </div>
          </div>
        ) : (
          <>
            {summary ? (
              <pre
                ref={jsonRef}
                className="p-4 font-mono text-gray-300 h-full"
                dangerouslySetInnerHTML={{ __html: syntaxHighlight(formatJson(summary)) }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Upload a PDF to view its JSON summary</p>
              </div>
            )}
          </>
        )}
      </div>
      {!loading && summary && ( // Conditional rendering
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Save Template
        </button>
      )}
{!loading && summary && ( // Conditional rendering for webhook section
        <div className="flex flex-col gap-2 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableWebhook"
              checked={enableWebhook}
              onChange={(e) => setEnableWebhook(e.target.checked)}
              className="form-checkbox h-4 w-4 text-purple-600 rounded"
            />
            <label htmlFor="enableWebhook" className="text-gray-300">Enable Webhook</label>
          </div>
          {enableWebhook && ( // Show URL input and buttons only if webhook is enabled
            <>
              <input
                type="text"
                placeholder="Enter Webhook URL"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={!webhookUrl}>
                  Test Webhook
                </button>
                <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={!webhookUrl}>
                  Send Summary to Webhook
                </button>
                <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={!webhookUrl}>
                  Save Webhook
                </button>
              </div>
            </>
          )}
        </div>
      )}
{/* API Usage Section */}
      {!loading && summary && ( // Show this section only after analysis
        <div className="flex flex-col gap-2 p-4 bg-gray-800 rounded-lg text-gray-300">
          <h3 className="text-lg font-bold text-purple-400">🛠 Use Your API</h3>
          <p>
            <strong>POST</strong> your documents to:
          </p>
          <p className="ml-4 text-purple-300">
            https://yourdomain.com/api/analyze
          </p>
          <p>
            <strong>✔️ We’ll return the saved summary format to your webhook.</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default JsonViewer;