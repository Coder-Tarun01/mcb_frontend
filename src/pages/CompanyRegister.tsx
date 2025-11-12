import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  FileText,
  Save,
  Upload,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './CompanyRegister.css';

interface VerificationItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  action?: string;
}

const CompanyRegister: React.FC = () => {
  const navigate = useNavigate();
  const { user, isEmployer } = useAuth();

  const [formData, setFormData] = useState({
    businessRegNumber: '',
    taxId: '',
    businessType: 'Corporation',
    companyPhone: '',
    verificationCode: ''
  });

  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([
    {
      id: 'email',
      title: 'Email Verification',
      description: 'Your email address has been verified',
      status: 'completed'
    },
    {
      id: 'documents',
      title: 'Company Documents',
      description: 'Upload business registration documents',
      status: 'pending',
      action: 'upload'
    },
    {
      id: 'phone',
      title: 'Phone Verification',
      description: 'Verify your company phone number',
      status: 'pending',
      action: 'verify'
    }
  ]);

  React.useEffect(() => {
    if (!user || !isEmployer()) {
      navigate('/login');
      return;
    }
  }, [user, navigate, isEmployer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentUpload = () => {
    // Simulate document upload
    setVerificationItems(prev =>
      prev.map(item =>
        item.id === 'documents'
          ? { ...item, status: 'completed' as const, description: 'Business documents uploaded successfully' }
          : item
      )
    );
  };

  const handlePhoneVerification = () => {
    if (!formData.companyPhone) {
      alert('Please enter your company phone number first');
      return;
    }
    // Simulate phone verification
    setVerificationItems(prev =>
      prev.map(item =>
        item.id === 'phone'
          ? { ...item, status: 'completed' as const, description: 'Phone number verified successfully' }
          : item
      )
    );
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.businessRegNumber || !formData.taxId) {
      alert('Please fill in all required fields');
      return;
    }

    // Simulate save
    console.log('Saving registration data:', formData);
    alert('Registration information saved successfully!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="status-icon completed" />;
      case 'failed':
        return <AlertCircle className="status-icon failed" />;
      default:
        return <Clock className="status-icon pending" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'verification-item completed';
      case 'failed':
        return 'verification-item failed';
      default:
        return 'verification-item pending';
    }
  };

  return (
    <div className="company-register-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="register-container"
      >
        <div className="register-header">
          <button onClick={() => navigate('/employer/dashboard')} className="back-btn">
            <ArrowLeft className="btn-icon" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="page-title">Company Registration</h1>
          <p className="page-subtitle">
            Complete your company registration and verification process to access all features.
          </p>
        </div>

        <div className="register-content">
          {/* Verification Status Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="verification-section"
          >
            <div className="section-header">
              <Shield className="section-icon" />
              <h2 className="section-title">Verification Status</h2>
              <p className="section-subtitle">Track your verification progress</p>
            </div>
            
            <div className="verification-items">
              {verificationItems.map((item) => (
                <div key={item.id} className={getStatusClass(item.status)}>
                  <div className="verification-status">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="verification-content">
                    <h4 className="verification-title">{item.title}</h4>
                    <p className="verification-description">{item.description}</p>
                  </div>
                  {item.action && item.status === 'pending' && (
                    <div className="verification-action">
                      {item.action === 'upload' && (
                        <button onClick={handleDocumentUpload} className="action-btn upload-btn">
                          <Upload className="btn-icon" />
                          <span>Upload</span>
                        </button>
                      )}
                      {item.action === 'verify' && (
                        <button onClick={handlePhoneVerification} className="action-btn verify-btn">
                          <Phone className="btn-icon" />
                          <span>Verify</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Legal Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="legal-section"
          >
            <div className="section-header">
              <FileText className="section-icon" />
              <h2 className="section-title">Legal Information</h2>
              <p className="section-subtitle">Provide your company's legal details</p>
            </div>
            
            <div className="form-container">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="businessRegNumber">
                    Business Registration Number *
                  </label>
                  <input
                    type="text"
                    id="businessRegNumber"
                    name="businessRegNumber"
                    value={formData.businessRegNumber}
                    onChange={handleInputChange}
                    placeholder="Enter registration number"
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="taxId">
                    Tax ID / EIN *
                  </label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    placeholder="Enter tax identification number"
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="businessType">
                    Business Type
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Corporation">Corporation</option>
                    <option value="LLC">LLC</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Non-Profit">Non-Profit</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="companyPhone">
                    Company Phone Number
                  </label>
                  <input
                    type="tel"
                    id="companyPhone"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button onClick={handleSave} className="save-btn primary-btn">
                  <Save className="btn-icon" />
                  <span>Save Information</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Registration Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="progress-section"
          >
            <div className="progress-header">
              <h3 className="progress-title">Registration Progress</h3>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${(verificationItems.filter(item => item.status === 'completed').length / verificationItems.length) * 100}%` 
                }}
              ></div>
            </div>
            <p className="progress-text">
              {verificationItems.filter(item => item.status === 'completed').length} of {verificationItems.length} steps completed
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CompanyRegister;
