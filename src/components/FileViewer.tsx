import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Maximize2, Minimize2, RotateCw } from 'lucide-react';
import { cvAPI } from '../services/cvApi';
import toast from 'react-hot-toast';
import './FileViewer.css';

interface FileViewerProps {
  fileId: string;
  fileName: string;
  fileType: string;
  isOpen: boolean;
  onClose: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileId, fileName, fileType, isOpen, onClose }) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isOpen && fileId) {
      loadFile();
    }
  }, [isOpen, fileId]);

  const loadFile = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await cvAPI.viewCVFile(fileId);
      setFileUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to load file');
      toast.error('Failed to load file for viewing');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await cvAPI.downloadCVFile(fileId);
      toast.success('Download started');
    } catch (err: any) {
      toast.error('Failed to download file');
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleClose = () => {
    if (fileUrl) {
      window.URL.revokeObjectURL(fileUrl);
    }
    setFileUrl(null);
    setError(null);
    setRotation(0);
    setIsFullscreen(false);
    onClose();
  };

  const renderFileContent = () => {
    if (loading) {
      return (
        <div className="file-viewer-loading">
          <div className="file-viewer-spinner"></div>
          <p>Loading file...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="file-viewer-error">
          <p>❌ {error}</p>
          <button onClick={loadFile} className="file-viewer-retry-btn">
            <RotateCw size={16} />
            Retry
          </button>
        </div>
      );
    }

    if (!fileUrl) {
      return (
        <div className="file-viewer-error">
          <p>No file to display</p>
        </div>
      );
    }

    // Determine how to display the file based on type
    if (fileType === 'application/pdf') {
      return (
        <iframe
          src={fileUrl}
          className="file-viewer-iframe"
          title={fileName}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      );
    } else if (fileType.startsWith('image/')) {
      return (
        <img
          src={fileUrl}
          alt={fileName}
          className="file-viewer-image"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      );
    } else if (fileType.includes('text/')) {
      return (
        <iframe
          src={fileUrl}
          className="file-viewer-iframe"
          title={fileName}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      );
    } else {
      // For other file types, try to display in iframe
      return (
        <iframe
          src={fileUrl}
          className="file-viewer-iframe"
          title={fileName}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`file-viewer-overlay ${isFullscreen ? 'fullscreen' : ''}`}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="file-viewer-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="file-viewer-header">
            <div className="file-viewer-title">
              <h3>{fileName}</h3>
              <span className="file-viewer-type">{fileType}</span>
            </div>
            <div className="file-viewer-actions">
              <button
                onClick={handleRotate}
                className="file-viewer-action-btn"
                title="Rotate"
              >
                <RotateCw size={16} />
              </button>
              <button
                onClick={handleFullscreen}
                className="file-viewer-action-btn"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={handleDownload}
                className="file-viewer-action-btn"
                title="Download"
              >
                <Download size={16} />
              </button>
              <button
                onClick={handleClose}
                className="file-viewer-action-btn close"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="file-viewer-content">
            {renderFileContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileViewer;
