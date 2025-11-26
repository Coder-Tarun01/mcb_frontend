import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Edit, Save, X, Plus, Trash2, CheckCircle, Calendar } from 'lucide-react';
import { resumeSectionsAPI } from '../../../../services/api';

interface Accomplishment {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'Award' | 'Certification' | 'Achievement' | 'Recognition';
  issuer?: string;
}

interface AccomplishmentsData {
  accomplishments: Accomplishment[];
}

const Accomplishments: React.FC = () => {
  const [data, setData] = useState<AccomplishmentsData>({ accomplishments: [] });
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
      const response = await resumeSectionsAPI.getAccomplishments();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching accomplishments:', error);
      setMessage({ type: 'error', text: 'Failed to load accomplishments' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      await resumeSectionsAPI.updateAccomplishments({ accomplishments: data.accomplishments });
      setIsEditing(false);
      setEditingId(null);
      setMessage({ type: 'success', text: 'Accomplishments saved successfully!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving accomplishments:', error);
      setMessage({ type: 'error', text: 'Failed to save accomplishments' });
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

  const addAccomplishment = () => {
    const newAccomplishment: Accomplishment = {
      id: Date.now().toString(),
      title: '',
      description: '',
      date: '',
      type: 'Achievement',
      issuer: ''
    };
    
    setData(prev => ({
      ...prev,
      accomplishments: [...prev.accomplishments, newAccomplishment]
    }));
    setEditingId(newAccomplishment.id);
    setIsEditing(true);
  };

  const removeAccomplishment = (id: string) => {
    setData(prev => ({
      ...prev,
      accomplishments: prev.accomplishments.filter(acc => acc.id !== id)
    }));
  };

  const updateAccomplishment = (id: string, field: keyof Accomplishment, value: string) => {
    setData(prev => ({
      ...prev,
      accomplishments: prev.accomplishments.map(acc =>
        acc.id === id ? { ...acc, [field]: value } : acc
      )
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Award': return '🏆';
      case 'Certification': return '📜';
      case 'Achievement': return '⭐';
      case 'Recognition': return '👏';
      default: return '🏆';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Award': return 'bg-blue-100 text-blue-800';
      case 'Certification': return 'bg-blue-100 text-blue-800';
      case 'Achievement': return 'bg-blue-100 text-blue-800';
      case 'Recognition': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 w-full">
        <div className="flex items-start sm:items-center gap-3 w-full">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Award className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h2 className="text-xl font-semibold text-gray-900 leading-tight">Accomplishments</h2>
            <p className="text-sm text-gray-600 mt-1">Showcase your awards, certifications, and achievements</p>
          </div>
        </div>
        
        {!isEditing && (
          <motion.button
            onClick={addAccomplishment}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            Add Accomplishment
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
        {data.accomplishments.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {data.accomplishments.map((accomplishment, index) => (
                <motion.div
                  key={accomplishment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  {editingId === accomplishment.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={accomplishment.title}
                            onChange={(e) => updateAccomplishment(accomplishment.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Accomplishment title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={accomplishment.type}
                            onChange={(e) => updateAccomplishment(accomplishment.id, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          >
                            <option value="Award">Award</option>
                            <option value="Certification">Certification</option>
                            <option value="Achievement">Achievement</option>
                            <option value="Recognition">Recognition</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <input
                            type="date"
                            value={accomplishment.date}
                            onChange={(e) => updateAccomplishment(accomplishment.id, 'date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Issuer (Optional)</label>
                          <input
                            type="text"
                            value={accomplishment.issuer || ''}
                            onChange={(e) => updateAccomplishment(accomplishment.id, 'issuer', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Organization or institution"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={accomplishment.description}
                          onChange={(e) => updateAccomplishment(accomplishment.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          rows={3}
                          placeholder="Describe the accomplishment and its significance..."
                        />
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-lg">{getTypeIcon(accomplishment.type)}</span>
                            <h3 className="text-lg font-semibold text-gray-900">{accomplishment.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(accomplishment.type)}`}>
                              {accomplishment.type}
                            </span>
                          </div>
                          {accomplishment.issuer && (
                            <p className="text-gray-600 font-medium">{accomplishment.issuer}</p>
                          )}
                          <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {formatDate(accomplishment.date)}
                          </div>
                          {accomplishment.description && (
                            <p className="mt-2 text-gray-700 text-sm">{accomplishment.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2 w-full md:w-auto justify-end">
                          <motion.button
                            onClick={() => setEditingId(accomplishment.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => removeAccomplishment(accomplishment.id)}
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
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No accomplishments added yet</p>
            <p className="text-sm text-gray-400">Showcase your awards, certifications, and achievements</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Accomplishments;
