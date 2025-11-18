import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, DollarSign, Eye, Trash2, RefreshCw, Grid3X3, List, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { savedJobsAPI } from '../../services/api';
import { Job } from '../../types/job';
import { buildJobSlug } from '../../utils/slug';

const SavedJobs: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsaveLoading, setUnsaveLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('savedDate');
  const [stats, setStats] = useState<any>(null);

  // Load saved jobs from API
  useEffect(() => {
    loadSavedJobs();
  }, []);

  // Filter and search jobs
  useEffect(() => {
    let filtered = [...savedJobs];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter (for now, all are 'saved')
    // You can extend this based on job status from backend

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'savedDate':
          return new Date(b.savedDate || 0).getTime() - new Date(a.savedDate || 0).getTime();
        case 'jobTitle':
          return a.title.localeCompare(b.title);
        case 'company':
          return a.company.localeCompare(b.company);
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
  }, [savedJobs, searchQuery, statusFilter, sortBy]);

  const loadSavedJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load saved jobs
      const response = await savedJobsAPI.getSavedJobs();
      const savedJobsData = response.savedJobs || response || [];
      
      console.log('Saved jobs response:', savedJobsData);
      
      // Transform saved jobs data to match Job interface
      const transformedJobs = savedJobsData.map((savedJob: any) => ({
        id: savedJob.jobId || savedJob.id,
        title: savedJob.job?.title || 'Job Title Not Available',
        company: savedJob.job?.company || 'Company Not Available',
        location: savedJob.job?.location || 'Location Not Available',
        jobType: savedJob.job?.type || 'Full-time',
        slug: savedJob.job?.slug,
        salary: savedJob.job?.salary ? 
          `${savedJob.job.salary.min} - ${savedJob.job.salary.max}` : 
          'Competitive',
        savedDate: savedJob.savedAt || savedJob.createdAt || new Date().toISOString(),
        description: savedJob.job?.description || '',
        skills: savedJob.job?.skills || [],
        isRemote: savedJob.job?.isRemote || false
      }));
      
      setSavedJobs(transformedJobs);

      // Load statistics
      try {
        const statsData = await savedJobsAPI.getSavedJobsStats();
        setStats(statsData);
      } catch (statsErr) {
        console.error('Error loading stats:', statsErr);
        // Don't show error for stats, just use local data
        setStats({
          totalSaved: transformedJobs.length,
          recentSaved: 0
        });
      }
    } catch (err: any) {
      console.error('Error loading saved jobs:', err);
      setError(err.message || 'Failed to load saved jobs. Please check if the backend is running.');
      setSavedJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId: string) => {
    try {
      setUnsaveLoading(jobId);
      await savedJobsAPI.unsaveJob(jobId);
      // Remove the job from the local state
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      
      // Show success notification (you can enhance this with a toast)
      console.log('Job removed from saved jobs successfully');
    } catch (err: any) {
      console.error('Error unsaving job:', err);
      setError(err.message || 'Failed to remove job from saved jobs');
    } finally {
      setUnsaveLoading(null);
    }
  };

  const handleViewJob = (job: Job) => {
    // Use slug from job, or build it if missing
    const slug = (job as any).slug || buildJobSlug({
      title: job.title,
      company: job.company,
      location: job.location || null,
      id: job.id
    });
    navigate(`/jobs/${slug}`);
  };

  const handleRefresh = () => {
    loadSavedJobs();
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

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen pt-0 pb-6 px-4 sm:px-6 bg-gray-50"
      >
        <div className="w-full max-w-7xl mx-auto border-2 border-gray-300 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-600">Loading saved jobs...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error && savedJobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen pt-0 pb-6 px-4 sm:px-6 bg-gray-50 flex items-center justify-center"
      >
        <div className="w-full max-w-7xl mx-auto border-2 border-gray-300 rounded-xl p-4 sm:p-6">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={handleRefresh} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pt-0 pb-6 px-4 sm:px-6 bg-gray-50"
    >
      <div className="w-full max-w-7xl mx-auto border-2 border-gray-300 rounded-xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-blue-700 text-center md:text-left w-full">Saved Jobs</h2>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search saved jobs..."
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Categories</option>
              <option>IT / Software</option>
              <option>Marketing</option>
              <option>Finance</option>
              <option>Design</option>
            </select>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`${isLoading ? 'animate-spin' : ''}`} size={18} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Bar */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-blue-600">
              <Heart size={20} />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSaved || savedJobs.length}</div>
              <div className="text-sm text-gray-600">Total Saved</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-blue-500">
              <Clock size={20} />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-blue-600">{stats.recentSaved || 0}</div>
              <div className="text-sm text-gray-600">Last 7 Days</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && savedJobs.length > 0 && (
        <div className="mb-6 p-4 rounded-lg flex items-center gap-3 bg-red-100 text-red-800 border border-red-200">
          <AlertCircle size={18} />
          <span className="flex-1">{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="text-red-600 hover:text-red-800 font-bold text-xl"
          >
            ×
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select 
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select 
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="savedDate">Saved Date</option>
                  <option value="jobTitle">Job Title</option>
                  <option value="company">Company</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto justify-center">
              <button 
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <Grid3X3 size={18} />
              </button>
              <button 
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Content */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-7 gap-4 p-4 text-sm font-semibold text-gray-700">
              <div>JOB TITLE</div>
              <div>COMPANY</div>
              <div>LOCATION</div>
              <div>SALARY</div>
              <div>SAVED DATE</div>
              <div>STATUS</div>
              <div>ACTION</div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <div key={job.id} className={`grid grid-cols-7 gap-4 p-4 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <div className="flex flex-col">
                    <div className="font-medium text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-500">{job.jobType || 'Full-time'}</div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-700">@{job.company}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-700">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="text-gray-700">{job.salary}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-700">{formatDate(job.savedDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Saved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                      title="View Details"
                      onClick={() => handleViewJob(job)}
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                      title="Remove from Saved"
                      onClick={() => handleUnsaveJob(job.id)}
                      disabled={unsaveLoading === job.id}
                    >
                      {unsaveLoading === job.id ? (
                        <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : searchQuery ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No jobs match your search</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No saved jobs found</h3>
                <p className="text-gray-600 mb-4">Start saving jobs you're interested in to see them here.</p>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  onClick={() => navigate('/jobs')}
                >
                  Browse Jobs
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <motion.div 
                key={job.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <div className="p-6">
                  <div className="mb-4">
                    <div className="text-lg font-semibold text-gray-900 mb-1">{job.title}</div>
                    <div className="text-sm text-gray-500">{job.jobType}</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-medium">@{job.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-gray-700">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-gray-400" />
                      <span className="text-gray-700">{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-gray-700">Saved: {formatDate(job.savedDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Saved</span>
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                      title="View Details"
                      onClick={() => handleViewJob(job)}
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                      title="Remove from Saved"
                      onClick={() => handleUnsaveJob(job.id)}
                      disabled={unsaveLoading === job.id}
                    >
                      {unsaveLoading === job.id ? (
                        <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : searchQuery ? (
            <div className="col-span-full text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No jobs match your search</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search terms.</p>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No saved jobs found</h3>
              <p className="text-gray-600 mb-4">Start saving jobs you're interested in to see them here.</p>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                onClick={() => navigate('/jobs')}
              >
                Browse Jobs
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </motion.div>
  );
};

export default SavedJobs;

