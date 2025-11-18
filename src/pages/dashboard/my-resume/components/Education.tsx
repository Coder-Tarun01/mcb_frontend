import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Edit, Save, X, Plus, Trash2, CheckCircle, Calendar, MapPin } from 'lucide-react';
import { resumeSectionsAPI } from '../../../../services/api';

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  gpa?: string;
  description?: string;
}

interface EducationData {
  education: EducationItem[];
}

const Education: React.FC = () => {
  const [data, setData] = useState<EducationData>({ education: [] });
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
      const response = await resumeSectionsAPI.getEducation();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching education:', error);
      setMessage({ type: 'error', text: 'Failed to load education history' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      await resumeSectionsAPI.updateEducation({ education: data.education });
      setIsEditing(false);
      setEditingId(null);
      setMessage({ type: 'success', text: 'Education history saved successfully!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving education:', error);
      setMessage({ type: 'error', text: 'Failed to save education history' });
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

  const addEducation = () => {
    const newEducation: EducationItem = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      gpa: '',
      description: ''
    };
    
    setData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
    setEditingId(newEducation.id);
    setIsEditing(true);
  };

  const removeEducation = (id: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string | boolean) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
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

  const getDegreeIcon = (degree: string) => {
    if (degree.toLowerCase().includes('phd') || degree.toLowerCase().includes('doctorate')) {
      return '🎓';
    } else if (degree.toLowerCase().includes('master')) {
      return '🎓';
    } else if (degree.toLowerCase().includes('bachelor')) {
      return '🎓';
    } else if (degree.toLowerCase().includes('diploma')) {
      return '📜';
    } else if (degree.toLowerCase().includes('certificate')) {
      return '📜';
    }
    return '🎓';
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
          <div className="p-2 bg-indigo-100 rounded-lg">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Education</h2>
            <p className="text-sm text-gray-600">Add your academic qualifications and achievements</p>
          </div>
        </div>
        
        {!isEditing && (
          <motion.button
            onClick={addEducation}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            Add Education
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
        {data.education.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {data.education.map((education, index) => (
                <motion.div
                  key={education.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  {editingId === education.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                          <input
                            type="text"
                            value={education.institution}
                            onChange={(e) => updateEducation(education.id, 'institution', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="University/School name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                          <select
                            value={education.degree}
                            onChange={(e) => updateEducation(education.id, 'degree', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value="">Select degree</option>
                            <option value="High School">High School</option>
                            <option value="Associate">Associate Degree</option>
                            <option value="Bachelor">Bachelor's Degree</option>
                            <option value="Master">Master's Degree</option>
                            <option value="PhD">PhD/Doctorate</option>
                            <option value="Diploma">Diploma</option>
                            <option value="Certificate">Certificate</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                          <input
                            type="text"
                            value={education.field}
                            onChange={(e) => updateEducation(education.id, 'field', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="e.g., Computer Science, Business Administration"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input
                            type="text"
                            value={education.location}
                            onChange={(e) => updateEducation(education.id, 'location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="City, Country"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={education.startDate}
                            onChange={(e) => updateEducation(education.id, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            value={education.endDate}
                            onChange={(e) => updateEducation(education.id, 'endDate', e.target.value)}
                            disabled={education.isCurrent}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">GPA (Optional)</label>
                          <input
                            type="text"
                            value={education.gpa || ''}
                            onChange={(e) => updateEducation(education.id, 'gpa', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="e.g., 3.8/4.0"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`current-edu-${education.id}`}
                            checked={education.isCurrent}
                            onChange={(e) => updateEducation(education.id, 'isCurrent', e.target.checked)}
                            className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`current-edu-${education.id}`} className="text-sm font-medium text-gray-700">
                            Currently studying
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                          value={education.description || ''}
                          onChange={(e) => updateEducation(education.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          rows={3}
                          placeholder="Relevant coursework, achievements, or honors..."
                        />
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-lg">{getDegreeIcon(education.degree)}</span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {education.degree} {education.field && `in ${education.field}`}
                            </h3>
                          </div>
                          <p className="text-gray-600 font-medium">{education.institution}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(education.startDate)} - {education.isCurrent ? 'Present' : formatDate(education.endDate)}
                            </div>
                            {education.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {education.location}
                              </div>
                            )}
                            {education.gpa && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">GPA: {education.gpa}</span>
                              </div>
                            )}
                          </div>
                          {education.description && (
                            <p className="mt-2 text-gray-700 text-sm">{education.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => setEditingId(education.id)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => removeEducation(education.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto justify-center"
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
            <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No education history added yet</p>
            <p className="text-sm text-gray-400">Add your academic qualifications and achievements</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Education;
