import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, X, FileCheck } from 'lucide-react';

interface CreateResumePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadResume: (file: File) => void;
  onFillManually: () => void;
}

const CreateResumePopup: React.FC<CreateResumePopupProps> = ({
  isOpen,
  onClose,
  onUploadResume,
  onFillManually
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (file: File) => {
    if (file && (file.type === 'application/pdf' || 
                 file.type === 'application/msword' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      onUploadResume(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto border border-gray-100 relative"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create Your Resume</h2>
                <p className="text-xs text-gray-600">Choose how you'd like to get started</p>
              </div>
            </div>
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={onClose}
              aria-label="Close popup"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            {/* Upload Resume Option */}
            <motion.div
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 cursor-pointer ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                  : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              }`}
              tabIndex={0}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-full transition-colors duration-300 ${
                  dragActive ? 'bg-blue-200' : 'bg-blue-100'
                }`}>
                  <Upload size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Upload Resume</h3>
                  <p className="text-xs text-gray-600 mb-2">Upload your existing resume and we'll automatically fill in the details</p>
                  <div className="text-xs text-gray-500">Supports PDF, DOC, DOCX files (max 5MB)</div>
                </div>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileInput}
              />
            </motion.div>

            {/* Fill Manually Option */}
            <motion.div
              className="border-2 border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer"
              tabIndex={0}
              onClick={onFillManually}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileCheck size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Fill Manually</h3>
                  <p className="text-xs text-gray-600">Start from scratch and build your resume step by step</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateResumePopup;
