import React, { useState, useEffect } from 'react';
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
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { jobsAPI } from '../../services/api';
import { Job } from '../../types/job';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call to create job alert
      // In a real app, you would call an API endpoint like:
      // await jobAlertsAPI.createAlert(formData);
      
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
      setSuccessMessage('Job alert created successfully!');
      setFormData({
        title: '',
        keywords: '',
        location: '',
        jobType: '',
        salaryRange: '',
        frequency: 'daily'
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating job alert:', err);
      setError('Failed to create job alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAlert = async (id: string) => {
    try {
      setLoading(true);
      // In a real app, you would call an API endpoint like:
      // await jobAlertsAPI.toggleAlert(id);
      
      setAlerts(alerts.map(alert => 
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
      ));
      setSuccessMessage('Alert status updated successfully!');
    } catch (err) {
      console.error('Error toggling alert:', err);
      setError('Failed to update alert status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job alert?')) {
      return;
    }
    
    try {
      setLoading(true);
      // In a real app, you would call an API endpoint like:
      // await jobAlertsAPI.deleteAlert(id);
      
      setAlerts(alerts.filter(alert => alert.id !== id));
      setSuccessMessage('Job alert deleted successfully!');
    } catch (err) {
      console.error('Error deleting alert:', err);
      setError('Failed to delete job alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-green-100 text-green-800 py-4 px-5 rounded-lg mb-5 border border-green-200 relative"
          >
            <Check className="w-5 h-5 flex-shrink-0 text-green-500" />
            <span>{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-none border-none text-green-800 text-lg cursor-pointer p-1 hover:opacity-70"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-red-100 text-red-800 py-4 px-5 rounded-lg mb-5 border border-red-200 relative"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-none border-none text-red-800 text-lg cursor-pointer p-1 hover:opacity-70"
            >
              ×
            </button>
          </motion.div>
        )}
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-10">
          <div className="header-content">
            <h1 className="text-5xl font-bold text-gray-800 m-0 mb-3 bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent">
              Free Job Alerts
            </h1>
            <p className="text-lg text-gray-500 m-0 font-medium">
              Get notified about new job opportunities that match your criteria
            </p>
          </div>
          <button 
            className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none rounded-xl py-3.5 px-6 text-base font-semibold cursor-pointer transition-all duration-300 shadow-md shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-4.5 h-4.5" />
            Create Alert
          </button>
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 text-center shadow-md shadow-black/5 border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10">
              <Bell className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-xl font-bold text-gray-800 m-0 mb-3">
                Instant Notifications
              </h3>
              <p className="text-sm text-gray-500 m-0 leading-relaxed">
                Get notified as soon as jobs matching your criteria are posted
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 text-center shadow-md shadow-black/5 border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10">
              <Mail className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-xl font-bold text-gray-800 m-0 mb-3">
                Email Alerts
              </h3>
              <p className="text-sm text-gray-500 m-0 leading-relaxed">
                Receive personalized job alerts directly in your inbox
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 text-center shadow-md shadow-black/5 border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10">
              <Settings className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-xl font-bold text-gray-800 m-0 mb-3">
                Customizable
              </h3>
              <p className="text-sm text-gray-500 m-0 leading-relaxed">
                Set your preferences for location, salary, job type, and more
              </p>
            </div>
          </div>
        </motion.div>

        {/* Active Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-md shadow-black/5 border border-gray-200"
        >
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 m-0">
              Your Job Alerts
            </h2>
            <p className="text-sm text-gray-500 m-0">
              {alerts.filter(a => a.isActive).length} active alerts
            </p>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12 px-6 text-gray-500">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 m-0 mb-2">
                No job alerts yet
              </h3>
              <p className="text-sm m-0 mb-6">
                Create your first job alert to get notified about relevant opportunities
              </p>
              <button 
                className="inline-flex items-center gap-2 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none rounded-xl py-3.5 px-6 text-base font-semibold cursor-pointer transition-all duration-300 shadow-md shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-4.5 h-4.5" />
                Create Your First Alert
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`bg-slate-50 rounded-xl p-6 border border-gray-200 transition-all duration-300 ${alert.isActive ? 'bg-white border-blue-500' : 'opacity-70'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 m-0 mb-2">
                        {alert.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        {alert.isActive ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-semibold uppercase tracking-wider">
                            <Check className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                            Paused
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="bg-gray-100 text-gray-700 border border-gray-300 rounded-md py-1.5 px-3 text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-gray-200"
                        onClick={() => toggleAlert(alert.id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        ) : (
                          alert.isActive ? 'Pause' : 'Resume'
                        )}
                      </button>
                      <button 
                        className="bg-red-100 text-red-600 border border-red-200 rounded-md py-1.5 px-2 cursor-pointer transition-all duration-200 hover:bg-red-200"
                        onClick={() => deleteAlert(alert.id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        ) : (
                          <X className="w-4.5 h-4.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span>Keywords: {alert.keywords.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>Location: {alert.location}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>Salary: {alert.salaryRange}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Frequency: {alert.frequency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <span className="text-xs text-gray-400">
                      Created: {alert.createdAt}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Create Alert Form Modal */}
        {showCreateForm && (
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex justify-center items-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-11/12 max-h-screen overflow-y-auto shadow-xl shadow-black/15"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 m-0">
                  Create Job Alert
                </h3>
                <button 
                  className="bg-none border-none cursor-pointer p-1 text-gray-500 transition-colors duration-200 hover:text-gray-700"
                  onClick={() => setShowCreateForm(false)}
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleCreateAlert} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Alert Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Frontend Developer Jobs"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 transition-all duration-300 outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., React, JavaScript, Frontend"
                    value={formData.keywords}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 transition-all duration-300 outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="City, State, or Remote"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="py-3 px-4 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 transition-all duration-300 outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Job Type
                    </label>
                    <select
                      value={formData.jobType}
                      onChange={(e) => setFormData({...formData, jobType: e.target.value})}
                      className="py-3 px-4 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 transition-all duration-300 outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10"
                    >
                      <option value="">Any</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Minimum Salary
                    </label>
                    <select
                      value={formData.salaryRange}
                      onChange={(e) => setFormData({...formData, salaryRange: e.target.value})}
                      className="py-3 px-4 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 transition-all duration-300 outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10"
                    >
                      <option value="">Any</option>
                      <option value="$40,000+">$40,000+</option>
                      <option value="$60,000+">$60,000+</option>
                      <option value="$80,000+">$80,000+</option>
                      <option value="$100,000+">$100,000+</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Alert Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                      className="py-3 px-4 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 transition-all duration-300 outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-2">
                  <button 
                    type="button" 
                    className="bg-white text-gray-700 border-2 border-gray-200 rounded-lg py-3 px-6 text-sm font-semibold cursor-pointer transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none rounded-lg py-3 px-6 text-sm font-semibold cursor-pointer transition-all duration-300 shadow-md shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <Bell className="w-4.5 h-4.5" />
                    )}
                    {loading ? 'Creating...' : 'Create Alert'}
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
