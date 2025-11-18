import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  Users, 
  Briefcase,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  CreditCard,
  Search,
  Shield,
  Star,
  Award,
  Upload,
  Save,
  Phone,
  Mail,
  Globe,
  MapPin as Location,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, employerAPI, BACKEND_BASE_URL } from '../../services/api';
import { Job } from '../../types/job';
import EmployerLayout from '../../components/employer/EmployerLayout';
import CompanySetup from '../../components/employer/CompanySetup';

interface DashboardStats {
  totalJobs: number;
  totalApplications: number;
  pendingApplications: number;
  reviewedApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  responseRate: number;
}

interface RecentApplication {
  id: string;
  job: any;
  user: any;
  status: string;
  createdAt: string;
}

const EmployerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isEmployer, isLoading: authLoading } = useAuth();
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [allApplications, setAllApplications] = useState<any[]>([]);

  useEffect(() => {
    // Wait for auth loading to complete before checking authentication
    if (!authLoading && (!user || !isEmployer())) {
      navigate('/login');
      return;
    }
    if (!authLoading && user && isEmployer()) {
      loadDashboardData();
    }
  }, [user, navigate, isEmployer, authLoading]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setIsLoadingProfile(true);
    
    try {
      // Load all data in parallel
      const [jobsData, statsData, applicationsData, profileData] = await Promise.all([
        employerAPI.getMyJobs().catch(err => {
          console.error('Error loading jobs:', err);
          return [];
        }),
        employerAPI.getStats().catch(err => {
          console.error('Error loading stats:', err);
          return null;
        }),
        employerAPI.getAllApplications().catch(err => {
          console.error('Error loading applications:', err);
          return [];
        }),
        usersAPI.fetchUserById(user!.id).catch(err => {
          console.error('Error loading profile:', err);
          return null;
        })
      ]);

      setPostedJobs(jobsData);
      setStats(statsData);
      setAllApplications(applicationsData);
      setCompanyProfile(profileData);
      
      // Get recent applications (last 5)
      const recent = applicationsData.slice(0, 5);
      setRecentApplications(recent);
      
      console.log('Dashboard data loaded:', {
        jobs: jobsData.length,
        stats: statsData,
        applications: applicationsData.length,
        recent: recent.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingProfile(false);
    }
  };

  const statsCards = [
    {
      icon: Briefcase,
      label: 'Posted Jobs',
      value: stats?.totalJobs || postedJobs.length || 0,
      color: '#2563eb',
      change: '+12%'
    },
    {
      icon: Users,
      label: 'Total Applications',
      value: stats?.totalApplications || 0,
      color: '#10b981',
      change: '+8%'
    },
    {
      icon: Eye,
      label: 'Pending Review',
      value: stats?.pendingApplications || 0,
      color: '#f59e0b',
      change: stats?.pendingApplications ? `${stats.pendingApplications} pending` : 'None'
    },
    {
      icon: TrendingUp,
      label: 'Response Rate',
      value: stats?.responseRate ? `${stats.responseRate}%` : '0%',
      color: '#8b5cf6',
      change: '+3%'
    }
  ];


  const renderOverviewTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="emp-dash-tab"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 m-0 mb-2 leading-tight">Dashboard Overview</h2>
        <p className="text-base text-gray-500 m-0 mb-8 leading-relaxed">
          Welcome back, {user?.name}! Here's what's happening with your job postings.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 sm:gap-6 mb-10">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:border-blue-500 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-600 before:to-blue-500 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
          >
            <div className="w-15 h-15 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stat.color + '20' }}>
              <stat.icon className="w-8 h-8" style={{ color: stat.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-3xl font-bold text-gray-800 m-0 mb-1 leading-none">{stat.value}</h3>
              <p className="text-sm text-gray-500 m-0 mb-2 font-medium">{stat.label}</p>
              <span className="text-xs font-semibold py-0.5 px-2 rounded-xl inline-block bg-green-100 text-green-800">{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 m-0 mb-5">Recent Activity</h3>
        <div className="flex flex-col gap-4">
          {recentApplications.length === 0 ? (
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 transition-all duration-300 hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 m-0 mb-1 leading-relaxed">No recent activity</p>
                <span className="text-xs text-gray-500 font-medium">Waiting for applications</span>
              </div>
            </div>
          ) : (
            recentApplications.map((application) => {
              const timeAgo = new Date(application.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
              });
              
              return (
                <div key={application.id} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 transition-all duration-300 hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 m-0 mb-1 leading-relaxed">
                      New application from {application.user?.name || 'Unknown'} for {application.job?.title || 'Unknown position'}
                    </p>
                    <span className="text-xs text-gray-500 font-medium">{timeAgo}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderJobsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="jobs-tab"
    >
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div className="flex-1 min-w-0 w-full lg:w-auto">
          <h2 className="text-3xl font-bold text-gray-800 m-0 mb-2 leading-tight">Posted Jobs</h2>
          <p className="text-base text-gray-500 m-0 mb-8 leading-relaxed">
            Manage your job postings and track applications
          </p>
        </div>
        <button
          onClick={() => navigate('/employer/post-job')}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white border-none py-3 px-5 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-300 whitespace-nowrap hover:from-blue-700 hover:to-blue-600 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-base">Loading your jobs...</p>
        </div>
      ) : postedJobs.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {postedJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-6 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:border-blue-500 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-600 before:to-blue-500 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 m-0 mb-2 leading-tight">{job.title}</h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="bg-blue-50 text-blue-600 py-1 px-3 rounded-full text-xs font-semibold uppercase tracking-wide">{job.type}</span>
                    <span className="flex items-center gap-1 text-gray-500 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(job.postedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center w-9 h-9 border-none rounded-lg cursor-pointer transition-all duration-300 text-gray-500 hover:scale-110 hover:bg-blue-50 hover:text-blue-600">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="flex items-center justify-center w-9 h-9 border-none rounded-lg cursor-pointer transition-all duration-300 text-gray-500 hover:scale-110 hover:bg-amber-50 hover:text-amber-500">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="flex items-center justify-center w-9 h-9 border-none rounded-lg cursor-pointer transition-all duration-300 text-gray-500 hover:scale-110 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <DollarSign className="w-4 h-4 flex-shrink-0" />
                    <span>{
                      job.displaySalary 
                        || (job?.salary?.min && job?.salary?.max
                              ? `${job?.salary?.currency === 'INR' ? '₹' : '$'}${(job.salary.min / 1000).toFixed(0)}K - ${job?.salary?.currency === 'INR' ? '₹' : '$'}${(job.salary.max / 1000).toFixed(0)}K`
                              : 'Salary not specified')
                    }</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>{job.experience.min}-{job.experience.max} years</span>
                  </div>
                </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <div className="text-center">
                    <span className="block text-lg font-bold text-gray-800 mb-0.5">{job.applicationsCount || 0}</span>
                  <span className="text-xs text-gray-500 font-medium">Applications</span>
                </div>
                <div className="text-center">
                    <span className="block text-lg font-bold text-gray-800 mb-0.5">-</span>
                  <span className="text-xs text-gray-500 font-medium">Views</span>
                </div>
                  <div className="text-center">
                    <span className="block text-lg font-bold text-gray-800 mb-0.5">-</span>
                    <span className="text-xs text-gray-500 font-medium">Shortlisted</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mb-6" />
          <h3 className="text-2xl font-semibold text-gray-700 m-0 mb-3">No Jobs Posted Yet</h3>
          <p className="text-gray-500 text-base leading-relaxed m-0 mb-8 max-w-md">
            Start by posting your first job to attract top talent
          </p>
          <button
            onClick={() => navigate('/employer/post-job')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white border-none py-4 px-6 rounded-xl font-semibold text-base cursor-pointer transition-all duration-300 hover:from-blue-700 hover:to-blue-600 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(37,99,235,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Post Your First Job</span>
          </button>
      </div>
      )}
    </motion.div>
  );

  const renderApplicationsTab = () => (
            <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="applications-tab"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 m-0 mb-2 leading-tight">Applications</h2>
        <p className="text-base text-gray-500 m-0 mb-8 leading-relaxed">
          Review and manage job applications
        </p>
                  </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex flex-col gap-2 w-full sm:min-w-[220px]">
          <label className="text-sm font-semibold text-gray-700">Filter by Job</label>
          <select className="py-2.5 px-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm cursor-pointer transition-all duration-300 focus:outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] w-full">
            <option value="">All Jobs</option>
            {postedJobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
              </div>
        <div className="flex flex-col gap-2 w-full sm:min-w-[220px]">
          <label className="text-sm font-semibold text-gray-700">Status</label>
          <select className="py-2.5 px-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm cursor-pointer transition-all duration-300 focus:outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] w-full">
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {allApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
            <Users className="w-16 h-16 text-gray-400 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-700 m-0 mb-3">No Applications Yet</h3>
            <p className="text-gray-500 text-base leading-relaxed m-0 max-w-md">
              Applications will appear here when candidates apply to your jobs
            </p>
          </div>
        ) : (
          allApplications.slice(0, 5).map((application) => {
            const initials = application.user?.name 
              ? application.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
              : '??';
            
            const timeAgo = new Date(application.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            const statusClass = application.status === 'pending' ? 'new' : application.status;

            return (
              <div key={application.id} className="bg-white border border-gray-200 rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-blue-500">
                <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0 w-full lg:w-auto">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-semibold text-base flex-shrink-0">
                      <span>{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-800 m-0 mb-1">{application.user?.name || 'Unknown'}</h4>
                      <p className="text-sm text-gray-500 m-0 mb-0.5">{application.job?.title || 'Unknown Position'}</p>
                      <p className="text-xs text-gray-400 m-0">{application.job?.location || 'Location Not Specified'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      statusClass === 'new' ? 'bg-blue-100 text-blue-800' : 
                      statusClass === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                      statusClass === 'shortlisted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">{timeAgo}</span>
                  </div>
                </div>
                <div className="mb-5">
                  <p className="text-gray-500 text-sm leading-relaxed m-0 mb-3">
                    {application.coverLetter || 'No cover letter provided.'}
                  </p>
                  {application.user?.skills && application.user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {application.user.skills.slice(0, 4).map((skill: any, idx: number) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 py-1 px-2.5 rounded-2xl text-xs font-medium border border-slate-200">{typeof skill === 'string' ? skill : (skill?.skill || String(skill))}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 flex-wrap">
                  {application.user?.resumeUrl && (
                    <>
                      <button className="flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium w-auto h-auto bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all duration-300" onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${application.user.resumeUrl}`, '_blank')}>
                        <FileText className="w-4 h-4" />
                        <span>View Resume</span>
                      </button>
                       <a 
                         href={`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${application.user.resumeUrl}`}
                         download={`resume-${application.user.name}.pdf`}
                         target="_self"
                         className="flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium w-auto h-auto bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-all duration-300 no-underline"
                       >
                         <Download className="w-4 h-4" />
                         <span>Download</span>
                       </a>
                    </>
                  )}
                  <button className="flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium w-auto h-auto bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-all duration-300">
                    <Users className="w-4 h-4" />
                    <span>Shortlist</span>
                  </button>
                  <button className="flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium w-auto h-auto bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all duration-300">
                    <Trash2 className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );


  const renderCompanyProfileTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="company-profile-tab"
    >
      <div className="profile-header">
        <h2 className="emp-dash-title">Company Profile</h2>
        <p className="emp-dash-subtitle">
          Manage your company information and public profile
        </p>
      </div>

      <div className="profile-sections">
        {/* Basic Information */}
        <div className="profile-section">
          <div className="section-header">
            <Building2 className="section-icon" />
            <h3 className="emp-dash-title">Basic Information</h3>
            <button className="edit-section-btn">
              <Edit className="btn-icon" />
              <span>Edit</span>
            </button>
          </div>
          
          <div className="profile-form">
            <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Company Name</label>
                <input 
                  type="text" 
                  value={isLoadingProfile ? 'Loading...' : companyProfile?.companyName || user?.companyName || ''} 
                  className="form-input" 
                  readOnly 
                />
            </div>
            <div className="form-group">
              <label className="form-label">Industry</label>
                <input 
                  type="text" 
                  value={isLoadingProfile ? 'Loading...' : companyProfile?.industry || ''}
                  placeholder="e.g., Technology, Healthcare" 
                  className="form-input" 
                />
            </div>
            <div className="form-group">
              <label className="form-label">Company Size</label>
              <select className="form-select" value={companyProfile?.companySize || ''}>
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
            <div className="form-group">
                <label className="form-label">Founded Year</label>
                <input 
                  type="number" 
                  value={companyProfile?.foundedYear || ''}
                  placeholder="2020" 
                  className="form-input" 
                />
            </div>
            </div>

            <div className="form-group">
              <label className="form-label">Company Description</label>
              <textarea 
                className="form-textarea" 
                rows={4}
                value={isLoadingProfile ? 'Loading...' : companyProfile?.companyDescription || companyProfile?.description || ''}
                placeholder="Tell candidates about your company, culture, and mission..."
              />
            </div>
            </div>
          </div>

        {/* Contact Information */}
        <div className="profile-section">
          <div className="section-header">
            <Phone className="section-icon" />
            <h3 className="emp-dash-title">Contact Information</h3>
          </div>
          
          <div className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <Mail className="label-icon" />
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={isLoadingProfile ? 'Loading...' : companyProfile?.email || user?.email || ''} 
                  className="form-input" 
                  readOnly 
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Phone className="label-icon" />
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  value={isLoadingProfile ? 'Loading...' : companyProfile?.phone || ''}
                  placeholder="+1 (555) 123-4567" 
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Globe className="label-icon" />
                  Website
                </label>
                <input 
                  type="url" 
                  value={isLoadingProfile ? 'Loading...' : companyProfile?.website || ''}
                  placeholder="https://yourcompany.com" 
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Location className="label-icon" />
                  Address
                </label>
                <input 
                  type="text" 
                  value={isLoadingProfile ? 'Loading...' : companyProfile?.fullAddress || companyProfile?.address || ''}
                  placeholder="123 Business St, City, State 12345" 
                  className="form-input" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Logo */}
        <div className="profile-section">
          <div className="section-header">
            <Upload className="section-icon" />
            <h3 className="emp-dash-title">Company Logo</h3>
          </div>
          
          <div className="logo-upload">
            <div className="current-logo">
              {isLoadingProfile ? (
                <div className="logo-placeholder">
                  <Building2 className="placeholder-icon" />
                  <span>Loading...</span>
                </div>
              ) : companyProfile?.companyLogo ? (
                <img src={(companyProfile.companyLogo?.startsWith('http') ? companyProfile.companyLogo : `${BACKEND_BASE_URL}${companyProfile.companyLogo.startsWith('/') ? '' : '/'}${companyProfile.companyLogo}`)} alt="Company Logo" className="logo-preview" />
              ) : (
                <div className="logo-placeholder">
                  <Building2 className="placeholder-icon" />
                  <span>No logo uploaded</span>
                </div>
              )}
            </div>
            <div className="upload-actions">
              <input id="company-logo-file" type="file" accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  // Use dedicated company logo upload endpoint
                  const res = await profileAPI.uploadCompanyLogo(file);
                  const url = res?.companyLogo || res?.url;
                  if (url) {
                    // Refresh profile to get updated company logo
                    await refreshCompanyProfile?.();
                  }
                } catch (err) {
                  console.error('Company logo upload failed', err);
                } finally {
                  // reset input so same file can be reselected
                  (e.target as HTMLInputElement).value = '';
                }
              }} />
              <button className="upload-btn" onClick={() => document.getElementById('company-logo-file')?.click()}>
                <Upload className="btn-icon" />
                <span>Upload Logo</span>
              </button>
              <p className="upload-hint">Recommended: 200x200px, PNG/JPG/WebP</p>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="save-btn">
            <Save className="btn-icon" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderEmployerResumeTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="employer-resume-tab"
    >
      <div className="resume-header">
        <h2 className="emp-dash-title">Company Overview</h2>
        <p className="emp-dash-subtitle">
          Create a comprehensive company profile that attracts top talent
        </p>
        </div>

      <div className="resume-sections">
        {/* Company Story */}
        <div className="resume-section">
          <div className="section-header">
            <FileText className="section-icon" />
            <h3 className="emp-dash-title">Company Story</h3>
        </div>
          <textarea 
            className="form-textarea" 
            rows={6}
            placeholder="Share your company's journey, mission, and what makes you unique..."
          />
      </div>

        {/* Culture & Values */}
        <div className="resume-section">
          <div className="section-header">
            <Award className="section-icon" />
            <h3 className="emp-dash-title">Culture & Values</h3>
        </div>
          <textarea 
            className="form-textarea" 
            rows={4}
            placeholder="Describe your company culture, values, and work environment..."
          />
              </div>

        {/* Benefits & Perks */}
        <div className="resume-section">
          <div className="section-header">
            <Star className="section-icon" />
            <h3 className="emp-dash-title">Benefits & Perks</h3>
            </div>
          <div className="benefits-grid">
            <div className="benefit-item">
              <input type="checkbox" className="benefit-checkbox" />
              <span>Health Insurance</span>
            </div>
            <div className="benefit-item">
              <input type="checkbox" className="benefit-checkbox" />
              <span>Remote Work</span>
            </div>
            <div className="benefit-item">
              <input type="checkbox" className="benefit-checkbox" />
              <span>Flexible Hours</span>
              </div>
            <div className="benefit-item">
              <input type="checkbox" className="benefit-checkbox" />
              <span>401(k) Matching</span>
            </div>
            <div className="benefit-item">
              <input type="checkbox" className="benefit-checkbox" />
              <span>Professional Development</span>
            </div>
            <div className="benefit-item">
              <input type="checkbox" className="benefit-checkbox" />
              <span>Paid Time Off</span>
            </div>
          </div>
        </div>

        <div className="resume-actions">
          <button className="preview-btn">
                  <Eye className="btn-icon" />
            <span>Preview Profile</span>
                </button>
          <button className="save-btn">
            <Save className="btn-icon" />
            <span>Save Changes</span>
                </button>
              </div>
      </div>
    </motion.div>
  );






  // Show loading while auth is loading
  if (authLoading) {
    return (
      <EmployerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-base">Loading...</p>
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
    <div className="min-h-full bg-slate-50 p-1">
      <div className="max-w-full m-0 p-4 min-h-full bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-gray-200 p-4 sm:p-6 md:p-8 overflow-hidden">
            {renderOverviewTab()}
          </div>
        </div>
      </div>
    </EmployerLayout>
  );
};

export default EmployerDashboard;
