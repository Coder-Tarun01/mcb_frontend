import React, { useState, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface DebugFileUploaderProps {
  onFileUpload: (file: File) => Promise<void>;
  allowedTypes?: string[];
  maxSize?: number;
}

const DebugFileUploader: React.FC<DebugFileUploaderProps> = ({
  onFileUpload,
  allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  maxSize = 10 * 1024 * 1024 // 10MB default
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const validateFile = (file: File): string | null => {
    console.log('DEBUG - Validating file:', {
      name: file.name,
      type: file.mimetype,
      size: file.size
    });

    if (!allowedTypes.includes(file.type)) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }

    if (file.size > maxSize) {
      return `File too large. Maximum size is ${Math.floor(maxSize / 1024 / 1024)}MB`;
    }

    return null;
  };

  const handleFile = async (file: File) => {
    console.log('DEBUG - Processing file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const error = validateFile(file);
    if (error) {
      console.error('DEBUG - File validation failed:', error);
      setUploadError(error);
      toast.error(error);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      console.log('DEBUG - Starting file upload');
      await onFileUpload(file);
      console.log('DEBUG - File upload completed successfully');
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('DEBUG - File upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      console.log('DEBUG - File dropped:', file.name);
      handleFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('DEBUG - File selected:', file.name);
      handleFile(file);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Uploading file...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4">
              <Upload className="w-12 h-12 text-gray-400" />
              <div className="text-center">
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Drag & Drop your file here
                </h4>
                <p className="text-gray-600 mb-4">or</p>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </button>
              </div>
              <div className="text-sm text-gray-500">
                Supports: PDF, DOC, DOCX (max {Math.floor(maxSize / 1024 / 1024)}
                MB)
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx"
            />
          </>
        )}
      </div>

      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-red-800 mb-1">
              Upload Failed
            </h5>
            <p className="text-sm text-red-600">{uploadError}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugFileUploader;