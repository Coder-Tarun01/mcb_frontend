import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  File, 
  CheckCircle, 
  AlertCircle,
  User,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  GraduationCap,
  Link as LinkIcon,
  Github,
  Linkedin,
  Globe,
  X,
  Eye
} from 'lucide-react';
import { jobsAPI, profileAPI } from '../services/api';
import { cvAPI, CVFile } from '../services/cvApi';
import { Job } from '../types/job';
import { useAuth } from '../context/AuthContext';
import { extractIdFromSlug } from '../utils/slug';

const Apply: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const slugOrId = slug || '';
  const extractedId = slugOrId ? extractIdFromSlug(slugOrId) : '';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    
    // Professional Details
    experience: '',
    currentJobTitle: '',
    currentCompany: '',
    currentCTC: '',
    expectedCTC: '',
    noticePeriod: '',
    skills: '',
    
    // Education Details
    qualification: '',
    specialization: '',
    university: '',
    yearOfPassing: '',
    
    // Additional Links
    linkedin: '',
    portfolio: '',
    github: '',
    
    // Cover Letter
    coverLetter: '',
    
    // Declaration
    declaration: false
  });
  const [resume, setResume] = useState<File | null>(null);
  const [selectedResumeFromCV, setSelectedResumeFromCV] = useState<CVFile | null>(null);
  const [showCVManager, setShowCVManager] = useState(false);
  const [cvFiles, setCvFiles] = useState<CVFile[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingCVFiles, setLoadingCVFiles] = useState(false);

  useEffect(() => {
    if (slugOrId && job) {
      // Job already loaded, check if user state changed
      const jobUrl = (job as any)?.jobUrl;
      if (!jobUrl && !user) {
        // Internal job but user not logged in - redirect to login
        const slug = (job as any)?.slug || slugOrId;
        navigate(`/login?redirect=${encodeURIComponent(`/jobs/${slug}`)}`);
        return;
      }
      if (!jobUrl && user && !userProfile) {
        // User logged in and job is internal - load user data
        loadUserData();
      }
    } else if (slugOrId) {
      // Initial load - load job
      loadJob();
    }
  }, [slugOrId, user, job]);

  const loadJob = async () => {
    if (!slugOrId) return;
    
    setIsLoading(true);
    try {
      // Backend accepts both slug and ID
      const jobData = await jobsAPI.fetchJobById(slugOrId);
      setJob(jobData);
      
      // If it's an external job (has jobUrl), redirect back to job details
      // External jobs should be handled on the job details page, not here
      const jobUrl = (jobData as any)?.jobUrl;
      if (jobUrl) {
        // Redirect back to job details page - apply button there will open external URL
        const slug = (jobData as any)?.slug || slugOrId;
        navigate(`/jobs/${slug}`);
        return;
      }
      
      // For internal jobs, check if user is logged in
      if (!user) {
        // Not logged in - redirect to login with redirect back to job details
        const slug = (jobData as any)?.slug || slugOrId;
        navigate(`/login?redirect=${encodeURIComponent(`/jobs/${slug}`)}`);
        return;
      }
      
      // User is logged in and job is internal - load user data for form
      loadUserData();
    } catch (error) {
      console.error('Error loading job:', error);
      setError('Failed to load job details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      // Load user profile data
      const [profileData, skillsData] = await Promise.all([
        profileAPI.getProfile().catch((error) => {
          console.warn('Failed to load profile data:', error);
          return null;
        }),
        profileAPI.getSkills().catch((error) => {
          console.warn('Failed to load skills data:', error);
          return [];
        })
      ]);

      if (profileData) {
        setUserProfile(profileData);
        setFormData(prev => ({
          ...prev,
          name: profileData.name || user?.name || '',
          email: profileData.email || user?.email || '',
          phone: profileData.phone || user?.phone || '',
          location: profileData.location || user?.location || '',
          currentJobTitle: profileData.currentJobTitle || '',
          currentCompany: profileData.currentCompany || '',
          currentCTC: profileData.currentCTC || '',
          expectedCTC: profileData.expectedCTC || '',
          noticePeriod: profileData.noticePeriod || '',
          qualification: profileData.qualification || '',
          specialization: profileData.specialization || '',
          university: profileData.university || '',
          yearOfPassing: profileData.yearOfPassing || '',
          linkedin: profileData.linkedin || '',
          portfolio: profileData.portfolio || '',
          github: profileData.github || ''
        }));
      }

      if (skillsData && Array.isArray(skillsData)) {
        setUserSkills(skillsData);
        setFormData(prev => ({
          ...prev,
          skills: skillsData.join(', ')
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Don't show error to user as this is not critical
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : String(value)
    }));
    if (error) setError('');
  };

  const handleResumeUpload = (file: File) => {
    setResume(file);
    if (error) setError('');
  };

  const handleResumeRemove = () => {
    setResume(null);
    setSelectedResumeFromCV(null);
  };

  const loadCVFiles = async () => {
    setLoadingCVFiles(true);
    try {
      const response = await cvAPI.getCVFiles({ 
        search: '',
        type: 'resume',
        status: 'active'
      });
      setCvFiles(response.files || []);
    } catch (error) {
      console.error('Error loading CV files:', error);
      setError('Failed to load CV files. Please try again.');
    } finally {
      setLoadingCVFiles(false);
    }
  };

  const handleSelectFromCVManager = (cvFile: CVFile) => {
    setSelectedResumeFromCV(cvFile);
    setResume(null); // Clear uploaded file
    setShowCVManager(false);
    setError(''); // Clear any previous errors
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Please enter your current location');
      return false;
    }
    if (!formData.experience.trim()) {
      setError('Please enter your total experience');
      return false;
    }
    if (!formData.skills.trim()) {
      setError('Please enter your key skills');
      return false;
    }
    if (!resume && !selectedResumeFromCV) {
      setError('Please upload your resume or select from CV Manager');
      return false;
    }
    if (!formData.declaration) {
      setError('Please confirm that the above details are correct');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append('jobId', extractedId);
      formDataToSend.append('coverLetter', formData.coverLetter);
      
      // Add all form data
      Object.keys(formData).forEach(key => {
        if (key !== 'declaration') {
          const value = formData[key as keyof typeof formData];
          if (typeof value === 'string' || typeof value === 'number') {
            formDataToSend.append(key, value.toString());
          }
        }
      });
      
      if (resume) {
        formDataToSend.append('resume', resume);
      } else if (selectedResumeFromCV) {
        formDataToSend.append('resumeId', selectedResumeFromCV.id.toString());
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', response.status, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        setSuccess('Application submitted successfully! We will review your application and get back to you soon.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError(result.message || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('An error occurred while submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're trying to apply for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/jobs')} 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft size={18} />
          Back to Jobs
        </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for Position</h1>
            <p className="text-gray-600">
              Complete your application for this exciting opportunity
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Summary - Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                {job.companyLogo ? (
                    <img src={job.companyLogo} alt={`${job.company} logo`} className="w-full h-full object-cover" />
                ) : (
                    <Building2 size={32} className="text-blue-600" />
                )}
              </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{String(job.title)}</h2>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={16} className="text-gray-500" />
                    <span className="text-gray-600 font-medium">{String(job.company)}</span>
                </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500" />
                    <span className="text-gray-600">{String(job.location || 'Not specified')}</span>
                </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-4">
                {(job.experience || job.experienceLevel) && (
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Experience Required</p>
                      <p className="text-sm text-gray-600">
                        {job.experienceLevel || 
                         (typeof job.experience === 'object' 
                          ? `${job.experience.min}-${job.experience.max} years`
                          : job.experience)
                        }
                      </p>
                    </div>
                  </div>
                )}
                
                {job.salary && (
                  <div className="flex items-center gap-3">
                    <DollarSign size={18} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Salary Range</p>
                      <p className="text-sm text-gray-600">
                        {job.salary.min && job.salary.max 
                          ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                          : 'Salary not specified'
                        }
                      </p>
                    </div>
                  </div>
                )}

                {job.type && (
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Job Type</p>
                      <p className="text-sm text-gray-600">{String(job.type)}</p>
                    </div>
                  </div>
                )}

                {(job.createdAt || job.postedDate) && (
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Posted Date</p>
                      <p className="text-sm text-gray-600">
                        {(() => {
                          const dateValue = job.postedDate || job.createdAt;
                          try {
                            const date = new Date(dateValue);
                            return isNaN(date.getTime()) ? String(dateValue) : date.toLocaleDateString();
                          } catch (error) {
                            return String(dateValue);
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Application Form - Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Application Details</h3>
                <p className="text-gray-600">
                Please fill in your information and upload your resume
              </p>
            </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                >
                    <AlertCircle size={20} />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
                >
                    <CheckCircle size={20} />
                  <span>{success}</span>
                </motion.div>
              )}

              {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} className="text-blue-600" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Current Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., New York, NY"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

                {/* Professional Details */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase size={20} className="text-blue-600" />
                    Professional Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                        Total Experience *
                      </label>
                      <select
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      >
                        <option value="">Select Experience</option>
                        <option value="0-1 years">0-1 years</option>
                        <option value="1-2 years">1-2 years</option>
                        <option value="2-3 years">2-3 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5-7 years">5-7 years</option>
                        <option value="7-10 years">7-10 years</option>
                        <option value="10+ years">10+ years</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="currentJobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                        Current Job Title
                      </label>
                      <input
                        type="text"
                        id="currentJobTitle"
                        name="currentJobTitle"
                        value={formData.currentJobTitle}
                        onChange={handleInputChange}
                        placeholder="e.g., Software Engineer"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="currentCompany" className="block text-sm font-medium text-gray-700 mb-2">
                        Current Company
                      </label>
                      <input
                        type="text"
                        id="currentCompany"
                        name="currentCompany"
                        value={formData.currentCompany}
                        onChange={handleInputChange}
                        placeholder="e.g., Tech Corp"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="currentCTC" className="block text-sm font-medium text-gray-700 mb-2">
                        Current CTC (Annual)
                      </label>
                      <input
                        type="text"
                        id="currentCTC"
                        name="currentCTC"
                        value={formData.currentCTC}
                        onChange={handleInputChange}
                        placeholder="e.g., $80,000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="expectedCTC" className="block text-sm font-medium text-gray-700 mb-2">
                        Expected CTC (Annual)
                      </label>
                      <input
                        type="text"
                        id="expectedCTC"
                        name="expectedCTC"
                        value={formData.expectedCTC}
                        onChange={handleInputChange}
                        placeholder="e.g., $90,000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="noticePeriod" className="block text-sm font-medium text-gray-700 mb-2">
                        Notice Period
                      </label>
                      <select
                        id="noticePeriod"
                        name="noticePeriod"
                        value={formData.noticePeriod}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Select Notice Period</option>
                        <option value="Immediate">Immediate</option>
                        <option value="15 Days">15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                      Key Skills *
                    </label>
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g., React, JavaScript, Python, Node.js"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Separate skills with commas</p>
                  </div>
                </div>

                {/* Education Details */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap size={20} className="text-blue-600" />
                    Education Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-2">
                        Highest Qualification
                      </label>
                      <select
                        id="qualification"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Select Qualification</option>
                        <option value="High School">High School</option>
                        <option value="Associate Degree">Associate Degree</option>
                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                        <option value="Master's Degree">Master's Degree</option>
                        <option value="PhD">PhD</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization / Stream
                      </label>
                      <input
                        type="text"
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        placeholder="e.g., Computer Science"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
                        University / College Name
                      </label>
                      <input
                        type="text"
                        id="university"
                        name="university"
                        value={formData.university}
                        onChange={handleInputChange}
                        placeholder="e.g., University of Technology"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="yearOfPassing" className="block text-sm font-medium text-gray-700 mb-2">
                        Year of Passing
                      </label>
                      <input
                        type="number"
                        id="yearOfPassing"
                        name="yearOfPassing"
                        value={formData.yearOfPassing}
                        onChange={handleInputChange}
                        placeholder="e.g., 2020"
                        min="1950"
                        max="2030"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Resume Upload */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <File size={20} className="text-blue-600" />
                    Resume Upload *
                  </h4>
                  
                  {/* Resume Upload Options */}
                  <div className="space-y-4">
                    {/* Upload New File */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleResumeUpload(file);
                        }}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-lg font-medium text-gray-900 mb-2">Upload New Resume</p>
                        <p className="text-sm text-gray-600 mb-3">Drag and drop your resume here, or click to browse</p>
                        <div className="flex justify-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">PDF</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">DOC</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">DOCX</span>
                        </div>
                        <p className="text-xs text-gray-500">Max file size: 5MB</p>
                      </label>
                    </div>

                    {/* Or Select from CV Manager */}
                    <div className="text-center">
                      <span className="text-gray-500 text-sm">or</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCVManager(true);
                        loadCVFiles();
                      }}
                      className="w-full border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors"
                    >
                      <File size={24} className="mx-auto text-blue-600 mb-2" />
                      <p className="font-medium text-gray-900">Select from CV Manager</p>
                      <p className="text-sm text-gray-600">Choose from your previously uploaded resumes</p>
                    </button>
                  </div>

                  {/* Selected Resume Display */}
                  {(resume || selectedResumeFromCV) && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle size={20} className="text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">
                              {resume ? resume.name : selectedResumeFromCV?.name}
                            </p>
                            <p className="text-sm text-green-700">
                              {resume 
                                ? `${(resume.size / 1024 / 1024).toFixed(2)} MB • Uploaded` 
                                : selectedResumeFromCV 
                                  ? `${(selectedResumeFromCV.size / 1024 / 1024).toFixed(2)} MB • ${selectedResumeFromCV.type.charAt(0).toUpperCase() + selectedResumeFromCV.type.slice(1).replace('-', ' ')} • From CV Manager`
                                  : 'From CV Manager'
                              }
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleResumeRemove}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Links */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <LinkIcon size={20} className="text-blue-600" />
                    Additional Links (Optional)
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn Profile
                      </label>
                      <div className="relative">
                        <Linkedin size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="url"
                          id="linkedin"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-2">
                        Portfolio / Personal Website
                      </label>
                      <div className="relative">
                        <Globe size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="url"
                          id="portfolio"
                          name="portfolio"
                          value={formData.portfolio}
                          onChange={handleInputChange}
                          placeholder="https://yourportfolio.com"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub Profile
                      </label>
                      <div className="relative">
                        <Github size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="url"
                          id="github"
                          name="github"
                          value={formData.github}
                          onChange={handleInputChange}
                          placeholder="https://github.com/yourusername"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>
                  </div>
              </div>

              {/* Cover Letter */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter (Optional)</h4>
                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us why you're interested in this position
                  </label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Write a brief cover letter explaining your interest and qualifications for this position..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                  />
                </div>
              </div>

                {/* Declaration */}
                <div>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="declaration"
                      name="declaration"
                      checked={formData.declaration}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="declaration" className="text-sm text-gray-700">
                      I confirm that the above details are correct and I understand that any false information may result in the rejection of my application. *
                    </label>
                  </div>
                </div>

              {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-white">Submitting Application...</span>
                    </>
                  ) : (
                    <>
                        <CheckCircle size={20} />
                      <span className="text-white">Submit Application</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CV Manager Modal */}
      {showCVManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Select Resume from CV Manager</h3>
                <button
                  onClick={() => setShowCVManager(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingCVFiles ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Loading CV files...</span>
                </div>
              ) : cvFiles.length > 0 ? (
                <div className="space-y-3">
                  {cvFiles.map((cvFile) => (
                    <div
                      key={cvFile.id}
                      onClick={() => handleSelectFromCVManager(cvFile)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <File size={20} className="text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{cvFile.name}</p>
                          <p className="text-sm text-gray-600">
                            Uploaded: {new Date(cvFile.uploadDate).toLocaleDateString()}
                            {cvFile.isPrimary && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Primary
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {cvFile.type.charAt(0).toUpperCase() + cvFile.type.slice(1).replace('-', ' ')} • 
                            {(cvFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700">
                          <Eye size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <File size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">No CV files found</p>
                  <p className="text-sm text-gray-500">Upload your first resume to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Apply;
