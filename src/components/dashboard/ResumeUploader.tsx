import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';
import './ResumeUploader.css';

interface ResumeUploaderProps {
  currentResume?: string | null;
  onResumeUpload: (file: File) => void;
  onResumeRemove: () => void;
  className?: string;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  currentResume,
  onResumeUpload,
  onResumeRemove,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadError('');
    setUploadSuccess('');

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    try {
      onResumeUpload(file);
      setUploadSuccess('Resume uploaded successfully!');
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (error) {
      setUploadError('Failed to upload resume. Please try again.');
    }
  };

  const handleRemoveResume = () => {
    onResumeRemove();
    setUploadError('');
    setUploadSuccess('');
  };

  const handleDownloadResume = () => {
    if (currentResume) {
      const link = document.createElement('a');
      link.href = currentResume;
      link.download = 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`resume-uploader ${className}`}>
      <div className="uploader-header">
        <h3 className="uploader-title">Resume Management</h3>
        <p className="uploader-subtitle">
          Upload your resume to apply for jobs quickly
        </p>
      </div>

      {currentResume ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="resume-preview"
        >
          <div className="resume-info">
            <div className="resume-icon">
              <File className="file-icon" />
            </div>
            <div className="resume-details">
              <h4 className="resume-name">Current Resume</h4>
              <p className="resume-status">
                <CheckCircle className="status-icon success" />
                Resume uploaded successfully
              </p>
            </div>
          </div>
          
          <div className="resume-actions">
            <button
              onClick={handleDownloadResume}
              className="action-btn download-btn"
            >
              <Download className="action-icon" />
              <span>Download</span>
            </button>
            <button
              onClick={handleRemoveResume}
              className="action-btn remove-btn"
            >
              <X className="action-icon" />
              <span>Remove</span>
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="upload-area"
        >
          <div
            className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-content">
              <Upload className="upload-icon" />
              <h4 className="upload-title">Upload Your Resume</h4>
              <p className="upload-description">
                Drag and drop your resume here, or click to browse
              </p>
              <div className="upload-formats">
                <span className="format-tag">PDF</span>
                <span className="format-tag">DOC</span>
                <span className="format-tag">DOCX</span>
              </div>
              <p className="upload-limit">Max file size: 5MB</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="file-input"
          />
        </motion.div>
      )}

      {uploadError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="upload-message error"
        >
          <AlertCircle className="message-icon" />
          <span>{uploadError}</span>
        </motion.div>
      )}

      {uploadSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="upload-message success"
        >
          <CheckCircle className="message-icon" />
          <span>{uploadSuccess}</span>
        </motion.div>
      )}

      <div className="upload-tips">
        <h4 className="tips-title">Tips for a great resume:</h4>
        <ul className="tips-list">
          <li>Use a clear, professional format</li>
          <li>Include relevant keywords from job descriptions</li>
          <li>Keep it concise (1-2 pages)</li>
          <li>Update your contact information</li>
          <li>Proofread for spelling and grammar errors</li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeUploader;
