import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  MapPin,
  Clock,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobsAPI, employerAPI } from '../../services/api';
import { Job } from '../../types/job';
import EmployerLayout from '../../components/employer/EmployerLayout';
import CompanySetup from '../../components/employer/CompanySetup';

interface JobData extends Job {
  applications: number;
  date: string;
  status: 'active' | 'pending' | 'expired';
  isRead: boolean;
  isStarred: boolean;
}

type SortField = 'title' | 'applications' | 'date' | 'status';
type SortDirection = 'asc' | 'desc';
type FilterTab = 'all' | 'none' | 'read' | 'unread' | 'starred' | 'unstarred';
type SortBy = 'latest' | 'oldest' | 'active' | 'pending' | 'expired';

const ManageJobs: React.FC = () => {
  const navigate = useNavigate();
  const { user, isEmployer, isLoading } = useAuth();

  // State management
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortBy>('latest');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Load jobs from API
  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch employer's jobs with application counts from backend
      const storedCompanyName = localStorage.getItem('employerCompanyName');
      const employerCompanyName = user?.companyName || (user as any)?.company || storedCompanyName || null;
      const employerCompanyId = (user as any)?.companyId || (user as any)?.company_id || null;
      const employerId = user?.id || null;

      const jobsData = await employerAPI.getMyJobs({
        companyName: employerCompanyName,
        companyId: employerCompanyId,
        employerId,
      });
      
      console.log('Employer jobs loaded from backend:', jobsData);
      
      // Transform API data to match our interface
      const transformedJobs: JobData[] = jobsData.map((job: any) => ({
        id: job.id,
        title: job.title || 'Untitled Job',
        company: (() => {
          if (typeof job.company === 'string') return job.company;
          if (job.company && typeof job.company.name === 'string') return job.company.name;
          if (typeof job.companyName === 'string') return job.companyName;
          if (typeof job.company_name === 'string') return job.company_name;
          if (typeof job.organizationName === 'string') return job.organizationName;
          return employerCompanyName || 'Unknown Company';
        })(),
        location: job.location || 'Location Not Specified',
        jobType: job.type || 'Full-time',
        category: job.category || 'General',
        salary: job.salary || 'Competitive',
        description: job.description || '',
        requirements: job.requirements || [],
        responsibilities: job.responsibilities || [],
        benefits: job.benefits || [],
        postedDate: job.createdAt || job.postedDate || new Date().toISOString(),
        deadline: job.deadline || job.applicationDeadline || null,
        isRemote: job.isRemote || false,
        experienceLevel: job.experienceLevel || job.experience || 'Mid-level',
        employmentType: job.employmentType || 'Full-time',
        skills: Array.isArray(job.skills)
          ? job.skills
          : typeof job.skills === 'string'
            ? job.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean)
            : [],
        createdAt: job.createdAt || job.postedDate || new Date().toISOString(),
        updatedAt: job.updatedAt || job.lastUpdated || new Date().toISOString(),
        // Additional fields for ManageJobs interface - now from backend!
        applications: job.applicationsCount || job.applications_count || job.applications?.length || 0,
        date: new Date(job.createdAt || job.postedDate || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        status: (job.status as 'active' | 'pending' | 'expired') || 'active',
        isRead: true,
        isStarred: false,
      }));
      
      setJobs(transformedJobs);
    } catch (err: any) {
      console.error('Error loading jobs:', err);
      setError(err.message || 'Failed to load jobs. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    // Wait for auth loading to complete before checking authentication
    if (!isLoading && (!user || !isEmployer())) {
      navigate('/login');
      return;
    }
  }, [user, navigate, isEmployer, isLoading]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filtered and sorted jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      // Search filter
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Tab filter
      let matchesTab = true;
      switch (activeTab) {
        case 'none':
          matchesTab = false;
          break;
        case 'read':
          matchesTab = job.isRead;
          break;
        case 'unread':
          matchesTab = !job.isRead;
          break;
        case 'starred':
          matchesTab = job.isStarred;
          break;
        case 'unstarred':
          matchesTab = !job.isStarred;
          break;
        default:
          matchesTab = true;
      }

      // Sort by filter
      let matchesSortBy = true;
      switch (sortBy) {
        case 'active':
          matchesSortBy = job.status === 'active';
          break;
        case 'pending':
          matchesSortBy = job.status === 'pending';
          break;
        case 'expired':
          matchesSortBy = job.status === 'expired';
          break;
        default:
          matchesSortBy = true;
      }
      
      return matchesSearch && matchesTab && matchesSortBy;
    });

    // Sort jobs
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle different data types
      if (sortField === 'applications') {
        aValue = a.applications;
        bValue = b.applications;
      } else if (sortField === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [jobs, searchTerm, activeTab, sortBy, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredAndSortedJobs.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleApplicationsClick = (jobId: string, applications: number) => {
    // Navigate to applications page for this job
    console.log(`Viewing ${applications} applications for job ${jobId}`);
    // In a real app: navigate(`/employer/jobs/${jobId}/applications`);
  };


  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-slate-500 transition-colors duration-200" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-blue-500 transition-colors duration-200" /> : 
      <ArrowDown className="w-4 h-4 text-blue-500 transition-colors duration-200" />;
  };

  // Removed unused getStatusBadgeClass to resolve lint warning

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'expired': return 'Closed';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };


  const handleRefresh = () => {
    loadJobs();
  };

  const handleEditJob = (jobId: string) => {
    console.log('Edit job:', jobId);
    // Navigate to edit job page
    navigate(`/employer/edit-job/${jobId}`);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(jobId);
      setError(null); // Clear any previous errors
      
      console.log('Attempting to delete job:', jobId);
      const result = await jobsAPI.deleteJob(jobId);
      
      console.log('Delete result:', result);
      
      if (result.deleted > 0 || result.success) {
        setSuccessMessage('Job deleted successfully!');
        // Remove the job from local state immediately for better UX
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      } else {
        setError('Job not found or already deleted.');
      }
    } catch (err: any) {
      console.error('Error deleting job:', err);
      
      // Enhanced error handling
      let errorMessage = 'Failed to delete job. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.status) {
        switch (err.status) {
          case 401:
            errorMessage = 'You are not authorized to delete this job.';
            break;
          case 404:
            errorMessage = 'Job not found.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Error ${err.status}: ${err.message || 'Unknown error'}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const getTabCount = (tab: FilterTab) => {
    switch (tab) {
      case 'all':
        return jobs.length;
      case 'none':
        return 0;
      case 'read':
        return jobs.filter(job => job.isRead).length;
      case 'unread':
        return jobs.filter(job => !job.isRead).length;
      case 'starred':
        return jobs.filter(job => job.isStarred).length;
      case 'unstarred':
        return jobs.filter(job => !job.isStarred).length;
      default:
        return 0;
    }
  };


  // Show loading while auth is loading
  if (isLoading) {
    return (
      <EmployerLayout>
        <div className="flex flex-col items-center justify-center py-15 px-5 text-gray-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
            // Update the user in context
            window.location.reload();
          }} 
        />
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="w-full">
        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-lg mb-4 sm:mb-6 font-medium animate-slideIn fixed top-3 sm:top-5 left-1/2 transform -translate-x-1/2 z-[1000] max-w-lg w-[90%] sm:w-auto shadow-[0_10px_25px_rgba(0,0,0,0.1)] bg-green-50 border border-green-500 text-green-800"
          >
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-green-500" />
            <span className="flex-1 font-medium text-xs sm:text-sm leading-relaxed">{successMessage}</span>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-lg mb-4 sm:mb-6 font-medium animate-slideIn fixed top-3 sm:top-5 left-1/2 transform -translate-x-1/2 z-[1000] max-w-lg w-[90%] sm:w-auto shadow-[0_10px_25px_rgba(0,0,0,0.1)] bg-red-50 border border-red-500 text-red-800"
          >
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-red-500" />
            <span className="flex-1 font-medium text-xs sm:text-sm leading-relaxed">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto bg-none border-none text-red-800 cursor-pointer p-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded transition-all duration-200 hover:bg-red-100 text-lg sm:text-xl">
              ×
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-3 sm:p-4 md:p-6 max-w-7xl w-full mx-auto border border-gray-200"
        >
        <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-5 relative min-h-[60px]">
          <button onClick={() => navigate('/employer/dashboard')} className="flex items-center gap-2 bg-none border-none text-gray-500 text-xs sm:text-sm font-medium cursor-pointer transition-all duration-300 justify-self-start py-2 hover:text-blue-500 hover:-translate-x-1 sm:col-start-1 sm:row-start-1">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="flex justify-center items-center text-center sm:col-start-2 sm:row-start-1 w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 m-0 leading-tight tracking-tight text-center w-full">Manage Jobs</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 sm:col-start-3 sm:row-start-1 sm:justify-self-end w-full sm:w-auto">
            <button 
              onClick={handleRefresh} 
              className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg py-2 sm:py-3 px-3 sm:px-5 font-semibold text-xs sm:text-sm cursor-pointer transition-all duration-300 flex-shrink-0 hover:bg-gray-200 hover:border-gray-400 hover:text-gray-700 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
              title="Refresh jobs"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={() => navigate('/employer/post-job')} className="flex items-center gap-1.5 sm:gap-2 bg-blue-500 text-white border-none rounded-lg py-2 sm:py-3 px-3 sm:px-5 font-semibold text-xs sm:text-sm cursor-pointer transition-all duration-300 flex-1 sm:flex-shrink-0 justify-center hover:bg-blue-600 hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              <span className="text-white whitespace-nowrap">Add New Job</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-3 sm:p-4 md:p-5 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-gray-200"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2.5 sm:py-3 px-3 sm:px-4 pl-9 sm:pl-12 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-800 bg-white transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                />
              </div>
              <div className="relative w-full sm:w-auto sm:min-w-[180px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full py-2.5 sm:py-3 px-3 sm:px-4 pl-9 sm:pl-10 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-800 bg-white cursor-pointer transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] appearance-none pr-8 sm:pr-10"
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {(['all', 'none', 'read', 'unread', 'starred', 'unstarred'] as FilterTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-full text-xs sm:text-sm font-medium cursor-pointer transition-all duration-300 ${
                    activeTab === tab 
                      ? 'bg-blue-500 text-white border border-blue-500' 
                      : 'bg-slate-50 text-gray-600 border border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                  }`}
                >
                  <span className={`font-medium ${
                    activeTab === tab ? 'text-white' : 'text-gray-600'
                  }`}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </span>
                  <span className={`py-0.5 px-1 sm:px-1.5 rounded-lg text-xs font-semibold ${
                    activeTab === tab 
                      ? 'bg-white/30 text-white' 
                      : 'bg-white/20 text-gray-600'
                  }`}>
                    ({getTabCount(tab)})
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Jobs Table Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-3 sm:p-4 md:p-5 shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-gray-200"
          >
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="w-full overflow-x-auto">
                <div className="grid grid-cols-[2.5fr_140px_120px_120px_140px] gap-2 sm:gap-3 py-3 sm:py-4 px-3 sm:px-4 md:px-5 bg-slate-50 border-b-2 border-slate-200 rounded-t-lg min-w-[700px]">
                  <div 
                    className="flex items-center justify-center font-bold text-xs text-slate-800 uppercase tracking-wide text-center p-1 cursor-pointer transition-colors duration-200 select-none gap-0.5 sm:gap-1 flex-row hover:text-blue-500"
                    onClick={() => handleSort('title')}
                  >
                    <span>Job Title</span>
                    {getSortIcon('title')}
                  </div>
                  <div 
                    className="flex items-center justify-center font-bold text-xs text-slate-800 uppercase tracking-wide text-center p-1 cursor-pointer transition-colors duration-200 select-none gap-0.5 sm:gap-1 flex-row hover:text-blue-500"
                    onClick={() => handleSort('applications')}
                  >
                    <span className="hidden sm:inline">Applications</span>
                    <span className="sm:hidden">Apps</span>
                    {getSortIcon('applications')}
                  </div>
                  <div 
                    className="flex items-center justify-center font-bold text-xs text-slate-800 uppercase tracking-wide text-center p-1 cursor-pointer transition-colors duration-200 select-none gap-0.5 sm:gap-1 flex-row hover:text-blue-500"
                    onClick={() => handleSort('date')}
                  >
                    <span>Date</span>
                    {getSortIcon('date')}
                  </div>
                  <div 
                    className="flex items-center justify-center font-bold text-xs text-slate-800 uppercase tracking-wide text-center p-1 cursor-pointer transition-colors duration-200 select-none gap-0.5 sm:gap-1 flex-row hover:text-blue-500"
                    onClick={() => handleSort('status')}
                  >
                    <span>Status</span>
                    {getSortIcon('status')}
                  </div>
                  <div className="flex items-center justify-center font-bold text-xs text-slate-800 uppercase tracking-wide text-center p-1">
                    <span>Actions</span>
                  </div>
                </div>

                <div className="bg-white">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 sm:py-15 px-4 sm:px-5 text-gray-500 gap-3">
                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-500" />
                      <span className="text-sm sm:text-base">Loading jobs...</span>
                    </div>
                  ) : paginatedJobs.length === 0 ? (
                    <div className="text-center py-10 sm:py-15 px-4 sm:px-5 text-gray-500">
                      <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-700 m-0 mb-2">No jobs found</h3>
                      <p className="text-xs sm:text-sm m-0">Try adjusting your search criteria or filters.</p>
                    </div>
                  ) : (
                    paginatedJobs.map((job, index) => (
                      <div 
                        key={job.id} 
                        className={`grid grid-cols-[2.5fr_140px_120px_120px_140px] gap-2 sm:gap-3 py-3 sm:py-4 px-3 sm:px-4 md:px-5 border-b border-slate-200 items-center transition-all duration-200 bg-white ${
                          index % 2 === 1 ? 'bg-gray-50' : ''
                        } ${!job.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''} hover:bg-slate-50`}
                      >
                      <div className="flex items-center text-xs text-gray-700 justify-center text-center p-1 min-w-0 overflow-hidden items-start justify-start pr-2 border-r border-slate-100">
                        <div className="w-full">
                          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 m-0 mb-1 leading-tight truncate">{job.title}</h3>
                          <div className="flex flex-wrap gap-1 sm:gap-1.5 text-xs text-gray-500">
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                              <span className="truncate max-w-[100px] sm:max-w-none">{job.location}</span>
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{job.jobType}</span>
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Briefcase className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{job.category}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-gray-700 justify-center text-center p-1 min-w-0 overflow-hidden justify-center p-0 px-1 sm:px-2 border-r border-slate-100">
                        <button
                          onClick={() => handleApplicationsClick(job.id, job.applications)}
                          className="flex flex-col items-center gap-0.5 bg-blue-50 border border-blue-200 py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-md cursor-pointer transition-all duration-200 text-blue-600 min-w-[50px] sm:min-w-[60px] hover:bg-blue-100 hover:border-blue-300 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(37,99,235,0.1)]"
                        >
                          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="font-bold text-xs sm:text-sm leading-none">({job.applications})</span>
                          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wide leading-none hidden sm:inline">Applications</span>
                          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wide leading-none sm:hidden">Apps</span>
                        </button>
                      </div>
                      <div className="flex items-center text-xs text-gray-700 justify-center text-center p-1 min-w-0 overflow-hidden justify-center p-0 px-1 sm:px-2 border-r border-slate-100">
                        <span className="text-gray-500 text-xs font-medium whitespace-nowrap">{job.date}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700 justify-center text-center p-1 min-w-0 overflow-hidden justify-center p-0 px-1 sm:px-2 border-r border-slate-100">
                        <div className={`inline-flex items-center gap-0.5 sm:gap-1 py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold text-center uppercase tracking-wide transition-all duration-200 border min-w-[60px] sm:min-w-[70px] justify-center ${
                          job.status === 'active' 
                            ? 'bg-green-50 text-green-800 border-green-500' 
                            : job.status === 'pending' 
                            ? 'bg-amber-50 text-amber-800 border-amber-500' 
                            : job.status === 'expired' 
                            ? 'bg-red-50 text-red-800 border-red-500' 
                            : 'bg-gray-50 text-gray-600 border-gray-300'
                        }`}>
                          <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0 ${
                            job.status === 'active' 
                              ? 'bg-green-500' 
                              : job.status === 'pending' 
                              ? 'bg-amber-500' 
                              : job.status === 'expired' 
                              ? 'bg-red-500' 
                              : 'bg-gray-500'
                          }`}></span>
                          <span className="text-[10px] sm:text-xs font-semibold tracking-wide leading-none">{getStatusLabel(job.status)}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-gray-700 justify-center text-center p-1 min-w-0 overflow-hidden justify-center p-0 px-1 sm:px-2">
                        <div className="flex flex-col items-center gap-1 sm:gap-1.5 py-1 px-1 sm:px-2 bg-transparent rounded-lg justify-center w-full min-w-[80px] sm:min-w-[100px]">
                          {/* First row: View Applications and Edit */}
                          <div className="flex items-center gap-0.5 sm:gap-1 justify-center w-full">
                            <button
                              onClick={() => navigate(`/employer/jobs/${job.id}/applications`)}
                              className="flex items-center justify-center gap-0.5 sm:gap-1 bg-white border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-xs font-medium h-6 sm:h-7 flex-shrink-0 px-1.5 sm:px-2 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                              title="View Applications"
                            >
                              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-all duration-200 stroke-2 flex-shrink-0" />
                              <span className="text-[10px] sm:text-xs font-medium transition-all duration-200 whitespace-nowrap">{job.applications}</span>
                            </button>
                            <button
                              onClick={() => handleEditJob(job.id)}
                              className="flex items-center justify-center gap-0.5 bg-white border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-xs font-medium min-w-[28px] sm:min-w-9 h-6 sm:h-7 flex-shrink-0 px-1 sm:px-1.5 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-green-50 hover:border-green-200 hover:text-green-600"
                              title="Edit Job"
                            >
                              <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-all duration-200 stroke-2 flex-shrink-0" />
                            </button>
                          </div>
                          {/* Second row: Delete */}
                          <div className="flex items-center justify-center w-full">
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              disabled={deleteLoading === job.id}
                              className="flex items-center justify-center gap-0.5 bg-white border border-gray-200 rounded-md cursor-pointer transition-all duration-200 text-xs font-medium min-w-[28px] sm:min-w-9 h-6 sm:h-7 flex-shrink-0 px-1 sm:px-1.5 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Job"
                            >
                              {deleteLoading === job.id ? (
                                <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-all duration-200 stroke-2 flex-shrink-0" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>

        </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 py-2 sm:py-2.5 px-3 sm:px-4 bg-white text-gray-600 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Prev</span>
                </button>

                <div className="flex flex-wrap justify-center gap-1 mx-2 sm:mx-4">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white text-gray-600 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 ${
                        currentPage === page ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600' : ''
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 py-2 sm:py-2.5 px-3 sm:px-4 bg-white text-gray-600 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}

            {/* Results Summary */}
            <div className="mt-3 sm:mt-4 text-center px-2">
              <p className="text-xs sm:text-sm text-gray-500 m-0">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedJobs.length)} of {filteredAndSortedJobs.length} jobs
              </p>
            </div>
          </motion.div>
      </div>
    </EmployerLayout>
  );
};

export default ManageJobs;