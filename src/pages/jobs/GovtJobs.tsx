import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  MapPin,
  Briefcase,
  Loader2,
  Shield
} from 'lucide-react';
import { jobsAPI } from '../../services/api';
import { Job } from '../../types/job';
import JobCard from '../../components/jobs/JobCard';
import JobSearchBar from '../../components/jobs/JobSearchBar';
import { buildJobSlug } from '../../utils/slug';

const GovtJobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ keyword: string; location: string }>({ keyword: '', location: '' });
  const [resetCounter, setResetCounter] = useState(0);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [filters, jobs]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.fetchJobs();
      const jobsData = response.jobs || response || [];
      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      
      // Filter for government jobs
      const govtJobs = jobsArray.filter(job => 
        job.category?.toLowerCase().includes('government') ||
        job.company?.toLowerCase().includes('government') ||
        job.title?.toLowerCase().includes('government') ||
        job.title?.toLowerCase().includes('govt') ||
        job.title?.toLowerCase().includes('public sector')
      );
      
      setJobs(govtJobs);
      setFilteredJobs(govtJobs);
    } catch (error) {
      console.error('Error loading government jobs:', error);
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(keyword) ||
        job.company?.toLowerCase().includes(keyword) ||
        job.description?.toLowerCase().includes(keyword)
      );
    }

    if (filters.location) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(location)
      );
    }

    setFilteredJobs(filtered);
  };

  const handleSearch = (searchFilters: { keyword: string; location: string }) => {
    setFilters(searchFilters);
  };

  const handleJobClick = (job: Job) => {
    const slug = (job as any).slug || buildJobSlug({
      title: job.title,
      company: job.company,
      location: job.location || null,
      id: job.id
    });
    navigate(`/jobs/${slug}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Professional Banner */}
      <header className="bg-gradient-to-br from-blue-800 to-blue-500 text-white py-10 shadow-lg shadow-black/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-8 h-8 text-white" />
              <h1 className="text-5xl font-bold m-0 leading-tight text-white">
                Government Jobs
              </h1>
            </div>
            <p className="text-lg m-0 opacity-90 font-normal text-white">
              Explore career opportunities in the public sector
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
                Available Positions
              </h2>
              <p className="text-sm text-gray-600 m-0">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4 text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p>Loading government jobs...</p>
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20 px-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-2xl font-semibold text-gray-700 m-0 mb-2">
                No government jobs found
              </h3>
              <p className="text-base text-gray-500 m-0">
                {filters.keyword || filters.location
                  ? 'Try adjusting your search criteria.'
                  : 'Check back later for new government job opportunities.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filteredJobs.map((job) => (
                <JobCard 
                  key={job.id}
                  job={job} 
                  onClick={() => handleJobClick(job)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GovtJobs;
