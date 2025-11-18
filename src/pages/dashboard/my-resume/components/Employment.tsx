import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Edit, Save, X, Plus, Trash2, CheckCircle, Calendar, MapPin } from 'lucide-react';
import { resumeSectionsAPI } from '../../../../services/api';

interface EmploymentItem {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

interface EmploymentData {
  employment: EmploymentItem[];
}

const Employment: React.FC = () => {
  const [data, setData] = useState<EmploymentData>({ employment: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await resumeSectionsAPI.getEmployment();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching employment:', error);
      setMessage({ type: 'error', text: 'Failed to load employment history' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      await resumeSectionsAPI.updateEmployment({ employment: data.employment });
      setIsEditing(false);
      setEditingId(null);
      setMessage({ type: 'success', text: 'Employment history saved successfully!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving employment:', error);
      setMessage({ type: 'error', text: 'Failed to save employment history' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    fetchData();
    setIsEditing(false);
    setEditingId(null);
    setMessage(null);
  };

  const addEmployment = () => {
    const newEmployment: EmploymentItem = {
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: ''
    };
    
    setData(prev => ({
      ...prev,
      employment: [...prev.employment, newEmployment]
    }));
    setEditingId(newEmployment.id);
    setIsEditing(true);
  };

  const removeEmployment = (id: string) => {
    setData(prev => ({
      ...prev,
      employment: prev.employment.filter(emp => emp.id !== id)
    }));
  };

  const updateEmployment = (id: string, field: keyof EmploymentItem, value: string | boolean) => {
    setData(prev => ({
      ...prev,
      employment: prev.employment.map(emp =>
        emp.id === id ? { ...emp, [field]: value } : emp
      )
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const calculateDuration = (startDate: string, endDate: string, isCurrent: boolean) => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const end = isCurrent ? new Date() : new Date(endDate);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0 && months > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
    } else if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Employment History</h2>
            <p className="text-sm text-gray-600">Add your work experience and career progression</p>
          </div>
        </div>
        
        {!isEditing && (
          <motion.button
            onClick={addEmployment}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            Add Experience
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
        {data.employment.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {data.employment.map((employment, index) => (
                <motion.div
                  key={employment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  {editingId === employment.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                          <input
                            type="text"
                            value={employment.company}
                            onChange={(e) => updateEmployment(employment.id, 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Company name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                          <input
                            type="text"
                            value={employment.position}
                            onChange={(e) => updateEmployment(employment.id, 'position', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Job title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input
                            type="text"
                            value={employment.location}
                            onChange={(e) => updateEmployment(employment.id, 'location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="City, Country"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={employment.startDate}
                            onChange={(e) => updateEmployment(employment.id, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            value={employment.endDate}
                            onChange={(e) => updateEmployment(employment.id, 'endDate', e.target.value)}
                            disabled={employment.isCurrent}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`current-${employment.id}`}
                            checked={employment.isCurrent}
                            onChange={(e) => updateEmployment(employment.id, 'isCurrent', e.target.checked)}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`current-${employment.id}`} className="text-sm font-medium text-gray-700">
                            Currently working here
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={employment.description}
                          onChange={(e) => updateEmployment(employment.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                          placeholder="Describe your role and achievements..."
                        />
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{employment.position}</h3>
                          <p className="text-gray-600 font-medium">{employment.company}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(employment.startDate)} - {employment.isCurrent ? 'Present' : formatDate(employment.endDate)}
                              {employment.startDate && (
                                <span className="ml-2 text-gray-400">
                                  ({calculateDuration(employment.startDate, employment.endDate, employment.isCurrent)})
                                </span>
                              )}
                            </div>
                            {employment.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {employment.location}
                              </div>
                            )}
                          </div>
                          {employment.description && (
                            <p className="mt-2 text-gray-700 text-sm">{employment.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => setEditingId(employment.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => removeEmployment(employment.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save All'}
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
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No employment history added yet</p>
            <p className="text-sm text-gray-400">Add your work experience to showcase your career</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employment;
