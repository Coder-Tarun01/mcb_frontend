import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Edit, Save, X, Plus, Trash2, CheckCircle } from 'lucide-react';
import { resumeSectionsAPI } from '../../../../services/api';

interface Skill {
  id: string;
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface SkillsData {
  skills: Skill[];
}

const Skills: React.FC = () => {
  const [data, setData] = useState<SkillsData>({ skills: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'Intermediate' as const });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await resumeSectionsAPI.getSkills();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setMessage({ type: 'error', text: 'Failed to load skills' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      await resumeSectionsAPI.updateSkills({ skills: data.skills });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Skills saved successfully!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving skills:', error);
      setMessage({ type: 'error', text: 'Failed to save skills' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    fetchData();
    setIsEditing(false);
    setMessage(null);
  };

  const addSkill = () => {
    if (newSkill.name.trim()) {
      const skill: Skill = {
        id: Date.now().toString(),
        name: newSkill.name.trim(),
        proficiency: newSkill.proficiency
      };
      
      setData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      
      setNewSkill({ name: '', proficiency: 'Intermediate' });
    }
  };

  const removeSkill = (id: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'Beginner': return 'bg-blue-100 text-blue-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-blue-100 text-blue-800';
      case 'Expert': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
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
            <Code className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
            <p className="text-sm text-gray-600">Add your technical and professional skills</p>
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
            {/* Add New Skill */}
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Skill</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter skill name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <select
                  value={newSkill.proficiency}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, proficiency: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <motion.button
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Skills List */}
            <div className="space-y-2">
              <AnimatePresence>
                {data.skills.map((skill) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <select
                      value={skill.proficiency}
                      onChange={(e) => updateSkill(skill.id, 'proficiency', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <motion.button
                      onClick={() => removeSkill(skill.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
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
            {data.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <span className="font-medium text-gray-900">{skill.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(skill.proficiency)}`}>
                      {skill.proficiency}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No skills added yet</p>
                <p className="text-sm text-gray-400">Add your technical and professional skills</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills;
