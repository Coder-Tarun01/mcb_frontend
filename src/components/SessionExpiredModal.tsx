import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SessionExpiredModal.css';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="session-expired-overlay"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="session-expired-modal"
      >
        <div className="modal-header">
          <div className="warning-icon">
            <AlertTriangle className="warning-icon-svg" />
          </div>
          <h2>Session Expired</h2>
        </div>
        
        <div className="modal-content">
          <p>
            Your session has expired for security reasons. Please log in again to continue.
          </p>
          <p className="security-note">
            This helps protect your account and personal information.
          </p>
        </div>
        
        <div className="modal-actions">
          <button 
            onClick={handleLogin}
            className="login-btn"
          >
            <LogIn className="btn-icon" />
            Go to Login
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SessionExpiredModal;
