import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Edit, Save, X, User, Mail, Phone, MapPin, Briefcase, DollarSign, Globe, FileText } from 'lucide-react';
import ProfilePhotoUpload from '../../components/dashboard/ProfilePhotoUpload';

const Profile: React.FC = () => {
  const { user, isEmployee } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    professionalTitle: '',
    languages: '',
    age: '',
    currentSalary: '',
    expectedSalary: '',
    description: '',
    // Contact Information
    phone: '',
    email: '',
    country: '',
    postcode: '',
    city: '',
    fullAddress: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        return value.trim() === '' ? 'Name is required' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return value.trim() === '' ? 'Email is required' : 
               !emailRegex.test(value) ? 'Email is invalid' : '';
      case 'phone':
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
        return value.trim() !== '' && !phoneRegex.test(value.replace(/[\s\-()]/g, '')) ? 'Phone number is invalid' : '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        errors[key] = error;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Load user data from API
        const userData = await usersAPI.fetchUserById(user.id);
        
        const loadedData = {
          name: userData.name || '',
          professionalTitle: (userData as any).professionalTitle || (userData as any).jobTitle || '',
          languages: (userData as any).languages || '',
          age: (userData as any).age || '',
          currentSalary: (userData as any).currentSalary || '',
          expectedSalary: (userData as any).expectedSalary || '',
          description: (userData as any).description || (userData as any).bio || '',
          phone: userData.phone || '',
          email: userData.email || '',
          country: (userData as any).country || '',
          postcode: (userData as any).postcode || '',
          city: (userData as any).city || (userData as any).location || '',
          fullAddress: (userData as any).fullAddress || (userData as any).address || ''
        };
        
        setFormData(loadedData);
        setOriginalData(loadedData);
        setUserProfile(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setValidationErrors({});
  };

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setIsEditing(false);
    setValidationErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix validation errors before saving');
      return;
    }
    
    if (!user) return;
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      console.log('🔄 Saving profile data:', formData);
      
      // Use the correct profile API endpoint
      const response = await usersAPI.updateProfile({
        name: formData.name,
        professionalTitle: formData.professionalTitle,
        languages: formData.languages,
        age: formData.age,
        currentSalary: formData.currentSalary,
        expectedSalary: formData.expectedSalary,
        description: formData.description,
        phone: formData.phone,
        country: formData.country,
        postcode: formData.postcode,
        city: formData.city,
        fullAddress: formData.fullAddress
      });
      
      console.log('✅ Profile update response:', response);
      
      // Update local state with the response data
      if (response.user) {
        const updatedData = {
          name: response.user.name || '',
          professionalTitle: response.user.professionalTitle || '',
          languages: response.user.languages || '',
          age: response.user.age || '',
          currentSalary: response.user.currentSalary || '',
          expectedSalary: response.user.expectedSalary || '',
          description: response.user.description || '',
          phone: response.user.phone || '',
          email: response.user.email || '',
          country: response.user.country || '',
          postcode: response.user.postcode || '',
          city: response.user.city || '',
          fullAddress: response.user.fullAddress || ''
        };
        
        setFormData(updatedData);
        setOriginalData(updatedData);
        setUserProfile(response.user);
      }
      
      setIsEditing(false);
      toast.success('Profile updated successfully ✅');
      
    } catch (error: any) {
      console.error('❌ Error saving profile:', error);
      toast.error('Failed to update profile ❌');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle avatar update
  const handleAvatarUpdate = (newAvatarUrl: string) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        avatarUrl: newAvatarUrl
      });
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-0 pb-6 px-6 bg-gray-50">
      <div className="w-full max-w-7xl mx-auto border-2 border-gray-300 rounded-2xl p-6">
      {/* Header with Edit/Save/Cancel buttons */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Edit size={16} />
                Edit Profile
              </motion.button>
            ) : (
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Photo Section */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-6">
          <User size={20} className="text-blue-600" />
          PROFILE PHOTO
        </h2>
        <div className="flex justify-center">
          <ProfilePhotoUpload
            currentAvatarUrl={userProfile?.avatarUrl}
            userName={userProfile?.name || user?.name || 'User'}
            userTitle={userProfile?.professionalTitle || userProfile?.jobTitle || 'Professional'}
            onAvatarUpdate={handleAvatarUpdate}
            size="lg"
            showName={true}
            showTitle={true}
          />
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Click the camera icon to upload a new profile photo</p>
          <p className="text-xs mt-1">Supported formats: JPEG, PNG, WebP (Max 5MB)</p>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-6">
          <User size={20} className="text-blue-600" />
          BASIC INFORMATION
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. John Doe"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              disabled={!isEditing}
            />
            {validationErrors.name && (
              <span className="text-red-500 text-sm mt-1">{validationErrors.name}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
            <input
              type="text"
              name="professionalTitle"
              value={formData.professionalTitle}
              onChange={handleInputChange}
              placeholder="e.g. Web Developer, Designer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
            <input
              type="text"
              name="languages"
              value={formData.languages}
              onChange={handleInputChange}
              placeholder="e.g. English, Spanish, French"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="e.g. 25 Years"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Salary ($)</label>
            <input
              type="text"
              name="currentSalary"
              value={formData.currentSalary}
              onChange={handleInputChange}
              placeholder="e.g. 50000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary</label>
            <input
              type="text"
              name="expectedSalary"
              value={formData.expectedSalary}
              onChange={handleInputChange}
              placeholder="e.g. 60000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!isEditing}
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Tell us about yourself, your experience, and what makes you unique..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            rows={4}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-6">
          <Mail size={20} className="text-blue-600" />
          CONTACT INFORMATION
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g. +1 234 567 8900"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
              disabled={!isEditing}
            />
            {validationErrors.phone && (
              <span className="text-red-500 text-sm mt-1">{validationErrors.phone}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g. john.doe@email.com"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              disabled={!isEditing}
            />
            {validationErrors.email && (
              <span className="text-red-500 text-sm mt-1">{validationErrors.email}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="e.g. United States"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
            <input
              type="text"
              name="postcode"
              value={formData.postcode}
              onChange={handleInputChange}
              placeholder="e.g. 12345"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="e.g. New York"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
            <input
              type="text"
              name="fullAddress"
              value={formData.fullAddress}
              onChange={handleInputChange}
              placeholder="e.g. 123 Main St, Apt 4B"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Profile;

