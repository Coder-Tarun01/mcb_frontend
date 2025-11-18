import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin, DollarSign, Eye, FileText, CheckCircle, Clock, XCircle, Grid3X3, List, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { applicationsAPI } from '../../services/api';

interface AppliedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  jobType: string;
  experience: string;
  description: string;
  requirements: string[];
  benefits: string[];
  coverLetter?: string;
  resumeUrl?: string;
}

const AppliedJobs: React.FC = () => {
  const navigate = useNavigate();
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<AppliedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'appliedDate'
  });
  const [selectedJob, setSelectedJob] = useState<AppliedJob | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Load applied jobs from API
  useEffect(() => {
    loadAppliedJobs();
  }, []);

  // Filter and search jobs
  useEffect(() => {
    let filtered = [...appliedJobs];

    // Search filter
    if (filters.search.trim()) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'appliedDate':
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'company':
          return a.company.localeCompare(b.company);
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
  }, [appliedJobs, filters.search, filters.status, filters.sortBy]);

  const loadAppliedJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const applications = await applicationsAPI.getUserApplications();
      console.log('Applications response:', applications);

      // Transform applications data to match AppliedJob interface
      const transformedJobs = applications.map((application: any) => ({
        id: application.id,
        title: application.job?.title || 'Job Title Not Available',
        company: application.job?.company || 'Company Not Available',
        location: application.job?.location || 'Location Not Available',
        jobType: application.job?.type || 'Full-time',
        salary: application.job?.salary ? 
          `${application.job.salary.min} - ${application.job.salary.max}` : 
          'Competitive',
        appliedDate: application.appliedAt || application.createdAt || new Date().toISOString(),
        status: application.status === 'accepted' ? 'accepted' : 
                application.status === 'shortlisted' ? 'accepted' : 
                application.status,
        experience: '2-5 years', // Default since not in backend
        description: application.job?.description || '',
        requirements: application.job?.skills || [],
        benefits: ['Health Insurance', '401k'], // Default since not in backend
        coverLetter: application.coverLetter,
        resumeUrl: application.resumeUrl
      }));

      setAppliedJobs(transformedJobs);
    } catch (err: any) {
      console.error('Error loading applied jobs:', err);
      setError(err.message || 'Failed to load applied jobs. Please check if the backend is running.');
      setAppliedJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="applied-jobs-status-icon" />;
      case 'reviewed': return <Eye className="applied-jobs-status-icon" />;
      case 'accepted': return <CheckCircle className="applied-jobs-status-icon" />;
      case 'rejected': return <XCircle className="applied-jobs-status-icon" />;
      default: return <Clock className="applied-jobs-status-icon" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'reviewed': return '#3b82f6';
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleJobAction = async (id: string, action: 'view' | 'withdraw') => {
    if (action === 'view') {
      // Navigate to application details page
      navigate(`/dashboard/applications/${id}`);
    } else if (action === 'withdraw') {
      try {
        setWithdrawLoading(id);
        await applicationsAPI.withdrawApplication(id);
        // Remove the job from the local state
        setAppliedJobs(prev => prev.filter(job => job.id !== id));
        console.log('Application withdrawn successfully');
      } catch (err: any) {
        console.error('Error withdrawing application:', err);
        setError(err.message || 'Failed to withdraw application');
      } finally {
        setWithdrawLoading(null);
      }
    }
  };

  const handleRefresh = () => {
    loadAppliedJobs();
  };

  const closeJobDetails = () => {
    setSelectedJob(null);
  };

  const getStatusCount = (status: string) => {
    return appliedJobs.filter(job => job.status === status).length;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="min-h-screen pt-0 pb-6 px-4 sm:px-6 bg-gray-50">
      <div className="w-full max-w-7xl mx-auto border-2 border-gray-300 rounded-xl p-4 sm:p-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 flex-1">{error}</span>
          <button 
            className="text-red-500 hover:text-red-700 text-xl font-bold leading-none"
            onClick={() => setError(null)}
            title="Close error"
          >
            ×
          </button>
        </div>
      )}

      {/* Modern Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Applied Jobs</h1>
            <p className="text-gray-600">Track your job applications and their progress</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh applications"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">{appliedJobs.length}</div>
            <div className="text-sm text-gray-600">Total Applied</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{getStatusCount('accepted')}</div>
            <div className="text-sm text-gray-600">Accepted</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-1">{getStatusCount('reviewed')}</div>
            <div className="text-sm text-gray-600">Reviewed</div>
          </div>
        </div>
      </div>

      {/* Modern Controls */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row gap-3 md:gap-2 items-start md:items-center w-full">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applied jobs..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 sm:flex sm:items-center">Status:</label>
              <select 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 sm:flex sm:items-center">Sort by:</label>
              <select 
                value={filters.sortBy} 
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="appliedDate">Applied Date</option>
                <option value="title">Job Title</option>
                <option value="company">Company</option>
              </select>
            </div>
            <div className="flex gap-1 border border-gray-300 rounded-lg p-1 justify-center">
              <button 
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4">
            <RefreshCw className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-gray-500">Loading your applications...</p>
        </div>
      ) : (
        /* Modern Content */
        viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{job.title}</div>
                          <div className="text-sm text-gray-500">{job.jobType} • {job.experience}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">@{job.company}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                            {job.location}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                            {job.salary}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(job.appliedDate)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            job.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                            job.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getStatusIcon(job.status)}
                            <span className="ml-1">{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" 
                              onClick={() => handleJobAction(job.id, 'view')}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50" 
                              onClick={() => handleJobAction(job.id, 'withdraw')}
                              disabled={withdrawLoading === job.id}
                              title="Withdraw Application"
                            >
                              {withdrawLoading === job.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 sm:px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="text-4l mb-4">📋</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No applied jobs found</h3>
                          <p className="text-gray-500 mb-4">Start applying to jobs to see them here.</p>
                          <button 
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            onClick={() => navigate('/jobs')}
                          >
                            Browse Jobs
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.jobType} • {job.experience}</p>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">@{job.company}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                      {job.salary}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      Applied: {formatDate(job.appliedDate)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      job.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                      job.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getStatusIcon(job.status)}
                      <span className="ml-1">{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        onClick={() => handleJobAction(job.id, 'view')}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                        onClick={() => handleJobAction(job.id, 'withdraw')}
                        disabled={withdrawLoading === job.id}
                        title="Withdraw Application"
                      >
                        {withdrawLoading === job.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applied jobs found</h3>
                <p className="text-gray-500 mb-4">Start applying to jobs to see them here.</p>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  onClick={() => navigate('/jobs')}
                >
                  Browse Jobs
                </button>
              </div>
            )}
          </div>
        )
      )}
      </div>

      {/* Modern Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeJobDetails}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">{selectedJob.title}</h3>
              <button className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none" onClick={closeJobDetails}>×</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Company</span>
                  <span className="text-base text-gray-900">{selectedJob.company}</span>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Location</span>
                  <span className="text-base text-gray-900">{selectedJob.location}</span>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Salary</span>
                  <span className="text-base text-gray-900">{selectedJob.salary}</span>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Applied Date</span>
                  <span className="text-base text-gray-900">{formatDate(selectedJob.appliedDate)}</span>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedJob.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedJob.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                    selectedJob.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getStatusIcon(selectedJob.status)}
                    <span className="ml-1">{selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}</span>
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Job Description</h4>
                <p className="text-gray-700">{selectedJob.description}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Requirements</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.requirements.map((req, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{req}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Benefits</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.benefits.map((benefit, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">{benefit}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200" onClick={closeJobDetails}>
                Close
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200" 
                onClick={() => {
                  handleJobAction(selectedJob.id, 'withdraw');
                  closeJobDetails();
                }}
              >
                Withdraw Application
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AppliedJobs;