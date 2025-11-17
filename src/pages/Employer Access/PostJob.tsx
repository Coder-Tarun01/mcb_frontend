import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Mail,
  MapPin,
  DollarSign,
  Clock,
  Upload,
  Plus,
  X,
  Save,
  Tag,
  AlertCircle,
  CheckCircle,
  Globe,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobsAPI } from '../../services/api';
import EmployerLayout from '../../components/employer/EmployerLayout';
import CompanySetup from '../../components/employer/CompanySetup';

const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const { user, isEmployer, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [jobData, setJobData] = useState({
    // Section 1: Job Basics
    job_title: '',
    job_description: '',
    category_id: '',
    job_type: 'Full-Time',
    experience_level: 'Fresher',
    
    // Section 2: Compensation
    min_salary: '',
    max_salary: '',
    salary_currency: 'INR',
    salary_type: 'Yearly',
    vacancies: '',
    
    // Section 3: Requirements
    education_required: '',
    skills_required: [] as string[],
    gender_preference: 'Any',
    
    // Section 4: Location Details
    location_type: 'On-site',
    full_address: '',
    city: '',
    state: '',
    country: 'India',
    
    // Section 5: Company Details
    company_name: user?.companyName || '',
    company_website: '',
    contact_email: user?.email || '',
    contact_phone: user?.phone || '',
    
    // Section 6: Status & Dates
    application_deadline: '',
    status: 'Active',
    
    // Current tag input
    currentTag: '',
  });

  const jobTypes = [
    'Full-Time',
    'Part-Time',
    'Contract',
    'Internship',
    'Freelance',
    'Remote'
  ];

  const experienceLevels = [
    'Fresher',
    'Junior',
    'Mid-Level',
    'Senior',
    'Manager'
  ];

  const salaryCurrencies = [
    'INR',
    'USD',
    'EUR',
    'GBP',
    'CAD',
    'AUD'
  ];

  const salaryTypes = [
    'Monthly',
    'Yearly',
    'Hourly'
  ];

  const genderPreferences = [
    'Any',
    'Male',
    'Female'
  ];

  const locationTypes = [
    'On-site',
    'Hybrid',
    'Remote'
  ];

  const jobStatuses = [
    'Active',
    'Closed',
    'Pending',
    'Draft'
  ];

  const jobCategories = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Marketing',
    'Sales',
    'Human Resources',
    'Operations',
    'Customer Service',
    'Design',
    'Engineering',
    'Management',
    'Administrative',
    'Legal',
    'Other'
  ];

  React.useEffect(() => {
    // Wait for auth loading to complete before checking authentication
    if (!authLoading && (!user || !isEmployer())) {
      navigate('/login');
      return;
    }
  }, [user, navigate, isEmployer, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobData(prev => ({
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

  const handleAddTag = () => {
    if (jobData.currentTag.trim() && !jobData.skills_required.includes(jobData.currentTag.trim())) {
      setJobData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, prev.currentTag.trim()],
        currentTag: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setJobData(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!jobData.job_title.trim()) {
      newErrors.job_title = 'Job title is required';
    }
    if (!jobData.job_description.trim()) {
      newErrors.job_description = 'Job description is required';
    }
    if (!jobData.category_id.trim()) {
      newErrors.category_id = 'Job category is required';
    }
    if (!jobData.contact_email.trim()) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(jobData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }
    if (!jobData.min_salary.trim()) {
      newErrors.min_salary = 'Minimum salary is required';
    } else if (isNaN(Number(jobData.min_salary)) || Number(jobData.min_salary) <= 0) {
      newErrors.min_salary = 'Please enter a valid minimum salary';
    }
    if (!jobData.max_salary.trim()) {
      newErrors.max_salary = 'Maximum salary is required';
    } else if (isNaN(Number(jobData.max_salary)) || Number(jobData.max_salary) <= 0) {
      newErrors.max_salary = 'Please enter a valid maximum salary';
    } else if (Number(jobData.max_salary) < Number(jobData.min_salary)) {
      newErrors.max_salary = 'Maximum salary must be greater than minimum salary';
    }
    if (!jobData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!jobData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!jobData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    if (!jobData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }
    if (!jobData.vacancies.trim()) {
      newErrors.vacancies = 'Number of vacancies is required';
    } else if (isNaN(Number(jobData.vacancies)) || Number(jobData.vacancies) <= 0) {
      newErrors.vacancies = 'Please enter a valid number of vacancies';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSuccess('');
    setErrors({});
    
    try {
      // Prepare job data for API
      const jobPayload = {
        title: jobData.job_title,
        location: `${jobData.city}, ${jobData.state}, ${jobData.country}`,
        type: jobData.job_type,
        category: jobData.category_id,
        description: jobData.job_description,
        // Send salary fields in the format backend expects
        minSalary: parseInt(jobData.min_salary),
        maxSalary: parseInt(jobData.max_salary),
        salaryCurrency: jobData.salary_currency,
        salaryType: jobData.salary_type,
        experienceLevel: jobData.experience_level,
        skillsRequired: jobData.skills_required,
        isRemote: jobData.location_type === 'Remote',
        // Additional fields for enhanced job posting
        company: jobData.company_name,
        companyWebsite: jobData.company_website,
        contactEmail: jobData.contact_email,
        contactPhone: jobData.contact_phone,
        educationRequired: jobData.education_required,
        genderPreference: jobData.gender_preference,
        locationType: jobData.location_type,
        fullAddress: jobData.full_address,
        vacancies: parseInt(jobData.vacancies),
        applicationDeadline: jobData.application_deadline,
        status: jobData.status
      };

      console.log('Submitting job to API:', jobPayload);
      
      // Call the real API
      const createdJob = await jobsAPI.createJob(jobPayload);
      
      console.log('Job created successfully:', createdJob);
      setSuccess('Job posted successfully!');
      
      // Auto-hide success message and redirect after 2 seconds
      setTimeout(() => {
        setSuccess('');
        navigate('/employer/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Error posting job:', error);
      setErrors({ 
        general: error.message || 'Failed to post job. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };


  // Show loading while auth is loading
  if (authLoading) {
    return (
      <EmployerLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-slate-600 font-medium">Loading...</span>
          </div>
        </div>
      </EmployerLayout>
    );
  }

  // Show company setup if user doesn't have a company name
  if (!user?.companyName) {
    return (
      <EmployerLayout>
        <CompanySetup 
          currentUser={user} 
          onCompanySet={(updatedUser) => {
            // Update the user in context
            window.location.reload();
          }} 
        />
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
        <div className="flex flex-col w-full max-w-6xl mx-auto border border-slate-200 rounded-2xl bg-white/95 p-3 sm:p-4 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center mb-4 sm:mb-6 gap-3 sm:gap-5 pb-3 sm:pb-4 border-b border-slate-200/60 w-full">
            <button 
              onClick={() => navigate('/employer/dashboard')} 
              className="flex items-center gap-2 sm:gap-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-600 text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-300 py-2.5 sm:py-3 px-3 sm:px-5 rounded-xl backdrop-blur-sm hover:bg-blue-500 hover:border-blue-500 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 w-full sm:w-auto justify-center"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
            <div className="flex-1 text-center w-full flex justify-center items-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-slate-800 to-blue-500 bg-clip-text text-transparent m-0 leading-tight tracking-tight">
                Post a New Job
              </h1>
            </div>
          </div>
          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2.5 sm:gap-3.5 py-3.5 sm:py-5 px-4 sm:px-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-8 font-semibold text-sm sm:text-15 backdrop-blur-sm border-2 border-green-300/30 relative overflow-hidden bg-gradient-to-br from-green-50/90 to-green-100/80 text-green-700 shadow-lg shadow-green-500/15"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-green-600"></div>
              <CheckCircle className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 flex-shrink-0 bg-white/20 p-1 rounded-lg" />
              <span className="text-xs sm:text-base">{success}</span>
            </motion.div>
          )}
          {/* General Error */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2.5 sm:gap-3.5 py-3.5 sm:py-5 px-4 sm:px-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-8 font-semibold text-sm sm:text-15 backdrop-blur-sm border-2 border-red-300/30 relative overflow-hidden bg-gradient-to-br from-red-50/90 to-red-100/80 text-red-700 shadow-lg shadow-red-500/15"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-600"></div>
              <AlertCircle className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 flex-shrink-0 bg-white/20 p-1 rounded-lg" />
              <span className="text-xs sm:text-base">{errors.general}</span>
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6 md:gap-8 border border-slate-200 rounded-2xl bg-white/90 p-3 sm:p-4 md:p-6 lg:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            {/* Section 1: Job Basics */}
            <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 border border-slate-200/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 backdrop-blur-sm transition-all duration-300 relative overflow-hidden hover:bg-gradient-to-br hover:from-slate-50/80 hover:to-slate-100/60 hover:border-blue-300/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10 group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-slate-800 mt-0 mb-4 sm:mb-6 pb-3 sm:pb-5 border-b-2 border-slate-200/80 relative">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 bg-blue-100 p-1 sm:p-1.5 rounded-lg sm:rounded-2.5" />
                Job Basics
                <div className="absolute bottom-0 left-0 w-12 sm:w-15 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-sm sm:after:text-base">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="job_title"
                    value={jobData.job_title}
                    onChange={handleInputChange}
                    placeholder="Enter Job Title"
                    className={`w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic ${errors.job_title ? 'border-red-500 shadow-lg shadow-red-500/12 bg-red-50/50' : ''}`}
                  />
                  {errors.job_title && <span className="text-red-500 text-xs sm:text-13 font-medium mt-1 sm:mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-xs sm:before:text-sm">{errors.job_title}</span>}
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight">
                    <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-500 bg-slate-100 p-0.5 sm:p-0.75 rounded-md sm:rounded-1.5" />
                    Job Type
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                    <select
                      name="job_type"
                      value={jobData.job_type}
                      onChange={handleInputChange}
                      className="w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 pl-10 sm:pl-11 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 cursor-pointer appearance-none"
                    >
                      {jobTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight">
                    Experience Level
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                    <select
                      name="experience_level"
                      value={jobData.experience_level}
                      onChange={handleInputChange}
                      className="w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 pl-10 sm:pl-11 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 cursor-pointer appearance-none"
                    >
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-sm sm:after:text-base">
                    Job Category
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                    <select
                      name="category_id"
                      value={jobData.category_id}
                      onChange={handleInputChange}
                      className={`w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 pl-10 sm:pl-11 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 cursor-pointer appearance-none ${errors.category_id ? 'border-red-500 shadow-lg shadow-red-500/12 bg-red-50/50' : ''}`}
                    >
                      <option value="">Select Category</option>
                      {jobCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.category_id && <span className="text-red-500 text-xs sm:text-13 font-medium mt-1 sm:mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-xs sm:before:text-sm">{errors.category_id}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:gap-2.5 mt-4 sm:mt-6">
                <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-sm sm:after:text-base">
                  Job Description
                </label>
                <textarea
                  name="job_description"
                  value={jobData.job_description}
                  onChange={handleInputChange}
                  placeholder="Describe the job responsibilities, requirements, and what makes this role exciting..."
                  className={`w-full py-3 sm:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic resize-y min-h-[120px] sm:min-h-[150px] md:min-h-[180px] leading-relaxed ${errors.job_description ? 'border-red-500 shadow-lg shadow-red-500/12 bg-red-50/50' : ''}`}
                  rows={6}
                />
                {errors.job_description && <span className="text-red-500 text-xs sm:text-13 font-medium mt-1 sm:mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-xs sm:before:text-sm">{errors.job_description}</span>}
              </div>
            </div>

            {/* Section 2: Compensation */}
            <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 border border-slate-200/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 backdrop-blur-sm transition-all duration-300 relative overflow-hidden hover:bg-gradient-to-br hover:from-slate-50/80 hover:to-slate-100/60 hover:border-blue-300/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10 group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-slate-800 mt-0 mb-4 sm:mb-6 pb-3 sm:pb-5 border-b-2 border-slate-200/80 relative">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 bg-blue-100 p-1 sm:p-1.5 rounded-lg sm:rounded-2.5" />
                Compensation
                <div className="absolute bottom-0 left-0 w-12 sm:w-15 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-sm sm:after:text-base">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    name="min_salary"
                    value={jobData.min_salary}
                    onChange={handleInputChange}
                    placeholder="e.g. 50000"
                    className={`w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic ${errors.min_salary ? 'border-red-500 shadow-lg shadow-red-500/12 bg-red-50/50' : ''}`}
                  />
                  {errors.min_salary && <span className="text-red-500 text-xs sm:text-13 font-medium mt-1 sm:mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-xs sm:before:text-sm">{errors.min_salary}</span>}
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-sm sm:after:text-base">
                    Maximum Salary
                  </label>
                  <input
                    type="number"
                    name="max_salary"
                    value={jobData.max_salary}
                    onChange={handleInputChange}
                    placeholder="e.g. 80000"
                    className={`w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic ${errors.max_salary ? 'border-red-500 shadow-lg shadow-red-500/12 bg-red-50/50' : ''}`}
                  />
                  {errors.max_salary && <span className="text-red-500 text-xs sm:text-13 font-medium mt-1 sm:mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-xs sm:before:text-sm">{errors.max_salary}</span>}
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight">
                    Salary Currency
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                    <select
                      name="salary_currency"
                      value={jobData.salary_currency}
                      onChange={handleInputChange}
                      className="w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 pl-10 sm:pl-11 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 cursor-pointer appearance-none"
                    >
                      {salaryCurrencies.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight">
                    Salary Type
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                    <select
                      name="salary_type"
                      value={jobData.salary_type}
                      onChange={handleInputChange}
                      className="w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 pl-10 sm:pl-11 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 cursor-pointer appearance-none"
                    >
                      {salaryTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-sm sm:after:text-base">
                    Number of Vacancies
                  </label>
                  <input
                    type="number"
                    name="vacancies"
                    value={jobData.vacancies}
                    onChange={handleInputChange}
                    placeholder="e.g. 2"
                    className={`w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic ${errors.vacancies ? 'border-red-500 shadow-lg shadow-red-500/12 bg-red-50/50' : ''}`}
                  />
                  {errors.vacancies && <span className="text-red-500 text-xs sm:text-13 font-medium mt-1 sm:mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-xs sm:before:text-sm">{errors.vacancies}</span>}
                </div>
              </div>
            </div>

            {/* Section 3: Requirements */}
            <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 border border-slate-200/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 backdrop-blur-sm transition-all duration-300 relative overflow-hidden hover:bg-gradient-to-br hover:from-slate-50/80 hover:to-slate-100/60 hover:border-blue-300/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10 group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-slate-800 mt-0 mb-4 sm:mb-6 pb-3 sm:pb-5 border-b-2 border-slate-200/80 relative">
                <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 bg-blue-100 p-1 sm:p-1.5 rounded-lg sm:rounded-2.5" />
                Requirements
                <div className="absolute bottom-0 left-0 w-12 sm:w-15 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight">
                    Education Required
                  </label>
                  <input
                    type="text"
                    name="education_required"
                    value={jobData.education_required}
                    onChange={handleInputChange}
                    placeholder="e.g. Bachelor's Degree in Computer Science"
                    className="w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight">
                    Gender Preference
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                    <select
                      name="gender_preference"
                      value={jobData.gender_preference}
                      onChange={handleInputChange}
                      className="w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 pl-10 sm:pl-11 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 cursor-pointer appearance-none"
                    >
                      {genderPreferences.map(preference => (
                        <option key={preference} value={preference}>{preference}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Required */}
              <div className="flex flex-col gap-3 sm:gap-4 mt-4 sm:mt-6">
                <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight">
                  <Tag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-500 bg-slate-100 p-0.5 sm:p-0.75 rounded-md sm:rounded-1.5" />
                  Skills Required
                </label>
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Skills Display Area */}
                  <div className={`flex flex-wrap gap-2 sm:gap-2.5 min-h-[50px] py-3 sm:py-3.5 sm:py-4 px-3 sm:px-4 border-2 border-slate-200/80 rounded-xl bg-white/90 backdrop-blur-sm transition-all duration-300 ${jobData.skills_required.length === 0 ? 'items-center justify-center' : 'items-start'} ${jobData.skills_required.length > 0 ? 'hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8' : ''}`}>
                    {jobData.skills_required.length === 0 ? (
                      <span className="text-xs sm:text-sm text-slate-400 italic font-normal">No skills added yet. Add skills below.</span>
                    ) : (
                      jobData.skills_required.map((skill, index) => (
                        <span key={index} className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-1.5 sm:py-2 px-2.5 sm:px-3 md:px-4 rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30">
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(skill)}
                            className="bg-none border-none text-white cursor-pointer flex items-center justify-center p-0.5 rounded-full transition-all duration-200 w-4 h-4 sm:w-5 sm:h-5 hover:bg-white/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                            aria-label={`Remove ${skill} skill`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  
                  {/* Skills Input and Add Button */}
                  <div className="flex gap-2 sm:gap-3">
                    <input
                      type="text"
                      name="currentTag"
                      value={jobData.currentTag}
                      onChange={handleInputChange}
                      onKeyPress={handleTagKeyPress}
                      placeholder="Add a skill and press Enter"
                      className="flex-1 py-3 sm:py-3.5 md:py-4 px-3 sm:px-4 md:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!jobData.currentTag.trim()}
                      className="flex items-center justify-center bg-blue-500 text-white border-none rounded-xl w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 cursor-pointer transition-all duration-300 shadow-lg shadow-blue-500/20 hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="Add skill"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Location Details */}
            <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 border border-slate-200/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 backdrop-blur-sm transition-all duration-300 relative overflow-hidden hover:bg-gradient-to-br hover:from-slate-50/80 hover:to-slate-100/60 hover:border-blue-300/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10 group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-slate-800 mt-0 mb-4 sm:mb-6 pb-3 sm:pb-5 border-b-2 border-slate-200/80 relative">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 bg-blue-100 p-1 sm:p-1.5 rounded-lg sm:rounded-2.5" />
                Location Details
                <div className="absolute bottom-0 left-0 w-12 sm:w-15 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight">
                    Location Type
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                    <select
                      name="location_type"
                      value={jobData.location_type}
                      onChange={handleInputChange}
                      className="w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 pl-10 sm:pl-11 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 cursor-pointer appearance-none"
                    >
                      {locationTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-sm sm:after:text-base">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={jobData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Mumbai"
                    className={`w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic ${errors.city ? 'border-red-500 shadow-lg shadow-red-500/12 bg-red-50/50' : ''}`}
                  />
                  {errors.city && <span className="text-red-500 text-xs sm:text-13 font-medium mt-1 sm:mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-xs sm:before:text-sm">{errors.city}</span>}
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-sm sm:after:text-base">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={jobData.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Maharashtra"
                    className={`w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic ${errors.state ? 'border-red-500 shadow-lg shadow-red-500/12 bg-red-50/50' : ''}`}
                  />
                  {errors.state && <span className="text-red-500 text-xs sm:text-13 font-medium mt-1 sm:mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-xs sm:before:text-sm">{errors.state}</span>}
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-sm sm:after:text-base">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={jobData.country}
                    onChange={handleInputChange}
                    placeholder="e.g. India"
                    className={`w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic ${errors.country ? 'border-red-500 shadow-lg shadow-red-500/12 bg-red-50/50' : ''}`}
                  />
                  {errors.country && <span className="text-red-500 text-xs sm:text-13 font-medium mt-1 sm:mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-xs sm:before:text-sm">{errors.country}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:gap-2.5 mt-4 sm:mt-6">
                <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight">
                  Full Address
                </label>
                <textarea
                  name="full_address"
                  value={jobData.full_address}
                  onChange={handleInputChange}
                  placeholder="Enter complete office address"
                  className="w-full py-3 sm:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic resize-y min-h-[100px] sm:min-h-[120px] leading-relaxed"
                  rows={3}
                />
              </div>
            </div>

            {/* Section 5: Company Details */}
            <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 border border-slate-200/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 backdrop-blur-sm transition-all duration-300 relative overflow-hidden hover:bg-gradient-to-br hover:from-slate-50/80 hover:to-slate-100/60 hover:border-blue-300/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10 group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-slate-800 mt-0 mb-4 sm:mb-6 pb-3 sm:pb-5 border-b-2 border-slate-200/80 relative">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 bg-blue-100 p-1 sm:p-1.5 rounded-lg sm:rounded-2.5" />
                Company Details
                <div className="absolute bottom-0 left-0 w-12 sm:w-15 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-sm sm:after:text-base">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={jobData.company_name}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    className={`w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic ${errors.company_name ? 'border-red-500 shadow-lg shadow-red-500/12 bg-red-50/50' : ''}`}
                  />
                  {errors.company_name && <span className="text-red-500 text-xs sm:text-13 font-medium mt-1 sm:mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-xs sm:before:text-sm">{errors.company_name}</span>}
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight">
                    Company Website
                  </label>
                  <input
                    type="url"
                    name="company_website"
                    value={jobData.company_website}
                    onChange={handleInputChange}
                    placeholder="https://company.com"
                    className="w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight after:content-['*'] after:text-red-500 after:ml-1 after:text-sm sm:after:text-base">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={jobData.contact_email}
                    onChange={handleInputChange}
                    placeholder="hr@company.com"
                    className={`w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic ${errors.contact_email ? 'border-red-500 shadow-lg shadow-red-500/12 bg-red-50/50' : ''}`}
                  />
                  {errors.contact_email && <span className="text-red-500 text-xs sm:text-13 font-medium mt-1 sm:mt-1.5 flex items-center gap-1.5 before:content-['⚠'] before:text-xs sm:before:text-sm">{errors.contact_email}</span>}
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={jobData.contact_phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic"
                  />
                </div>
              </div>
            </div>

            {/* Section 6: Status & Dates */}
            <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 border border-slate-200/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 backdrop-blur-sm transition-all duration-300 relative overflow-hidden hover:bg-gradient-to-br hover:from-slate-50/80 hover:to-slate-100/60 hover:border-blue-300/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10 group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-slate-800 mt-0 mb-4 sm:mb-6 pb-3 sm:pb-5 border-b-2 border-slate-200/80 relative">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 bg-blue-100 p-1 sm:p-1.5 rounded-lg sm:rounded-2.5" />
                Status & Dates
                <div className="absolute bottom-0 left-0 w-12 sm:w-15 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="application_deadline"
                    value={jobData.application_deadline}
                    onChange={handleInputChange}
                    className="w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:gap-2.5">
                  <label className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-15 font-semibold text-slate-700 mb-1 sm:mb-1.5 tracking-tight">
                    Job Status
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                    <select
                      name="status"
                      value={jobData.status}
                      onChange={handleInputChange}
                      className="w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-5 pl-10 sm:pl-11 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 cursor-pointer appearance-none"
                    >
                      {jobStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 md:gap-5 mt-6 sm:mt-8 md:mt-10 pt-6 sm:pt-8 border-t-2 border-slate-200/60 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-25 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <button
                type="button"
                onClick={() => navigate('/employer/dashboard')}
                className="flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-15 cursor-pointer transition-all duration-300 w-full sm:w-auto sm:min-w-45 tracking-tight relative overflow-hidden bg-slate-50/80 text-slate-600 border-2 border-slate-200/80 backdrop-blur-sm hover:bg-slate-50/95 hover:border-slate-400/40 hover:text-slate-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-500/15 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-slate-100/10 before:to-transparent before:transition-all before:duration-500 hover:before:left-full"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-15 cursor-pointer transition-all duration-300 w-full sm:w-auto sm:min-w-45 tracking-tight relative overflow-hidden bg-blue-500 !text-white border-2 border-transparent shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:bg-slate-400 disabled:shadow-none before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-500 hover:before:left-full"
              >
                {isLoading ? (
                  <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 border-2 sm:border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5 !text-white" />
                    <span className="!text-white">Post Job</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
    </EmployerLayout>
  );
};

export default PostJob;