import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobsAPI } from '../../services/api';
import EmployerLayout from '../../components/employer/EmployerLayout';
import CompanySetup from '../../components/employer/CompanySetup';

const EditJob: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isEmployer, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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

  // Load job data on component mount
  useEffect(() => {
    if (id) {
      loadJobData();
    }
  }, [id]);

  // Check authentication
  useEffect(() => {
    if (!authLoading && (!user || !isEmployer())) {
      navigate('/login');
      return;
    }
  }, [user, navigate, isEmployer, authLoading]);

  const loadJobData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const job = await jobsAPI.fetchJobById(id!);
      
      // Transform job data to match our form structure
      setJobData({
        job_title: job.title || '',
        job_description: job.description || job.jobDescription || '',
        category_id: job.category || '',
        job_type: job.type || job.jobType || 'Full-Time',
        experience_level: job.experienceLevel || 'Fresher',
        
        min_salary: job.minSalary?.toString() || job.salary?.min?.toString() || '',
        max_salary: job.maxSalary?.toString() || job.salary?.max?.toString() || '',
        salary_currency: job.salaryCurrency || job.salary?.currency || 'INR',
        salary_type: job.salaryType || 'Yearly',
        vacancies: job.vacancies?.toString() || '1',
        
        education_required: job.educationRequired || '',
        skills_required: job.skills || job.skillsRequired || [],
        gender_preference: job.genderPreference || 'Any',
        
        location_type: job.locationType || 'On-site',
        full_address: job.fullAddress || '',
        city: job.city || (job.location ? job.location.split(',')[0]?.trim() : ''),
        state: job.state || (job.location ? job.location.split(',')[1]?.trim() : ''),
        country: job.country || 'India',
        
        company_name: job.company || user?.companyName || '',
        company_website: job.companyWebsite || '',
        contact_email: job.contactEmail || user?.email || '',
        contact_phone: job.contactPhone || user?.phone || '',
        
        application_deadline: job.applicationDeadline || '',
        status: job.status || 'Active',
        
        currentTag: '',
      });
      
    } catch (err: any) {
      console.error('Error loading job:', err);
      setError(err.message || 'Failed to load job data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setJobData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSkill = () => {
    if (jobData.currentTag.trim() && !jobData.skills_required.includes(jobData.currentTag.trim())) {
      setJobData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, prev.currentTag.trim()],
        currentTag: ''
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setJobData(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      setError('Job ID is missing');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Prepare the data for the API
      const locationString = [jobData.city, jobData.state].filter(Boolean).join(', ');
      const submitData = {
        title: jobData.job_title,
        description: jobData.job_description,
        category: jobData.category_id,
        type: jobData.job_type,
        experienceLevel: jobData.experience_level,
        
        minSalary: jobData.min_salary ? parseInt(jobData.min_salary) : null,
        maxSalary: jobData.max_salary ? parseInt(jobData.max_salary) : null,
        salaryCurrency: jobData.salary_currency,
        salaryType: jobData.salary_type,
        vacancies: jobData.vacancies ? parseInt(jobData.vacancies) : 1,
        
        educationRequired: jobData.education_required,
        skillsRequired: jobData.skills_required,
        genderPreference: jobData.gender_preference,
        
        locationType: jobData.location_type,
        fullAddress: jobData.full_address,
        city: jobData.city,
        state: jobData.state,
        country: jobData.country,
        
        companyWebsite: jobData.company_website,
        contactEmail: jobData.contact_email,
        contactPhone: jobData.contact_phone,
        
        applicationDeadline: jobData.application_deadline,
        status: jobData.status,
        
        // Legacy fields for compatibility (only send if present to avoid wiping existing)
        ...(locationString && { location: locationString }),
        isRemote: jobData.location_type === 'Remote'
      };

      console.log('Updating job with data:', submitData);

      await jobsAPI.updateJob(id, submitData);
      
      setSuccess('Job updated successfully!');
      
      // Redirect to manage jobs after a short delay
      setTimeout(() => {
        navigate('/employer/jobs');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error updating job:', err);
      setError(err.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/employer/jobs');
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <EmployerLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-white text-lg">
          <Loader2 className="w-8 h-8 mb-4 animate-spin" />
          <span>Loading...</span>
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
            window.location.reload();
          }} 
        />
      </EmployerLayout>
    );
  }

  if (loading) {
    return (
      <EmployerLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-700 text-lg">
          <Loader2 className="w-8 h-8 mb-4 animate-spin" />
          <span>Loading job data...</span>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="min-h-screen bg-slate-50 py-8">
        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 py-4 px-6 rounded-lg mb-6 font-medium animate-slideIn bg-green-100 border border-green-500 text-green-800"
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 py-4 px-6 rounded-lg mb-6 font-medium animate-slideIn bg-red-100 border border-red-500 text-red-800"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto bg-none border-none text-xl text-red-800 cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-red-200">
              ×
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-4"
        >
          <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 mb-8 shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-gray-200">
            <div className="flex items-center gap-8 flex-wrap">
              <button onClick={handleCancel} className="flex items-center gap-2 py-3 px-6 bg-slate-50 border border-gray-300 rounded-lg text-gray-700 no-underline font-medium text-sm transition-all duration-200 hover:bg-slate-100 hover:border-gray-400 hover:text-slate-800">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Manage Jobs</span>
              </button>
              <div className="flex-1 flex flex-col gap-1">
                <h1 className="text-4xl font-bold text-gray-800 m-0 leading-tight">Edit Job</h1>
                <p className="text-base text-gray-500 m-0 font-normal">Update your job posting details and requirements</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 py-2 px-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-medium text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-700 rounded-full"></div>
                  <span>Editing Mode</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.1)] backdrop-blur-[10px]">
            {/* Section 1: Job Basics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12 pb-8 border-b border-gray-200"
            >
              <h2 className="text-2xl font-semibold text-gray-800 m-0 mb-6 pb-2 border-b-2 border-blue-500 inline-block">Job Basics</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                <div className="flex flex-col col-span-full">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Job Title *</label>
                  <input
                    type="text"
                    value={jobData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Job Type *</label>
                  <select
                    value={jobData.job_type}
                    onChange={(e) => handleInputChange('job_type', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    required
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Experience Level *</label>
                  <select
                    value={jobData.experience_level}
                    onChange={(e) => handleInputChange('experience_level', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    required
                  >
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Category *</label>
                  <select
                    value={jobData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    required
                  >
                    <option value="">Select Category</option>
                    {jobCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col col-span-full">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Job Description *</label>
                  <textarea
                    value={jobData.job_description}
                    onChange={(e) => handleInputChange('job_description', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] resize-y min-h-[120px] font-inherit"
                    placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                    rows={6}
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Section 2: Compensation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12 pb-8 border-b border-gray-200"
            >
              <h2 className="text-2xl font-semibold text-gray-800 m-0 mb-6 pb-2 border-b-2 border-blue-500 inline-block">Compensation</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Minimum Salary</label>
                  <input
                    type="number"
                    value={jobData.min_salary}
                    onChange={(e) => handleInputChange('min_salary', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    placeholder="e.g., 500000"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Maximum Salary</label>
                  <input
                    type="number"
                    value={jobData.max_salary}
                    onChange={(e) => handleInputChange('max_salary', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    placeholder="e.g., 800000"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Currency</label>
                  <select
                    value={jobData.salary_currency}
                    onChange={(e) => handleInputChange('salary_currency', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  >
                    {salaryCurrencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Salary Type</label>
                  <select
                    value={jobData.salary_type}
                    onChange={(e) => handleInputChange('salary_type', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  >
                    {salaryTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Number of Vacancies</label>
                  <input
                    type="number"
                    value={jobData.vacancies}
                    onChange={(e) => handleInputChange('vacancies', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    placeholder="e.g., 2"
                    min="1"
                  />
                </div>
              </div>
            </motion.div>

            {/* Section 3: Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12 pb-8 border-b border-gray-200"
            >
              <h2 className="text-2xl font-semibold text-gray-800 m-0 mb-6 pb-2 border-b-2 border-blue-500 inline-block">Requirements</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Education Required</label>
                  <input
                    type="text"
                    value={jobData.education_required}
                    onChange={(e) => handleInputChange('education_required', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    placeholder="e.g., Bachelor's Degree in Computer Science"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Gender Preference</label>
                  <select
                    value={jobData.gender_preference}
                    onChange={(e) => handleInputChange('gender_preference', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  >
                    {genderPreferences.map(preference => (
                      <option key={preference} value={preference}>{preference}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col col-span-full">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Required Skills</label>
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={jobData.currentTag}
                        onChange={(e) => handleInputChange('currentTag', e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                        placeholder="Add a skill and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="flex items-center justify-center py-3 bg-blue-500 border-none rounded-lg text-white cursor-pointer transition-all duration-300 min-w-[3rem] hover:bg-blue-600 hover:-translate-y-0.5"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {jobData.skills_required.map((skill, index) => (
                        <span key={index} className="flex items-center gap-2 py-2 px-3 bg-cyan-50 border border-cyan-600 rounded-full text-cyan-800 text-sm font-medium">
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="flex items-center justify-center w-5 h-5 bg-cyan-600 border-none rounded-full text-white cursor-pointer transition-all duration-300 hover:bg-cyan-700 hover:scale-110"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 4: Location Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12 pb-8 border-b border-gray-200"
            >
              <h2 className="text-2xl font-semibold text-gray-800 m-0 mb-6 pb-2 border-b-2 border-blue-500 inline-block">Location Details</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Location Type</label>
                  <select
                    value={jobData.location_type}
                    onChange={(e) => handleInputChange('location_type', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  >
                    {locationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">City</label>
                  <input
                    type="text"
                    value={jobData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    placeholder="e.g., Mumbai"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">State</label>
                  <input
                    type="text"
                    value={jobData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    placeholder="e.g., Maharashtra"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Country</label>
                  <input
                    type="text"
                    value={jobData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    placeholder="e.g., India"
                  />
                </div>
                
                <div className="flex flex-col col-span-full">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Full Address</label>
                  <textarea
                    value={jobData.full_address}
                    onChange={(e) => handleInputChange('full_address', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] resize-y min-h-[120px] font-inherit"
                    placeholder="Complete address of the workplace"
                    rows={3}
                  />
                </div>
              </div>
            </motion.div>

            {/* Section 5: Company Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12 pb-8 border-b border-gray-200"
            >
              <h2 className="text-2xl font-semibold text-gray-800 m-0 mb-6 pb-2 border-b-2 border-blue-500 inline-block">Company Details</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Company Name</label>
                  <input
                    type="text"
                    value={jobData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    readOnly
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Company Website</label>
                  <input
                    type="url"
                    value={jobData.company_website}
                    onChange={(e) => handleInputChange('company_website', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    placeholder="https://company.com"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Contact Email</label>
                  <input
                    type="email"
                    value={jobData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    placeholder="hr@company.com"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Contact Phone</label>
                  <input
                    type="tel"
                    value={jobData.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </motion.div>

            {/* Section 6: Status & Dates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8 pb-8 border-b border-gray-200"
            >
              <h2 className="text-2xl font-semibold text-gray-800 m-0 mb-6 pb-2 border-b-2 border-blue-500 inline-block">Status & Dates</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Job Status</label>
                  <select
                    value={jobData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  >
                    {jobStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2 text-sm">Application Deadline</label>
                  <input
                    type="date"
                    value={jobData.application_deadline}
                    onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                    className="py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-white text-gray-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  />
                </div>
              </div>
            </motion.div>

            {/* Form Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-end gap-4 pt-8 border-t border-gray-200"
            >
              <button
                type="button"
                onClick={handleCancel}
                className="py-3 px-8 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-200 hover:border-gray-400"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 py-3 px-8 bg-gradient-to-r from-blue-500 to-blue-700 border-none rounded-lg !text-white font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_6px_rgba(59,130,246,0.3)] hover:from-blue-600 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(59,130,246,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin !text-white" />
                    <span className="!text-white">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 !text-white" />
                    <span className="!text-white">Save Changes</span>
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </EmployerLayout>
  );
};

export default EditJob;
