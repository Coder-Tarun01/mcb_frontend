import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Edit, Save, X, CheckCircle, MapPin, Clock, DollarSign } from 'lucide-react';
import { resumeSectionsAPI } from '../../../../services/api';

interface DesiredCareerProfileData {
  jobType: string;
  preferredLocation: string;
  noticePeriod: string;
  expectedSalary: string;
  currency: string;
  workMode: string;
  industry: string;
  careerObjective: string;
}

const DesiredCareerProfile: React.FC = () => {
  const [data, setData] = useState<DesiredCareerProfileData>({
    jobType: '',
    preferredLocation: '',
    noticePeriod: '',
    expectedSalary: '',
    currency: 'INR',
    workMode: '',
    industry: '',
    careerObjective: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await resumeSectionsAPI.getDesiredCareer();
      setData(response.data.careerProfile);
    } catch (error) {
      console.error('Error fetching career profile:', error);
      setMessage({ type: 'error', text: 'Failed to load career profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      
      await resumeSectionsAPI.updateDesiredCareer({ careerProfile: data });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Career profile saved successfully!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving career profile:', error);
      setMessage({ type: 'error', text: 'Failed to save career profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    fetchData();
    setIsEditing(false);
    setMessage(null);
  };

  const handleInputChange = (field: keyof DesiredCareerProfileData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Desired Career Profile</h2>
            <p className="text-sm text-gray-600">Define your career goals and job preferences</p>
          </div>
        </div>
        
        {!isEditing && (
          <motion.button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit className="w-4 h-4" />
            Edit
          </motion.button>
        )}
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          {message.text}
        </motion.div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  value={data.jobType}
                  onChange={(e) => handleInputChange('jobType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select job type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
                <select
                  value={data.workMode}
                  onChange={(e) => handleInputChange('workMode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select work mode</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location</label>
                <input
                  type="text"
                  value={data.preferredLocation}
                  onChange={(e) => handleInputChange('preferredLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  value={data.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
                <select
                  value={data.noticePeriod}
                  onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select notice period</option>
                  <option value="Immediate">Immediate</option>
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="2 months">2 months</option>
                  <option value="3 months">3 months</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={data.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-auto"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                  <input
                    type="text"
                    value={data.expectedSalary}
                    onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Career Objective</label>
              <textarea
                value={data.careerObjective}
                onChange={(e) => handleInputChange('careerObjective', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Describe your career goals and what you're looking for in your next role..."
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </motion.button>
              
              <motion.button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4" />
                Cancel
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Job Type</p>
                    <p className="font-medium text-gray-900">{data.jobType || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Preferred Location</p>
                    <p className="font-medium text-gray-900">{data.preferredLocation || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Notice Period</p>
                    <p className="font-medium text-gray-900">{data.noticePeriod || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Expected Salary</p>
                    <p className="font-medium text-gray-900">
                      {data.expectedSalary ? `${data.currency} ${data.expectedSalary}` : 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Work Mode</p>
                    <p className="font-medium text-gray-900">{data.workMode || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Industry</p>
                    <p className="font-medium text-gray-900">{data.industry || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {data.careerObjective && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Career Objective</h3>
                <p className="text-gray-900">{data.careerObjective}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesiredCareerProfile;
