import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface JsonViewerProps {
  summary: any;
  loading: boolean;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ summary, loading }) => {
  const jsonRef = useRef<HTMLPreElement>(null);

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
  );
};

export default JsonViewer;