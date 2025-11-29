import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Star,
  Bookmark,
  Share2,
  CheckCircle,
  ExternalLink,
  Building2,
  Award,
  GraduationCap
} from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { buildCompanySlug, extractIdFromSlug } from '../utils/slug';
import JobPostingSchema from '../components/seo/JobPostingSchema';
import { jobsAPI, savedJobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface JobDetailsData {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  postedDate: string;
  applicationDeadline?: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: {
    skills: string[];
    education: string;
    experience: string;
    preferred: string[];
  };
  responsibilities: string[];
  benefits: string[];
  howToApply: string;
  contact: {
    hrContact: string;
    email: string;
    phone?: string;
  };
  isBookmarked: boolean;
  rating: number;
  applicantsCount: number;
  applyUrl?: string | null;
  jobUrl?: string | null;
  slug?: string;
  // Govt job specific fields
  department?: string | null;
  eligibility?: string | null;
  qualification?: string | null;
  education?: string | null;
  preferredQualifications?: string | null;
  requirementsText?: string | null; // Detailed requirements text (separate from requirements object)
  notificationPdf?: string | null;
  lastDate?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
  vacancies?: number | null;
  applicants?: string | null;
  displaySalary?: string | null;
  category?: string | null;
}

const JobDetails: React.FC = () => {
  const params = useParams();
  // Use slug parameter (route is now /jobs/:slug)
  const slugOrId = (params as any).slug || (params as any).id || '';
  // Use the utility function to extract ID from slug
  const extractedId = slugOrId ? extractIdFromSlug(slugOrId) : '';
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // CSS modules handle style isolation automatically

  useEffect(() => {
    const loadJobDetails = async () => {
      // Extract ID from slugOrId for API calls
      const currentExtractedId = slugOrId ? extractIdFromSlug(slugOrId) : '';
      if (!currentExtractedId) return;
      
      setLoading(true);
      try {
        // Backend accepts both slug and ID, so we can pass the slug directly
        // The backend will extract the ID internally
        const jobData = await jobsAPI.fetchJobById(slugOrId);
        
        // Get the canonical slug from the API response (backend now includes it)
        const canonicalSlug = (jobData as any).slug || slugOrId;
        
        // Check if this is a govt job (has _source === 'govt' or has govt-specific fields)
        const isGovtJob = (jobData as any)._source === 'govt' || 
                          (jobData as any).department || 
                          (jobData as any).notificationPdf ||
                          (jobData as any).eligibility;

        // Transform responsibilities - handle both array and string
        let responsibilitiesList: string[] = [];
        if ((jobData as any).responsibilities) {
          if (Array.isArray((jobData as any).responsibilities)) {
            responsibilitiesList = (jobData as any).responsibilities;
          } else {
            // Split by newline or bullet points
            responsibilitiesList = String((jobData as any).responsibilities)
              .split(/\n|•|\*/)
              .map((r: string) => r.trim())
              .filter((r: string) => r.length > 0);
          }
        }
        
        // If no responsibilities from API, use defaults for non-govt jobs
        if (responsibilitiesList.length === 0 && !isGovtJob) {
          responsibilitiesList = [
            'Develop and maintain high-quality software solutions',
            'Collaborate with cross-functional teams',
            'Write clean, maintainable, and well-documented code',
            'Participate in code reviews and technical discussions'
          ];
        }

        // Transform the API data to match the JobDetailsData interface using REAL data
        const transformedJob: JobDetailsData = {
          id: jobData.id,
          title: jobData.title,
          company: jobData.company,
          companyLogo: jobData.companyLogo,
          location: jobData.location || 'Location not specified',
          jobType: jobData.type || 'Full-time',
          experienceLevel: jobData.experienceLevel || 'Experience not specified',
          postedDate: jobData.postedDate || new Date().toISOString(),
          applicationDeadline: jobData.applicationDeadline || (jobData as any).lastDate || null,
          salary: {
            min: jobData.salary?.min || 0,
            max: jobData.salary?.max || 0,
            currency: jobData.salary?.currency || 'INR'
          },
          description: jobData.description || 'No description available.',
          requirements: {
            skills: jobData.skills || [],
            education: (jobData as any).education || (jobData as any).educationRequired || (jobData as any).qualification || 'Education requirements not specified',
            experience: jobData.experienceLevel || 'Experience not specified',
            preferred: (jobData as any).preferredQualifications ? 
              String((jobData as any).preferredQualifications).split(/\n|•|\*/).map((p: string) => p.trim()).filter((p: string) => p.length > 0) : 
              (jobData.skills || [])
          },
          responsibilities: responsibilitiesList,
          benefits: isGovtJob ? [
            'Government job security',
            'Pension benefits',
            'Medical facilities',
            'Housing allowances'
          ] : [
            'Competitive salary package',
            'Health insurance',
            'Flexible working hours',
            'Professional development opportunities'
          ],
          howToApply: (jobData as any).applyUrl ? 
            `Apply directly through the official portal: ${(jobData as any).applyUrl}` : 
            'To apply for this position, please submit your resume and cover letter through our online application portal.',
          contact: {
            hrContact: jobData.company || 'HR Team',
            email: (jobData as any).contactEmail || 'hr@company.com',
            phone: (jobData as any).contactPhone || '+1 (555) 123-4567'
          },
          isBookmarked: jobData.isBookmarked || false,
          rating: jobData.rating || 4.5,
          applicantsCount: jobData.applicantsCount || 0,
          applyUrl: (jobData as any).applyUrl || null,
          jobUrl: (jobData as any).jobUrl || (jobData as any).applyUrl || null,
          // Store slug for use in navigation and SEO
          slug: canonicalSlug,
          // Store all govt job fields for display
          ...(isGovtJob && {
            department: (jobData as any).department,
            eligibility: (jobData as any).eligibility,
            qualification: (jobData as any).qualification,
            education: (jobData as any).education || (jobData as any).educationRequired,
            preferredQualifications: (jobData as any).preferredQualifications,
            // Don't overwrite requirements object - store detailed requirements separately
            requirementsText: (jobData as any).requirements,
            notificationPdf: (jobData as any).notificationPdf,
            lastDate: (jobData as any).lastDate || (jobData as any).applicationDeadline,
            source: (jobData as any).source,
            sourceUrl: (jobData as any).sourceUrl,
            vacancies: (jobData as any).vacancies,
            applicants: (jobData as any).applicants,
            displaySalary: (jobData as any).displaySalary,
            category: (jobData as any).category
          })
        } as any;
        
        setJob(transformedJob);
        setIsBookmarked(transformedJob.isBookmarked);
        
        // Check if job is saved
        try {
          const isSaved = await savedJobsAPI.isJobSaved(currentExtractedId);
          setIsBookmarked(isSaved);
        } catch (error) {
          console.error('Error checking if job is saved:', error);
        }
      } catch (error) {
        console.error('Error loading job details:', error);
        // Show error state instead of mock data
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [slugOrId]);

  const handleBookmark = async () => {
    if (!extractedId) return;
    
    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await savedJobsAPI.unsaveJob(extractedId);
        setIsBookmarked(false);
      } else {
        await savedJobsAPI.saveJob(extractedId);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert the state on error
      setIsBookmarked(!isBookmarked);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleApply = async () => {
    // Employers should not be applying to jobs
    if (user?.role === 'employer') {
      navigate('/employer/dashboard');
      return;
    }

    // Check if job has external jobUrl (from external API)
    const jobUrl = job?.jobUrl;
    
    if (jobUrl) {
      // External job flow - redirect to external URL
      if (!user) {
        // Not logged in - redirect to login with redirect param
        const redirectPath = location.pathname;
        navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
        return;
      }
      
      // Logged in - record click and open external URL
      try {
        await jobsAPI.recordApplyClick(extractedId);
      } catch (error) {
        console.error('Error recording apply click:', error);
        // Continue even if click recording fails
      }
      window.open(jobUrl, '_blank');
    } else {
      // Internal job flow (existing behavior)
      if (!user) {
        // If not authenticated, redirect to login with redirect param
        const redirectPath = location.pathname;
        navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
        return;
      }
      
      // If authenticated as candidate, navigate to apply page with job slug
      const slugToUse = job?.slug || slugOrId;
      navigate(`/apply/${slugToUse}`);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job opportunity: ${job?.title} at ${job?.company}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Job link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-0 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 text-base m-0">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-0 relative z-10">
        <div className="text-center py-20 px-5 bg-white rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 m-0 mb-3">
            Job Not Found
          </h2>
          <p className="text-gray-500 text-base m-0 mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 bg-none border-none text-gray-500 text-sm font-medium cursor-pointer transition-all duration-300 py-2 px-0 hover:text-blue-500 hover:-translate-x-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-0 relative z-10">
      {/* SEO Head */}
      <SEOHead
        title={`${job.title} at ${job.company} - ${job.location} | mycareerbuild Jobs`}
        description={`Apply for ${job.title} at ${job.company} in ${job.location}. ${job.jobType} position${job.displaySalary ? ` with salary ${job.displaySalary}` : job.salary && job.salary.min > 0 ? ` with salary ${job.salary.currency} ${job.salary.min}-${job.salary.max}` : ''}. Find more jobs at mycareerbuild.`}
        keywords={`${job.title}, ${job.company}, jobs in ${job.location}, ${job.jobType} jobs${job.requirements?.skills && Array.isArray(job.requirements.skills) && job.requirements.skills.length > 0 ? `, ${job.requirements.skills.join(', ')}` : ''}, career opportunities`}
        canonical={`http://localhost:3000/jobs/${job?.slug || slugOrId}`}
        ogTitle={`${job.title} at ${job.company} - ${job.location}`}
        ogDescription={`Apply for ${job.title} at ${job.company} in ${job.location}. ${job.jobType} position with competitive salary.`}
        ogImage={job.companyLogo || "http://localhost:3000/logo.png"}
        ogUrl={`http://localhost:3000/jobs/${job?.slug || slugOrId}`}
      />
      
      {/* Job Posting Schema */}
      <JobPostingSchema
        jobTitle={job.title}
        jobDescription={job.description}
        companyName={job.company}
        companyLogo={job.companyLogo}
        companyUrl={job.contact.email ? `mailto:${job.contact.email}` : undefined}
        jobLocation={{
          addressLocality: job.location.split(',')[0],
          addressRegion: job.location.split(',')[1] || '',
          postalCode: '',
          addressCountry: 'IN'
        }}
        baseSalary={job.salary && job.salary.min > 0 ? {
          currency: job.salary.currency,
          minValue: job.salary.min,
          maxValue: job.salary.max
        } : undefined}
        employmentType={job.jobType.toUpperCase().replace('-', '_') as any}
        datePosted={job.postedDate}
        validThrough={job.applicationDeadline || job.lastDate || undefined}
        qualifications={job.requirements?.education || job.education || job.qualification || ''}
        responsibilities={Array.isArray(job.responsibilities) ? job.responsibilities.join(', ') : (job.responsibilities || '')}
        skills={job.requirements?.skills && Array.isArray(job.requirements.skills) ? job.requirements.skills.join(', ') : ''}
        workHours="40 hours per week"
        benefits={Array.isArray(job.benefits) ? job.benefits.join(', ') : ''}
      />
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6"
      >
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
          <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 bg-none border-none text-gray-500 text-sm font-medium cursor-pointer transition-all duration-300 mb-5 py-2 px-0 hover:text-blue-500 hover:-translate-x-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>
          
          <div className="flex flex-col md:flex-row md:justify-between items-start gap-4 md:gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 m-0 mb-3 leading-tight">
                {job.title}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-5 h-5 text-gray-500" />
                <span className="text-lg font-semibold text-gray-700 m-0 leading-snug">
                  {job.company && (job as any).companyId ? (
                    <a className="text-blue-600 hover:underline" href={`/companies/${buildCompanySlug(job.company, (job as any).companyId)}`}>
                      {job.company}
                    </a>
                  ) : (
                    job.company
                  )}
                </span>
                <div className="flex items-center gap-1 bg-slate-50 py-1 px-2 rounded-md text-sm font-medium text-gray-700">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{job.rating}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 flex-shrink-0 flex-wrap w-full md:w-auto">
              <button 
                onClick={handleBookmark} 
                disabled={bookmarkLoading}
                className={`flex items-center gap-1.5 py-2.5 px-4 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 ${isBookmarked ? 'bg-emerald-600 border-2 border-emerald-700 text-white shadow-md shadow-emerald-500/30 hover:bg-emerald-700 hover:border-emerald-800' : 'bg-slate-50 border border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300'} ${bookmarkLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
                {bookmarkLoading ? 'Saving...' : (isBookmarked ? 'Saved' : 'Save')}
              </button>
              <button onClick={handleShare} className="flex items-center gap-1.5 py-2.5 px-4 bg-slate-50 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-gray-200 hover:border-gray-300 flex-1 md:flex-none justify-center">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button onClick={handleApply} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none rounded-lg py-3 px-6 text-base font-semibold cursor-pointer transition-all duration-300 shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 flex-1 md:flex-none justify-center">
                Apply Now
              </button>
            </div>
          </div>
        </div>

        {/* Job Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="flex items-center gap-3 bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10">
            <MapPin className="w-6 h-6 text-blue-500 flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {job.location}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10">
            <Briefcase className="w-6 h-6 text-blue-500 flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Type
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {job.jobType}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10">
            <Award className="w-6 h-6 text-blue-500 flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experience
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {job.experienceLevel}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10">
            <DollarSign className="w-6 h-6 text-blue-500 flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salary
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {(() => {
                  // Check for displaySalary first (govt jobs)
                  if (job.displaySalary) {
                    return job.displaySalary;
                  }
                  if (typeof job.salary === 'string') return job.salary;
                  if (job.salary.min === 0 && job.salary.max === 0) return 'Salary not specified';
                  
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
          </div>
          
          <div className="flex items-center gap-3 bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10">
            <Calendar className="w-6 h-6 text-blue-500 flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posted
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {new Date(job.postedDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10">
            <Users className="w-6 h-6 text-blue-500 flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {job.vacancies ? 'Vacancies' : 'Applicants'}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {job.vacancies ? `${job.vacancies} ${job.vacancies === 1 ? 'vacancy' : 'vacancies'}` : job.applicantsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`grid grid-cols-1 ${job.applicationDeadline ? 'xl:grid-cols-3' : ''} gap-8`}>
          <div className={`${job.applicationDeadline ? 'xl:col-span-2' : ''} bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-200`}>
            {/* Job Description */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 m-0 mb-5 pb-3 border-b-2 border-gray-200 relative">
                Job Description
                <div className="absolute bottom-[-2px] left-0 w-15 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700"></div>
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="m-0 mb-4 text-base">{job.description}</p>
              </div>
            </section>

            {/* Requirements & Qualifications */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 m-0 mb-5 pb-3 border-b-2 border-gray-200 relative">
                Requirements & Qualifications
                <div className="absolute bottom-[-2px] left-0 w-15 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700"></div>
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <div className="grid gap-6">
                  {/* Department (Govt Jobs) */}
                  {job.department && (
                    <div className="bg-slate-50 p-5 rounded-xl border border-gray-200">
                      <h3 className="flex items-center gap-2 text-base font-semibold text-gray-700 m-0 mb-3">
                        <Building2 className="w-4.5 h-4.5 text-blue-500" />
                        Department
                      </h3>
                      <p className="m-0 text-sm text-gray-700 font-medium">{job.department}</p>
                    </div>
                  )}

                  {/* Eligibility (Govt Jobs) */}
                  {job.eligibility && (
                    <div className="bg-slate-50 p-5 rounded-xl border border-gray-200">
                      <h3 className="flex items-center gap-2 text-base font-semibold text-gray-700 m-0 mb-3">
                        <CheckCircle className="w-4.5 h-4.5 text-blue-500" />
                        Eligibility
                      </h3>
                      <p className="m-0 text-sm text-gray-700 whitespace-pre-line">{job.eligibility}</p>
                    </div>
                  )}

                  {/* Qualification (Govt Jobs) */}
                  {job.qualification && (
                    <div className="bg-slate-50 p-5 rounded-xl border border-gray-200">
                      <h3 className="flex items-center gap-2 text-base font-semibold text-gray-700 m-0 mb-3">
                        <Award className="w-4.5 h-4.5 text-blue-500" />
                        Qualification
                      </h3>
                      <p className="m-0 text-sm text-gray-700 whitespace-pre-line">{job.qualification}</p>
                    </div>
                  )}

                  <div className="bg-slate-50 p-5 rounded-xl border border-gray-200">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-gray-700 m-0 mb-3">
                      <CheckCircle className="w-4.5 h-4.5 text-blue-500" />
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements?.skills && Array.isArray(job.requirements.skills) && job.requirements.skills.length > 0 ? (
                        job.requirements.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-500 text-white py-1.5 px-3 rounded-full text-xs font-medium uppercase tracking-wider">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="m-0 text-sm text-gray-500">No specific skills listed</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-5 rounded-xl border border-gray-200">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-gray-700 m-0 mb-3">
                      <GraduationCap className="w-4.5 h-4.5 text-blue-500" />
                      Education
                    </h3>
                    <p className="m-0 text-sm text-gray-700 whitespace-pre-line">{job.requirements?.education || 'Education requirements not specified'}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-5 rounded-xl border border-gray-200">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-gray-700 m-0 mb-3">
                      <Clock className="w-4.5 h-4.5 text-blue-500" />
                      Experience
                    </h3>
                    <p className="m-0 text-sm text-gray-700">{job.requirements?.experience || 'Experience not specified'}</p>
                  </div>

                  {/* Requirements (Govt Jobs - detailed) */}
                  {job.requirementsText && (
                    <div className="bg-slate-50 p-5 rounded-xl border border-gray-200">
                      <h3 className="flex items-center gap-2 text-base font-semibold text-gray-700 m-0 mb-3">
                        <CheckCircle className="w-4.5 h-4.5 text-blue-500" />
                        Detailed Requirements
                      </h3>
                      <p className="m-0 text-sm text-gray-700 whitespace-pre-line">{job.requirementsText}</p>
                    </div>
                  )}
                  
                  {job.requirements?.preferred && Array.isArray(job.requirements.preferred) && job.requirements.preferred.length > 0 && (
                    <div className="bg-slate-50 p-5 rounded-xl border border-gray-200">
                      <h3 className="flex items-center gap-2 text-base font-semibold text-gray-700 m-0 mb-3">
                        <Star className="w-4.5 h-4.5 text-blue-500" />
                        Preferred Qualifications
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.preferred.map((skill, index) => (
                          <span key={index} className="bg-blue-500 text-white py-1.5 px-3 rounded-full text-xs font-medium uppercase tracking-wider">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preferred Qualifications (Govt Jobs - as string) */}
                  {job.preferredQualifications && typeof job.preferredQualifications === 'string' && (
                    <div className="bg-slate-50 p-5 rounded-xl border border-gray-200">
                      <h3 className="flex items-center gap-2 text-base font-semibold text-gray-700 m-0 mb-3">
                        <Star className="w-4.5 h-4.5 text-blue-500" />
                        Preferred Qualifications
                      </h3>
                      <p className="m-0 text-sm text-gray-700 whitespace-pre-line">{job.preferredQualifications}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Responsibilities */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 m-0 mb-5 pb-3 border-b-2 border-gray-200 relative">
                Responsibilities
                <div className="absolute bottom-[-2px] left-0 w-15 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700"></div>
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <ul className="list-none p-0 m-0">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-3 py-3 border-b border-slate-100 text-sm text-gray-700 leading-relaxed last:border-b-0">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {responsibility}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Benefits & Perks */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 m-0 mb-5 pb-3 border-b-2 border-gray-200 relative">
                Benefits & Perks
                <div className="absolute bottom-[-2px] left-0 w-15 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700"></div>
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-gray-200 text-sm text-gray-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* How to Apply */}
            <section className="mb-0">
              <h2 className="text-2xl font-bold text-gray-900 m-0 mb-5 pb-3 border-b-2 border-gray-200 relative">
                How to Apply
                <div className="absolute bottom-[-2px] left-0 w-15 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700"></div>
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <div className="bg-slate-50 p-6 rounded-xl border border-gray-200">
                  <p className="m-0 mb-5 text-sm text-gray-500">
                    {job.howToApply}
                  </p>
                  <button onClick={handleApply} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none rounded-lg py-3.5 px-7 text-base font-semibold cursor-pointer transition-all duration-300 shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40">
                    <ExternalLink className="w-4 h-4" />
                    Apply Now
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          {(job.applicationDeadline || job.lastDate || job.notificationPdf || job.vacancies || job.category) && (
            <div className="flex flex-col gap-6">
              {/* Category (Govt Jobs) */}
              {job.category && (
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-4 sm:p-6 shadow-sm border border-blue-300">
                  <h3 className="text-lg font-semibold text-gray-900 m-0 mb-2">
                    Category
                  </h3>
                  <span className="text-base font-semibold text-blue-800 capitalize">
                    {job.category}
                  </span>
                </div>
              )}

              {/* Vacancies (Govt Jobs) */}
              {job.vacancies && (
                <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-4 sm:p-6 shadow-sm border border-green-300">
                  <h3 className="text-lg font-semibold text-gray-900 m-0 mb-2">
                    Vacancies
                  </h3>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-base font-semibold text-green-800">
                      {job.vacancies} {job.vacancies === 1 ? 'vacancy' : 'vacancies'}
                    </span>
                  </div>
                </div>
              )}

              {/* Application Deadline */}
              {(job.applicationDeadline || job.lastDate) && (
                <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl p-4 sm:p-6 shadow-sm border border-amber-300">
                  <h3 className="text-lg font-semibold text-gray-900 m-0 mb-4">
                    Application Deadline
                  </h3>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <span className="text-base font-semibold text-amber-800">
                      {new Date(job.applicationDeadline || job.lastDate || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Notification PDF (Govt Jobs) */}
              {job.notificationPdf && (
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-4 sm:p-6 shadow-sm border border-purple-300">
                  <h3 className="text-lg font-semibold text-gray-900 m-0 mb-4">
                    Official Notification
                  </h3>
                  <a
                    href={job.notificationPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white border-none rounded-lg py-2.5 px-5 text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-purple-700 hover:-translate-y-0.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View PDF Notification
                  </a>
                </div>
              )}

              {/* Source (Govt Jobs) */}
              {job.source && (
                <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-300">
                  <h3 className="text-lg font-semibold text-gray-900 m-0 mb-2">
                    Source
                  </h3>
                  {job.sourceUrl ? (
                    <a
                      href={job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-blue-800 hover:underline inline-flex items-center gap-2"
                    >
                      {job.source}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-base font-semibold text-slate-800">
                      {job.source}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.main>
    </div>
  );
};

export default JobDetails;