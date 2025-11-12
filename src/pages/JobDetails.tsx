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
  CheckCircle,
  ExternalLink,
  Building2,
  Award,
  GraduationCap
} from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { buildCompanySlug, extractIdFromSlug } from '../utils/slug';
import JobPostingSchema from '../components/seo/JobPostingSchema';
import { jobsAPI } from '../services/api';
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
          applicationDeadline: jobData.applicationDeadline,
          salary: {
            min: jobData.salary?.min || 0,
            max: jobData.salary?.max || 0,
            currency: jobData.salary?.currency || 'INR'
          },
          description: jobData.description || 'No description available.',
          requirements: {
            skills: jobData.skills || [],
            education: 'Education requirements not specified',
            experience: jobData.experienceLevel || 'Experience not specified',
            preferred: jobData.skills || []
          },
          responsibilities: [
            'Develop and maintain high-quality software solutions',
            'Collaborate with cross-functional teams',
            'Write clean, maintainable, and well-documented code',
            'Participate in code reviews and technical discussions'
          ],
          benefits: [
            'Competitive salary package',
            'Health insurance',
            'Flexible working hours',
            'Professional development opportunities'
          ],
          howToApply: 'To apply for this position, please submit your resume and cover letter through our online application portal.',
          contact: {
            hrContact: jobData.company || 'HR Team',
            email: 'hr@company.com',
            phone: '+1 (555) 123-4567'
          },
          isBookmarked: jobData.isBookmarked || false,
          rating: jobData.rating || 4.5,
          applicantsCount: jobData.applicantsCount || 0,
          applyUrl: (jobData as any).applyUrl || null,
          jobUrl: (jobData as any).jobUrl || null,
          // Store slug for use in navigation and SEO
          slug: canonicalSlug
        };
        
        setJob(transformedJob);
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

  const formatSalary = (salary: any) => {
    if (!salary) return 'Salary not specified';
    if (typeof salary === 'string') return salary;

    const { min = 0, max = 0, currency = 'INR' } = salary;

    if (min === 0 && max === 0) return 'Salary not specified';

    const currencySymbol = currency === 'INR' ? '₹' : '$';

    if (min && max) {
      if (currency === 'INR') {
        const minLakhs = (min / 100000).toFixed(1);
        const maxLakhs = (max / 100000).toFixed(1);
        return `${currencySymbol}${minLakhs}L - ${currencySymbol}${maxLakhs}L`;
      }

      const minThousands = (min / 1000).toFixed(0);
      const maxThousands = (max / 1000).toFixed(0);
      return `${currencySymbol}${minThousands}K - ${currencySymbol}${maxThousands}K`;
    }

    if (min) {
      if (currency === 'INR') {
        const minLakhs = (min / 100000).toFixed(1);
        return `${currencySymbol}${minLakhs}L+`;
      }

      const minThousands = (min / 1000).toFixed(0);
      return `${currencySymbol}${minThousands}K+`;
    }

    return 'Salary not specified';
  };

  const formatDateValue = (value?: string | null) => {
    if (!value) return 'Not specified';
    try {
      return new Date(value).toLocaleDateString();
    } catch (error) {
      return 'Not specified';
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

  const ratingDisplay =
    typeof job.rating === 'number' ? job.rating.toFixed(1) : job.rating;
  const descriptionPreview =
    job.description && job.description.length > 240
      ? `${job.description.slice(0, 240)}…`
      : job.description;

  const highlightCards = [
    { icon: MapPin, label: 'Location', value: job.location },
    { icon: Briefcase, label: 'Job Type', value: job.jobType },
    { icon: Award, label: 'Experience', value: job.experienceLevel },
    { icon: DollarSign, label: 'Salary', value: formatSalary(job.salary) }
  ];

  const insightChips = [
    { label: 'Posted', value: formatDateValue(job.postedDate) },
    { label: 'Applicants', value: `${job.applicantsCount ?? 0}` },
    { label: 'Rating', value: ratingDisplay || '4.5' }
  ];

  const snapshotItems = [
    { label: 'Employment Type', value: job.jobType },
    { label: 'Experience Level', value: job.experienceLevel },
    { label: 'Location', value: job.location },
    { label: 'Salary Range', value: formatSalary(job.salary) },
    { label: 'Applicants', value: `${job.applicantsCount ?? 0}` },
    { label: 'Posted On', value: formatDateValue(job.postedDate) }
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-0 relative z-10">
      <SEOHead
        title={`${job.title} at ${job.company} - ${job.location} | mycareerbuild Jobs`}
        description={`Apply for ${job.title} at ${job.company} in ${job.location}. ${job.jobType} position with salary ${job.salary.currency} ${job.salary.min}-${job.salary.max}. Find more jobs at mycareerbuild.`}
        keywords={`${job.title}, ${job.company}, jobs in ${job.location}, ${job.jobType} jobs, ${job.requirements.skills.join(', ')}, career opportunities`}
        canonical={`https://mycareerbuild.com/jobs/${job?.slug || slugOrId}`}
        ogTitle={`${job.title} at ${job.company} - ${job.location}`}
        ogDescription={`Apply for ${job.title} at ${job.company} in ${job.location}. ${job.jobType} position with competitive salary.`}
        ogImage={job.companyLogo || 'https://mycareerbuild.com/logo.png'}
        ogUrl={`https://mycareerbuild.com/jobs/${job?.slug || slugOrId}`}
      />

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
        baseSalary={{
          currency: job.salary.currency,
          minValue: job.salary.min,
          maxValue: job.salary.max
        }}
        employmentType={job.jobType.toUpperCase().replace('-', '_') as any}
        datePosted={job.postedDate}
        validThrough={job.applicationDeadline}
        qualifications={job.requirements.education}
        responsibilities={job.responsibilities.join(', ')}
        skills={job.requirements.skills.join(', ')}
        workHours="40 hours per week"
        benefits={job.benefits.join(', ')}
      />

      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10"
      >
        <div className="space-y-10">
          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-lg">
            <div className="p-6 sm:p-7 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={() => navigate('/jobs')}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 transition-all duration-300 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Jobs
                </button>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {formatDateValue(job.postedDate)}</span>
                </div>
              </div>

              <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div className="space-y-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                    <Briefcase className="h-3.5 w-3.5" />
                    {job.jobType}
                  </span>

                  <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                    {job.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-slate-500" />
                      <span className="font-semibold text-slate-900">
                        {job.company && (job as any).companyId ? (
                          <a
                            className="text-blue-600 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-700"
                            href={`/companies/${buildCompanySlug(
                              job.company,
                              (job as any).companyId
                            )}`}
                          >
                            {job.company}
                          </a>
                        ) : (
                          job.company
                        )}
                      </span>
                    </div>

                    <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />

                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-slate-500" />
                      <span className="text-slate-700">{job.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {insightChips.map((chip) => (
                      <span
                        key={chip.label}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-600"
                      >
                        <span className="text-slate-500">{chip.label}</span>
                        <span className="text-slate-800">{chip.value}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 md:items-end">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    <Star className="h-4 w-4 text-amber-400" />
                    <span>{ratingDisplay}</span>
                    <span className="text-slate-500">Employer Rating</span>
                  </div>

                  <button
                    onClick={handleApply}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Apply Now
                  </button>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {highlightCards.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                      <Icon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[0.6rem] uppercase tracking-[0.26em] text-slate-500">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-slate-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-8">
              <section className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur">
                <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Role Overview
                  </h2>
                  <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{formatDateValue(job.postedDate)}</span>
                  </div>
                </header>
                <div className="mt-4 space-y-4 text-gray-600">
                  <p className="text-base leading-relaxed">{job.description}</p>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur">
                <header className="mb-6 space-y-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Requirements & Qualifications
                  </h2>
                  <p className="text-sm text-gray-500">
                    What you need to succeed in this role
                  </p>
                </header>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      Core Skills
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.requirements.skills.length > 0 ? (
                        job.requirements.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 shadow-sm"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-blue-800/70">
                          Skills not specified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-purple-100 bg-purple-50/70 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-purple-700">
                      <GraduationCap className="h-4 w-4 text-purple-600" />
                      Education
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-purple-900/80">
                      {job.requirements.education}
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      Experience
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-emerald-900/80">
                      {job.requirements.experience}
                    </p>
                  </div>

                  {job.requirements.preferred.length > 0 && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-5">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                        <Star className="h-4 w-4 text-amber-500" />
                        Preferred
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.requirements.preferred.map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur">
                <header className="mb-6 space-y-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Responsibilities
                  </h2>
                  <p className="text-sm text-gray-500">
                    What your day-to-day will look like
                  </p>
                </header>
                <ol className="space-y-4">
                  {job.responsibilities.map((responsibility, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <span className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-gray-600">
                        {responsibility}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur">
                <header className="mb-6 space-y-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Benefits & Perks
                  </h2>
                  <p className="text-sm text-gray-500">
                    A glimpse into what the company offers
                  </p>
                </header>
                <div className="grid gap-4 sm:grid-cols-2">
                  {job.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm font-medium text-emerald-900/80"
                    >
                      <CheckCircle className="mt-1 h-4 w-4 text-emerald-500" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </section>

              <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-slate-900">How to Apply</h2>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {job.howToApply}
                  </p>
                  <button
                    onClick={handleApply}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-transform duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Apply Now
                  </button>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur">
                <h3 className="text-lg font-semibold text-gray-900">
                  Opportunity Snapshot
                </h3>
                <div className="mt-6 space-y-4">
                  {snapshotItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-gray-500">
                        {item.label}
                      </span>
                      <span className="text-sm font-medium text-gray-900 text-right">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleApply}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Apply for this role
                </button>
              </section>

              {job.applicationDeadline && (
                <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 shadow-inner">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-10 w-10 flex-shrink-0 text-amber-600" />
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-amber-600">
                        Application Deadline
                      </p>
                      <p className="text-lg font-semibold text-amber-900">
                        {formatDateValue(job.applicationDeadline)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-amber-800/80">
                    Submit your application before the deadline to make sure
                    you're considered for this opportunity.
                  </p>
                </section>
              )}
            </aside>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default JobDetails;