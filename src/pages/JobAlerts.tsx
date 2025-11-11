import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Mail, 
  Settings, 
  Plus,
  X,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Check
} from 'lucide-react';
import './JobAlerts.css';

interface JobAlert {
  id: string;
  title: string;
  keywords: string[];
  location: string;
  jobType: string;
  salaryRange: string;
  frequency: string;
  isActive: boolean;
  createdAt: string;
}

const JobAlerts: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    keywords: '',
    location: '',
    jobType: '',
    salaryRange: '',
    frequency: 'daily'
  });

  const [alerts, setAlerts] = useState<JobAlert[]>([
    {
      id: '1',
      title: 'Frontend Developer Jobs',
      keywords: ['React', 'JavaScript', 'Frontend'],
      location: 'Remote',
      jobType: 'Full-time',
      salaryRange: '$70,000+',
      frequency: 'daily',
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Data Science Opportunities',
      keywords: ['Python', 'Machine Learning', 'Data Science'],
      location: 'New York',
      jobType: 'Any',
      salaryRange: '$90,000+',
      frequency: 'weekly',
      isActive: true,
      createdAt: '2024-01-10'
    }
  ]);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: JobAlert = {
      id: Date.now().toString(),
      title: formData.title,
      keywords: formData.keywords.split(',').map(k => k.trim()),
      location: formData.location,
      jobType: formData.jobType,
      salaryRange: formData.salaryRange,
      frequency: formData.frequency,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAlerts([...alerts, newAlert]);
    setFormData({
      title: '',
      keywords: '',
      location: '',
      jobType: '',
      salaryRange: '',
      frequency: 'daily'
    });
    setShowCreateForm(false);
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <div className="job-alerts-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="job-alerts-container"
      >
        {/* Header */}
        <div className="alerts-header">
          <div className="header-content">
            <h1 className="page-title">Free Job Alerts</h1>
            <p className="page-subtitle">
              Get notified about new job opportunities that match your criteria
            </p>
          </div>
          <button 
            className="create-alert-btn"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="btn-icon" />
            Create Alert
          </button>
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="benefits-section"
        >
          <div className="benefits-grid">
            <div className="benefit-item">
              <Bell className="benefit-icon" />
              <h3>Instant Notifications</h3>
              <p>Get notified as soon as jobs matching your criteria are posted</p>
            </div>
            <div className="benefit-item">
              <Mail className="benefit-icon" />
              <h3>Email Alerts</h3>
              <p>Receive personalized job alerts directly in your inbox</p>
            </div>
            <div className="benefit-item">
              <Settings className="benefit-icon" />
              <h3>Customizable</h3>
              <p>Set your preferences for location, salary, job type, and more</p>
            </div>
          </div>
        </motion.div>

        {/* Active Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="alerts-section"
        >
          <div className="section-header">
            <h2>Your Job Alerts</h2>
            <p>{alerts.filter(a => a.isActive).length} active alerts</p>
          </div>

          {alerts.length === 0 ? (
            <div className="empty-state">
              <Bell className="empty-icon" />
              <h3>No job alerts yet</h3>
              <p>Create your first job alert to get notified about relevant opportunities</p>
              <button 
                className="create-first-alert-btn"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="btn-icon" />
                Create Your First Alert
              </button>
            </div>
          ) : (
            <div className="alerts-list">
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`alert-card ${alert.isActive ? 'active' : 'inactive'}`}
                >
                  <div className="alert-header">
                    <div className="alert-title-section">
                      <h3 className="alert-title">{alert.title}</h3>
                      <div className="alert-status">
                        {alert.isActive ? (
                          <span className="status-active">
                            <Check className="status-icon" />
                            Active
                          </span>
                        ) : (
                          <span className="status-inactive">Paused</span>
                        )}
                      </div>
                    </div>
                    <div className="alert-actions">
                      <button 
                        className="toggle-btn"
                        onClick={() => toggleAlert(alert.id)}
                      >
                        {alert.isActive ? 'Pause' : 'Resume'}
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <X className="btn-icon" />
                      </button>
                    </div>
                  </div>

                  <div className="alert-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <Briefcase className="detail-icon" />
                        <span>Keywords: {alert.keywords.join(', ')}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin className="detail-icon" />
                        <span>Location: {alert.location}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-item">
                        <DollarSign className="detail-icon" />
                        <span>Salary: {alert.salaryRange}</span>
                      </div>
                      <div className="detail-item">
                        <Clock className="detail-icon" />
                        <span>Frequency: {alert.frequency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="alert-footer">
                    <span className="created-date">Created: {alert.createdAt}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Create Alert Form Modal */}
        {showCreateForm && (
          <div className="modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="modal"
            >
              <div className="modal-header">
                <h3>Create Job Alert</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  <X className="btn-icon" />
                </button>
              </div>

              <form onSubmit={handleCreateAlert} className="alert-form">
                <div className="form-group">
                  <label className="form-label">Alert Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Frontend Developer Jobs"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., React, JavaScript, Frontend"
                    value={formData.keywords}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      placeholder="City, State, or Remote"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Job Type</label>
                    <select
                      value={formData.jobType}
                      onChange={(e) => setFormData({...formData, jobType: e.target.value})}
                      className="form-select"
                    >
                      <option value="">Any</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Minimum Salary</label>
                    <select
                      value={formData.salaryRange}
                      onChange={(e) => setFormData({...formData, salaryRange: e.target.value})}
                      className="form-select"
                    >
                      <option value="">Any</option>
                      <option value="$40,000+">$40,000+</option>
                      <option value="$60,000+">$60,000+</option>
                      <option value="$80,000+">$80,000+</option>
                      <option value="$100,000+">$100,000+</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Alert Frequency</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                      className="form-select"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    <Bell className="btn-icon" />
                    Create Alert
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default JobAlerts;
