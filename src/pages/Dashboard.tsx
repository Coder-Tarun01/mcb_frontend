 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  FileText, 
  Heart, 
  Briefcase, 
  Bell,
  Lock,
  LogOut,
  Camera,
  Edit,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, jobsAPI, applicationsAPI, savedJobsAPI } from '../services/api';
import { Job } from '../types/job';
import { buildJobSlug } from '../utils/slug';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, sessionExpired, handleSessionExpired } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
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

  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [unsaveLoading, setUnsaveLoading] = useState<string | null>(null);
  const [savedJobsLoading, setSavedJobsLoading] = useState(false);

  const [jobFilters, setJobFilters] = useState({
    search: '',
    sortBy: 'freshness'
  });

  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);

  const [appliedJobFilters, setAppliedJobFilters] = useState({
    search: '',
    sortBy: 'freshness',
    status: 'all'
  });

  // Load user data and dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }
      
      setIsLoading(true);
      try {
        // Load user profile data
        const userData = await usersAPI.fetchUserById(user.id);
        setFormData({
          name: userData.name || '',
          professionalTitle: userData.professionalTitle || userData.jobTitle || '',
          languages: userData.languages || '',
          age: userData.age || '',
          currentSalary: userData.currentSalary || '',
          expectedSalary: userData.expectedSalary || '',
          description: userData.description || userData.bio || '',
          phone: userData.phone || '',
          email: userData.email || '',
          country: userData.country || '',
          postcode: userData.postcode || '',
          city: userData.city || userData.location || '',
          fullAddress: userData.fullAddress || userData.address || ''
        });

        // Load user's applications
        try {
          const applications = await applicationsAPI.getUserApplications();
          setAppliedJobs(applications);
        } catch (error) {
          console.error('Error loading applications:', error);
          setAppliedJobs([]);
        }

        // Load user's saved jobs
        try {
          setSavedJobsLoading(true);
          console.log('Loading saved jobs for user:', user.id);
          const response = await savedJobsAPI.getSavedJobs();
          console.log('Saved jobs response:', response);
          const savedJobsData = response.savedJobs || response || [];
          console.log('Saved jobs data:', savedJobsData);
          
          // Transform saved jobs data to match Job interface
          const transformedJobs = savedJobsData.map((savedJob: any) => ({
            id: savedJob.jobId,
            title: savedJob.job?.title || 'Job Title Not Available',
            company: savedJob.job?.company || 'Company Not Available',
            location: savedJob.job?.location || 'Location Not Available',
            jobType: savedJob.job?.type || 'Job Type Not Available',
            salary: savedJob.job?.salary ? 
              `${savedJob.job.salary.min} - ${savedJob.job.salary.max}` : 
              'Salary Not Available',
            savedDate: new Date(savedJob.savedAt).toLocaleDateString(),
            description: savedJob.job?.description || '',
            skills: savedJob.job?.skills || [],
            isRemote: savedJob.job?.isRemote || false
          }));
          console.log('Transformed saved jobs:', transformedJobs);
          setSavedJobs(transformedJobs);
        } catch (error) {
          console.error('Error loading saved jobs:', error);
          // Check if it's an authentication error
          if (error.status === 401) {
            console.log('Authentication error, logging out user');
            logout();
            navigate('/login');
          }
          setSavedJobs([]);
        } finally {
          setSavedJobsLoading(false);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const handleUnsaveJob = async (jobId: string) => {
    try {
      setUnsaveLoading(jobId);
      await savedJobsAPI.unsaveJob(jobId);
      // Remove the job from the local state
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error unsaving job:', err);
      if (err.status === 401) {
        console.log('Authentication error during unsave, logging out user');
        logout();
        navigate('/login');
      }
    } finally {
      setUnsaveLoading(null);
    }
  };

  const retryLoadSavedJobs = async () => {
    if (!user) return;
    
    try {
      setSavedJobsLoading(true);
      console.log('Retrying to load saved jobs for user:', user.id);
      const response = await savedJobsAPI.getSavedJobs();
      const savedJobsData = response.savedJobs || response || [];
      
      const transformedJobs = savedJobsData.map((savedJob: any) => ({
        id: savedJob.jobId,
        title: savedJob.job?.title || 'Job Title Not Available',
        company: savedJob.job?.company || 'Company Not Available',
        location: savedJob.job?.location || 'Location Not Available',
        jobType: savedJob.job?.type || 'Job Type Not Available',
        salary: savedJob.job?.salary ? 
          `${savedJob.job.salary.min} - ${savedJob.job.salary.max}` : 
          'Salary Not Available',
        savedDate: new Date(savedJob.savedAt).toLocaleDateString(),
        description: savedJob.job?.description || '',
        skills: savedJob.job?.skills || [],
        isRemote: savedJob.job?.isRemote || false
      }));
      
      setSavedJobs(transformedJobs);
    } catch (error) {
      console.error('Error retrying saved jobs load:', error);
      if (error.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setSavedJobsLoading(false);
    }
  };

  const [jobAlerts, setJobAlerts] = useState([
    {
      id: 1,
      title: 'Social Media Expert',
      criteria: 'Lorem Ipsum is simply dummy text.',
      date: 'December 15, 2018',
      isPremium: true
    },
    {
      id: 2,
      title: 'Web Designer',
      criteria: 'Lorem Ipsum is simply dummy text.',
      date: 'November 10, 2018',
      isPremium: true
    },
    {
      id: 3,
      title: 'Finance Accountant',
      criteria: 'Lorem Ipsum is simply dummy text.',
      date: 'October 5, 2018',
      isPremium: false
    },
    {
      id: 4,
      title: 'Marketing Manager',
      criteria: 'Lorem Ipsum is simply dummy text.',
      date: 'September 20, 2018',
      isPremium: true
    },
    {
      id: 5,
      title: 'Software Engineer',
      criteria: 'Lorem Ipsum is simply dummy text.',
      date: 'August 15, 2018',
      isPremium: false
    },
    {
      id: 6,
      title: 'Data Analyst',
      criteria: 'Lorem Ipsum is simply dummy text.',
      date: 'July 10, 2018',
      isPremium: true
    }
  ]);

  const [jobAlertFilters, setJobAlertFilters] = useState({
    search: '',
    sortBy: 'freshness'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordValidation, setPasswordValidation] = useState({
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    passwordStrength: 0,
    passwordMatch: false,
    errors: {} as { [key: string]: string }
  });

  const [resumeData, setResumeData] = useState({
    profileStrength: 70,
    location: 'Sacramento, California',
    phone: '+1 123 456 7890',
    email: 'info@example.com',
    resumeHeadline: 'Job board currently living in USA',
    keySkills: ['Javascript', 'CSS', 'HTML', 'Bootstrap', 'Web Designing', 'Photoshop'],
    employment: {
      position: 'Junior Software Developer',
      company: 'W3itexperts',
      duration: 'Oct 2015 to Present (3 years 4 months)',
      availability: 'Available',
      role: 'Junior Software Developer'
    },
    education: [
      { level: '12th', location: 'London', year: '2017' },
      { level: '10th', location: 'London', year: '2013' }
    ],
    itSkills: [
      { skill: 'Bootstrap', version: '3', lastUsed: '2018', experience: '2 years' },
      { skill: 'Bootstrap', version: '4', lastUsed: '2018', experience: '2 years' },
      { skill: 'HTML', version: '5', lastUsed: '2018', experience: '2 years' },
      { skill: 'CSS', version: '3', lastUsed: '2018', experience: '2 years' },
      { skill: 'Photoshop', version: '64bit', lastUsed: '2018', experience: '2 years' }
    ],
    projects: [
      { name: 'Job Board', company: 'w3itexpert (Offsite)', duration: 'Dec 2018 to Present (Full Time)', description: 'Job Board Template' }
    ],
    profileSummary: '',
    accomplishments: {
      onlineProfile: '',
      workSample: '',
      research: '',
      presentation: '',
      patent: '',
      certification: ''
    },
    desiredCareer: {
      industry: 'IT Software/Software Services',
      functionalArea: 'Design/Creative/User Experience',
      role: 'Web Designer',
      jobType: 'permanent',
      employmentType: 'Full Time',
      availabilityToJoin: '12 July',
      expectedSalary: '5 Lakhs',
      desiredShift: '',
      desiredLocation: '',
      desiredIndustry: ''
    },
    personalDetails: {
      dateOfBirth: '31 July 1998',
      permanentAddress: 'Add Permanent Address',
      gender: 'male',
      areaPinCode: '302030',
      maritalStatus: 'Single/Unmarried',
      hometown: 'Delhi',
      passportNumber: '+1234567890',
      workPermit: 'USA',
      differentlyAbled: 'None',
      languages: 'English'
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Listen for session expiration events
  useEffect(() => {
    const handleSessionExpiredEvent = () => {
      console.log('Session expired event received');
      setShowSessionExpiredModal(true);
    };

    window.addEventListener('sessionExpired', handleSessionExpiredEvent);
    
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpiredEvent);
    };
  }, []);

  // Handle session expiration state
  useEffect(() => {
    if (sessionExpired) {
      console.log('Session has expired, showing modal');
      setShowSessionExpiredModal(true);
    }
  }, [sessionExpired]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    console.log('Saving settings:', formData);
    alert('Settings saved successfully!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleJobAction = (jobId: string, action: string) => {
    if (action === 'remove') {
      handleUnsaveJob(jobId);
    } else if (action === 'apply') {
      // Navigate to apply page
      navigate(`/apply/${jobId}`);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setJobFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleAppliedJobAction = (jobId: number, action: string) => {
    if (action === 'withdraw') {
      setAppliedJobs(appliedJobs.filter(job => job.id !== jobId));
    } else if (action === 'view') {
      // Handle view details
      console.log('View job details:', jobId);
    }
  };

  const handleAppliedJobFilterChange = (filterType: string, value: string) => {
    setAppliedJobFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleJobAlertAction = (alertId: number, action: string) => {
    if (action === 'delete') {
      setJobAlerts(jobAlerts.filter(alert => alert.id !== alertId));
    } else if (action === 'view') {
      // Handle view details
      console.log('View job alert details:', alertId);
    }
  };

  const handleJobAlertFilterChange = (filterType: string, value: string) => {
    setJobAlertFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validate password strength
    if (field === 'newPassword') {
      const strength = calculatePasswordStrength(value);
      setPasswordValidation(prev => ({
        ...prev,
        passwordStrength: strength
      }));
    }

    // Check password match
    if (field === 'confirmPassword' || field === 'newPassword') {
      const match = field === 'confirmPassword' 
        ? value === passwordData.newPassword 
        : passwordData.confirmPassword === value;
      
      setPasswordValidation(prev => ({
        ...prev,
        passwordMatch: match
      }));
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const togglePasswordVisibility = (field: string) => {
    setPasswordValidation(prev => ({
      ...prev,
      [field]: !(prev as any)[field]
    }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: any = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setPasswordValidation(prev => ({
      ...prev,
      errors
    }));

    if (Object.keys(errors).length === 0) {
      // In a real app, this would update the password via API
      console.log('Password updated successfully');
      alert('Password updated successfully!');
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordValidation({
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
        passwordStrength: 0,
        passwordMatch: false,
        errors: {}
      });
    }
  };

  const filteredJobs = savedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(jobFilters.search.toLowerCase()) ||
                         job.company.toLowerCase().includes(jobFilters.search.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    if (jobFilters.sortBy === 'freshness') {
      // Use savedDate for saved jobs, fallback to postedDate if available
      const dateA = job.savedDate ? new Date(job.savedDate) : (job.postedDate ? new Date(job.postedDate) : new Date(0));
      const dateB = job.savedDate ? new Date(job.savedDate) : (job.postedDate ? new Date(job.postedDate) : new Date(0));
      return dateB.getTime() - dateA.getTime();
    }
    return 0;
  });

  const filteredAppliedJobs = appliedJobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(appliedJobFilters.search.toLowerCase()) ||
                         job.company?.toLowerCase().includes(appliedJobFilters.search.toLowerCase());
    const matchesStatus = appliedJobFilters.status === 'all' || job.status === appliedJobFilters.status;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (appliedJobFilters.sortBy === 'freshness') {
      return new Date(b.appliedDate || b.createdAt).getTime() - new Date(a.appliedDate || a.createdAt).getTime();
    }
    return 0;
  });

  const filteredJobAlerts = jobAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(jobAlertFilters.search.toLowerCase()) ||
                         alert.criteria.toLowerCase().includes(jobAlertFilters.search.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    if (jobAlertFilters.sortBy === 'freshness') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0;
  });

  // Resume section content moved to main dashboard area

  const mainSidebarItems = [
    { id: 'profile', label: 'Profile', icon: User, active: activeTab === 'profile' },
    { id: 'resume', label: 'My Resume', icon: FileText, active: activeTab === 'resume' },
    { id: 'saved', label: 'Saved Jobs', icon: Heart, active: activeTab === 'saved' },
    { id: 'applied', label: 'Applied Jobs', icon: Briefcase, active: activeTab === 'applied' },
    { id: 'alerts', label: 'Job Alerts', icon: Bell, active: activeTab === 'alerts' },
    { id: 'cv-manager', label: 'CV Manager', icon: FileText, active: activeTab === 'cv-manager' },
    { id: 'password', label: 'Change Password', icon: Lock, active: activeTab === 'password' },
    { id: 'logout', label: 'Log Out', icon: LogOut, active: false, action: handleLogout }
  ];

  const resumeSidebarItems = [
    { id: 'resume-headline', label: 'Resume Headline', icon: FileText, active: false },
    { id: 'key-skills', label: 'Key Skills', icon: FileText, active: false },
    { id: 'employment', label: 'Employment', icon: Briefcase, active: false },
    { id: 'education', label: 'Education', icon: FileText, active: false },
    { id: 'it-skills', label: 'IT Skills', icon: FileText, active: false },
    { id: 'projects', label: 'Projects', icon: FileText, active: false },
    { id: 'profile-summary', label: 'Profile Summary', icon: FileText, active: false },
    { id: 'accomplishments', label: 'Accomplishments', icon: FileText, active: false },
    { id: 'desired-career', label: 'Desired Career Profile', icon: FileText, active: false },
    { id: 'personal-details', label: 'Personal Details', icon: User, active: false },
    { id: 'attach-resume', label: 'Attach Resume', icon: FileText, active: false }
  ];

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-layout">
        {/* Left Sidebar */}
        <div className="dashboard-sidebar">
          {activeTab === 'resume' || activeTab === 'resume-headline' || activeTab === 'key-skills' || activeTab === 'employment' || activeTab === 'education' || activeTab === 'it-skills' || activeTab === 'projects' || activeTab === 'profile-summary' || activeTab === 'accomplishments' || activeTab === 'desired-career' || activeTab === 'personal-details' || activeTab === 'attach-resume' ? (
            <>
              {/* Profile Section for Resume */}
              <div className="sidebar-profile">
                <div className="profile-avatar">
                  <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" alt="Profile" />
                  <button className="camera-btn">
                    <Camera className="camera-icon" />
                  </button>
                </div>
                <h3 className="profile-name">John Doe</h3>
                <p className="profile-title">Freelance Senior PHP Developer at various agencies</p>
                
                {/* Profile Strength */}
                <div className="profile-strength">
                  <div className="strength-label">
                    <span>Profile Strength (Average)</span>
                    <span className="strength-percentage">70%</span>
                  </div>
                  <div className="strength-bar">
                    <div className="strength-progress" style={{ width: '70%' }}></div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="contact-info">
                  <div className="contact-item">
                    <MapPin className="contact-icon" />
                    <span>Sacramento, California</span>
                  </div>
                  <div className="contact-item">
                    <Phone className="contact-icon" />
                    <span>+1 123 456 7890</span>
                  </div>
                  <div className="contact-item">
                    <Mail className="contact-icon" />
                    <span>info@example.com</span>
                  </div>
                </div>
              </div>


              {/* Resume Navigation Menu */}
              <nav className="sidebar-nav">
                {resumeSidebarItems.map((item) => (
                  <button
                    key={item.id}
                    className={`nav-item ${item.active ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </button>
                ))}
              </nav>
            </>
          ) : (
            <>
              {/* Profile Section for Main Dashboard */}
              <div className="sidebar-profile">
                <div className="profile-avatar">
                  <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" alt="Profile" />
                  <button className="camera-btn">
                    <Camera className="camera-icon" />
        </button>
                </div>
                <h3 className="profile-name">David Matin</h3>
                <p className="profile-title">Web developer</p>
      </div>

              {/* Main Navigation Menu */}
              <nav className="sidebar-nav">
                {mainSidebarItems.map((item) => (
                  <button
                    key={item.id}
                    className={`nav-item ${item.active ? 'active' : ''}`}
                    onClick={() => item.action ? item.action() : setActiveTab(item.id)}
                  >
                    <item.icon className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </button>
                ))}
              </nav>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className={`dashboard-main ${activeTab === 'resume' ? 'resume-main' : ''}`}>
          {activeTab === 'profile' ? (
            <div className="profile-form-container">
              {/* Basic Information Section */}
              <div className="basic-info-section">
              <h2 className="section-title">BASIC INFORMATION</h2>
              
              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">YOUR NAME:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="field-input"
                  />
                </div>
                
                <div className="form-field">
                  <label className="field-label">PROFESSIONAL TITLE:</label>
                  <input
                    type="text"
                    name="professionalTitle"
                    value={formData.professionalTitle}
                    onChange={handleInputChange}
                    placeholder="e.g. Web Developer, Designer"
                    className="field-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">LANGUAGES:</label>
                  <input
                    type="text"
                    name="languages"
                    value={formData.languages}
                    onChange={handleInputChange}
                    placeholder="e.g. English, Spanish, French"
                    className="field-input"
                  />
                </div>
                
                <div className="form-field">
                  <label className="field-label">AGE:</label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="e.g. 25 Years"
                    className="field-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">CURRENT SALARY($):</label>
                  <input
                    type="text"
                    name="currentSalary"
                    value={formData.currentSalary}
                    onChange={handleInputChange}
                    placeholder="e.g. 50000"
                    className="field-input"
                  />
                </div>
                
                <div className="form-field">
                  <label className="field-label">EXPECTED SALARY:</label>
                  <input
                    type="text"
                    name="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={handleInputChange}
                    placeholder="e.g. 60000"
                    className="field-input"
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label className="field-label">DESCRIPTION:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself, your experience, and what makes you unique..."
                  className="field-textarea"
                  rows={4}
                />
              </div>
              </div>

              {/* Contact Information Section */}
              <div className="contact-info-section">
                <h2 className="section-heading">CONTACT INFORMATION</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Phone:</label>
              <input
                type="text"
                      name="phone"
                value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +1 234 567 8900"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address:</label>
              <input
                type="email"
                      name="email"
                value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. john.doe@email.com"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country:</label>
              <input
                type="text"
                      name="country"
                value={formData.country}
                      onChange={handleInputChange}
                      placeholder="e.g. United States"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Postcode:</label>
              <input
                type="text"
                      name="postcode"
                value={formData.postcode}
                      onChange={handleInputChange}
                      placeholder="e.g. 12345"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">City:</label>
              <input
                type="text"
                      name="city"
                value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. New York"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Address:</label>
              <input
                type="text"
                      name="fullAddress"
                value={formData.fullAddress}
                      onChange={handleInputChange}
                      placeholder="e.g. 123 Main St, Apt 4B"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid rgba(59, 130, 246, 0.1)' }}>
              <button className="save-btn" onClick={handleSaveSettings}>
                Save Setting
            </button>
              </div>
          </div>
          ) : activeTab === 'saved' ? (
            <div>
              <div className="saved-jobs-header">
                <div className="header-left">
                  <h2 className="jobs-count">{savedJobs.length} SAVED JOBS</h2>
                  <div className="sort-dropdown">
                    <span>Sort by freshness</span>
                    <select 
                      value={jobFilters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="sort-select"
                    >
                      <option value="freshness">Sort by freshness</option>
                      <option value="title">Sort by title</option>
                      <option value="company">Sort by company</option>
                    </select>
                  </div>
                </div>
                <button 
                  className="add-job-btn"
                  onClick={() => navigate('/jobs')}
                >
                  <span className="plus-icon">+</span>
                  Browse Jobs
                </button>
      </div>

              {/* Search Bar */}
              <div className="search-section">
                <input
                  type="text"
                  placeholder="Search saved jobs..."
                  value={jobFilters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="search-input"
                />
              </div>

              {/* Jobs Table */}
              <div className="jobs-table">
                <div className="table-header">
                  <div className="header-cell premium-jobs">Premium jobs</div>
                  <div className="header-cell company">Company</div>
                  <div className="header-cell date">Date</div>
                  <div className="header-cell action">Action</div>
      </div>

                <div className="table-body">
                  {savedJobsLoading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading saved jobs...</p>
                    </div>
                  ) : filteredJobs.length > 0 ? (
                    filteredJobs.map((job, index) => (
                      <div key={job.id} className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                        <div className="cell premium-jobs">
                          <div className="premium-icon">
                            <div className="target-icon">🎯</div>
        </div>
                          <span className="job-title">{job.title}</span>
                        </div>
                        <div className="cell company">
                          <span className="company-name">@{job.company}</span>
                        </div>
                        <div className="cell date">
                          <span className="saved-date">{job.savedDate}</span>
                        </div>
                        <div className="cell action">
                          <button 
                            className="action-btn edit"
                            onClick={() => {
                              const slug = (job as any).slug || buildJobSlug({
                                title: job.title,
                                company: job.company,
                                location: job.location || null,
                                id: job.id
                              });
                              navigate(`/jobs/${slug}`);
                            }}
                            title="View Job Details"
                          >
                            👁️
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleUnsaveJob(job.id)}
                            disabled={unsaveLoading === job.id}
                            title="Remove from Saved Jobs"
                          >
                            {unsaveLoading === job.id ? '⏳' : '🗑️'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-jobs">
                      <div className="no-jobs-icon">💼</div>
                      <h3>No saved jobs found</h3>
                      <p>Start saving jobs you're interested in to see them here.</p>
                      <button 
                        onClick={retryLoadSavedJobs}
                        className="retry-btn"
                        style={{
                          marginTop: '1rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
                </div>
                </div>
          ) : activeTab === 'applied' ? (
            <div>
              <div className="applied-jobs-header">
                <div className="header-left">
                  <h2 className="jobs-count">{appliedJobs.length} APPLIED JOBS</h2>
                  <div className="sort-dropdown">
                    <span>Sort by freshness</span>
                    <select 
                      value={appliedJobFilters.sortBy}
                      onChange={(e) => handleAppliedJobFilterChange('sortBy', e.target.value)}
                      className="sort-select"
                    >
                      <option value="freshness">Sort by freshness</option>
                      <option value="title">Sort by title</option>
                      <option value="company">Sort by company</option>
                      <option value="status">Sort by status</option>
                    </select>
              </div>
                </div>
                <div className="status-filter">
                  <select 
                    value={appliedJobFilters.status}
                    onChange={(e) => handleAppliedJobFilterChange('status', e.target.value)}
                    className="status-select"
                  >
                    <option value="all">All Status</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
              </div>
        </div>

              {/* Search Bar */}
              <div className="search-section">
                <input
                  type="text"
                  placeholder="Search applied jobs..."
                  value={appliedJobFilters.search}
                  onChange={(e) => handleAppliedJobFilterChange('search', e.target.value)}
                  className="search-input"
                />
              </div>

              {/* Applied Jobs Table */}
              <div className="jobs-table">
                <div className="table-header">
                  <div className="header-cell premium-jobs">Applied Jobs</div>
                  <div className="header-cell company">Company</div>
                  <div className="header-cell status">Status</div>
                  <div className="header-cell date">Applied Date</div>
                  <div className="header-cell action">Action</div>
                </div>
                
                <div className="table-body">
                  {filteredAppliedJobs.length > 0 ? (
                    filteredAppliedJobs.map((job, index) => (
                      <div key={job.id} className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                        <div className="cell premium-jobs">
                          <div className="premium-icon">
                            <div className="target-icon">🎯</div>
                          </div>
                          <span className="job-title">{job.title}</span>
                        </div>
                        <div className="cell company">
                          <span className="company-name">@{job.company}</span>
                        </div>
                        <div className="cell status">
                          <span className={`status-badge ${job.status.toLowerCase().replace(' ', '-')}`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="cell date">
                          <span className="applied-date">{job.appliedDate}</span>
                        </div>
                        <div className="cell action">
          <button
                            className="action-btn view"
                            onClick={() => handleAppliedJobAction(job.id, 'view')}
                          >
                            👁️
                          </button>
                          <button 
                            className="action-btn withdraw"
                            onClick={() => handleAppliedJobAction(job.id, 'withdraw')}
                          >
                            🗑️
          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-jobs">
                      <div className="no-jobs-icon">💼</div>
                      <h3>No applied jobs found</h3>
                      <p>You haven't applied to any jobs yet.</p>
        </div>
      )}
                </div>
              </div>
            </div>
          ) : activeTab === 'alerts' ? (
            <div>
              <div className="job-alerts-header">
                <div className="header-left">
                  <h2 className="alerts-count">JOB ALERTS</h2>
                  <div className="sort-dropdown">
                    <span>Sort by freshness</span>
                    <select 
                      value={jobAlertFilters.sortBy}
                      onChange={(e) => handleJobAlertFilterChange('sortBy', e.target.value)}
                      className="sort-select"
                    >
                      <option value="freshness">Last 2 Months</option>
                      <option value="title">Sort by title</option>
                      <option value="date">Sort by date</option>
                    </select>
                  </div>
                </div>
      </div>

              {/* Search Bar */}
              <div className="search-section">
                <input
                  type="text"
                  placeholder="Search job alerts..."
                  value={jobAlertFilters.search}
                  onChange={(e) => handleJobAlertFilterChange('search', e.target.value)}
                  className="search-input"
                />
            </div>

              {/* Job Alerts Table */}
              <div className="jobs-table">
                <div className="table-header job-alerts">
                  <div className="header-cell premium-jobs">Premium jobs</div>
                  <div className="header-cell criterias">Criterias</div>
                  <div className="header-cell date">Date</div>
                  <div className="header-cell action">Action</div>
          </div>
                
                <div className="table-body">
                  {filteredJobAlerts.length > 0 ? (
                    filteredJobAlerts.map((alert, index) => (
                      <div key={alert.id} className={`table-row job-alerts ${index % 2 === 0 ? 'even' : 'odd'}`}>
                        <div className="cell premium-jobs">
                          <div className="premium-icon">
                            <div className="target-icon">🎯</div>
            </div>
                          <span className="job-title">{alert.title}</span>
          </div>
                        <div className="cell criterias">
                          <span className="criteria-text">{alert.criteria}</span>
        </div>
                        <div className="cell date">
                          <span className="alert-date">{alert.date}</span>
            </div>
                        <div className="cell action">
                          <button 
                            className="action-btn view"
                            onClick={() => handleJobAlertAction(alert.id, 'view')}
                          >
                            👁️
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleJobAlertAction(alert.id, 'delete')}
                          >
                            🗑️
                          </button>
          </div>
        </div>
                    ))
                  ) : (
                    <div className="no-jobs">
                      <div className="no-jobs-icon">🔔</div>
                      <h3>No job alerts found</h3>
                      <p>Create job alerts to get notified about new opportunities.</p>
      </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'password' ? (
            <div>
              <div className="password-header">
                <h2>Change Password</h2>
                <p className="password-subtitle">Update your password to keep your account secure</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="password-form">
                {/* Current Password */}
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div className="password-input-container">
                    <input
                      type={passwordValidation.showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className={`form-input ${passwordValidation.errors.currentPassword ? 'error' : ''}`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('showCurrentPassword')}
                    >
                      {passwordValidation.showCurrentPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {passwordValidation.errors.currentPassword && (
                    <span className="error-message">{passwordValidation.errors.currentPassword}</span>
                  )}
                </div>

                {/* New Password */}
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="password-input-container">
                    <input
                      type={passwordValidation.showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className={`form-input ${passwordValidation.errors.newPassword ? 'error' : ''}`}
                      placeholder="Enter your new password"
                    />
      <button 
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('showNewPassword')}
                    >
                      {passwordValidation.showNewPassword ? '🙈' : '👁️'}
      </button>
                  </div>
                  {passwordValidation.errors.newPassword && (
                    <span className="error-message">{passwordValidation.errors.newPassword}</span>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {passwordData.newPassword && (
                    <div className="password-strength">
                      <div className="strength-label">Password Strength:</div>
                      <div className="strength-bar">
                        <div 
                          className={`strength-progress ${passwordValidation.passwordStrength <= 2 ? 'weak' : passwordValidation.passwordStrength <= 3 ? 'medium' : 'strong'}`}
                          style={{ width: `${(passwordValidation.passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <div className="strength-text">
                        {passwordValidation.passwordStrength <= 2 ? 'Weak' : 
                         passwordValidation.passwordStrength <= 3 ? 'Medium' : 'Strong'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="password-input-container">
                    <input
                      type={passwordValidation.showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className={`form-input ${passwordValidation.errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('showConfirmPassword')}
                    >
                      {passwordValidation.showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {passwordValidation.errors.confirmPassword && (
                    <span className="error-message">{passwordValidation.errors.confirmPassword}</span>
                  )}
                  
                  {/* Password Match Indicator */}
                  {passwordData.confirmPassword && (
                    <div className={`password-match ${passwordValidation.passwordMatch ? 'match' : 'no-match'}`}>
                      {passwordValidation.passwordMatch ? '✅ Passwords match' : '❌ Passwords do not match'}
                    </div>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="password-requirements">
                  <h4>Password Requirements:</h4>
                  <ul>
                    <li className={passwordData.newPassword.length >= 8 ? 'met' : ''}>
                      At least 8 characters long
                    </li>
                    <li className={/[a-z]/.test(passwordData.newPassword) ? 'met' : ''}>
                      Contains lowercase letter
                    </li>
                    <li className={/[A-Z]/.test(passwordData.newPassword) ? 'met' : ''}>
                      Contains uppercase letter
                    </li>
                    <li className={/[0-9]/.test(passwordData.newPassword) ? 'met' : ''}>
                      Contains number
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(passwordData.newPassword) ? 'met' : ''}>
                      Contains special character
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                  <button type="submit" className="update-password-btn">
                    Update Password
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setPasswordValidation({
                        showCurrentPassword: false,
                        showNewPassword: false,
                        showConfirmPassword: false,
                        passwordStrength: 0,
                        passwordMatch: false,
                        errors: {}
                      });
                    }}
                  >
                    Cancel
                  </button>
              </div>
              </form>
              </div>
          ) : activeTab === 'resume' ? (
            <div className="resume-form-container">
              {/* Pending Actions */}
              <div className="pending-actions">
                <h3>Pending Action</h3>
                <div className="completed-tasks">
                  <div className="task-item completed">
                    <span className="checkmark">✓</span>
                    <span>Verify Mobile Number</span>
                  </div>
                  <div className="task-item completed">
                    <span className="checkmark">✓</span>
                    <span>Add Preferred Location</span>
                  </div>
                  <div className="task-item completed">
                    <span className="checkmark">✓</span>
                    <span>Add Resume</span>
                  </div>
                </div>
              </div>

              {/* Resume Headline */}
              <div className="resume-card">
                <div className="card-header">
                  <h3>Resume Headline</h3>
                  <button className="edit-btn">
                    <User className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <p>{resumeData.resumeHeadline}</p>
                </div>
              </div>

              {/* Key Skills */}
              <div className="resume-card">
                <div className="card-header">
                  <h3>Key Skills</h3>
                  <button className="edit-btn">
                    <User className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <div className="skills-container">
                    {resumeData.keySkills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Employment */}
              <div className="resume-card">
                <div className="card-header">
                  <h3>Employment</h3>
                  <button className="edit-btn">
                    <User className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <div className="employment-item">
                    <h4>{resumeData.employment.position}</h4>
                    <p className="company">{resumeData.employment.company}</p>
                    <p className="duration">{resumeData.employment.duration}</p>
                    <p className="availability">{resumeData.employment.availability}</p>
                    <p className="role">{resumeData.employment.role}</p>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="resume-card">
                <div className="card-header">
                  <h3>Education</h3>
                  <button className="edit-btn">
                    <User className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  {resumeData.education.map((edu, index) => (
                    <div key={index} className="education-item">
                      <p>{edu.location} - {edu.level} ({edu.year})</p>
                    </div>
                  ))}
                  <div className="add-education">
                    <button className="add-btn">Add Doctorate/PhD</button>
                    <button className="add-btn">Add Masters/Post-Graduation</button>
                    <button className="add-btn">Add Graduation/Diploma</button>
                  </div>
                </div>
              </div>

              {/* IT Skills */}
              <div className="resume-card">
                <div className="card-header">
                  <h3>IT Skills</h3>
                  <button className="edit-btn">
                    <User className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <div className="skills-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Skills</th>
                          <th>Version</th>
                          <th>Last Used</th>
                          <th>Experience</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumeData.itSkills.map((skill, index) => (
                          <tr key={index}>
                            <td>{skill.skill}</td>
                            <td>{skill.version}</td>
                            <td>{skill.lastUsed}</td>
                            <td>{skill.experience}</td>
                            <td>
                              <button className="edit-btn-small">
                                <User className="edit-icon" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Projects */}
              <div className="resume-card">
                <div className="card-header">
                  <h3>Projects</h3>
                  <button className="edit-btn">
                    <User className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  {resumeData.projects.map((project, index) => (
                    <div key={index} className="project-item">
                      <h4>{project.name}</h4>
                      <p className="company">{project.company}</p>
                      <p className="duration">{project.duration}</p>
                      <p className="description">{project.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Summary */}
              <div className="resume-card">
                <div className="card-header">
                  <h3>Profile Summary</h3>
                  <button className="edit-btn">
                    <User className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <textarea
                    placeholder="Your Profile Summary should mention the highlights of your career and education, what your professional interests are, and what kind of a career you are looking for. Write a meaningful summary of more than 50 characters."
                    className="profile-summary-textarea"
                    rows={4}
                  />
                </div>
              </div>

              {/* Accomplishments */}
              <div className="resume-card">
                <div className="card-header">
                  <h3>Accomplishments</h3>
                  <button className="edit-btn">
                    <User className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <div className="accomplishments-grid">
                    <div className="accomplishment-item">
                      <label>Online Profile</label>
                      <input type="text" placeholder="Add Online Profile" />
                    </div>
                    <div className="accomplishment-item">
                      <label>Work Sample</label>
                      <input type="text" placeholder="Add Work Sample" />
                    </div>
                    <div className="accomplishment-item">
                      <label>White Paper / Research Publication / Journal Entry</label>
                      <input type="text" placeholder="Add Research" />
                    </div>
                    <div className="accomplishment-item">
                      <label>Presentation</label>
                      <input type="text" placeholder="Add Presentation" />
                    </div>
                    <div className="accomplishment-item">
                      <label>Patent</label>
                      <input type="text" placeholder="Add Patent" />
                    </div>
                    <div className="accomplishment-item">
                      <label>Certification</label>
                      <input type="text" placeholder="Add Certification" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Desired Career Profile */}
              <div className="resume-card">
                <div className="card-header">
                  <h3>Desired Career Profile</h3>
                  <button className="edit-btn">
                    <User className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <div className="career-grid">
                    <div className="career-item">
                      <label>Industry</label>
                      <input type="text" value={resumeData.desiredCareer.industry} readOnly />
                    </div>
                    <div className="career-item">
                      <label>Functional Area</label>
                      <input type="text" value={resumeData.desiredCareer.functionalArea} readOnly />
                    </div>
                    <div className="career-item">
                      <label>Role</label>
                      <input type="text" value={resumeData.desiredCareer.role} readOnly />
                    </div>
                    <div className="career-item">
                      <label>Job Type</label>
                      <input type="text" value={resumeData.desiredCareer.jobType} readOnly />
                    </div>
                    <div className="career-item">
                      <label>Employment Type</label>
                      <input type="text" value={resumeData.desiredCareer.employmentType} readOnly />
                    </div>
                    <div className="career-item">
                      <label>Availability to Join</label>
                      <input type="text" value={resumeData.desiredCareer.availabilityToJoin} readOnly />
                    </div>
                    <div className="career-item">
                      <label>Expected Salary</label>
                      <input type="text" value={resumeData.desiredCareer.expectedSalary} readOnly />
                    </div>
                    <div className="career-item">
                      <label>Desired Shift</label>
                      <input type="text" placeholder="Add Desired Shift" />
                    </div>
                    <div className="career-item">
                      <label>Desired Location</label>
                      <input type="text" placeholder="Add Desired Location" />
                    </div>
                    <div className="career-item">
                      <label>Desired Industry</label>
                      <input type="text" placeholder="Add Desired Industry" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="resume-card">
                <div className="card-header">
                  <h3>Personal Details</h3>
                  <button className="edit-btn">
                    <User className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <div className="personal-grid">
                    <div className="personal-item">
                      <label>Date of Birth</label>
                      <input type="text" value={resumeData.personalDetails.dateOfBirth} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Permanent Address</label>
                      <input type="text" value={resumeData.personalDetails.permanentAddress} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Gender</label>
                      <input type="text" value={resumeData.personalDetails.gender} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Area Pin Code</label>
                      <input type="text" value={resumeData.personalDetails.areaPinCode} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Marital Status</label>
                      <input type="text" value={resumeData.personalDetails.maritalStatus} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Hometown</label>
                      <input type="text" value={resumeData.personalDetails.hometown} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Passport Number</label>
                      <input type="text" value={resumeData.personalDetails.passportNumber} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Work permit of other country</label>
                      <input type="text" value={resumeData.personalDetails.workPermit} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Differently Abled</label>
                      <input type="text" value={resumeData.personalDetails.differentlyAbled} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Languages</label>
                      <input type="text" value={resumeData.personalDetails.languages} readOnly />
                    </div>
                  </div>
                </div>
              </div>

              {/* Attach Resume */}
              <div className="resume-card">
                <div className="card-header">
                  <h3>Attach Resume</h3>
                  <button className="edit-btn">
                    <User className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <p className="resume-description">
                    Your resume is the most important document in your job search. It's your first impression with employers, 
                    so it needs to be perfect. Upload your resume in PDF, DOC, or DOCX format.
                  </p>
                  <div className="resume-upload">
                    <div className="upload-area">
                      <FileText className="upload-icon" />
                      <p>Upload Resume</p>
                      <p className="file-size">File size is 3 MB</p>
                    </div>
                  </div>
                  <div className="resume-alternative">
                    <p>Don't have a resume? <a href="#">Write your brief professional profile here</a></p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'resume-headline' ? (
            <div>
              <div className="resume-card">
                <div className="card-header">
                  <h3>Resume Headline</h3>
                  <button className="edit-btn">
                    <Edit className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <p>{resumeData.resumeHeadline}</p>
                </div>
              </div>
            </div>
          ) : activeTab === 'key-skills' ? (
            <div>
              <div className="resume-card">
                <div className="card-header">
                  <h3>Key Skills</h3>
                  <button className="edit-btn">
                    <Edit className="edit-icon" />
            </button>
          </div>
                <div className="card-content">
                  <div className="skills-container">
                    {resumeData.keySkills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
      </div>
      </div>
          ) : activeTab === 'employment' ? (
            <div>
              <div className="resume-card">
                <div className="card-header">
                  <h3>Employment</h3>
                  <button className="edit-btn">
                    <Edit className="edit-icon" />
                  </button>
      </div>
                <div className="card-content">
                  <div className="employment-item">
                    <h4>{resumeData.employment.position}</h4>
                    <p className="company">{resumeData.employment.company}</p>
                    <p className="duration">{resumeData.employment.duration}</p>
                    <p className="availability">{resumeData.employment.availability}</p>
                    <p className="role">{resumeData.employment.role}</p>
        </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'education' ? (
            <div>
              <div className="resume-card">
                <div className="card-header">
                  <h3>Education</h3>
                  <button className="edit-btn">
                    <Edit className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  {resumeData.education.map((edu, index) => (
                    <div key={index} className="education-item">
                      <p>{edu.location} - {edu.level} ({edu.year})</p>
                    </div>
                  ))}
                  <div className="add-education">
                    <button className="add-btn">Add Doctorate/PhD</button>
                    <button className="add-btn">Add Masters/Post-Graduation</button>
                    <button className="add-btn">Add Graduation/Diploma</button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'it-skills' ? (
            <div>
              <div className="resume-card">
                <div className="card-header">
                  <h3>IT Skills</h3>
                  <button className="edit-btn">
                    <Edit className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <div className="skills-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Skills</th>
                          <th>Version</th>
                          <th>Last Used</th>
                          <th>Experience</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumeData.itSkills.map((skill, index) => (
                          <tr key={index}>
                            <td>{skill.skill}</td>
                            <td>{skill.version}</td>
                            <td>{skill.lastUsed}</td>
                            <td>{skill.experience}</td>
                            <td>
                              <button className="edit-btn-small">
                                <Edit className="edit-icon" />
                </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'projects' ? (
            <div>
              <div className="resume-card">
                <div className="card-header">
                  <h3>Projects</h3>
                  <button className="edit-btn">
                    <Edit className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  {resumeData.projects.map((project, index) => (
                    <div key={index} className="project-item">
                      <h4>{project.name}</h4>
                      <p className="company">{project.company}</p>
                      <p className="duration">{project.duration}</p>
                      <p className="description">{project.description}</p>
                    </div>
          ))}
        </div>
              </div>
            </div>
          ) : activeTab === 'profile-summary' ? (
            <div>
              <div className="resume-card">
                <div className="card-header">
                  <h3>Profile Summary</h3>
                  <button className="edit-btn">
                    <Edit className="edit-icon" />
          </button>
        </div>
                <div className="card-content">
                  <textarea
                    placeholder="Your Profile Summary should mention the highlights of your career and education, what your professional interests are, and what kind of a career you are looking for. Write a meaningful summary of more than 50 characters."
                    className="profile-summary-textarea"
                    rows={4}
                  />
                </div>
      </div>
            </div>
          ) : activeTab === 'accomplishments' ? (
            <div>
              <div className="resume-card">
                <div className="card-header">
                  <h3>Accomplishments</h3>
                  <button className="edit-btn">
                    <Edit className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <div className="accomplishments-grid">
                    <div className="accomplishment-item">
                      <label>Online Profile</label>
                      <input type="text" placeholder="Add Online Profile" />
                    </div>
                    <div className="accomplishment-item">
                      <label>Work Sample</label>
                      <input type="text" placeholder="Add Work Sample" />
                    </div>
                    <div className="accomplishment-item">
                      <label>White Paper / Research Publication / Journal Entry</label>
                      <input type="text" placeholder="Add Research" />
                    </div>
                    <div className="accomplishment-item">
                      <label>Presentation</label>
                      <input type="text" placeholder="Add Presentation" />
                    </div>
                    <div className="accomplishment-item">
                      <label>Patent</label>
                      <input type="text" placeholder="Add Patent" />
                    </div>
                    <div className="accomplishment-item">
                      <label>Certification</label>
                      <input type="text" placeholder="Add Certification" />
                    </div>
                  </div>
                </div>
          </div>
            </div>
          ) : activeTab === 'desired-career' ? (
            <div>
              <div className="resume-card">
                <div className="card-header">
                  <h3>Desired Career Profile</h3>
                  <button className="edit-btn">
                    <Edit className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <div className="career-grid">
                    <div className="career-item">
                      <label>Industry</label>
                      <input type="text" value={resumeData.desiredCareer.industry} readOnly />
                    </div>
                    <div className="career-item">
                      <label>Functional Area</label>
                      <input type="text" value={resumeData.desiredCareer.functionalArea} readOnly />
                    </div>
                    <div className="career-item">
                      <label>Role</label>
                      <input type="text" value={resumeData.desiredCareer.role} readOnly />
                    </div>
                    <div className="career-item">
                      <label>Job Type</label>
                      <input type="text" value={resumeData.desiredCareer.jobType} readOnly />
                    </div>
                    <div className="career-item">
                      <label>Employment Type</label>
                      <input type="text" value={resumeData.desiredCareer.employmentType} readOnly />
                    </div>
                    <div className="career-item">
                      <label>Availability to Join</label>
                      <input type="text" value={resumeData.desiredCareer.availabilityToJoin} readOnly />
                    </div>
                    <div className="career-item">
                      <label>Expected Salary</label>
                      <input type="text" value={resumeData.desiredCareer.expectedSalary} readOnly />
                    </div>
                    <div className="career-item">
                      <label>Desired Shift</label>
                      <input type="text" placeholder="Add Desired Shift" />
                    </div>
                    <div className="career-item">
                      <label>Desired Location</label>
                      <input type="text" placeholder="Add Desired Location" />
                    </div>
                    <div className="career-item">
                      <label>Desired Industry</label>
                      <input type="text" placeholder="Add Desired Industry" />
                    </div>
                  </div>
          </div>
        </div>
            </div>
          ) : activeTab === 'personal-details' ? (
            <div>
              <div className="resume-card">
                <div className="card-header">
                  <h3>Personal Details</h3>
                  <button className="edit-btn">
                    <Edit className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <div className="personal-grid">
                    <div className="personal-item">
                      <label>Date of Birth</label>
                      <input type="text" value={resumeData.personalDetails.dateOfBirth} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Permanent Address</label>
                      <input type="text" value={resumeData.personalDetails.permanentAddress} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Gender</label>
                      <input type="text" value={resumeData.personalDetails.gender} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Area Pin Code</label>
                      <input type="text" value={resumeData.personalDetails.areaPinCode} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Marital Status</label>
                      <input type="text" value={resumeData.personalDetails.maritalStatus} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Hometown</label>
                      <input type="text" value={resumeData.personalDetails.hometown} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Passport Number</label>
                      <input type="text" value={resumeData.personalDetails.passportNumber} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Work permit of other country</label>
                      <input type="text" value={resumeData.personalDetails.workPermit} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Differently Abled</label>
                      <input type="text" value={resumeData.personalDetails.differentlyAbled} readOnly />
                    </div>
                    <div className="personal-item">
                      <label>Languages</label>
                      <input type="text" value={resumeData.personalDetails.languages} readOnly />
          </div>
        </div>
      </div>
              </div>
            </div>
          ) : activeTab === 'attach-resume' ? (
            <div>
              <div className="resume-card">
                <div className="card-header">
                  <h3>Attach Resume</h3>
                  <button className="edit-btn">
                    <Edit className="edit-icon" />
                  </button>
                </div>
                <div className="card-content">
                  <p className="resume-description">
                    Your resume is the most important document in your job search. It's your first impression with employers, 
                    so it needs to be perfect. Upload your resume in PDF, DOC, or DOCX format.
                  </p>
                  <div className="resume-upload">
                    <div className="upload-area">
                      <FileText className="upload-icon" />
                      <p>Upload Resume</p>
                      <p className="file-size">File size is 3 MB</p>
                    </div>
                  </div>
                  <div className="resume-alternative">
                    <p>Don't have a resume? <a href="#">Write your brief professional profile here</a></p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2>Coming Soon</h2>
              <p>This section is under development.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
