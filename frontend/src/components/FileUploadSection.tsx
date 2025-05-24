import React from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import FileUploader from './FileUploader';
import JsonViewer from './JsonViewer';
import { useAppContext } from '../context/AppContext';
import { getUserTemplates } from '../services/firebase'; // Import getUserTemplates
import { JsonEditor, githubDarkTheme  } from 'json-edit-react'


const FileUploadSection = () => {
  const { summary, loading, error, resetSummary, setSummary, selectedTemplateId, setSelectedTemplateId, user } = useAppContext(); // Access user from context
  const [tab, setTab] = React.useState<'view' | 'edit'>('view');
  const [editableSummary, setEditableSummary] = React.useState<any>(summary);
  const [templates, setTemplates] = React.useState<any[]>([]); // State to hold fetched templates

  // Keep editableSummary in sync with summary when a new document is analyzed
  React.useEffect(() => {
    setEditableSummary(summary);
  }, [summary]);

  // TODO: Fetch templates when the component mounts
  React.useEffect(() => {
    const fetchTemplates = async () => {
      if (user) { // Fetch templates only if user is logged in
        try {
          const userTemplates = await getUserTemplates(user.uid);
          setTemplates(userTemplates);
        } catch (err) {
          console.error("Error fetching user templates:", err);
          setTemplates([]); // Set to empty array on error
        }
      } else {
        setTemplates([]); // Clear templates if user logs out
      }
    };

    fetchTemplates();
  }, [user]); // Dependency array includes user, so this runs when user changes

  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemplateId(event.target.value || null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="order-1 lg:order-1">
        <div className="backdrop-blur-sm bg-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-700 h-full">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Upload Document</h2>
          <FileUploader />

          {/* Template Selection */}
          {user && ( // Conditionally render if user is logged in
            <div className="mt-4">
              <label htmlFor="template-select" className="block text-sm font-medium text-gray-400 mb-2">
                Use Template:
              </label>
              <select
                id="template-select"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-gray-700 text-white"
                onChange={handleTemplateChange}
                value={selectedTemplateId || ''} // Control the select value
              >
                <option value="">None</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {`${template.folder}-${template.template}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-900/30 border border-red-800 rounded-lg p-4 flex items-start">
              <AlertCircle className="text-red-400 mr-2 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Instructions</h3>
            <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
              <li>Upload a PDF or CSV file (max 10MB)</li>
              <li>The file will be processed by our AI</li>
              <li>View the JSON summary on the right</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="order-2 lg:order-2">
        <div className="backdrop-blur-sm bg-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-700 h-full">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">JSON Summary</h2>
          {summary && (
            <React.Fragment>
              <div className="flex mb-4">
                <button
                  className={`px-4 py-2 rounded-tl rounded-bl font-medium ${
                    tab === 'view'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-purple-700'
                  }`}
                  onClick={() => setTab('view')}
                >
                  View
                </button>
                <button
                  className={`px-4 py-2 rounded-tr rounded-br font-medium ${
                    tab === 'edit'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-purple-700'
                  }`}
                  onClick={() => setTab('edit')}
                >
                  Edit
                </button>
              </div>
              {tab === 'view' ? (
                <JsonViewer summary={editableSummary} loading={loading} />
              ) : (
                <div className="bg-gray-900 rounded-lg p-2 flex flex-col">
                  <div className="flex justify-start mb-2">
                    <button
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      onClick={() => { setSummary(editableSummary); setTab('view'); }}
                    >
                      Save Changes & View
                    </button>
                  </div>

                  <JsonEditor
                    data={editableSummary}
                    setData={setEditableSummary}
                    theme={githubDarkTheme}
                  />

                  <div className="flex justify-start mb-2">
                    <button
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      onClick={() => { setSummary(editableSummary); setTab('view'); }}
                    >
                      Save Changes & View
                    </button>
                  </div>
                  
                </div>
              )}
            </React.Fragment>
          )}
          {!summary && (
            <JsonViewer summary={summary} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadSection;