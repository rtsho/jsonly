import React, { useState } from "react";
import { JsonEditor, githubDarkTheme } from "json-edit-react";
import { X } from "lucide-react";

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  folderName: string;
  setFolderName: (v: string) => void;
  templateName: string;
  setTemplateName: (v: string) => void;
  templateJson: any;
  setTemplateJson: (v: any) => void;
  saveStatus: "idle" | "saving" | "success" | "error";
  saveError: string | null;
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  folderName,
  setFolderName,
  templateName,
  setTemplateName,
  templateJson,
  setTemplateJson,
  saveStatus,
  saveError,
}) => {
  const [useEditor, setUseEditor] = useState(true);
  const [textAreaContent, setTextAreaContent] = useState(JSON.stringify(templateJson, null, 2));

  if (!isOpen) return null;

  const handleToggleChange = () => {
    if (useEditor) {
      // Switching from editor to text area
      setTextAreaContent(JSON.stringify(templateJson, null, 2));
    } else {
      // Switching from text area to editor
      try {
        const parsedJson = JSON.parse(textAreaContent);
        setTemplateJson(parsedJson);
      } catch (error) {
        console.error("Invalid JSON:", error);
        // Optionally, show an error message to the user
      }
    }
    setUseEditor(!useEditor);
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAreaContent(e.target.value);
    // Optionally, attempt to parse and update templateJson as user types
    try {
      const parsedJson = JSON.parse(e.target.value);
      setTemplateJson(parsedJson);
    } catch (error) {
      // Ignore parsing errors while typing, only enforce on switch
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-300"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold text-purple-300 mb-4">
          Create Template
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Folder Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Enter folder name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Template Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
          />
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-400">
              Template JSON
            </label>
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-2">Use Editor</span>
              <input
                type="checkbox"
                checked={useEditor}
                onChange={handleToggleChange}
                className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
              />
            </div>
          </div>
          {useEditor ? (
            <JsonEditor
              data={templateJson}
              setData={setTemplateJson}
              theme={githubDarkTheme}
            />
          ) : (
            <textarea
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              rows={10}
              value={textAreaContent}
              onChange={handleTextAreaChange}
              placeholder="Enter JSON here"
            />
          )}
        </div>
        {saveStatus === "error" && (
          <div className="mb-2 text-red-400 text-sm">{saveError}</div>
        )}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
            onClick={onClose}
            disabled={saveStatus === "saving"}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            onClick={onSave}
            disabled={saveStatus === "saving"}
          >
            {saveStatus === "saving" ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplateModal;