import React from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import FileUploader from './FileUploader';
import JsonViewer from './JsonViewer';
import { useAppContext } from '../context/AppContext';

const FileUploadSection = () => {
  const { summary, loading, error } = useAppContext();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="order-1 lg:order-1">
        <div className="backdrop-blur-sm bg-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-700 h-full">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Upload Document</h2>
          <FileUploader />
          
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
          <JsonViewer summary={summary} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default FileUploadSection;