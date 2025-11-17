import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Grid3X3, 
  List, 
  SortAsc, 
  Search,
  Clock,
  DollarSign,
  ArrowRight,
  MapPin,
  Briefcase,
  Globe,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import JobCard from '../components/jobs/JobCard';
import JobSearchBar from '../components/jobs/JobSearchBar';
import { Job, JobFilter as JobFilterType } from '../types/job';
import { jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { buildJobSlug } from '../utils/slug';

const Jobs: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const { user } = useAuth();

  // Handle job click - navigate to job details page
  const handleJobClick = (job: Job) => {
    const slug = (job as any).slug || buildJobSlug({
      title: job.title,
      company: job.company,
      location: job.location || null,
      id: job.id
    });
    navigate(`/jobs/${slug}`);
  };
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState<JobFilterType>({});
  const [resetCounter, setResetCounter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 12;

  // Read URL parameters and set filters
  useEffect(() => {
    const query = searchParams.get('q');
    const location = searchParams.get('location');
    const type = searchParams.get('type');
    const experience = searchParams.get('experience');
    const category = searchParams.get('category');
    const isRemote = searchParams.get('isRemote');
    
    if (query || location || type || experience || category || isRemote) {
      setFilters(prev => ({
        ...prev,
        keyword: query || '',
        location: location || '',
        jobType: type || '',
        experience: experience || '',
        category: category || '',
        isRemote: isRemote === 'true' || false
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        // Check if we need to filter for specific job types
        const query = searchParams.get('q');
        const location = searchParams.get('location');
        const type = searchParams.get('type');
        const experience = searchParams.get('experience');
        const category = searchParams.get('category');
        const isRemote = searchParams.get('isRemote');
        
        let apiFilters: any = { limit: 500 };
        
        // Apply server-side filtering based on URL parameters
        if (isRemote === 'true') {
          apiFilters.isRemote = true;
        } else if (location === 'remote') {
          apiFilters.isRemote = true;
        } else if (location) {
          apiFilters.location = location;
        }
        
        if (experience) {
          apiFilters.experience = experience;
        }
        
        if (category) {
          apiFilters.category = category;
        }
        
        if (type) {
          apiFilters.type = type;
        }
        
        if (query) {
          apiFilters.search = query;
        }
        
        const response = await jobsAPI.fetchJobs(apiFilters);
        // Handle both response structures
        const jobs = response.jobs || response || [];
        let jobsArray = Array.isArray(jobs) ? jobs : [];
        
        // Apply domain filtering if type=domain
        if (type === 'domain') {
          jobsArray = jobsArray.filter(job => 
            !job.isRemote || 
            job.category === 'Technology' || 
            job.category === 'Engineering' ||
            job.category === 'Data Science' ||
            job.category === 'Product Management'
          );
        }
        
        // Apply fresher filter as fallback if experience=fresher is in URL but backend didn't filter
        // This ensures frontend filtering happens BEFORE rendering and pagination
        if (experience === 'fresher') {
          jobsArray = jobsArray.filter(job => {
            const typeLower = job.type ? String(job.type).toLowerCase() : '';
            const expLower = job.experienceLevel ? String(job.experienceLevel).toLowerCase() : '';
            const expMin = job.experience && typeof job.experience === 'object' ? (job.experience as any).min : null;
            
            // Strict fresher filter: Only 0-1 year experience
            // Check if type explicitly mentions fresher
            if (typeLower.includes('fresher') || typeLower.includes('entry')) {
              return true;
            }
            
            // Check if experienceLevel explicitly mentions fresher
            if (expLower.includes('fresher') || expLower.includes('entry')) {
              return true;
            }
            
            // Check if experience.min === 0 (0 years experience)
            if (expMin === 0) {
              return true;
            }
            
            // Exclude all others (too loose if we include null)
            return false;
          });
        }
        
        setJobs(jobsArray);
        setFilteredJobs(jobsArray);
      } catch (error) {
        console.error('Error loading jobs:', error);
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [searchParams]);

  useEffect(() => {
    let filtered = [...jobs];

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(keyword) ||
        job.company?.toLowerCase().includes(keyword) ||
        job.description?.toLowerCase().includes(keyword) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(keyword)))
      );
    }

    // Apply isRemote filter if set
    if (filters.isRemote === true) {
      filtered = filtered.filter(job => 
        job.isRemote === true || 
        job.locationType === 'Remote' ||
        (job.location && job.location.toLowerCase().includes('remote')) ||
        (job.type && job.type.toLowerCase() === 'remote')
      );
    }

    if (filters.location) {
      const location = filters.location.toLowerCase();
      if (location === 'remote') {
        // Filter for remote jobs specifically
        filtered = filtered.filter(job => 
          job.isRemote === true || 
          job.locationType === 'Remote' ||
          job.location?.toLowerCase().includes('remote') ||
          (job.type && job.type.toLowerCase() === 'remote')
        );
      } else {
        // Filter by location for non-remote jobs
        filtered = filtered.filter(job => 
          job.location?.toLowerCase().includes(location)
        );
      }
    }

    // Apply experience filter (this is a secondary filter for UI state changes)
    // Note: Primary filtering for experience=fresher happens in loadJobs above
    if (filters.experience && !searchParams.get('experience')) {
      // Only apply if not already filtered by URL parameter
      const experience = filters.experience.toLowerCase();
      if (experience === 'fresher') {
        filtered = filtered.filter(job => {
          const typeLower = job.type ? String(job.type).toLowerCase() : '';
          const expLower = job.experienceLevel ? String(job.experienceLevel).toLowerCase() : '';
          const expMin = job.experience && typeof job.experience === 'object' ? (job.experience as any).min : null;
          
          // Strict fresher filter
          if (typeLower.includes('fresher') || typeLower.includes('entry')) {
            return true;
          }
          if (expLower.includes('fresher') || expLower.includes('entry')) {
            return true;
          }
          if (expMin === 0) {
            return true;
          }
          return false;
        });
      } else if (experience === 'experienced') {
        filtered = filtered.filter(job => {
          const typeLower = job.type ? String(job.type).toLowerCase() : '';
          const expLower = job.experienceLevel ? String(job.experienceLevel).toLowerCase() : '';
          const expMin = job.experience && typeof job.experience === 'object' ? (job.experience as any).min : null;
          
          // Exclude fresher/entry level
          if (
            typeLower.includes('fresher') ||
            typeLower.includes('entry') ||
            expLower.includes('fresher') ||
            expLower.includes('entry')
          ) {
            return false;
          }
          
          // Exclude if experience is 0
          if (expMin === 0) {
            return false;
          }
          
          // Include if experience > 0 or type is experienced
          return (
            typeLower === 'experienced' ||
            (expMin !== null && expMin > 0) ||
            (expMin === null && !typeLower.includes('fresher') && typeLower !== '')
          );
        });
      }
    }

    // Apply category filter
    if (filters.category) {
      const category = filters.category.toLowerCase();
      filtered = filtered.filter(job => {
        const categoryLower = job.category ? String(job.category).toLowerCase() : '';
        const companyLower = job.company ? String(job.company).toLowerCase() : '';
        const titleLower = job.title ? String(job.title).toLowerCase() : '';
        
        return (
          categoryLower === category ||
          categoryLower === 'public sector' ||
          companyLower.includes('government') ||
          companyLower.includes('govt') ||
          companyLower.includes('gov') ||
          companyLower.includes('public sector') ||
          titleLower.includes('government') ||
          titleLower.includes('govt')
        );
      });
    }

    if (filters.salaryMin !== undefined) {
      filtered = filtered.filter(job => (job.salary?.min || 0) >= filters.salaryMin!);
    }

    if (filters.salaryMax !== undefined) {
      filtered = filtered.filter(job => (job.salary?.max || 0) <= filters.salaryMax!);
    }

    if (filters.jobType && filters.jobType !== 'domain') {
      // Filter by specific job type (but not domain, since that's handled server-side)
      filtered = filtered.filter(job => job.type === filters.jobType);
    }

    if (filters.company) {
      const company = filters.company.toLowerCase();
      filtered = filtered.filter(job => 
        job.company?.toLowerCase().includes(company)
      );
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
          const dateB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'oldest':
        filtered.sort((a, b) => {
          const dateA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
          const dateB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case 'salary-high':
        filtered.sort((a, b) => (b.salary?.max || 0) - (a.salary?.max || 0));
        break;
      case 'salary-low':
        filtered.sort((a, b) => (a.salary?.min || 0) - (b.salary?.min || 0));
        break;
      case 'company':
        filtered.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
        break;
    }

    setFilteredJobs(filtered);
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [jobs, filters, sortBy]);


  const handleClearFilters = async () => {
    setFilters({});
    setResetCounter((c) => c + 1); // signal inputs to reset/close dropdowns
    // Clear URL parameters
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('q');
    newUrl.searchParams.delete('location');
    newUrl.searchParams.delete('type');
    window.history.replaceState({}, '', newUrl.toString());

    // Reload default job list immediately
    try {
      setLoading(true);
      const response = await jobsAPI.fetchJobs({ limit: 500 });
      const jobs = response.jobs || response || [];
      const jobsArray = Array.isArray(jobs) ? jobs : [];
      setJobs(jobsArray);
      setFilteredJobs(jobsArray);
    } catch (e) {
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters: { keyword: string; location: string }) => {
    setFilters(prev => ({
      ...prev,
      keyword: searchFilters.keyword,
      location: searchFilters.location
    }));
    
    // Trigger real-time search with debouncing
    if (searchFilters.keyword || searchFilters.location) {
      performRealTimeSearch(searchFilters);
    }
  };

  // Real-time search function with debouncing
  const performRealTimeSearch = async (searchFilters: { keyword: string; location: string }) => {
    try {
      setSearching(true);
      const response = await jobsAPI.fetchJobs({
        search: searchFilters.keyword,
        location: searchFilters.location,
        page: 1,
        limit: 500
      });
      
      const jobs = response.jobs || response || [];
      const jobsArray = Array.isArray(jobs) ? jobs : [];
      setJobs(jobsArray);
      setFilteredJobs(jobsArray);
    } catch (error) {
      console.error('Error performing real-time search:', error);
    } finally {
      setSearching(false);
    }
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== null
    ).length;
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of jobs section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Professional Banner */}
      <header className="bg-gradient-to-br from-blue-800 to-blue-500 text-white py-10 shadow-lg shadow-black/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-10">
          <div className="flex-1 min-w-0">
            <h1 className="text-5xl font-bold m-0 mb-2 leading-tight text-white">
              Career Opportunities
            </h1>
            <p className="text-lg m-0 opacity-90 font-normal text-white">
              Find your next professional opportunity
            </p>
          </div>
          <div className="w-full md:flex-1 md:max-w-lg">
            <JobSearchBar 
              onSearch={handleSearch}
              valueFilters={{
                keyword: filters.keyword || '',
                location: filters.location || ''
              }}
              resetToken={resetCounter}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-6 mt-8">
        {/* Main Content Area */}
        <main className="bg-transparent rounded-none shadow-none border-none overflow-visible">
            {/* Results Header */}
            <div className="px-4 sm:px-6 pt-8 pb-6 border-b border-gray-200 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between bg-transparent mb-8 max-w-6xl mx-auto">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-800 m-0 mb-1">
                  {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Available
                  {filteredJobs.length > 0 && (
                    <span className="text-lg font-normal text-gray-500 ml-2">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                </h2>
                <p className="text-gray-500 text-sm m-0">
                  {getActiveFiltersCount() > 0 ? `${getActiveFiltersCount()} filter${getActiveFiltersCount() !== 1 ? 's' : ''} applied` : 'All opportunities'}
                  {filteredJobs.length > 0 && (
                    <span className="ml-2">
                      • Showing {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
                <button
                  className={`border-none py-3 px-6 rounded-md font-semibold cursor-pointer transition-all duration-200 w-full sm:w-auto ${
                    getActiveFiltersCount() > 0
                      ? 'bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer'
                  }`}
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </button>
                
                <div className="flex items-center gap-2 bg-white border border-gray-300 py-2 px-3 rounded-md w-full sm:w-auto">
                  <SortAsc className="w-4 h-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-none border-none text-gray-700 text-sm font-medium cursor-pointer outline-none w-full"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="salary-high">Salary: High to Low</option>
                    <option value="salary-low">Salary: Low to High</option>
                    <option value="company">Company A-Z</option>
                  </select>
                </div>

                <div className="flex bg-white border border-gray-300 rounded-md overflow-hidden w-full sm:w-auto">
                  <button
                    className={`flex items-center justify-center flex-1 sm:w-10 h-10 bg-none border-none cursor-pointer transition-all duration-200 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <Grid3X3 className="w-4.5 h-4.5" />
                  </button>
                  <button
                    className={`flex items-center justify-center flex-1 sm:w-10 h-10 bg-none border-none cursor-pointer transition-all duration-200 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <List className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Job Cards Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 text-base">
                  Loading opportunities...
                </p>
              </div>
            ) : searching ? (
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 text-base">
                  Searching jobs...
                </p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                <Search className="w-16 h-16 text-gray-400 mb-6" />
                <h3 className="text-2xl font-semibold text-gray-700 m-0 mb-3">
                  No jobs found
                </h3>
                <p className="text-gray-500 text-base leading-relaxed m-0 mb-6 max-w-md">
                  Try adjusting your search criteria or filters to find more opportunities.
                </p>
                {getActiveFiltersCount() > 0 && (
                  <button
                    className="bg-blue-500 text-white border-none py-3 px-6 rounded-md font-semibold cursor-pointer transition-all duration-200 hover:bg-blue-600 hover:-translate-y-0.5"
                    onClick={handleClearFilters}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={`mx-auto mb-12 max-w-6xl w-full ${viewMode === 'list' ? 'space-y-4' : 'grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                  <AnimatePresence>
                    {(currentJobs || []).map((job, index) => (
                    viewMode === 'list' ? (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-gradient-to-br from-white/90 to-slate-50/80 rounded-2xl p-4 sm:p-6 backdrop-blur-[10px] border border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center gap-6"
                        onClick={() => {
                          const slug = (job as any).slug || buildJobSlug({
                            title: job.title,
                            company: job.company,
                            location: job.location || null,
                            id: job.id
                          });
                          navigate(`/jobs/${slug}`);
                        }}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-1 h-20 bg-gradient-to-b from-blue-500 to-blue-700 rounded-r-sm"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-slate-800 m-0 leading-tight">{job.title}</h3>
                                <div className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1 rounded-2xl text-[11px] font-semibold uppercase tracking-[0.5px] shadow-[0_2px_8px_rgba(59,130,246,0.25)] flex-shrink-0">
                                  {job.isRemote ? (
                                    <>
                                      <Globe className="w-[12px] h-[12px] text-white" />
                                      <span className="text-white font-semibold">Remote</span>
                                    </>
                                  ) : (
                                    <>
                                      <Briefcase className="w-[12px] h-[12px] text-white" />
                                      <span className="text-white font-semibold">{job.type || 'Specialized'}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-slate-500 m-0 font-medium">{job.company}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                              <span>{job.location || 'Location not specified'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                              <span>
                                {(() => {
                                  if (job.experienceLevel) return job.experienceLevel;
                                  if (typeof job.experience === 'string') return job.experience;
                                  if (job.experience && job.experience.min && job.experience.max) {
                                    return `${job.experience.min}-${job.experience.max} years`;
                                  }
                                  return 'Experience not specified';
                                })()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                              <span>
                                {(() => {
                                  if (!job.salary) return 'Salary not specified';
                                  if (typeof job.salary === 'string') return job.salary;
                                  const currency = job.salary.currency === 'INR' ? '₹' : '$';
                                  if (job.salary.min && job.salary.max) {
                                    if (job.salary.currency === 'INR') {
                                      const minLakhs = (job.salary.min / 100000).toFixed(1);
                                      const maxLakhs = (job.salary.max / 100000).toFixed(1);
                                      return `${currency}${minLakhs}L - ${currency}${maxLakhs}L`;
                                    } else {
                                      const minK = (job.salary.min / 1000).toFixed(0);
                                      const maxK = (job.salary.max / 1000).toFixed(0);
                                      return `${currency}${minK}K - ${currency}${maxK}K`;
                                    }
                                  }
                                  if (job.salary.min) {
                                    if (job.salary.currency === 'INR') {
                                      const minLakhs = (job.salary.min / 100000).toFixed(1);
                                      return `${currency}${minLakhs}L+`;
                                    } else {
                                      const minK = (job.salary.min / 1000).toFixed(0);
                                      return `${currency}${minK}K+`;
                                    }
                                  }
                                  return 'Salary not specified';
                                })()}
                              </span>
                            </div>
                            {job.postedDate && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                                <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {job.skills && job.skills.length > 0 && (
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                                <span>{job.skills.slice(0, 2).join(', ')}{job.skills.length > 2 ? '...' : ''}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <button 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none px-6 py-3 rounded-md text-xs font-semibold cursor-pointer transition-all duration-300 whitespace-nowrap tracking-[0.3px] uppercase hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJobClick(job);
                            }}
                          >
                            Apply Now
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <JobCard
                        key={job.id}
                        job={job}
                        index={index}
                      />
                    )
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center justify-center gap-2 mt-8 mb-12 w-full">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 md:gap-2 w-full">
                      {/* Previous Button */}
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 w-full md:w-auto ${
                          currentPage === 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5 cursor-pointer'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      {/* Page Numbers */}
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {getPageNumbers().map((page, idx) => (
                          page === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                              ...
                            </span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page as number)}
                              className={`min-w-[36px] h-9 md:min-w-[40px] md:h-10 px-3 rounded-md font-medium transition-all duration-200 ${
                                currentPage === page
                                  ? 'bg-blue-500 text-white shadow-md'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-500'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 w-full md:w-auto ${
                          currentPage === totalPages
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5 cursor-pointer'
                        }`}
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Pagination Info */}
                    <p className="text-sm text-gray-500">
                      Showing page {currentPage} of {totalPages}
                    </p>
                  </div>
                )}
              </>
            )}
        </main>
      </div>
    </div>
  );
};

export default Jobs;