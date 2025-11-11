import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Search, AlertCircle } from 'lucide-react';
import './NotFound.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSearchJobs = () => {
    navigate('/jobs');
  };

  return (
    <div className="not-found-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="not-found-container"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="error-icon"
        >
          <AlertCircle className="icon" />
        </motion.div>

        {/* Error Content */}
        <div className="error-content">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="error-title"
          >
            404
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="error-subtitle"
          >
            Page Not Found
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="error-description"
          >
            Sorry, the page you are looking for doesn't exist or has been moved.
            <br />
            Let's get you back on track!
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="error-actions"
        >
          <button 
            className="action-btn action-btn--primary"
            onClick={handleGoHome}
          >
            <Home className="btn-icon" />
            <span>Go Home</span>
          </button>
          
          <button 
            className="action-btn action-btn--secondary"
            onClick={handleGoBack}
          >
            <ArrowLeft className="btn-icon" />
            <span>Go Back</span>
          </button>
          
          <button 
            className="action-btn action-btn--tertiary"
            onClick={handleSearchJobs}
          >
            <Search className="btn-icon" />
            <span>Search Jobs</span>
          </button>
        </motion.div>

        {/* Helpful Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="helpful-links"
        >
          <h3 className="links-title">Popular Pages</h3>
          <div className="links-grid">
            <button 
              className="link-item"
              onClick={() => navigate('/jobs')}
            >
              <Search className="link-icon" />
              <span>Browse Jobs</span>
            </button>
            
            <button 
              className="link-item"
              onClick={() => navigate('/about')}
            >
              <AlertCircle className="link-icon" />
              <span>About Us</span>
            </button>
            
            <button 
              className="link-item"
              onClick={() => navigate('/contact')}
            >
              <AlertCircle className="link-icon" />
              <span>Contact Us</span>
            </button>
            
            <button 
              className="link-item"
              onClick={() => navigate('/login')}
            >
              <AlertCircle className="link-icon" />
              <span>Login</span>
            </button>
          </div>
        </motion.div>

        {/* Background Elements */}
        <div className="error-background">
          <div className="error-shape error-shape--1"></div>
          <div className="error-shape error-shape--2"></div>
          <div className="error-shape error-shape--3"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
