import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  X, 
  File,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ResumeOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFillManual: () => void;
  onUploadResume: (file: File) => void;
}

const ResumeOptionsModal: React.FC<ResumeOptionsModalProps> = ({
  isOpen,
  onClose,
  onFillManual,
  onUploadResume
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('error');
      setUploadMessage('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('error');
      setUploadMessage('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');

    try {
      // Simulate file processing (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call the upload handler
      onUploadResume(file);
      
      setUploadStatus('success');
      setUploadMessage('Resume uploaded and parsed successfully!');
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        setUploadStatus('idle');
        setUploadMessage('');
      }, 1500);
      
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Failed to process resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFillManual = () => {
    onFillManual();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-start justify-center z-[100] p-3 sm:p-4 pt-20 sm:pt-24 md:pt-28 lg:pt-32 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-xl shadow-2xl max-w-sm sm:max-w-md w-full max-h-[calc(100vh-8rem)] sm:max-h-[75vh] mb-4 sm:mb-6 overflow-y-auto border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start sm:items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">Create Your Resume</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Choose how you'd like to get started</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
            {/* Upload Resume Option */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-5 md:p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
              onClick={handleUploadClick}
            >
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-blue-100 rounded-full">
                  <Upload className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
                </div>
                <div className="w-full">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">Upload Resume</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-2">
                    Upload your existing resume and we'll automatically fill in the details
                  </p>
                  <div className="text-xs text-gray-500">
                    Supports PDF, DOC, DOCX files (max 5MB)
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Fill Manual Option */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-gray-200 rounded-xl p-4 sm:p-5 md:p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
              onClick={handleFillManual}
            >
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-blue-100 rounded-full">
                  <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
                </div>
                <div className="w-full">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">Fill Manually</h3>
                  <p className="text-xs sm:text-sm text-gray-600 px-2">
                    Start from scratch and build your resume step by step
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Upload Status */}
            {uploadStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 sm:p-4 rounded-lg flex items-start sm:items-center gap-2 sm:gap-3 ${
                  uploadStatus === 'success' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {uploadStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
                )}
                <span className="text-xs sm:text-sm font-medium leading-relaxed">{uploadMessage}</span>
              </motion.div>
            )}

            {/* Loading State */}
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 sm:p-4 bg-blue-50 rounded-lg flex items-center gap-2 sm:gap-3"
              >
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 animate-spin flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-blue-700">
                  Processing your resume...
                </span>
              </motion.div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResumeOptionsModal;
