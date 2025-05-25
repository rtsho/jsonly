import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { collection, query, where, getDocs, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { JsonEditor, githubDarkTheme } from 'json-edit-react';
import CreateTemplateModal from '../components/CreateTemplateModal';
import { deleteDoc } from 'firebase/firestore'; // Import deleteDoc
import { X } from 'lucide-react';

interface Template {
  id: string; // Firestore document ID
  userId: string;
  folder: string;
  template: string; // Template name
  summary: any; // The JSON data
  createdAt: string;
  webhookUrl?: string; // Add optional webhookUrl
}

interface GroupedTemplates {
  [folderName: string]: Template[];
}

const TemplatePage = () => {
  const { user, loading: userLoading } = useAppContext();
  const [templates, setTemplates] = useState<GroupedTemplates>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For editing
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editableJson, setEditableJson] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle'); // State for copy status


  // For "Create Template" modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTemplateJson, setNewTemplateJson] = useState<any>({});
  const [newFolderName, setNewFolderName] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [createSaveStatus, setCreateSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [createSaveError, setCreateSaveError] = useState<string | null>(null);

  // For webhook editing
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [editingWebhookTemplate, setEditingWebhookTemplate] = useState<Template | null>(null);
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [webhookSaveStatus, setWebhookSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [webhookSaveError, setWebhookSaveError] = useState<string | null>(null);

  // For webhook testing
  const [webhookTestStatus, setWebhookTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [webhookTestError, setWebhookTestError] = useState<string | null>(null);

  // For harmonization
  const [harmonizingFolder, setHarmonizingFolder] = useState<string | null>(null);
  const [harmonizeError, setHarmonizeError] = useState<string | null>(null);


  useEffect(() => {
    const fetchTemplates = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const templatesCollection = collection(db, 'templates');
        const userTemplatesQuery = query(templatesCollection, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(userTemplatesQuery);

        const fetchedTemplates: Template[] = [];
        querySnapshot.forEach((docSnap) => {
          fetchedTemplates.push({ id: docSnap.id, ...docSnap.data() } as Template);
        });

        // Group templates by folder
        const grouped: GroupedTemplates = fetchedTemplates.reduce((acc, template) => {
          if (!acc[template.folder]) {
            acc[template.folder] = [];
          }
          acc[template.folder].push(template);
          return acc;
        }, {} as GroupedTemplates);

        setTemplates(grouped);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch templates.');
      } finally {
        setLoading(false);
      }
    };

    if (user && !userLoading) {
      fetchTemplates();
    } else if (!userLoading) {
      setLoading(false);
    }
  }, [user, userLoading]);

  // Open editor for a template
  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setEditableJson(template.summary);
    setEditModalOpen(true);
    setSaveStatus('idle');
    setSaveError(null);
  };

  // Handle copy template ID to clipboard
  const handleCopyId = async () => {
    if (!editingTemplate?.id) return;
    try {
      await navigator.clipboard.writeText(editingTemplate.id);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000); // Reset status after 2 seconds
    } catch (err) {
      console.error('Failed to copy template ID: ', err);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000); // Reset status after 2 seconds
    }
  };


  // Save edited template
  const handleSave = async () => {
    if (!editingTemplate) return;
    setSaveStatus('saving');
    setSaveError(null);
    try {
      const docRef = doc(db, 'templates', editingTemplate.id);
      await setDoc(docRef, {
        ...editingTemplate,
        summary: editableJson,
        updatedAt: new Date().toISOString(),
      });
      setSaveStatus('success');
      // Update local state for immediate UI feedback
      setTemplates(prev => {
        const updated = { ...prev };
        updated[editingTemplate.folder] = updated[editingTemplate.folder].map(t =>
          t.id === editingTemplate.id ? { ...t, summary: editableJson } : t
        );
        return updated;
      });
      setTimeout(() => {
        setEditModalOpen(false);
        setEditingTemplate(null);
        setEditableJson(null);
        setSaveStatus('idle');
      }, 1200);
    } catch (err: any) {
      setSaveStatus('error');
      setSaveError(err.message || 'Failed to save template.');
    }
  };

  // Handle delete button click
  const handleDelete = async (templateToDelete: Template) => {
    if (window.confirm(`Are you sure you want to delete the template "${templateToDelete.template}"?`)) {
      try {
        const docRef = doc(db, 'templates', templateToDelete.id);
        await deleteDoc(docRef);
        // Update local state to remove the deleted template
        setTemplates(prev => {
          const updated = { ...prev };
          updated[templateToDelete.folder] = updated[templateToDelete.folder].filter(t => t.id !== templateToDelete.id);
          // If folder becomes empty, remove it
          if (updated[templateToDelete.folder].length === 0) {
            delete updated[templateToDelete.folder];
          }
          return updated;
        });
        console.log(`Template "${templateToDelete.template}" deleted successfully.`);
      } catch (err: any) {
        console.error('Error deleting template:', err);
        setHarmonizeError(`Failed to delete template: ${err.message || 'Unknown error'}`); // Using harmonizeError state for simplicity
      }
    }
  };
  
  // Handle test webhook button click
  const handleTestWebhook = async () => {
    if (!editingWebhookTemplate || !webhookUrlInput) {
      setWebhookTestError('No template selected or webhook URL is empty.');
      return;
    }
  
    setWebhookTestStatus('testing');
    setWebhookTestError(null);
  
    try {
      // Assuming the webhook expects a POST request with the template summary in the body
      const response = await fetch(webhookUrlInput, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary authentication headers here if required by the webhook
        },
        body: JSON.stringify(editingWebhookTemplate.summary),
      });
  
      if (!response.ok) {
        const errorText = await response.text(); // Get error response body
        throw new Error(`Webhook test failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
  
      setWebhookTestStatus('success');
      console.log('Webhook test successful!');
  
    } catch (err: any) {
      setWebhookTestStatus('error');
      setWebhookTestError(err.message || 'An error occurred during webhook test.');
      console.error('Webhook test error:', err);
    } finally {
      // Optionally reset status after a delay
      // setTimeout(() => setWebhookTestStatus('idle'), 3000);
    }
  };
  
  
  // Handle harmonize button click
  const handleHarmonize = async (folderName: string) => {
    setHarmonizingFolder(folderName);
    setHarmonizeError(null);
    if (!user) { // Add null check for user
      setHarmonizeError('User not logged in.');
      setHarmonizingFolder(null);
      return;
    }
    try {
      const folderTemplates = templates[folderName].filter(template => template.template !== 'template-harmonized');
      const templateContents = folderTemplates.map(template => template.summary);

      const response = await fetch('http://127.0.0.1:8000/harmonize-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
        },
        body: JSON.stringify(templateContents),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to harmonize templates.');
      }
      const harmonizedSummary = await response.json();

      // Save the harmonized template
      const harmonizedTemplateName = 'template-harmonized';
      const harmonizedDocId = `${user.uid}-${folderName}-${harmonizedTemplateName}`;
      const harmonizedDocRef = doc(db, 'templates', harmonizedDocId);

      await setDoc(harmonizedDocRef, {
        userId: user.uid,
        folder: folderName,
        template: harmonizedTemplateName,
        summary: harmonizedSummary,
        createdAt: new Date().toISOString(), // Or use the creation date of the original templates if preferred
      });

      // Update local state to include the new harmonized template
      setTemplates(prev => {
        const updated = { ...prev };
        const newTemplate: Template = {
          id: harmonizedDocId,
          userId: user.uid,
          folder: folderName,
          template: harmonizedTemplateName,
          summary: harmonizedSummary,
          createdAt: new Date().toISOString(),
        };
        // Check if template-harmonized already exists and replace it, or add it
        const existingIndex = updated[folderName].findIndex(t => t.template === harmonizedTemplateName);
        if (existingIndex > -1) {
          updated[folderName][existingIndex] = newTemplate;
        } else {
          updated[folderName].push(newTemplate);
        }
        return updated;
      });

      console.log(`Harmonization successful and template saved for folder: ${folderName}`);

    } catch (err: any) {
      setHarmonizeError(err.message || 'An error occurred during harmonization.');
    } finally {
      setHarmonizingFolder(null);
    }
  };


  if (loading || userLoading) {
    return <div>Loading templates...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!user) {
    return <div>Please log in to view your templates.</div>;
  }

  const folderNames = Object.keys(templates).sort();

  // Handle Create Template Save
  const handleCreateTemplateSave = async () => {
    if (!user) return;
    if (!newFolderName.trim() || !newTemplateName.trim()) {
      setCreateSaveError('Folder name and template name are required.');
      setCreateSaveStatus('error');
      return;
    }
    setCreateSaveStatus('saving');
    setCreateSaveError(null);
    try {
      const docRef = await addDoc(collection(db, 'templates'), {
        userId: user.uid,
        folder: newFolderName.trim(),
        template: newTemplateName.trim(),
        summary: newTemplateJson,
        createdAt: serverTimestamp(),
      });
      // Update local state (grouped by folder)
      setTemplates(prev => {
        const updated = { ...prev };
        const folder = newFolderName.trim();
        const newTemplate: Template = {
          id: docRef.id,
          userId: user.uid,
          folder,
          template: newTemplateName.trim(),
          summary: newTemplateJson,
          createdAt: new Date().toISOString(),
        };
        if (!updated[folder]) {
          updated[folder] = [];
        }
        updated[folder] = [...updated[folder], newTemplate];
        return updated;
      });
      setCreateSaveStatus('success');
      setIsCreateModalOpen(false);
      setNewFolderName('');
      setNewTemplateName('');
      setNewTemplateJson({});
    } catch (err: any) {
      setCreateSaveStatus('error');
      setCreateSaveError(err.message || 'Failed to save template.');
    }
  };

  // Modal JSX
  // (renderCreateTemplateModal removed, replaced by CreateTemplateModal component)

  return (
    <> {/* Wrap with React Fragment */}
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
        saveStatus={createSaveStatus}
        saveError={createSaveError}
      />
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Templates</h1>
          <button
            className="px-4 py-2 bg-gray-700 text-purple-300 rounded hover:bg-gray-600 transition"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Template
          </button>
        </div>
        {harmonizeError && (
          <div className="text-red-500 mb-4">{harmonizeError}</div>
        )}
        {folderNames.length === 0 ? (
          <p>No templates saved yet.</p>
        ) : (
          <div className="space-y-6">
            {folderNames.map(folderName => (
              <div key={folderName} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold text-purple-300">{folderName}</h2>
                  {templates[folderName].length > 1 && (
                    <button
                      className="px-3 py-1 bg-purple-900 hover:bg-purple-800 text-white rounded text-sm"
                      onClick={() => handleHarmonize(folderName)}
                      disabled={harmonizingFolder === folderName}
                    >
                      {harmonizingFolder === folderName ? 'Harmonizing...' : 'Harmonize'}
                    </button>
                  )}
                </div>
                <ul className="space-y-2">
                  {(() => {
                    const allTemplates = templates[folderName];
                    const harmonized = allTemplates.find(t => t.template === 'template-harmonized');
                    const rest = allTemplates.filter(t => t.template !== 'template-harmonized');
                    return (
                      <>
                        {rest.map(template => (
                          <li key={template.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
                            <span className="text-gray-200">{template.template}</span>
                            <div className="flex gap-2"> {/* Container for buttons */}
                                <button
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1" // Added flex and gap for icon spacing
                                  onClick={() => {
                                    setEditingWebhookTemplate(template);
                                    setWebhookUrlInput(template.webhookUrl || '');
                                    setShowWebhookModal(true);
                                    setWebhookSaveStatus('idle');
                                    setWebhookSaveError(null);
                                  }}
                                >
                                  {template.webhookUrl ? '✅' : '❌'} Webhook
                                </button>
                              <button
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                                onClick={() => handleEdit(template)}
                              >
                                View/Edit
                              </button>
                              <button
                                className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-sm"
                                onClick={() => handleDelete(template)}
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        ))}
                        {harmonized && (
                          <li
                            key={harmonized.id}
                            className="bg-purple-950/40 border-2 border-purple-400 p-3 rounded-md flex justify-between items-center"
                          >
                            <span className="text-purple-200 font-semibold">{harmonized.template}</span>
                            <div className="flex gap-2">
                                <button
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1" // Added flex and gap for icon spacing
                                  onClick={() => {
                                    setEditingWebhookTemplate(harmonized);
                                    setWebhookUrlInput(harmonized.webhookUrl || '');
                                    setShowWebhookModal(true);
                                    setWebhookSaveStatus('idle');
                                    setWebhookSaveError(null);
                                  }}
                                >
                                  {harmonized.webhookUrl ? '✅' : '❌'} Webhook
                                </button>
                              <button
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                                onClick={() => handleEdit(harmonized)}
                              >
                                View/Edit
                              </button>
                              <button
                                className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-sm"
                                onClick={() => handleDelete(harmonized)}
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        )}
                      </>
                    );
                  })()}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div> {/* Close the main div */}

      {/* Edit Modal */}
      {editModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto flex flex-col">
            <h3 className="text-lg font-bold mb-2 text-purple-300">
              Edit Template: {editingTemplate.template} (Folder: {editingTemplate.folder})
            </h3>
            <div className="flex items-center mb-4"> {/* Flex container for ID and button */}
              <p className="text-sm text-gray-400 mr-2">ID: {editingTemplate.id}</p> {/* Display template ID */}
              <button
                className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs" // Styled as a small icon button
                onClick={handleCopyId}
                title="Copy ID to clipboard"
              >
                📋 {/* Clipboard icon */}
              </button>
              {copyStatus === 'success' && <span className="ml-2 text-green-400 text-sm">Copied!</span>} {/* Success message */}
              {copyStatus === 'error' && <span className="ml-2 text-red-400 text-sm">Failed to copy.</span>} {/* Error message */}
            </div>
            <div className="mb-4 flex-1 min-h-[200px] max-h-[50vh] overflow-y-auto">
              <JsonEditor
                data={editableJson}
                setData={setEditableJson}
                theme={
                  githubDarkTheme
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-600 text-gray-300 hover:bg-gray-500"
                onClick={() => setEditModalOpen(false)}
                disabled={saveStatus === 'saving'}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? 'Saving...' : 'Save'}
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

      {/* Webhook Edit Modal */}
      {showWebhookModal && editingWebhookTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-purple-300">
              Edit Webhook for: {editingWebhookTemplate.template}
            </h3>
            <div className="mb-3">
              <label className="block text-gray-300 mb-1">Webhook URL</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={webhookUrlInput}
                onChange={e => setWebhookUrlInput(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                onClick={handleTestWebhook}
                disabled={webhookSaveStatus === 'saving' || webhookTestStatus === 'testing' || !webhookUrlInput}
              >
                {webhookTestStatus === 'testing' ? 'Testing...' : 'Test Webhook'}
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
                onClick={() => setShowWebhookModal(false)}
                disabled={webhookSaveStatus === 'saving' || webhookTestStatus === 'testing'}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={async () => {
                  if (!editingWebhookTemplate || !user) return;
                  setWebhookSaveStatus('saving');
                  setWebhookSaveError(null);
                  try {
                    const docRef = doc(db, 'templates', editingWebhookTemplate.id);
                    await setDoc(docRef, { webhookUrl: webhookUrlInput }, { merge: true });
                    setWebhookSaveStatus('success');
                    // Update local state
                    setTemplates(prev => {
                      const updated = { ...prev };
                      updated[editingWebhookTemplate.folder] = updated[editingWebhookTemplate.folder].map(t =>
                        t.id === editingWebhookTemplate.id ? { ...t, webhookUrl: webhookUrlInput } : t
                      );
                      return updated;
                    });
                    setTimeout(() => {
                      setShowWebhookModal(false);
                      setEditingWebhookTemplate(null);
                      setWebhookUrlInput('');
                      setWebhookSaveStatus('idle');
                      setWebhookTestStatus('idle'); // Reset test status on modal close
                      setWebhookTestError(null);
                    }, 1200);
                  } catch (err: any) {
                    setWebhookSaveStatus('error');
                    setWebhookSaveError(err.message || 'Failed to save webhook URL.');
                  }
                }}
                disabled={webhookSaveStatus === 'saving' || webhookTestStatus === 'testing'}
              >
                {webhookSaveStatus === 'saving' ? 'Saving...' : 'Save'}
              </button>
            </div>
            {webhookSaveStatus === 'error' && (
              <div className="mt-2 text-red-400 text-sm">{webhookSaveError}</div>
            )}
            {webhookSaveStatus === 'success' && (
              <div className="mt-2 text-green-400 text-sm">Webhook URL successfully saved!</div>
            )}
            {webhookTestStatus === 'testing' && (
              <div className="mt-2 text-yellow-400 text-sm">Testing webhook...</div>
            )}
            {webhookTestStatus === 'success' && (
              <div className="mt-2 text-green-400 text-sm">Webhook test successful!</div>
            )}
            {webhookTestStatus === 'error' && (
              <div className="mt-2 text-red-400 text-sm">Webhook test failed: {webhookTestError}</div>
            )}
          </div>
        </div>
      )}
    </> 
  );
};

export default TemplatePage;