import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Edit, Save, X, CheckCircle } from 'lucide-react';
import { resumeSectionsAPI } from '../../../../services/api';

interface ProfileSummaryData {
  summary: string;
}

const ProfileSummary: React.FC = () => {
  const [data, setData] = useState<ProfileSummaryData>({ summary: '' });
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
      const response = await resumeSectionsAPI.getProfileSummary();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching profile summary:', error);
      setMessage({ type: 'error', text: 'Failed to load profile summary' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      await resumeSectionsAPI.updateProfileSummary({ summary: data.summary });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile summary saved successfully!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving profile summary:', error);
      setMessage({ type: 'error', text: 'Failed to save profile summary' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    fetchData();
    setIsEditing(false);
    setMessage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData({ summary: e.target.value });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
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
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Profile Summary</h2>
            <p className="text-sm text-gray-600">Write a compelling summary of your professional profile</p>
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Summary
              </label>
              <textarea
                value={data.summary}
                onChange={handleInputChange}
                placeholder="Write a compelling summary that highlights your key strengths, experience, and career objectives. This should be 2-3 paragraphs that give employers a clear picture of who you are professionally."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={8}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">Keep it professional and engaging</p>
                <span className="text-xs text-gray-400">{data.summary.length}/1000</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={handleSave}
                disabled={isSaving || !data.summary.trim()}
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
          <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            {data.summary ? (
              <div className="prose prose-sm max-w-none">
                {data.summary.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-900 mb-3 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Add a compelling professional summary that highlights your key strengths, experience, and career objectives
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSummary;
