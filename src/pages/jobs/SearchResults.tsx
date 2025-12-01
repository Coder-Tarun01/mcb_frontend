import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Filter,
  X,
  Grid3X3,
  List,
  Bookmark,
  SlidersHorizontal,
  Clock,
  DollarSign,
  ArrowRight,
  Briefcase,
  Globe,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { savedJobsAPI, jobsAPI } from '../../services/api';
import { Job } from '../../types/job';
import JobCard from '../../components/jobs/JobCard';
import { useAuth } from '../../context/AuthContext';
import { buildJobSlug } from '../../utils/slug';

interface SearchFilters {
  keyword: string;
  location: string;
  jobType: string;
  salaryMin: string;
  salaryMax: string;
  experience: string;
  company: string;
  category: string;
  isRemote: boolean;
}

interface SavedSearchEntry {
  id: string;
  keyword: string;
  location: string;
  jobType?: string;
  createdAt: string;
}

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [jobs, setJobs] = useState<Job[]>([]);
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [savedSearches, setSavedSearches] = useState<SavedSearchEntry[]>([]);
  const [recentSearches, setRecentSearches] = useState<SavedSearchEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 12;

  // Filters
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('type') || '',
    salaryMin: searchParams.get('minSalary') || '',
    salaryMax: searchParams.get('maxSalary') || '',
    experience: searchParams.get('experience') || '',
    company: searchParams.get('company') || '',
    category: searchParams.get('category') || '',
    isRemote: searchParams.get('remote') === 'true'
  });

  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('q') || '');

  // Initialize once on mount
  const hasInitialized = useRef(false);
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchTerm(q);
    setFilters(prev => ({
      ...prev,
      keyword: q
    }));
    performSearch();
    hasInitialized.current = true;
  }, [searchParams]);

  useEffect(() => {
    loadSavedJobs();

    // Load saved searches
    try {
      const savedRaw = localStorage.getItem('savedSearches');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (Array.isArray(parsed)) {
          setSavedSearches(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load saved searches:', e);
    }

    // Load recent search history
    try {
      const historyRaw = localStorage.getItem('searchHistory');
      if (historyRaw) {
        const parsed = JSON.parse(historyRaw);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load search history:', e);
    }
  }, []);

  const loadSavedJobs = async () => {
    try {
      const response = await savedJobsAPI.getSavedJobs();
      const saved = new Set(response.savedJobs?.map((job: any) => job.id) || []);
      setSavedJobs(saved);
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      // Build API filters for jobsAPI.fetchJobs (fetches from both jobs and accounts_jobdata tables)
      const apiFilters: any = {
        limit: 500 // Get more jobs for client-side filtering
      };

      // Apply server-side filters
      if (filters.keyword) {
        apiFilters.search = filters.keyword;
      }
      if (filters.location) {
        apiFilters.location = filters.location;
        // Handle remote filter
        if (filters.location.toLowerCase() === 'remote') {
          apiFilters.isRemote = true;
        }
      }
      if (filters.jobType) {
        apiFilters.type = filters.jobType;
      }
      if (filters.category) {
        apiFilters.category = filters.category;
      }
      if (filters.isRemote) {
        apiFilters.isRemote = true;
      }

      // Fetch jobs from both jobs and accounts_jobdata tables
      const response = await jobsAPI.fetchJobs(apiFilters);
      const allJobs = response.jobs || response || [];
      let results = Array.isArray(allJobs) ? allJobs : [];

      // Apply client-side filtering
      let filteredResults = [...results];

      // Apply keyword filter (client-side for better matching)
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filteredResults = filteredResults.filter(job => 
          job.title?.toLowerCase().includes(keyword) ||
          job.company?.toLowerCase().includes(keyword) ||
          job.description?.toLowerCase().includes(keyword) ||
          (job.skills && job.skills.some((skill: string) => skill.toLowerCase().includes(keyword)))
        );
      }

      // Apply location filter (client-side for better matching)
      if (filters.location && filters.location.toLowerCase() !== 'remote') {
        const location = filters.location.toLowerCase();
        filteredResults = filteredResults.filter(job => 
          job.location?.toLowerCase().includes(location)
        );
      }

      // Apply remote filter (client-side)
      if (filters.isRemote) {
        filteredResults = filteredResults.filter(job => 
          job.isRemote === true || 
          job.locationType === 'Remote' ||
          job.location?.toLowerCase().includes('remote')
        );
      }

      // Apply job type filter (client-side)
      if (filters.jobType) {
        filteredResults = filteredResults.filter(job => job.type === filters.jobType);
      }

      // Apply category filter (client-side)
      if (filters.category) {
        filteredResults = filteredResults.filter(job => 
          job.category?.toLowerCase() === filters.category.toLowerCase()
        );
      }

      // Apply experience filter (client-side)
      if (filters.experience && filters.experience.trim() !== '') {
        filteredResults = filteredResults.filter(job => {
          const filterValue = filters.experience.toLowerCase().trim();
          
          // Debug logging (can be removed in production)
          // console.log('Filtering by experience:', filterValue, 'Job experience:', job.experience, 'Job experienceLevel:', job.experienceLevel);
          
          // Helper function to extract numeric experience from string
          const extractYearsFromString = (str: string): { min: number | null; max: number | null } => {
            if (!str) return { min: null, max: null };
            const lower = str.toLowerCase();
            
            // Match patterns like "1-3 years", "1 to 3 years", "1-3 yrs"
            const rangeMatch = lower.match(/(\d+)\s*[-–—to]\s*(\d+)\s*(?:year|yr|years|yrs)/);
            if (rangeMatch) {
              return { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) };
            }
            
            // Match patterns like "5+ years", "5+ yrs", "5 plus years"
            const plusMatch = lower.match(/(\d+)\s*\+/);
            if (plusMatch) {
              return { min: parseInt(plusMatch[1]), max: null };
            }
            
            // Match single number like "3 years", "3 yrs"
            const singleMatch = lower.match(/^(\d+)\s*(?:year|yr|years|yrs)/);
            if (singleMatch) {
              const num = parseInt(singleMatch[1]);
              return { min: num, max: num };
            }
            
            return { min: null, max: null };
          };
          
          // Check numeric experience (object with min/max) - from jobs table
          let expMin: number | null = null;
          let expMax: number | null = null;
          
          if (job.experience && typeof job.experience === 'object' && 'min' in job.experience) {
            expMin = (job.experience as any).min ?? null;
            expMax = (job.experience as any).max ?? null;
          }
          
          // If no numeric experience, try to extract from string
          if (expMin === null) {
            const experienceStr = typeof job.experience === 'string' 
              ? job.experience 
              : job.experienceLevel || '';
            const extracted = extractYearsFromString(experienceStr);
            expMin = extracted.min;
            expMax = extracted.max;
          }
          
          // Filter based on experience level
          if (filterValue === 'fresher') {
            // Fresher: 0 years or no experience
            if (expMin !== null) {
              return expMin === 0 && (expMax === null || expMax === 0 || expMax <= 1);
            }
            // Check string for fresher keywords
            const experienceStr = typeof job.experience === 'string' 
              ? job.experience 
              : job.experienceLevel || '';
            const experienceLower = String(experienceStr).toLowerCase();
            return experienceLower.includes('fresher') || 
                   experienceLower.includes('entry') || 
                   experienceLower === '0' ||
                   experienceLower === '0 years' ||
                   experienceLower === '0-0 years' ||
                   experienceLower === 'no experience' ||
                   experienceLower.includes('0 year') ||
                   experienceLower.includes('0 yr');
          } 
          else if (filterValue === '1-3 yrs') {
            // 1-3 years: min should be 1-3, or overlap with 1-3 range
            if (expMin !== null) {
              // Job requires 1-3 years, or overlaps with 1-3 range
              if (expMin >= 1 && expMin <= 3) {
                return true; // Min is in range
              }
              if (expMax !== null && expMax >= 1 && expMin <= 3) {
                return true; // Range overlaps with 1-3
              }
              return false;
            }
            // Check string for 1-3 years patterns
            const experienceStr = typeof job.experience === 'string' 
              ? job.experience 
              : job.experienceLevel || '';
            const experienceLower = String(experienceStr).toLowerCase();
            // Match "1 year", "2 years", "3 years", "1-3 years", "1 to 3 years"
            return /^[1-3]\s*(?:year|yr|years|yrs)/i.test(experienceStr) ||
                   /[1-3]\s*[-–—to]\s*[1-3]\s*(?:year|yr|years|yrs)/i.test(experienceStr) ||
                   (experienceLower.includes('1 year') && !experienceLower.includes('10') && !experienceLower.includes('11') && !experienceLower.includes('12')) ||
                   (experienceLower.includes('2 year') && !experienceLower.includes('12') && !experienceLower.includes('20') && !experienceLower.includes('21') && !experienceLower.includes('22')) ||
                   (experienceLower.includes('3 year') && !experienceLower.includes('13') && !experienceLower.includes('30') && !experienceLower.includes('31') && !experienceLower.includes('32') && !experienceLower.includes('33'));
          } 
          else if (filterValue === '3-5 yrs') {
            // 3-5 years: min should be 3-5, or overlap with 3-5 range
            if (expMin !== null) {
              // Job requires 3-5 years, or overlaps with 3-5 range
              if (expMin >= 3 && expMin <= 5) {
                return true; // Min is in range
              }
              if (expMax !== null && expMax >= 3 && expMin <= 5) {
                return true; // Range overlaps with 3-5
              }
              return false;
            }
            // Check string for 3-5 years patterns
            const experienceStr = typeof job.experience === 'string' 
              ? job.experience 
              : job.experienceLevel || '';
            const experienceLower = String(experienceStr).toLowerCase();
            // Match "3 years", "4 years", "5 years", "3-5 years", "3 to 5 years"
            return /^[3-5]\s*(?:year|yr|years|yrs)/i.test(experienceStr) ||
                   /[3-5]\s*[-–—to]\s*[3-5]\s*(?:year|yr|years|yrs)/i.test(experienceStr) ||
                   (experienceLower.includes('3 year') && !experienceLower.includes('13') && !experienceLower.includes('30') && !experienceLower.includes('31') && !experienceLower.includes('32') && !experienceLower.includes('33')) ||
                   (experienceLower.includes('4 year') && !experienceLower.includes('14') && !experienceLower.includes('40') && !experienceLower.includes('41') && !experienceLower.includes('42') && !experienceLower.includes('43') && !experienceLower.includes('44')) ||
                   (experienceLower.includes('5 year') && !experienceLower.includes('15') && !experienceLower.includes('50') && !experienceLower.includes('51') && !experienceLower.includes('52') && !experienceLower.includes('53') && !experienceLower.includes('54') && !experienceLower.includes('55'));
          } 
          else if (filterValue === '5+ yrs') {
            // 5+ years: min should be >= 5
            if (expMin !== null) {
              return expMin >= 5;
            }
            // Check string for 5+ years patterns
            const experienceStr = typeof job.experience === 'string' 
              ? job.experience 
              : job.experienceLevel || '';
            const experienceLower = String(experienceStr).toLowerCase();
            // Match "5+ years", "6 years", "10 years", "senior", etc.
            return /^[5-9]\s*(?:year|yr|years|yrs)/i.test(experienceStr) ||
                   /^\d{2,}\s*(?:year|yr|years|yrs)/i.test(experienceStr) ||
                   /[5-9]\s*\+/i.test(experienceStr) ||
                   /[5-9]\s*[-–—to]\s*\d+\s*(?:year|yr|years|yrs)/i.test(experienceStr) ||
                   experienceLower.includes('senior') ||
                   experienceLower.includes('lead') ||
                   experienceLower.includes('executive') ||
                   experienceLower.includes('manager') ||
                   experienceLower.includes('director') ||
                   experienceLower.includes('principal') ||
                   (experienceLower.includes('5 year') && !experienceLower.includes('15') && !experienceLower.includes('50') && !experienceLower.includes('51') && !experienceLower.includes('52') && !experienceLower.includes('53') && !experienceLower.includes('54') && !experienceLower.includes('55'));
          }
          
          // If no match found, exclude the job
          return false;
        });
      }

      // Apply company filter (client-side)
      if (filters.company) {
        const company = filters.company.toLowerCase();
        filteredResults = filteredResults.filter(job => 
          job.company?.toLowerCase().includes(company)
        );
      }

      // Apply salary filters (client-side)
      if (filters.salaryMin) {
        const minSalary = parseInt(filters.salaryMin);
        filteredResults = filteredResults.filter(job => 
          (job.salary?.min || 0) >= minSalary
        );
      }
      if (filters.salaryMax) {
        const maxSalary = parseInt(filters.salaryMax);
        filteredResults = filteredResults.filter(job => 
          (job.salary?.max || 0) <= maxSalary
        );
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          filteredResults.sort((a, b) => 
            new Date(b.postedDate || 0).getTime() - new Date(a.postedDate || 0).getTime()
          );
          break;
        case 'salary-high':
          filteredResults.sort((a, b) => 
            (b.salary?.max || 0) - (a.salary?.max || 0)
          );
          break;
        case 'salary-low':
          filteredResults.sort((a, b) => 
            (a.salary?.min || 0) - (b.salary?.min || 0)
          );
          break;
        case 'relevant':
          // Keep filtered order (most relevant first based on filters)
          break;
      }

      setJobs(filteredResults);

      // Update recent search history (only when user has entered something)
      if (filters.keyword || filters.location) {
        const entry: SavedSearchEntry = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          keyword: filters.keyword || '',
          location: filters.location || '',
          jobType: filters.jobType || '',
          createdAt: new Date().toISOString()
        };

        setRecentSearches(prev => {
          const withoutDup = prev.filter(
            s =>
              !(
                s.keyword === entry.keyword &&
                s.location === entry.location &&
                (s.jobType || '') === (entry.jobType || '')
              )
          );
          const updated = [entry, ...withoutDup].slice(0, 5);
          try {
            localStorage.setItem('searchHistory', JSON.stringify(updated));
          } catch (e) {
            console.warn('Failed to save search history:', e);
          }
          return updated;
        });
      }

      // Reset to page 1 when search results change
      setCurrentPage(1);
    } catch (error) {
      console.error('Error searching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const syncParamsAndSearch = () => {
    const params = new URLSearchParams();
    if (filters.keyword) params.set('q', filters.keyword);
    if (filters.location) params.set('location', filters.location);
    if (filters.jobType) params.set('type', filters.jobType);
    if (filters.salaryMin) params.set('minSalary', filters.salaryMin);
    if (filters.salaryMax) params.set('maxSalary', filters.salaryMax);
    if (filters.experience) params.set('experience', filters.experience);
    if (filters.company) params.set('company', filters.company);
    if (filters.category) params.set('category', filters.category);
    if (filters.isRemote) params.set('remote', 'true');
    setSearchParams(params);
    performSearch();
  };

  const handleSearch = () => {
    syncParamsAndSearch();
  };

  // Debounced realtime search on filters and sort changes
  const debounceId = useRef<number | null>(null);
  useEffect(() => {
    if (!hasInitialized.current) return;
    if (debounceId.current) window.clearTimeout(debounceId.current);
    debounceId.current = window.setTimeout(() => {
      syncParamsAndSearch();
    }, 350);
    return () => {
      if (debounceId.current) window.clearTimeout(debounceId.current);
    };
  }, [filters, sortBy]);

  const handleSaveJob = async (jobId: string) => {
    try {
      if (savedJobs.has(jobId)) {
        await savedJobsAPI.unsaveJob(jobId);
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await savedJobsAPI.saveJob(jobId);
        setSavedJobs(prev => new Set(prev).add(jobId));
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
    }
  };

  const handleSaveSearch = () => {
    if (!filters.keyword && !filters.location && !filters.jobType) {
      alert('Add at least a keyword, location, or job type before saving a search.');
      return;
    }

    const entry: SavedSearchEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      keyword: filters.keyword || '',
      location: filters.location || '',
      jobType: filters.jobType || '',
      createdAt: new Date().toISOString()
    };

    setSavedSearches(prev => {
      const withoutDup = prev.filter(
        s =>
          !(
            s.keyword === entry.keyword &&
            s.location === entry.location &&
            (s.jobType || '') === (entry.jobType || '')
          )
      );
      const updated = [entry, ...withoutDup].slice(0, 10);
      try {
        localStorage.setItem('savedSearches', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save savedSearches:', e);
      }
      return updated;
    });

    alert('Search saved successfully!');
  };

  const applySavedSearch = (entry: SavedSearchEntry) => {
    const params = new URLSearchParams();
    if (entry.keyword) params.set('q', entry.keyword);
    if (entry.location) params.set('location', entry.location);
    if (entry.jobType) params.set('type', entry.jobType);
    setSearchParams(params);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      keyword: '',
      location: '',
      jobType: '',
      salaryMin: '',
      salaryMax: '',
      experience: '',
      company: '',
      category: '',
      isRemote: false
    };
    setFilters(clearedFilters);
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => 
    value !== '' && value !== false
  ).length;

  // Calculate pagination
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = jobs.slice(startIndex, endIndex);

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
    <div className="min-h-screen bg-slate-50 pb-15">
      {/* Search Header */}
      <motion.div
        className="bg-gradient-to-br from-blue-800 to-blue-500 text-white py-8 px-4 sm:px-6 md:px-12 shadow-lg shadow-blue-500/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <div className="flex-1 relative bg-white rounded-xl flex items-center px-4 border-none shadow-none focus-within:outline-none">
              <Search className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border-none outline-none py-4 px-3 text-base text-gray-800 bg-transparent shadow-none appearance-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:shadow-none focus-visible:shadow-none"
              />
            </div>
            <div className="flex-1 relative bg-white rounded-xl flex items-center px-4 border-none shadow-none focus-within:outline-none">
              <MapPin className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="City, state, or remote"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border-none outline-none py-4 px-3 text-base text-gray-800 bg-transparent shadow-none appearance-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:shadow-none focus-visible:shadow-none"
              />
            </div>
            <button 
              className="py-4 px-6 md:px-8 bg-white text-blue-500 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-200 flex items-center gap-2 whitespace-nowrap hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/10 w-full md:w-auto justify-center" 
              onClick={handleSearch}
            >
              <Search size={20} />
              Search
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button 
              className={`flex items-center gap-2 py-2.5 px-5 bg-white/15 border border-white/30 rounded-lg text-white text-15 font-medium cursor-pointer transition-all duration-200 backdrop-blur-sm hover:bg-white/25 hover:border-white/50 ${showFilters ? 'bg-white/25 border-white/50' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={18} />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>

            <button 
              className="flex items-center gap-2 py-2.5 px-5 bg-white/15 border border-white/30 rounded-lg text-white text-15 font-medium cursor-pointer transition-all duration-200 backdrop-blur-sm hover:bg-white/25 hover:border-white/50" 
              onClick={clearFilters}
            >
              <X size={16} />
              Clear Filters
            </button>

            <button 
              className="flex items-center gap-2 py-2.5 px-5 bg-white/15 border border-white/30 rounded-lg text-white text-15 font-medium cursor-pointer transition-all duration-200 backdrop-blur-sm hover:bg-white/25 hover:border-white/50" 
              onClick={handleSaveSearch}
            >
              <Bookmark size={18} />
              Save Search
            </button>

            <div className="flex gap-1 bg-white/15 rounded-lg p-1">
              <button 
                className={`p-2 bg-transparent border-none rounded-lg text-white cursor-pointer transition-all duration-200 ${viewMode === 'grid' ? 'bg-white/25' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 size={18} />
              </button>
              <button 
                className={`p-2 bg-transparent border-none rounded-lg text-white cursor-pointer transition-all duration-200 ${viewMode === 'list' ? 'bg-white/25' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>

            <select 
              className="py-2.5 px-4 bg-white/15 border border-white/30 rounded-lg text-white text-15 font-medium cursor-pointer backdrop-blur-sm focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:shadow-none focus-visible:shadow-none"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                performSearch();
              }}
            >
              <option value="relevant" className="bg-blue-800 text-white">Most Relevant</option>
              <option value="newest" className="bg-blue-800 text-white">Newest First</option>
              <option value="salary-high" className="bg-blue-800 text-white">Highest Salary</option>
              <option value="salary-low" className="bg-blue-800 text-white">Lowest Salary</option>
            </select>
          </div>

          {/* Saved & Recent Searches */}
          {(savedSearches.length > 0 || recentSearches.length > 0) && (
            <div className="mt-4 space-y-2 text-sm">
              {savedSearches.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-white/80 font-medium">Saved searches:</span>
                  {savedSearches.map(entry => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => applySavedSearch(entry)}
                      className="px-3 py-1 rounded-full bg-white/15 border border-white/30 text-white text-xs font-medium hover:bg-white/25 hover:border-white/50 transition-colors"
                    >
                      {(entry.keyword || 'Any role')}
                      {entry.location && ` • ${entry.location}`}
                    </button>
                  ))}
                </div>
              )}
              {recentSearches.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-white/80 font-medium">Recent:</span>
                  {recentSearches.map(entry => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => applySavedSearch(entry)}
                      className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs hover:bg-white/20 hover:border-white/40 transition-colors"
                    >
                      {(entry.keyword || 'Any role')}
                      {entry.location && ` • ${entry.location}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 md:px-12 flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <motion.div
            className="w-full lg:w-72 xl:w-80 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 m-0">
                Advanced Filters
              </h3>
              {activeFiltersCount > 0 && (
                <button 
                  className="py-1.5 px-3 bg-none border border-gray-200 rounded-lg text-gray-500 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-red-50 hover:border-red-500 hover:text-red-500" 
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Job Type Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Type
              </label>
              <select
                className="w-full py-2.5 px-3.5 bg-white border border-gray-200 rounded-lg text-15 text-gray-800 transition-all duration-200 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:shadow-none focus-visible:shadow-none focus:border-blue-500"
                value={filters.jobType}
                onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Experience Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                className="w-full py-2.5 px-3.5 bg-white border border-gray-200 rounded-lg text-15 text-gray-800 transition-all duration-200 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:shadow-none focus-visible:shadow-none focus:border-blue-500"
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              >
                <option value="">All Levels</option>
                <option value="Fresher">Fresher</option>
                <option value="1-3 yrs">1–3 yrs</option>
                <option value="3-5 yrs">3–5 yrs</option>
                <option value="5+ yrs">5+ yrs</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                className="w-full py-2.5 px-3.5 bg-white border border-gray-200 rounded-lg text-15 text-gray-800 transition-all duration-200 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:shadow-none focus-visible:shadow-none focus:border-blue-500"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
              </select>
            </div>

            {/* Salary Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Salary Range
              </label>
              <div className="grid grid-cols-2 gap-2 w-full mt-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.salaryMin}
                  onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                  className="w-full py-2 px-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 transition-all duration-200 h-9 box-border focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:shadow-none focus-visible:shadow-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.salaryMax}
                  onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })}
                  className="w-full py-2 px-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 transition-all duration-200 h-9 box-border focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:shadow-none focus-visible:shadow-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Company Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                placeholder="Company name"
                value={filters.company}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                className="w-full py-2.5 px-3.5 bg-white border border-gray-200 rounded-lg text-15 text-gray-800 transition-all duration-200 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:shadow-none focus-visible:shadow-none focus:border-blue-500"
              />
            </div>

            {/* Remote Filter */}
            <div className="mb-6">
              <label className="flex items-center gap-2.5 cursor-pointer text-15 text-gray-700 font-medium">
                <input
                  type="checkbox"
                  checked={filters.isRemote}
                  onChange={(e) => setFilters({ ...filters, isRemote: e.target.checked })}
                  className="w-4.5 h-4.5 cursor-pointer accent-blue-500"
                />
                <span>Remote Jobs Only</span>
              </label>
            </div>

            <button 
              className="w-full py-3.5 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 mt-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30" 
              onClick={handleSearch}
            >
              Apply Filters
            </button>
          </motion.div>
        )}

        {/* Results Section */}
        <div className={`flex-1 min-w-0 ${!showFilters ? 'w-full' : ''}`}>
          {/* Results Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 m-0 mb-2">
              {loading ? 'Searching...' : `${jobs.length} Jobs Found`}
              {jobs.length > 0 && (
                <span className="text-xl font-normal text-gray-500 ml-2">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </h2>
            {filters.keyword && (
              <p className="text-base text-gray-500 m-0">
                Results for "{filters.keyword}"
                {filters.location && ` in ${filters.location}`}
                {jobs.length > 0 && (
                  <span className="ml-2">
                    • Showing {startIndex + 1}-{Math.min(endIndex, jobs.length)} of {jobs.length}
                  </span>
                )}
              </p>
            )}
            {!filters.keyword && jobs.length > 0 && (
              <p className="text-base text-gray-500 m-0">
                Showing {startIndex + 1}-{Math.min(endIndex, jobs.length)} of {jobs.length}
              </p>
            )}
          </div>

          {/* Results Grid/List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
              <div className="w-12.5 h-12.5 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-gray-500 text-base mt-4 m-0">
                Searching for jobs...
              </p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
              <Search size={64} className="text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 m-0 mb-2">
                No Jobs Found
              </h3>
              <p className="text-gray-500 text-base m-0">
                Try adjusting your search criteria or filters. You can also clear all filters or reuse a previous search.
              </p>
              <button 
                className="py-3 px-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none rounded-lg text-15 font-semibold cursor-pointer transition-all duration-300 mt-4 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30" 
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
              {(savedSearches.length > 0 || recentSearches.length > 0) && (
                <div className="mt-6 space-y-3 max-w-xl mx-auto">
                  {savedSearches.length > 0 && (
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Try one of your saved searches:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {savedSearches.map(entry => (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => applySavedSearch(entry)}
                            className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 hover:bg-blue-100 transition-colors"
                          >
                            {(entry.keyword || 'Any role')}
                            {entry.location && ` • ${entry.location}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {recentSearches.length > 0 && (
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Or repeat a recent search:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {recentSearches.map(entry => (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => applySavedSearch(entry)}
                            className="px-3 py-1 rounded-full bg-gray-50 text-gray-700 text-xs font-medium border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            {(entry.keyword || 'Any role')}
                            {entry.location && ` • ${entry.location}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5' : 'flex flex-col gap-4'}`}> 
                {currentJobs.map((job, index) => (
                viewMode === 'list' ? (
                  <motion.div
                    key={job.id}
                    className="bg-white rounded-2xl p-4 sm:p-6 shadow-md shadow-black/8 border border-gray-200 cursor-pointer transition-all duration-300 mb-4 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/12 hover:border-blue-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
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
                    <div className="flex justify-between items-center w-full">
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="mb-1">
                          <span className="inline-flex items-center gap-1.5 bg-gradient-to-br from-blue-500 to-blue-700 text-white py-1 px-3 rounded-full text-xs font-semibold uppercase tracking-wider">
                            {job.isRemote ? (
                              <>
                                <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="text-white">Remote</span>
                              </>
                            ) : (
                              <>
                                <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="text-white">Specialized</span>
                              </>
                            )}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 m-0 leading-tight">
                          {job.title}
                        </h3>
                        <p className="text-base text-gray-500 m-0 font-medium">
                          {job.company}
                        </p>
                        <div className="flex gap-6 mt-2">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                            <MapPin size={14} />
                            <span>{job.location || 'Location not specified'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                            <Briefcase size={14} />
                            <span>
                              {(() => {
                                // Handle the experience data structure we're receiving
                                if (job.experience && typeof job.experience === 'object' && 'level' in job.experience) {
                                  return (job.experience as any).level;
                                }
                                if (typeof job.experience === 'string') {
                                  return job.experience;
                                }
                                if (job.experience && typeof job.experience === 'object' && 'min' in job.experience && 'max' in job.experience) {
                                  return `${(job.experience as any).min}-${(job.experience as any).max} years`;
                                }
                                return 'Experience not specified';
                              })()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                            <DollarSign size={14} />
                            <span>
                              {(() => {
                                // Prefer displaySalary when available (e.g., government jobs)
                                const displaySalary = (job as any).displaySalary;
                                if (displaySalary) return displaySalary;

                                if (!job.salary) return 'Salary not specified';
                                if (typeof job.salary === 'string') return job.salary;
                                
                                const currency = job.salary.currency === 'INR' ? '₹' : '$';
                                
                                if (job.salary.min && job.salary.max) {
                                  if (job.salary.currency === 'INR') {
                                    // Format Indian salaries in Lakhs
                                    const minLakhs = (job.salary.min / 100000).toFixed(1);
                                    const maxLakhs = (job.salary.max / 100000).toFixed(1);
                                    return `${currency}${minLakhs}L - ${currency}${maxLakhs}L`;
                                  } else {
                                    // Format USD salaries in thousands
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
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                            <Clock size={14} />
                            <span>{job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'Recently'}</span>
                          </div>
                          {job.skills && job.skills.length > 0 && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                              <GraduationCap size={14} />
                              <span>{job.skills.slice(0, 2).join(', ')}{job.skills.length > 2 ? '...' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-6">
                        <button className="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none py-3 px-6 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 shadow-md shadow-blue-500/20 hover:from-blue-600 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30" onClick={(e) => { e.stopPropagation(); handleJobClick(job); }}>
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <JobCard key={job.id} job={job as unknown as Job} index={index} />
                  )
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-center gap-4 mt-8 mb-12">
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5 cursor-pointer'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, idx) => (
                        page === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            className={`min-w-[40px] h-10 px-3 rounded-md font-medium transition-all duration-200 ${
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
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
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
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
