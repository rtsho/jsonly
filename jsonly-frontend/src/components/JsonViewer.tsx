import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface JsonViewerProps {
  summary: any;
  loading: boolean;
  selectedTemplateId?: string | null;
  templates?: any[];
}

const JsonViewer: React.FC<JsonViewerProps> = ({ summary, loading, selectedTemplateId, templates }) => {
  const jsonRef = useRef<HTMLPreElement>(null);
  const [enableWebhook, setEnableWebhook] = React.useState(false); // New state for webhook toggle
  const [webhookUrl, setWebhookUrl] = React.useState(''); // New state for webhook URL
  // Popup state for saving template
  const [showSavePopup, setShowSavePopup] = React.useState(false);
  const [templateName, setTemplateName] = React.useState('');
  const [folderName, setFolderName] = React.useState('Default');

  // Popup state for saving template
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const { user } = useAppContext();

  useEffect(() => {
    // Add a subtle animation when new data arrives
    if (summary && jsonRef.current) {
      jsonRef.current.classList.add('animate-pulse');
      setTimeout(() => {
        jsonRef.current?.classList.remove('animate-pulse');
      }, 500);
    }
  }, [summary]);

  // Pre-fill folder/template name when Save Template modal is opened
  useEffect(() => {
    if (showSavePopup) {
      if (selectedTemplateId && templates && templates.length > 0) {
        const found = templates.find((t) => t.id === selectedTemplateId);
        if (found) {
          setFolderName(found.folder || '');
          setTemplateName(found.template || '');
          return;
        }
      }
      // If no template selected or not found, clear fields
      setFolderName('');
      setTemplateName('');
    }
    // Only run when popup opens, or when selectedTemplateId/templates change while popup is open
    // eslint-disable-next-line
  }, [showSavePopup, selectedTemplateId, templates]);

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
      {selectedTemplateId && (
        <div className="text-xs text-gray-400 mb-2">
          Template ID: <span className="font-mono">{selectedTemplateId}</span>
        </div>
      )}
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
        <>
          
          {showSavePopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4 text-purple-300">Save Template</h3>
                <div className="mb-3">
                  <label className="block text-gray-300 mb-1">Folder Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={folderName}
                    onChange={e => setFolderName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-300 mb-1">Template Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={templateName}
                    onChange={e => setTemplateName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    className="px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
                    onClick={() => setShowSavePopup(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={async () => {
                      setSaveStatus('loading');
                      setSaveError(null);
                      if (!user) {
                        setSaveStatus('error');
                        setSaveError('You must be logged in to save a template.');
                        return;
                      }
                      let docId: string;
                      let isUpdate = false;
                      if (selectedTemplateId) {
                        // Update existing template
                        docId = selectedTemplateId;
                        isUpdate = true;
                      } else {
                        // Create new template
                        docId = `${user.uid}-${folderName}-${templateName}`;
                      }
                      const docRef = doc(db, 'templates', docId);
                      try {
                        if (!isUpdate) {
                          // For new templates, check if it already exists
                          const docSnap = await getDoc(docRef);
                          if (docSnap.exists()) {
                            setSaveStatus('error');
                            setSaveError(`Template "${templateName}" already exists in folder "${folderName}".`);
                            return;
                          }
                        }
                        const templateData: any = {
                          userId: user.uid,
                          folder: folderName,
                          template: templateName,
                          summary,
                          createdAt: new Date().toISOString(),
                        };
                        if (webhookUrl) {
                          templateData.webhookUrl = webhookUrl;
                        }
                        // Always overwrite the document (no merge) to ensure summary is replaced
                        await setDoc(docRef, templateData);
                        setSaveStatus('success');
                        setTimeout(() => {
                          setShowSavePopup(false);
                          setSaveStatus('idle');
                          setTemplateName('');
                          setFolderName('Default');
                        }, 1500);
                      } catch (err: any) {
                        setSaveStatus('error');
                        setSaveError(err.message || 'Failed to save template.');
                      }
                    }}
                    disabled={!templateName || !folderName || saveStatus === 'loading'}
                  >
                    Save
                  </button>
                </div>
                {saveStatus === 'error' && (
                  <div className="mt-2 text-red-400 text-sm">{saveError}</div>
                )}
                {saveStatus === 'success' && (
                  <div className="mt-2 text-green-400 text-sm">Template successfully saved!</div>
                )}
              </div>
            </div>
          )}
        </>
      )}


    </div>
  );
};

export default JsonViewer;