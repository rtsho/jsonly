import { useCallback, useState, useEffect } from 'react';
import { Upload, File, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const FileUploader = () => {
  const { uploadDocument, loading, user } = useAppContext();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Clear selected file when user logs out
  useEffect(() => {
    if (!user) {
      setSelectedFile(null);
    }
  }, [user]);

  const isValidFileType = (file: File) => {
    return file.type === 'application/pdf' || file.type === 'text/csv';
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (isValidFileType(file)) {
        setSelectedFile(file);
      } else {
        alert('Please upload a PDF or CSV file');
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (isValidFileType(file)) {
        setSelectedFile(file);
      } else {
        alert('Please upload a PDF or CSV file');
      }
    }
  };

  const handleButtonClick = () => {
    document.getElementById('fileInput')?.click();
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      uploadDocument(selectedFile);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
        isDragging
        ? 'border-purple-500 bg-purple-500/10'
        : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
      }`}
    >
      <input
        id="fileInput"
        type="file"
        accept=".pdf,.csv"
        onChange={handleFileChange}
        className="hidden"
        disabled={loading}
      />
      
      <div className="flex flex-col items-center justify-center">
        {loading ? (
          <>
            <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center mb-4">
              <Loader2 size={28} className="text-purple-400 animate-spin" />
            </div>
            <p className="text-gray-300 font-medium">Processing Document...</p>
            <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
          </>
        ) : selectedFile ? (
          <>
            <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center mb-4">
              <File size={28} className="text-purple-400" />
            </div>
            <p className="text-gray-300 font-medium">{selectedFile.name}</p>
            <p className="text-gray-400 text-sm mt-2">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleButtonClick}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
              >
                Choose Different
              </button>
              <button
                onClick={handleAnalyze}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                Analyze Document
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center mb-4 group-hover:bg-purple-800/40 transition-colors">
              <Upload size={28} className="text-purple-400" />
            </div>
            <p className="text-gray-300 font-medium">Drag & Drop your document here</p>
            <p className="text-gray-400 text-sm mt-2">or</p>
            <button
              onClick={handleButtonClick}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium transition-colors"
            >
              Browse Files
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploader;