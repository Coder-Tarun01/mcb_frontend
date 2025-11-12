import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Search,
  Award,
  TrendingUp,
  CheckCircle,
  Zap,
  Sparkles,
  Code,
  Layers,
  Star,
  Target,
  AlertCircle,
  Save,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../services/api';

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

interface SkillSuggestion {
  name: string;
  category: string;
  popular: boolean;
}

const SkillsManagement: React.FC = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Industry-standard skill suggestions
  const skillSuggestions: SkillSuggestion[] = [
    // Programming Languages
    { name: 'JavaScript', category: 'Programming', popular: true },
    { name: 'TypeScript', category: 'Programming', popular: true },
    { name: 'Python', category: 'Programming', popular: true },
    { name: 'Java', category: 'Programming', popular: true },
    { name: 'C++', category: 'Programming', popular: false },
    { name: 'C#', category: 'Programming', popular: false },
    { name: 'Go', category: 'Programming', popular: false },
    { name: 'Rust', category: 'Programming', popular: false },
    { name: 'PHP', category: 'Programming', popular: false },
    { name: 'Ruby', category: 'Programming', popular: false },
    
    // Frontend
    { name: 'React', category: 'Frontend', popular: true },
    { name: 'Vue.js', category: 'Frontend', popular: true },
    { name: 'Angular', category: 'Frontend', popular: true },
    { name: 'HTML/CSS', category: 'Frontend', popular: true },
    { name: 'Next.js', category: 'Frontend', popular: false },
    { name: 'Tailwind CSS', category: 'Frontend', popular: false },
    { name: 'Redux', category: 'Frontend', popular: false },
    
    // Backend
    { name: 'Node.js', category: 'Backend', popular: true },
    { name: 'Express.js', category: 'Backend', popular: false },
    { name: 'Django', category: 'Backend', popular: false },
    { name: 'Spring Boot', category: 'Backend', popular: false },
    { name: 'Laravel', category: 'Backend', popular: false },
    
    // Database
    { name: 'SQL', category: 'Database', popular: true },
    { name: 'MongoDB', category: 'Database', popular: true },
    { name: 'PostgreSQL', category: 'Database', popular: false },
    { name: 'MySQL', category: 'Database', popular: false },
    { name: 'Redis', category: 'Database', popular: false },
    
    // DevOps & Tools
    { name: 'Git', category: 'Tools', popular: true },
    { name: 'Docker', category: 'DevOps', popular: true },
    { name: 'AWS', category: 'Cloud', popular: true },
    { name: 'Azure', category: 'Cloud', popular: false },
    { name: 'Kubernetes', category: 'DevOps', popular: false },
    { name: 'CI/CD', category: 'DevOps', popular: false },
    
    // Design
    { name: 'Figma', category: 'Design', popular: true },
    { name: 'Adobe XD', category: 'Design', popular: false },
    { name: 'Photoshop', category: 'Design', popular: false },
    { name: 'Illustrator', category: 'Design', popular: false },
    
    // Soft Skills
    { name: 'Communication', category: 'Soft Skills', popular: true },
    { name: 'Leadership', category: 'Soft Skills', popular: true },
    { name: 'Problem Solving', category: 'Soft Skills', popular: true },
    { name: 'Teamwork', category: 'Soft Skills', popular: false },
    { name: 'Time Management', category: 'Soft Skills', popular: false },
  ];

  useEffect(() => {
    if (user) {
      loadSkills();
    }
  }, [user]);

  const loadSkills = async () => {
    setLoading(true);
    try {
      if (!user) return;
      
      // Use the dedicated skills API endpoint
      const skillsData = await profileAPI.getSkills();
      console.log('Loaded skills from API:', skillsData);
      
      // Transform to Skill objects with levels
      const transformedSkills = Array.isArray(skillsData) 
        ? skillsData.map((skill: any) => {
            if (typeof skill === 'string') {
              return { name: skill, level: 'intermediate' as const };
            }
            return {
              name: skill.name || skill,
              level: skill.level || 'intermediate' as const,
              yearsOfExperience: skill.yearsOfExperience
            };
          })
        : [];
      
      setSkills(transformedSkills);
      console.log('Transformed skills:', transformedSkills);
    } catch (error: any) {
      console.error('Error loading skills:', error);
      
      // Better error handling with error codes
      if (error.status === 401) {
        if (error.code === 'TOKEN_EXPIRED') {
          setMessage({ type: 'error', text: 'Session expired. Please login again.' });
        } else if (error.code === 'NO_TOKEN') {
          setMessage({ type: 'error', text: 'Authentication required. Please login.' });
        } else {
          setMessage({ type: 'error', text: 'Authentication failed. Please login again.' });
        }
      } else if (error.status === 404) {
        setMessage({ type: 'error', text: 'User profile not found.' });
      } else {
        setMessage({ type: 'error', text: error.message || 'Failed to load skills' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a skill name' });
      return;
    }

    // Check if skill already exists
    if (skills.some(s => s.name && typeof s.name === 'string' && s.name.toLowerCase() === newSkillName.toLowerCase())) {
      setMessage({ type: 'error', text: 'Skill already added' });
      return;
    }

    const newSkill: Skill = {
      name: newSkillName.trim(),
      level: newSkillLevel
    };

    setSkills(prev => [...prev, newSkill]);
    setNewSkillName('');
    setNewSkillLevel('intermediate');
    setMessage(null);
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(prev => prev.filter(s => s.name !== skillName));
  };

  const handleUpdateSkillLevel = (skillName: string, newLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert') => {
    setSkills(prev => prev.map(s => 
      s.name === skillName ? { ...s, level: newLevel } : s
    ));
  };

  const handleAddSuggestion = (suggestionName: string) => {
    if (skills.some(s => s.name.toLowerCase() === suggestionName.toLowerCase())) {
      setMessage({ type: 'error', text: 'Skill already added' });
      return;
    }

    const newSkill: Skill = {
      name: suggestionName,
      level: 'intermediate'
    };

    setSkills(prev => [...prev, newSkill]);
    setMessage({ type: 'success', text: `Added ${suggestionName}` });
  };

  const handleSaveSkills = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Not authenticated. Please login again.' });
        setSaving(false);
        return;
      }

      // Save skills array to backend
      const skillsArray = skills.map(s => s.name);
      console.log('Saving skills:', skillsArray);
      console.log('Token exists:', !!token);
      
      await profileAPI.updateSkills(skillsArray);
      
      setMessage({ type: 'success', text: 'Skills updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving skills:', error);
      
      // Better error messages with error codes
      if (error.status === 401) {
        if (error.code === 'TOKEN_EXPIRED') {
          setMessage({ type: 'error', text: 'Session expired. Please login again.' });
        } else if (error.code === 'NO_TOKEN') {
          setMessage({ type: 'error', text: 'Authentication required. Please login.' });
        } else {
          setMessage({ type: 'error', text: 'Authentication failed. Please login again.' });
        }
      } else if (error.status === 400) {
        setMessage({ type: 'error', text: 'Invalid data. Please check your skills.' });
      } else if (error.status === 404) {
        setMessage({ type: 'error', text: 'User profile not found.' });
      } else {
        setMessage({ type: 'error', text: error.message || 'Failed to save skills. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const getLevelInfo = (level: string) => {
    switch (level) {
      case 'beginner':
        return { color: '#f59e0b', label: 'Beginner', percentage: 25 };
      case 'intermediate':
        return { color: '#3b82f6', label: 'Intermediate', percentage: 50 };
      case 'advanced':
        return { color: '#8b5cf6', label: 'Advanced', percentage: 75 };
      case 'expert':
        return { color: '#10b981', label: 'Expert', percentage: 100 };
      default:
        return { color: '#6b7280', label: 'Unknown', percentage: 0 };
    }
  };

  const filteredSuggestions = skillSuggestions.filter(suggestion =>
    !skills.some(s => s.name.toLowerCase() === suggestion.name.toLowerCase()) &&
    suggestion.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedSuggestions = filteredSuggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.category]) {
      acc[suggestion.category] = [];
    }
    acc[suggestion.category].push(suggestion);
    return acc;
  }, {} as Record<string, SkillSuggestion[]>);

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-600">Loading your skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-br from-blue-600 to-blue-500 text-white p-8 rounded-2xl mb-8 shadow-lg shadow-blue-500/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-start gap-6 lg:flex-row md:flex-col">
          <div className="flex-1">
            <h1 className="flex items-center gap-3 text-3xl font-bold mb-2 text-white">
              <Layers size={32} />
              Skills Management
            </h1>
            <p className="text-base opacity-90 text-white">
              Showcase your expertise and get better job matches
            </p>
          </div>
          <button 
            className="bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors backdrop-blur-sm disabled:opacity-50"
            onClick={handleSaveSkills}
            disabled={saving}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>

      {/* Message Alert */}
      <AnimatePresence>
        {message && (
          <motion.div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-blue-600">
            <Layers size={24} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-800">{skills.length}</div>
            <div className="text-sm text-gray-600">Total Skills</div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br from-green-500 to-green-600">
            <Award size={24} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-800">{skills.filter(s => s.level === 'expert').length}</div>
            <div className="text-sm text-gray-600">Expert Level</div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br from-purple-500 to-purple-600">
            <Star size={24} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-800">{skills.filter(s => s.level === 'advanced').length}</div>
            <div className="text-sm text-gray-600">Advanced Level</div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Skill Section */}
        <div className="lg:col-span-2">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-6">
              <Plus size={24} className="text-blue-600" />
              Add New Skill
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g., React, Python, Communication"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Proficiency Level</label>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="md:col-span-1 flex items-end">
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  onClick={handleAddSkill}
                >
                  <Plus size={18} />
                  Add Skill
                </button>
              </div>
            </div>
          </motion.div>

          {/* My Skills */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-6">
              <Award size={24} className="text-blue-600" />
              My Skills ({skills.length})
            </h2>

            {skills.length === 0 ? (
              <div className="text-center py-12">
                <Layers size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No skills added yet</p>
                <p className="text-sm text-gray-500">Add skills to improve your job matches</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {skills.map((skill, index) => {
                    const levelInfo = getLevelInfo(skill.level);
                    
                    return (
                      <motion.div
                        key={skill.name}
                        className="bg-gray-50 rounded-lg p-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-medium text-gray-900">{skill.name}</h4>
                          <button
                            className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                            onClick={() => handleRemoveSkill(skill.name)}
                            title="Remove skill"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex gap-2 flex-wrap">
                            {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map((level) => (
                              <button
                                key={level}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                  skill.level === level 
                                    ? 'text-white' 
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                                onClick={() => handleUpdateSkillLevel(skill.name, level)}
                                style={skill.level === level ? { 
                                  backgroundColor: getLevelInfo(level).color
                                } : {}}
                              >
                                {getLevelInfo(level).label}
                              </button>
                            ))}
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${levelInfo.percentage}%`,
                                backgroundColor: levelInfo.color
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Suggestions Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 mb-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-6">
              <Sparkles size={20} className="text-blue-600" />
              Skill Suggestions
            </h3>

            <div className="relative mb-6">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {Object.entries(groupedSuggestions).map(([category, categorySkills]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">{category}</h4>
                  <div className="space-y-2">
                    {categorySkills.slice(0, 5).map((suggestion) => (
                      <button
                        key={suggestion.name}
                        className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => handleAddSuggestion(suggestion.name)}
                      >
                        <span className="text-sm text-gray-800">{suggestion.name}</span>
                        <div className="flex items-center gap-1">
                          {suggestion.popular && (
                            <TrendingUp size={12} className="text-orange-500" />
                          )}
                          <Plus size={12} className="text-blue-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {filteredSuggestions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No suggestions found</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tips Card */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Target size={20} className="text-blue-600" />
              💡 Tips
            </h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600">• Add at least 5 skills to improve job matches</li>
              <li className="text-sm text-gray-600">• Set accurate proficiency levels</li>
              <li className="text-sm text-gray-600">• Include both technical and soft skills</li>
              <li className="text-sm text-gray-600">• Update skills as you learn new ones</li>
              <li className="text-sm text-gray-600">• Popular skills get more visibility</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SkillsManagement;

