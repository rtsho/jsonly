import React from 'react';
import { Upload, AlertCircle, X } from 'lucide-react';
import FileUploader from './FileUploader';
import JsonViewer from './JsonViewer';
import { useAppContext } from '../context/AppContext';
import { getUserTemplates } from '../services/firebase'; // Import getUserTemplates
import { JsonEditor, githubDarkTheme  } from 'json-edit-react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import CreateTemplateModal from './CreateTemplateModal';
 
 
const FileUploadSection = () => {
  const { summary, loading, error, resetSummary, setSummary, selectedTemplateId, setSelectedTemplateId, user, currentTemplate } = useAppContext(); // Access user and currentTemplate from context
  const [tab, setTab] = React.useState<'view' | 'edit'>('view');
  // Removed showTemplateModal state as we're using CreateTemplateModal instead
  const [editableSummary, setEditableSummary] = React.useState<any>(summary);
  const [templates, setTemplates] = React.useState<any[]>([]); // State to hold fetched templates

  // State for Create Template Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [newTemplateJson, setNewTemplateJson] = React.useState<any>({});
  const [newFolderName, setNewFolderName] = React.useState('');
  const [newTemplateName, setNewTemplateName] = React.useState('');
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = React.useState<string | null>(null);
 
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

  // Handle Create Template Save
  const handleCreateTemplateSave = async () => {
    if (!user) return;
    if (!newFolderName.trim() || !newTemplateName.trim()) {
      setSaveError('Folder name and template name are required.');
      setSaveStatus('error');
      return;
    }
    setSaveStatus('saving');
    setSaveError(null);
    try {
      const docRef = await addDoc(collection(db, 'templates'), {
        userId: user.uid,
        folder: newFolderName.trim(),
        template: newTemplateName.trim(),
        summary: newTemplateJson,
        createdAt: serverTimestamp(),
      });
      // Update local state
      setTemplates(prev => [
        ...prev,
        {
          id: docRef.id,
          userId: user.uid,
          folder: newFolderName.trim(),
          template: newTemplateName.trim(),
          summary: newTemplateJson,
          createdAt: new Date().toISOString(),
        }
      ]);
      setSaveStatus('success');
      setIsCreateModalOpen(false);
      setNewFolderName('');
      setNewTemplateName('');
      setNewTemplateJson({});
    } catch (err: any) {
      setSaveStatus('error');
      setSaveError(err.message || 'Failed to save template.');
    }
  };

  // (renderCreateTemplateModal removed, replaced by CreateTemplateModal component)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateTemplateSave}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
        templateName={newTemplateName}
        setTemplateName={setNewTemplateName}
        templateJson={newTemplateJson}
        setTemplateJson={setNewTemplateJson}
        saveStatus={saveStatus}
        saveError={saveError}
      />
      <div className="order-1 lg:order-1">
        <div className="backdrop-blur-sm bg-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-700 h-full">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Upload Document</h2>
          <FileUploader />

          {/* Template Selection */}
          {/* Template Selection and Creation */}
          {user && ( // Conditionally render if user is logged in
            <div className="mt-4 flex items-end space-x-4"> {/* Flex container, align items to end */}
              {/* Use Template Section */}
              <div className="flex-1"> {/* Allows this section to grow */}
                <label htmlFor="template-select" className="block text-sm font-medium text-gray-400 mb-2">
                  Use Template:
                </label>
                <select
                  id="template-select"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-gray-700 text-white"
                  onChange={handleTemplateChange}
                  value={selectedTemplateId || ''} // Control the select value
                >
                  <option value="">AI Generated</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {`${template.folder}-${template.template}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* OR Separator */}
              <div className="flex items-center px-4"> {/* Increased horizontal padding */}
                <div className="w-px bg-gray-600 h-8"></div> {/* Vertical divider, increased height */}
                <span className="px-2 text-gray-400 text-sm">OR</span>
                <div className="w-px bg-gray-600 h-8"></div> {/* Vertical divider, increased height */}
              </div>

              {/* Create Template Button */}
              <div>
                <button
                  className="px-4 py-2 bg-gray-700 text-purple-300 rounded hover:bg-gray-600 transition"
                  onClick={() => {
                    // Reset template data when creating a new template from scratch
                    setNewTemplateJson({});
                    setNewFolderName('');
                    setNewTemplateName('');
                    setIsCreateModalOpen(true);
                  }}
                >
                  Create Template
                </button>
              </div>
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
              <li> Provide your own JSON template or let our AI create one for you </li>
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
                  className="px-4 py-2 rounded font-medium bg-purple-600 text-white w-full"
                  onClick={() => {
                    console.log('Save/Edit Template clicked. currentTemplate:', currentTemplate);
                    // Pre-fill the CreateTemplateModal with current template data
                    if (currentTemplate) {
                      setNewTemplateJson(currentTemplate);
                      // If we have folder and template name information, use it
                      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
                      if (selectedTemplate) {
                        setNewFolderName(selectedTemplate.folder);
                        setNewTemplateName(selectedTemplate.template);
                      }
                    } else {
                      // If no template is selected, use the current summary
                      setNewTemplateJson(summary);
                    }
                    setIsCreateModalOpen(true);
                  }}
                >
                  View/Edit Template
                </button>
              </div>
              <JsonViewer
                summary={editableSummary}
                loading={loading}
                selectedTemplateId={selectedTemplateId}
                templates={templates}
              />
              {/* We no longer need the modal for viewing template as we're using CreateTemplateModal */}
            </React.Fragment>
          )}
          {!summary && (
            <JsonViewer
              summary={summary}
              loading={loading}
              selectedTemplateId={selectedTemplateId}
              templates={templates}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadSection;