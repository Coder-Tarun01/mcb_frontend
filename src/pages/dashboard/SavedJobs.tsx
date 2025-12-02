import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, DollarSign, Eye, Trash2, RefreshCw, Grid3X3, List, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { savedJobsAPI, fetchJobById } from '../../services/api';
import { Job } from '../../types/job';
import { buildJobSlug } from '../../utils/slug';
import { logger } from '../../utils/logger';

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
      
      logger.debug('Saved jobs response', savedJobsData);
      
      // For each saved job, ensure we have full job details.
      // If the joined Job is missing (e.g., Govt jobs or AI jobs),
      // fetch the job details from the /jobs/:id endpoint.
      const transformedJobs: Job[] = [];

      for (const savedJob of savedJobsData) {
        let jobData: any = savedJob.job;

        // If jobData is missing (common for govt or external jobs), fetch it by id
        if (!jobData && savedJob.jobId) {
          const fullJob = await fetchJobById(String(savedJob.jobId));
          if (fullJob) {
            jobData = fullJob;
          }
        }

        // Final safety fallback
        jobData = jobData || {};

        // Title fallbacks
        const title =
          jobData.title ||
          savedJob.title ||
          savedJob.jobTitle ||
          savedJob.position ||
          'Job Title Not Available';

        // Company/organization fallbacks
        const company =
          jobData.company ||
          savedJob.company ||
          savedJob.organization ||
          savedJob.department ||
          'Company Not Available';

        // Location fallbacks
        const location =
          jobData.location ||
          savedJob.location ||
          savedJob.city ||
          savedJob.state ||
          'Location Not Available';

        // Job type / nature fallbacks
        const jobType =
          jobData.type ||
          jobData.jobType ||
          savedJob.jobType ||
          savedJob.employmentType ||
          savedJob.natureOfJob ||
          'Full-time';

        // Slug for navigation (if available)
        const slug = jobData.slug || savedJob.slug;

        // Salary/display salary fallbacks (handles govt jobs with displaySalary)
        const displaySalary =
          (jobData as any).displaySalary ||
          savedJob.displaySalary ||
          savedJob.salaryRange ||
          savedJob.payScale ||
          savedJob.salary;

        let salary: string;
        if (displaySalary) {
          salary = String(displaySalary);
        } else if (jobData.salary && typeof jobData.salary === 'object') {
          const s = jobData.salary as { min?: number; max?: number; currency?: string };
          if (s.min && s.max) {
            salary = `${s.min} - ${s.max}`;
          } else if (s.min) {
            salary = `${s.min}+`;
          } else {
            salary = 'Competitive';
          }
        } else {
          salary = 'Competitive';
        }

        // Saved date / important date fallbacks
        const savedDate =
          savedJob.savedAt ||
          savedJob.createdAt ||
          jobData.postedDate ||
          jobData.applicationDeadline ||
          savedJob.postedDate ||
          savedJob.lastDate ||
          new Date().toISOString();

        transformedJobs.push({
          id: savedJob.jobId || savedJob.id,
          title,
          company,
          location,
          jobType,
          slug,
          salary,
          savedDate,
          description: jobData.description || savedJob.description || '',
          skills: jobData.skills || jobData.skillsRequired || savedJob.skills || [],
          isRemote: jobData.isRemote || savedJob.isRemote || false,
        } as Job);
      }
      
      setSavedJobs(transformedJobs);

      // Load statistics
      try {
        const statsData = await savedJobsAPI.getSavedJobsStats();
        setStats(statsData);
      } catch (statsErr) {
        logger.error('Error loading stats', statsErr);
        // Don't show error for stats, just use local data
        setStats({
          totalSaved: transformedJobs.length,
          recentSaved: 0
        });
      }
    } catch (err: any) {
      logger.error('Error loading saved jobs', err);
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
      logger.info('Job removed from saved jobs successfully');
    } catch (err: any) {
      logger.error('Error unsaving job', err);
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
      className="min-h-screen pt-0 pb-6 px-2 sm:px-4 bg-gray-50"
    >
      <div className="w-full border-2 border-gray-300 rounded-2xl p-4 sm:p-8">
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

      {/* Jobs Content - Desktop / Tablet (keeps list vs grid toggle) */}
      <div className="hidden md:block">
        {viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-6 gap-4 px-8 py-4 text-sm font-semibold text-gray-700">
                <div>JOB TITLE</div>
                <div>COMPANY</div>
                <div>LOCATION</div>
                <div>SALARY</div>
                <div>SAVED DATE</div>
                <div className="text-right">ACTION</div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className={`grid grid-cols-6 gap-4 px-8 py-4 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
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
                    <div className="flex items-center justify-end gap-2">
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

      {/* Jobs Content - Mobile (cards only) */}
      <div className="block md:hidden">
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-base font-semibold text-gray-900">{job.title}</div>
                    <div className="text-xs text-gray-500">{job.jobType || 'Full-time'}</div>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium">@{job.company}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <MapPin size={14} className="text-gray-400 mt-0.5" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <DollarSign size={14} className="text-gray-400 mt-0.5" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Saved: {formatDate(job.savedDate)}</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-medium">
                      Saved
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-end gap-3">
                  <button
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg active:bg-blue-100"
                    onClick={() => handleViewJob(job)}
                    title="View Details"
                  >
                    <Eye size={14} className="mr-1" />
                    View
                  </button>
                  <button
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg active:bg-red-100 disabled:opacity-60"
                    onClick={() => handleUnsaveJob(job.id)}
                    disabled={unsaveLoading === job.id}
                    title="Remove from Saved"
                  >
                    {unsaveLoading === job.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trash2 size={14} className="mr-1" />
                        Remove
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : searchQuery ? (
            <div className="text-center py-10 px-4">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">No jobs match your search</h3>
              <p className="text-sm text-gray-600 mb-3">Try adjusting your search terms.</p>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="text-center py-10 px-4">
              <div className="text-3xl mb-3">💼</div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">No saved jobs found</h3>
              <p className="text-sm text-gray-600 mb-3">Start saving jobs you're interested in to see them here.</p>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                onClick={() => navigate('/jobs')}
              >
                Browse Jobs
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default SavedJobs;

