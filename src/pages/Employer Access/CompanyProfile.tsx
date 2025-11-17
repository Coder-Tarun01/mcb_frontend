import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin as Location,
  Calendar,
  Save,
  Facebook,
  Twitter,
  Linkedin,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import { useCompanyProfile } from '../../hooks/useCompanyProfile';
import EmployerLayout from '../../components/employer/EmployerLayout';

const CompanyProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isEmployer } = useAuth();
  const { companyProfile, isLoadingProfile, refreshCompanyProfile } = useCompanyProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    // Company Details
    companyName: '', // Initialize as empty, will be populated from companyProfile
    companyEmail: user?.email || '',
    website: '',
    foundedDate: '',
    category: '',
    country: 'London',
    description: '',
    
    // Contact Information
    phone: '',
    contactEmail: '',
    contactCountry: 'India',
    city: 'Delhi',
    zip: '',
    address: '',
    
    // Social Links
    facebook: '',
    twitter: '',
    google: '',
    linkedin: ''
  });

  const categories = [
    'Web Designer',
    'IT',
    'Marketing',
    'Software Development',
    'Data Science',
    'Digital Marketing',
    'E-commerce',
    'Finance',
    'Healthcare',
    'Education',
    'Real Estate',
    'Consulting',
    'Manufacturing',
    'Retail',
    'Other'
  ];

  const countries = [
    'London',
    'United States',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'India',
    'Singapore',
    'Japan',
    'Brazil',
    'Other'
  ];

  // Load company profile data and update form
  useEffect(() => {
    if (companyProfile) {
      console.log('CompanyProfile: Loading company profile data:', {
        companyProfile,
        companyName: companyProfile.companyName,
        userCompanyName: user?.companyName,
        userName: user?.name
      });
      
      // Update form data with real company data
      setFormData({
        // Company Details - Use companyName from profile, fallback to empty string if not set
        companyName: companyProfile.companyName || '',
        companyEmail: companyProfile.email || user?.email || '',
        website: companyProfile.website || '',
        foundedDate: companyProfile.foundedYear || '',
        category: companyProfile.industry || '',
        country: companyProfile.country || 'London',
        description: companyProfile.companyDescription || companyProfile.description || '',
        
        // Contact Information
        phone: companyProfile.phone || '',
        contactEmail: companyProfile.email || '',
        contactCountry: companyProfile.country || 'India',
        city: companyProfile.city || companyProfile.location || 'Delhi',
        zip: companyProfile.postcode || '',
        address: companyProfile.fullAddress || companyProfile.address || '',
        
        // Social Links
        facebook: companyProfile.facebook || '',
        twitter: companyProfile.twitter || '',
        google: companyProfile.google || '',
        linkedin: companyProfile.linkedin || ''
      });
    }
  }, [companyProfile, user]);

  // Redirect if not authorized
  useEffect(() => {
    if (!user || !isEmployer()) {
      navigate('/login');
    }
  }, [user, isEmployer, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = 'Company email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.companyEmail)) {
      newErrors.companyEmail = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Company description is required';
    }

    // URL validation for website and social links
    const urlFields = ['website', 'facebook', 'twitter', 'google', 'linkedin'];
    urlFields.forEach(field => {
      const value = formData[field as keyof typeof formData];
      if (value && !/^https?:\/\/.+/.test(value)) {
        newErrors[field] = 'Please enter a valid URL starting with http:// or https://';
      }
    });

    // Email validation for contact email
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    // Zip code validation
    if (formData.zip && !/^\d+$/.test(formData.zip)) {
      newErrors.zip = 'Zip code must contain only numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user || !validateForm()) {
      return;
    }

    setIsLoading(true);
    setSuccess('');
    
    try {
      // Update company profile via API
      await usersAPI.updateUser(user.id, {
        companyName: formData.companyName,
        email: formData.companyEmail,
        website: formData.website,
        foundedYear: formData.foundedDate,
        industry: formData.category,
        country: formData.country,
        companyDescription: formData.description,
        phone: formData.phone,
        city: formData.city,
        postcode: formData.zip,
        fullAddress: formData.address,
        facebook: formData.facebook,
        twitter: formData.twitter,
        google: formData.google,
        linkedin: formData.linkedin
      } as any);
      
      setSuccess('Company profile updated successfully!');
      
      // Refresh company profile data to reflect changes
      await refreshCompanyProfile();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error updating company profile:', error);
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <EmployerLayout>
        <div className="w-full">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-gray-600">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p>Loading company profile...</p>
          </div>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="w-full">
        <div className="bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-4 sm:p-6 md:p-8 lg:p-10 max-w-6xl w-full mx-auto border border-slate-200/80 backdrop-blur-[10px] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-500 before:via-purple-500 before:to-cyan-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center mb-8 gap-4 md:gap-5 relative pb-6 border-b border-slate-200/60">
          <div className="w-full md:w-auto flex justify-start">
            <button 
              onClick={() => navigate('/employer/dashboard')}
              className="flex items-center gap-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-600 text-sm font-semibold cursor-pointer transition-all duration-300 py-3 px-5 rounded-xl backdrop-blur-[10px] hover:bg-blue-500 hover:border-blue-500 hover:text-white hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(59,130,246,0.3)] w-full md:w-auto justify-center"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 hover:-translate-x-0.5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <div className="flex-1 text-center w-full flex justify-center items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-br from-slate-800 to-blue-600 bg-clip-text text-transparent m-0 leading-tight tracking-tight">Company Profile</h1>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3.5 py-5 px-6 rounded-2xl mb-8 font-semibold text-sm backdrop-blur-[10px] border-2 border-green-300/30 bg-gradient-to-br from-green-50/90 to-green-100/80 text-green-700 shadow-[0_8px_25px_rgba(34,197,94,0.15)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-gradient-to-b before:from-emerald-500 before:to-green-600"
          >
            <CheckCircle className="w-5.5 h-5.5 flex-shrink-0 bg-white/20 p-1 rounded-lg" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* General Error */}
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3.5 py-5 px-6 rounded-2xl mb-8 font-semibold text-sm backdrop-blur-[10px] border-2 border-red-300/30 bg-gradient-to-br from-red-50/90 to-red-100/80 text-red-700 shadow-[0_8px_25px_rgba(239,68,68,0.15)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-gradient-to-b before:from-red-500 before:to-red-600"
          >
            <AlertCircle className="w-5.5 h-5.5 flex-shrink-0 bg-white/20 p-1 rounded-lg" />
            <span>{errors.general}</span>
          </motion.div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col gap-6 sm:gap-8">
          {/* Company Details Section */}
          <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 border border-slate-200/60 rounded-[20px] p-4 sm:p-6 md:p-8 backdrop-blur-[10px] transition-all duration-300 relative overflow-hidden hover:bg-gradient-to-br hover:from-slate-50/80 hover:to-slate-100/60 hover:border-blue-500/30 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-blue-500 before:via-purple-500 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mt-0 mb-6 pb-5 border-b-2 border-slate-200/80 relative after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:w-15 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500">
              <Building2 className="w-6 h-6 text-blue-500 bg-blue-500/10 p-1.5 rounded-[10px]" />
              Company Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7">
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-base">
                  Company Name
                </label>
                <input 
                  type="text" 
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter Company Name"
                  className={`py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-normal placeholder:italic hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5 ${errors.companyName ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)] bg-red-50/50' : ''}`}
                />
                {errors.companyName && <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-sm">{errors.companyName}</span>}
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-base">
                  <Mail className="w-4.5 h-4.5 text-slate-600 bg-slate-600/10 p-0.5 rounded-md" />
                  Your Email
                </label>
                <input 
                  type="email" 
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleInputChange}
                  placeholder="info@gmail.com"
                  className={`py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-normal placeholder:italic hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5 ${errors.companyEmail ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)] bg-red-50/50' : ''}`}
                />
                {errors.companyEmail && <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-sm">{errors.companyEmail}</span>}
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight">
                  <Globe className="w-4.5 h-4.5 text-slate-600 bg-slate-600/10 p-0.5 rounded-md" />
                  Website
                </label>
                <input 
                  type="url" 
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="Website Link"
                  className={`py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-normal placeholder:italic hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5 ${errors.website ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)] bg-red-50/50' : ''}`}
                />
                {errors.website && <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-sm">{errors.website}</span>}
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight">
                  <Calendar className="w-4.5 h-4.5 text-slate-600 bg-slate-600/10 p-0.5 rounded-md" />
                  Founded Date
                </label>
                <input 
                  type="date" 
                  name="foundedDate"
                  value={formData.foundedDate}
                  onChange={handleInputChange}
                  className="py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-base">
                  Category
                </label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] cursor-pointer pr-12 appearance-none hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5 ${errors.category ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)] bg-red-50/50' : ''}`}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-sm">{errors.category}</span>}
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight">
                  Country
                </label>
                <select 
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] cursor-pointer pr-12 appearance-none hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5"
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-base">Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-normal placeholder:italic resize-y min-h-[120px] leading-relaxed hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5 focus:min-h-[140px] ${errors.description ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)] bg-red-50/50' : ''}`}
                rows={4}
                placeholder="Tell candidates about your company, culture, and mission..."
              />
              {errors.description && <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-sm">{errors.description}</span>}
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 border border-slate-200/60 rounded-[20px] p-4 sm:p-6 md:p-8 backdrop-blur-[10px] transition-all duration-300 relative overflow-hidden hover:bg-gradient-to-br hover:from-slate-50/80 hover:to-slate-100/60 hover:border-blue-500/30 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-blue-500 before:via-purple-500 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mt-0 mb-6 pb-5 border-b-2 border-slate-200/80 relative after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:w-15 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500">
              <Phone className="w-6 h-6 text-blue-500 bg-blue-500/10 p-1.5 rounded-[10px]" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7">
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-base">
                  <Phone className="w-4.5 h-4.5 text-slate-600 bg-slate-600/10 p-0.5 rounded-md" />
                  Phone
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 123 456 7890"
                  className={`py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-normal placeholder:italic hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5 ${errors.phone ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)] bg-red-50/50' : ''}`}
                />
                {errors.phone && <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-sm">{errors.phone}</span>}
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight">
                  <Mail className="w-4.5 h-4.5 text-slate-600 bg-slate-600/10 p-0.5 rounded-md" />
                  Email
                </label>
                <input 
                  type="email" 
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="example@gmail.com"
                  className={`py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-normal placeholder:italic hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5 ${errors.contactEmail ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)] bg-red-50/50' : ''}`}
                />
                {errors.contactEmail && <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-sm">{errors.contactEmail}</span>}
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight">
                  Country
                </label>
                <select 
                  name="contactCountry"
                  value={formData.contactCountry}
                  onChange={handleInputChange}
                  className="py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] cursor-pointer pr-12 appearance-none hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5"
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight">
                  <Location className="w-4.5 h-4.5 text-slate-600 bg-slate-600/10 p-0.5 rounded-md" />
                  City
                </label>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Delhi"
                  className="py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-normal placeholder:italic hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight">
                  Zip
                </label>
                <input 
                  type="text" 
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  placeholder="504030"
                  className={`py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-normal placeholder:italic hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5 ${errors.zip ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)] bg-red-50/50' : ''}`}
                />
                {errors.zip && <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-sm">{errors.zip}</span>}
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight">
                  Address
                </label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="New York City"
                  className="py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-normal placeholder:italic hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5"
                />
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 border border-slate-200/60 rounded-[20px] p-4 sm:p-6 md:p-8 backdrop-blur-[10px] transition-all duration-300 relative overflow-hidden hover:bg-gradient-to-br hover:from-slate-50/80 hover:to-slate-100/60 hover:border-blue-500/30 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-blue-500 before:via-purple-500 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mt-0 mb-6 pb-5 border-b-2 border-slate-200/80 relative after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:w-15 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500">
              <Globe className="w-6 h-6 text-blue-500 bg-blue-500/10 p-1.5 rounded-[10px]" />
              Social Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7">
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight">
                  <Facebook className="w-4.5 h-4.5 text-slate-600 bg-slate-600/10 p-0.5 rounded-md" />
                  Facebook
                </label>
                <input 
                  type="url" 
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  placeholder="https://www.facebook.com/"
                  className={`py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-normal placeholder:italic hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5 ${errors.facebook ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)] bg-red-50/50' : ''}`}
                />
                {errors.facebook && <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-sm">{errors.facebook}</span>}
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight">
                  <Twitter className="w-4.5 h-4.5 text-slate-600 bg-slate-600/10 p-0.5 rounded-md" />
                  Twitter
                </label>
                <input 
                  type="url" 
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="https://www.twitter.com/"
                  className={`py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-normal placeholder:italic hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5 ${errors.twitter ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)] bg-red-50/50' : ''}`}
                />
                {errors.twitter && <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-sm">{errors.twitter}</span>}
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight">
                  <Globe className="w-4.5 h-4.5 text-slate-600 bg-slate-600/10 p-0.5 rounded-md" />
                  Google
                </label>
                <input 
                  type="url" 
                  name="google"
                  value={formData.google}
                  onChange={handleInputChange}
                  placeholder="https://www.google.com/"
                  className={`py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-normal placeholder:italic hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5 ${errors.google ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)] bg-red-50/50' : ''}`}
                />
                {errors.google && <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-sm">{errors.google}</span>}
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 mb-1.5 tracking-tight">
                  <Linkedin className="w-4.5 h-4.5 text-slate-600 bg-slate-600/10 p-0.5 rounded-md" />
                  LinkedIn
                </label>
                <input 
                  type="url" 
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://www.linkedin.com/"
                  className={`py-4 px-5 border-2 border-slate-200/80 rounded-xl text-sm text-slate-800 bg-white/90 backdrop-blur-[10px] transition-all duration-300 font-inherit font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400 placeholder:font-normal placeholder:italic hover:border-blue-500/40 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_8px_25px_rgba(59,130,246,0.15)] focus:bg-white focus:-translate-y-0.5 ${errors.linkedin ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)] bg-red-50/50' : ''}`}
                />
                {errors.linkedin && <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-sm">{errors.linkedin}</span>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 sm:gap-5 mt-8 pt-8 border-t-2 border-slate-200/60 relative before:content-[''] before:absolute before:-top-0.5 before:left-0 before:w-25 before:h-0.5 before:bg-gradient-to-r before:from-blue-500 before:to-purple-500">
            <button
              type="button"
              onClick={() => navigate('/employer/dashboard')}
              className="flex items-center gap-3 py-4 px-8 rounded-[14px] font-bold text-sm cursor-pointer transition-all duration-300 min-w-[180px] justify-center tracking-tight relative overflow-hidden bg-slate-50/80 text-slate-600 border-2 border-slate-200/80 backdrop-blur-[10px] before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-slate-600/10 before:to-transparent before:transition-[left] before:duration-500 hover:bg-slate-50/95 hover:border-slate-600/40 hover:text-slate-700 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(100,116,139,0.15)] hover:before:left-full w-full sm:w-auto"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-3 py-4 px-8 rounded-[14px] font-bold text-sm cursor-pointer transition-all duration-300 min-w-[180px] justify-center tracking-tight relative overflow-hidden bg-blue-500 !text-white border-2 border-transparent shadow-[0_8px_25px_rgba(59,130,246,0.3)] before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-[left] before:duration-500 hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(59,130,246,0.4)] hover:before:left-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:bg-slate-400 disabled:shadow-none w-full sm:w-auto"
            >
              {isLoading ? (
                <div className="w-4.5 h-4.5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 !text-white" />
                  <span className="!text-white">Update Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </EmployerLayout>
  );
};

export default CompanyProfile;
