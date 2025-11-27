import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  ArrowRight,
  Star,
  Globe,
  Shield,
  Users,
  DollarSign,
  Clock,
  GraduationCap,
  Building2,
  Award
} from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import OrganizationSchema from '../components/seo/OrganizationSchema';
import WebsiteSchema from '../components/seo/WebsiteSchema';
import { Job } from '../types/job';
import { jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { buildJobSlug } from '../utils/slug';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [remoteJobs, setRemoteJobs] = useState<Job[]>([]);
  const [fresherJobs, setFresherJobs] = useState<Job[]>([]);
  const [governmentJobs, setGovernmentJobs] = useState<Job[]>([]);
  const [experiencedJobs, setExperiencedJobs] = useState<Job[]>([]);
  const [isLoadingRemote, setIsLoadingRemote] = useState(true);
  const [isLoadingFresher, setIsLoadingFresher] = useState(true);
  const [isLoadingGovernment, setIsLoadingGovernment] = useState(true);
  const [isLoadingExperienced, setIsLoadingExperienced] = useState(true);
  const [forceRender, setForceRender] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  // Force component re-render on navigation back
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setForceRender(prev => prev + 1);
      }
    };

    const handleFocus = () => {
      setForceRender(prev => prev + 1);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Handle job click - navigate to job details page
  const handleJobClick = (jobIdOrSlug: string) => {
    // Force button to lose focus before navigation to prevent state persistence
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    navigate(`/jobs/${jobIdOrSlug}`);
  };

  useEffect(() => {
    const loadAllHomePageJobs = async () => {
      try {
        setIsLoadingRemote(true);
        setIsLoadingFresher(true);
        setIsLoadingGovernment(true);
        setIsLoadingExperienced(true);
        
        // Single API call to get all 4 categories
        const response = await jobsAPI.fetchHomePageJobs();
        
        // Set jobs for each category (each array has max 3 jobs)
        setRemoteJobs(Array.isArray(response.remote) ? response.remote : []);
        setFresherJobs(Array.isArray(response.fresher) ? response.fresher : []);
        setGovernmentJobs(Array.isArray(response.government) ? response.government : []);
        setExperiencedJobs(Array.isArray(response.experienced) ? response.experienced : []);
        
        setIsLoadingRemote(false);
        setIsLoadingFresher(false);
        setIsLoadingGovernment(false);
        setIsLoadingExperienced(false);
      } catch (error) {
        console.error('Error loading home page jobs:', error);
        setApiError('Unable to load jobs. Please make sure the backend server is running.');
        setRemoteJobs([]);
        setFresherJobs([]);
        setGovernmentJobs([]);
        setExperiencedJobs([]);
        setIsLoadingRemote(false);
        setIsLoadingFresher(false);
        setIsLoadingGovernment(false);
        setIsLoadingExperienced(false);
      }
    };

    loadAllHomePageJobs();
  }, []);


  const collaborations = [
    {
      name: 'AICTE',
      logo: '/collaboration/aicte.webp',
      description: 'All India Council for Technical Education'
    },
    {
      name: 'NASSCOM',
      logo: '/collaboration/nasscom.webp',
      description: 'National Association of Software and Service Companies'
    },
    {
      name: 'Digital India',
      logo: '/collaboration/digital.webp',
      description: 'Digital India Initiative'
    },
    {
      name: 'Make in India',
      logo: '/collaboration/make-in-india.webp',
      description: 'Make in India Campaign'
    },
    {
      name: 'STPI',
      logo: '/collaboration/STPI.webp',
      description: 'Software Technology Parks of India'
    },
    {
      name: 'Startup India',
      logo: '/collaboration/startup-india.webp',
      description: 'Startup India Initiative'
    },
    {
      name: 'Government of India',
      logo: '/collaboration/ind.webp',
      description: 'Government of India'
    },
    {
      name: 'Andhra Pradesh Government',
      logo: '/collaboration/govt-ap.webp',
      description: 'Government of Andhra Pradesh'
    },
    {
      name: 'NRDC',
      logo: '/collaboration/nrdc.webp',
      description: 'National Research Development Corporation'
    },
    {
      name: 'APSCHE',
      logo: '/collaboration/apsche.webp',
      description: 'Andhra Pradesh State Council of Higher Education'
    }
  ];

  const features = [
    {
      icon: Search,
      title: 'Smart Job Search',
      description: 'Find the perfect job with our advanced search and filtering options.'
    },
    {
      icon: Briefcase,
      title: 'Top Companies',
      description: 'Connect with leading companies and startups across various industries.'
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Get personalized career guidance from our team of experts.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Head */}
      <SEOHead
        title="mycareerbuild Jobs - Find Your Dream Career | Job Portal India"
        description="Discover 50,000+ jobs at mycareerbuild. Connect with top employers, build your career. Free job alerts, resume builder & career guidance."
        keywords="jobs, careers, employment, job portal, job search, recruitment, hiring, software engineer jobs, data scientist jobs, marketing jobs, hr jobs, remote jobs, work from home"
        canonical="http://localhost:3000"
        ogTitle="mycareerbuild Jobs - Find Your Dream Career | Job Portal India"
        ogDescription="Discover 50,000+ jobs at mycareerbuild. Connect with top employers, build your career. Free job alerts, resume builder & career guidance."
        ogImage="http://localhost:3000/logo.png"
        ogUrl="http://localhost:3000"
      />
      
      {/* Organization Schema */}
      <OrganizationSchema />
      
      {/* Website Schema */}
      <WebsiteSchema />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[70vh] bg-gradient-to-br from-blue-900 via-blue-500 to-blue-400 before:content-[''] before:absolute before:inset-0 before:opacity-30">
        {/* 3D Background Elements */}
        <div className="absolute inset-0 pointer-events-none z-10 hidden md:block">
          <div className="absolute inset-0">
            <div className="absolute w-20 h-20 top-[20%] left-[10%] rounded-full bg-gradient-to-br from-blue-500/20 to-blue-400/10 backdrop-blur-[10px] animate-floatShape"></div>
            <div className="absolute w-30 h-30 top-[60%] right-[15%] rounded-full bg-gradient-to-br from-blue-300/15 to-blue-500/8 backdrop-blur-[10px] animate-floatShape animation-delay-2000"></div>
            <div className="absolute w-15 h-15 top-[30%] right-[30%] rounded-full bg-gradient-to-br from-blue-400/20 to-blue-300/10 backdrop-blur-[10px] animate-floatShape animation-delay-4000"></div>
            <div className="absolute w-25 h-25 bottom-[20%] left-[20%] rounded-full bg-gradient-to-br from-blue-900/15 to-blue-500/10 backdrop-blur-[10px] animate-floatShape animation-delay-1000"></div>
            <div className="absolute w-18 h-18 top-[10%] right-[50%] rounded-full bg-gradient-to-br from-blue-500/18 to-blue-400/12 backdrop-blur-[10px] animate-floatShape animation-delay-3000"></div>
            <div className="absolute w-22 h-22 bottom-[40%] right-[5%] rounded-full bg-gradient-to-br from-blue-300/20 to-blue-900/10 backdrop-blur-[10px] animate-floatShape animation-delay-4500"></div>
          </div>
          <div className="absolute inset-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute w-1 h-1 bg-white/60 rounded-full animate-particleFloat" 
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="container max-w-7xl mx-auto px-5 py-15 relative z-20 h-full min-h-[70vh] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-15 items-center h-full min-h-[400px]">
            {/* Left Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white flex flex-col justify-center h-full relative z-30 px-5"
            >
              <h1
                className="text-3xl md:text-[35.2px] font-extrabold leading-tight mb-5 text-left tracking-[-0.01em] text-white relative"
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
                }}
              >
                Find Your {""}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%)'
                  }}
                >
                  Dream Job
                </span>{" "}
                with
                <br className="hidden md:block" /> MyCareerBuild - India's Leading Job Portal
              </h1>
              <p
                className="text-lg md:text-xl leading-relaxed mb-10 opacity-100 text-left font-medium max-w-[700px] relative tracking-[0.3px] bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #e0f2fe 100%)'
                }}
              >
                Connect with top companies and discover amazing career opportunities. 
                Join thousands of professionals who found their perfect match.
              </p>
            </motion.div>

            {/* Right Side - YouTube Video */}
            <motion.div
              initial={{ opacity: 0, x: 30, rotateY: 15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full relative rounded-[20px] overflow-hidden backdrop-blur-[20px] border border-white/10 transform-gpu flex items-center justify-center aspect-video h-[220px] sm:h-[280px] md:h-[360px] lg:h-[400px]"
            >
              <iframe 
                width="560" 
                height="315" 
                src="https://www.youtube.com/embed/Imv_Of5TV2g?si=E6oX4Vo_qUjvpChr" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="w-full h-full rounded-[20px] border-0 transition-all duration-300 hover:scale-[1.02]"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Remote Jobs Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 relative overflow-hidden">
        <div className="container max-w-7xl mx-auto px-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 w-full flex flex-col items-center overflow-visible"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white px-6 py-2.5 rounded-[30px] text-sm font-bold mb-6 uppercase tracking-[0.5px]">
              <Globe className="w-[18px] h-[18px] text-white stroke-white" />
              <span className="text-white">Work from Anywhere</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[2.8rem] font-extrabold text-slate-800 mb-6 leading-[1.3] tracking-[-0.03em] text-center w-full relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent py-4 overflow-visible min-h-[3.5rem]">
              Explore 50,000+ Jobs Across Top Companies
            </h2>
            <p className="text-lg text-slate-500 max-w-[600px] mx-auto leading-relaxed text-center">
              Find flexible opportunities that let you work from anywhere in the world
            </p>
            {apiError && (
              <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg mt-4 border border-red-200 text-sm">
                ⚠️ {apiError}
              </div>
            )}
          </motion.div>

          {isLoadingRemote ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p>Loading remote jobs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto mb-12 max-w-[1200px] w-full" key={`remote-${forceRender}`}>
              {(remoteJobs || []).map((job, index) => (
                <motion.div
                  key={`${job.id}-${forceRender}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="bg-gradient-to-br from-white/90 to-slate-50/80 rounded-2xl p-0 backdrop-blur-[10px] border border-white/20 relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col min-h-[280px] sm:min-h-[300px] lg:min-h-[320px] transform-gpu"
                  data-force-render={forceRender}
                  onClick={() => {
                    const slug = (job as any).slug || buildJobSlug({
                      title: job.title,
                      company: job.company,
                      location: job.location || null,
                      id: job.id
                    });
                    handleJobClick(slug);
                  }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-700 rounded-none rounded-r-sm"></div>
                  <div className="p-5 flex-grow flex flex-col justify-between h-full relative z-20">
                    <div className="flex justify-between items-start mb-2 flex-shrink-0 gap-2">
                      <h3 className="text-base font-bold text-slate-800 m-0 leading-tight line-clamp-2 overflow-hidden flex-1 min-w-0 tracking-[-0.01em]">{job.title}</h3>
                      <div className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-2xl text-[11px] font-semibold uppercase tracking-[0.5px] shadow-[0_2px_8px_rgba(59,130,246,0.25)] border-none transition-all duration-300 flex-shrink-0 whitespace-nowrap hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
                        <Globe className="w-[14px] h-[14px] text-white" />
                        <span className="text-white font-semibold">Remote</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden mb-3">
                      <p className="text-sm text-slate-500 m-0 font-medium leading-snug">{job.company}</p>
                      
                      <div className="flex flex-col gap-1.5 mt-1.5 flex-shrink-0">
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                          <MapPin className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                          <span>{job.location || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                          <Briefcase className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                          <span>
                            {(() => {
                              // Handle the experience data structure we're receiving
                              if (job.experienceLevel) {
                                return job.experienceLevel;
                              }
                              if (job.experience && job.experience.min && job.experience.max) {
                                return `${job.experience.min}-${job.experience.max} years`;
                              }
                              return 'Experience not specified';
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                          <DollarSign className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                          <span>
                            {(() => {
                              // Handle the salary data structure we're receiving
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
                        {job.postedDate && (
                          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                            <Clock className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                            <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                            <GraduationCap className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                            <span>{job.skills.slice(0, 2).join(', ')}{job.skills.length > 2 ? '...' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-0 p-0 flex-shrink-0">
                      <button 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all duration-300 w-full h-8 flex items-center justify-center text-center whitespace-nowrap leading-none box-border text-decoration-none outline-none relative tracking-[0.3px] uppercase hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5"
                        onClick={() => {
                    const slug = (job as any).slug || buildJobSlug({
                      title: job.title,
                      company: job.company,
                      location: job.location || null,
                      id: job.id
                    });
                    handleJobClick(slug);
                  }}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center flex justify-center items-center w-full"
          >
            <a href="/jobs?isRemote=true" className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none px-8 py-4 rounded-xl text-base font-bold text-decoration-none transition-all duration-300 relative overflow-hidden tracking-[0.025em] uppercase w-auto max-w-[300px] mx-auto hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-800 hover:-translate-y-1 hover:scale-[1.02] hover:text-white active:-translate-y-0.5 active:scale-[1.01] focus:outline-2 focus:outline-blue-500/50 focus:outline-offset-2">
              <span className="text-white">View All Remote Jobs</span>
              <ArrowRight className="w-[18px] h-[18px] text-white transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Fresher Jobs Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 relative overflow-hidden">
        <div className="container max-w-7xl mx-auto px-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 w-full flex flex-col items-center overflow-visible"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white px-6 py-2.5 rounded-[30px] text-sm font-bold mb-6 uppercase tracking-[0.5px]">
              <GraduationCap className="w-[18px] h-[18px] text-white stroke-white" />
              <span className="text-white">Start Your Career</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[2.8rem] font-extrabold text-slate-800 mb-6 leading-[1.3] tracking-[-0.03em] text-center w-full relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent py-4 overflow-visible min-h-[3.5rem]">
              Fresher Jobs - Launch Your Career
            </h2>
            <p className="text-lg text-slate-500 max-w-[600px] mx-auto leading-relaxed text-center">
              Perfect opportunities for fresh graduates and entry-level professionals
            </p>
          </motion.div>

          {isLoadingFresher ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p>Loading fresher jobs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto mb-12 max-w-[1200px] w-full" key={`fresher-${forceRender}`}>
              {(fresherJobs || []).map((job, index) => (
                <motion.div
                  key={`${job.id}-${forceRender}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="bg-gradient-to-br from-white/90 to-slate-50/80 rounded-2xl p-0 backdrop-blur-[10px] border border-white/20 relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col min-h-[280px] sm:min-h-[300px] lg:min-h-[320px] transform-gpu"
                  data-force-render={forceRender}
                  onClick={() => {
                    const slug = (job as any).slug || buildJobSlug({
                      title: job.title,
                      company: job.company,
                      location: job.location || null,
                      id: job.id
                    });
                    handleJobClick(slug);
                  }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-700 rounded-none rounded-r-sm"></div>
                  <div className="p-5 flex-grow flex flex-col justify-between h-full relative z-20">
                    <div className="flex justify-between items-start mb-2 flex-shrink-0 gap-2">
                      <h3 className="text-base font-bold text-slate-800 m-0 leading-tight line-clamp-2 overflow-hidden flex-1 min-w-0 tracking-[-0.01em]">{job.title}</h3>
                      <div className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-2xl text-[11px] font-semibold uppercase tracking-[0.5px] shadow-[0_2px_8px_rgba(59,130,246,0.25)] border-none transition-all duration-300 flex-shrink-0 whitespace-nowrap hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
                        <GraduationCap className="w-[14px] h-[14px] text-white" />
                        <span className="text-white font-semibold">Fresher</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden mb-3">
                      <p className="text-sm text-slate-500 m-0 font-medium leading-snug">{job.company}</p>
                      
                      <div className="flex flex-col gap-1.5 mt-1.5 flex-shrink-0">
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                          <MapPin className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                          <span>{job.location || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                          <Briefcase className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                          <span>
                            {(() => {
                              if (job.experienceLevel) {
                                return job.experienceLevel;
                              }
                              if (job.experience && job.experience.min && job.experience.max) {
                                return `${job.experience.min}-${job.experience.max} years`;
                              }
                              return 'Experience not specified';
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
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
                          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                            <Clock className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                            <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                            <GraduationCap className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                            <span>{job.skills.slice(0, 2).join(', ')}{job.skills.length > 2 ? '...' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-0 p-0 flex-shrink-0">
                      <button 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all duration-300 w-full h-8 flex items-center justify-center text-center whitespace-nowrap leading-none box-border text-decoration-none outline-none relative tracking-[0.3px] uppercase hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          const slug = (job as any).slug || buildJobSlug({
                            title: job.title,
                            company: job.company,
                            location: job.location || null,
                            id: job.id
                          });
                          handleJobClick(slug);
                        }}
                      >
                        Apply Now
                      </button>
                    </div>
            </div>
          </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center flex justify-center items-center w-full"
          >
            <a href="/jobs?experience=fresher" className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none px-8 py-4 rounded-xl text-base font-bold text-decoration-none transition-all duration-300 relative overflow-hidden tracking-[0.025em] uppercase w-auto max-w-[300px] mx-auto hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-800 hover:-translate-y-1 hover:scale-[1.02] hover:text-white active:-translate-y-0.5 active:scale-[1.01] focus:outline-2 focus:outline-blue-500/50 focus:outline-offset-2">
              <span className="text-white">View All Fresher Jobs</span>
              <ArrowRight className="w-[18px] h-[18px] text-white transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Government Jobs Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 relative overflow-hidden">
        <div className="container max-w-7xl mx-auto px-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 w-full flex flex-col items-center overflow-visible"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white px-6 py-2.5 rounded-[30px] text-sm font-bold mb-6 uppercase tracking-[0.5px]">
              <Shield className="w-[18px] h-[18px] text-white stroke-white" />
              <span className="text-white">Public Sector</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[2.8rem] font-extrabold text-slate-800 mb-6 leading-[1.3] tracking-[-0.03em] text-center w-full relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent py-4 overflow-visible min-h-[3.5rem]">
              Government Jobs - Secure Your Future
            </h2>
            <p className="text-lg text-slate-500 max-w-[600px] mx-auto leading-relaxed text-center">
              Explore opportunities in government and public sector organizations
            </p>
          </motion.div>

          {isLoadingGovernment ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p>Loading government jobs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto mb-12 max-w-[1200px] w-full" key={`government-${forceRender}`}>
              {(governmentJobs || []).map((job, index) => (
                <motion.div
                  key={`${job.id}-${forceRender}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="bg-gradient-to-br from-white/90 to-slate-50/80 rounded-2xl p-0 backdrop-blur-[10px] border border-white/20 relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col min-h-[280px] sm:min-h-[300px] lg:min-h-[320px] transform-gpu"
                  data-force-render={forceRender}
                  onClick={() => {
                    const slug = (job as any).slug || buildJobSlug({
                      title: job.title,
                      company: job.company,
                      location: job.location || null,
                      id: job.id
                    });
                    handleJobClick(slug);
                  }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-700 rounded-none rounded-r-sm"></div>
                  <div className="p-5 flex-grow flex flex-col justify-between h-full relative z-20">
                    <div className="flex justify-between items-start mb-2 flex-shrink-0 gap-2">
                      <h3 className="text-base font-bold text-slate-800 m-0 leading-tight line-clamp-2 overflow-hidden flex-1 min-w-0 tracking-[-0.01em]">{job.title}</h3>
                      <div className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-2xl text-[11px] font-semibold uppercase tracking-[0.5px] shadow-[0_2px_8px_rgba(59,130,246,0.25)] border-none transition-all duration-300 flex-shrink-0 whitespace-nowrap hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
                        <Shield className="w-[14px] h-[14px] text-white" />
                        <span className="text-white font-semibold">Government</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden mb-3">
                      <p className="text-sm text-slate-500 m-0 font-medium leading-snug">{job.company}</p>
                      
                      <div className="flex flex-col gap-1.5 mt-1.5 flex-shrink-0">
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                          <MapPin className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                          <span>{job.location || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                          <Briefcase className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                          <span>
                            {(() => {
                              if (job.experienceLevel) {
                                return job.experienceLevel;
                              }
                              if (job.experience && job.experience.min && job.experience.max) {
                                return `${job.experience.min}-${job.experience.max} years`;
                              }
                              return 'Experience not specified';
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
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
                          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                            <Clock className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                            <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                            <GraduationCap className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                            <span>{job.skills.slice(0, 2).join(', ')}{job.skills.length > 2 ? '...' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-0 p-0 flex-shrink-0">
                      <button 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all duration-300 w-full h-8 flex items-center justify-center text-center whitespace-nowrap leading-none box-border text-decoration-none outline-none relative tracking-[0.3px] uppercase hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          const slug = (job as any).slug || buildJobSlug({
                            title: job.title,
                            company: job.company,
                            location: job.location || null,
                            id: job.id
                          });
                          handleJobClick(slug);
                        }}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center flex justify-center items-center w-full"
          >
            <a href="/jobs?category=government" className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none px-8 py-4 rounded-xl text-base font-bold text-decoration-none transition-all duration-300 relative overflow-hidden tracking-[0.025em] uppercase w-auto mx-auto hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-800 hover:-translate-y-1 hover:scale-[1.02] hover:text-white active:-translate-y-0.5 active:scale-[1.01] focus:outline-2 focus:outline-blue-500/50 focus:outline-offset-2 group">
              <span className="text-white whitespace-nowrap">View All Government Jobs</span>
              <ArrowRight className="w-[18px] h-[18px] text-white transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Experienced Jobs Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 relative overflow-hidden">
        <div className="container max-w-7xl mx-auto px-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 w-full flex flex-col items-center overflow-visible"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white px-6 py-2.5 rounded-[30px] text-sm font-bold mb-6 uppercase tracking-[0.5px]">
              <Award className="w-[18px] h-[18px] text-white stroke-white" />
              <span className="text-white">Experienced Professionals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[2.8rem] font-extrabold text-slate-800 mb-6 leading-[1.3] tracking-[-0.03em] text-center w-full relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent py-4 overflow-visible min-h-[3.5rem]">
              Experienced Jobs - Advance Your Career
            </h2>
            <p className="text-lg text-slate-500 max-w-[600px] mx-auto leading-relaxed text-center">
              Senior roles for experienced professionals ready to take the next step
            </p>
          </motion.div>

          {isLoadingExperienced ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p>Loading experienced jobs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto mb-12 max-w-[1200px] w-full" key={`experienced-${forceRender}`}>
              {(experiencedJobs || []).map((job, index) => (
                <motion.div
                  key={`${job.id}-${forceRender}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="bg-gradient-to-br from-white/90 to-slate-50/80 rounded-2xl p-0 backdrop-blur-[10px] border border-white/20 relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col min-h-[280px] sm:min-h-[300px] lg:min-h-[320px] transform-gpu"
                  data-force-render={forceRender}
                  onClick={() => {
                    const slug = (job as any).slug || buildJobSlug({
                      title: job.title,
                      company: job.company,
                      location: job.location || null,
                      id: job.id
                    });
                    handleJobClick(slug);
                  }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-700 rounded-none rounded-r-sm"></div>
                  <div className="p-5 flex-grow flex flex-col justify-between h-full relative z-20">
                    <div className="flex justify-between items-start mb-2 flex-shrink-0 gap-2">
                      <h3 className="text-base font-bold text-slate-800 m-0 leading-tight line-clamp-2 overflow-hidden flex-1 min-w-0 tracking-[-0.01em]">{job.title}</h3>
                      <div className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-2xl text-[11px] font-semibold uppercase tracking-[0.5px] shadow-[0_2px_8px_rgba(59,130,246,0.25)] border-none transition-all duration-300 flex-shrink-0 whitespace-nowrap hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
                        <Award className="w-[14px] h-[14px] text-white" />
                        <span className="text-white font-semibold">Experienced</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden mb-3">
                      <p className="text-sm text-slate-500 m-0 font-medium leading-snug">{job.company}</p>
                      
                      <div className="flex flex-col gap-1.5 mt-1.5 flex-shrink-0">
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                          <MapPin className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                          <span>{job.location || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                          <Briefcase className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                          <span>
                            {(() => {
                              if (job.experienceLevel) {
                                return job.experienceLevel;
                              }
                              if (job.experience && job.experience.min && job.experience.max) {
                                return `${job.experience.min}-${job.experience.max} years`;
                              }
                              return 'Experience not specified';
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
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
                          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                            <Clock className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                            <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                            <GraduationCap className="w-[14px] h-[14px] text-slate-400 flex-shrink-0" />
                            <span>{job.skills.slice(0, 2).join(', ')}{job.skills.length > 2 ? '...' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-0 p-0 flex-shrink-0">
                      <button 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-all duration-300 w-full h-8 flex items-center justify-center text-center whitespace-nowrap leading-none box-border text-decoration-none outline-none relative tracking-[0.3px] uppercase hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          const slug = (job as any).slug || buildJobSlug({
                            title: job.title,
                            company: job.company,
                            location: job.location || null,
                            id: job.id
                          });
                          handleJobClick(slug);
                        }}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center flex justify-center items-center w-full"
          >
            <a href="/jobs?experience=experienced" className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none px-8 py-4 rounded-xl text-base font-bold text-decoration-none transition-all duration-300 relative overflow-hidden tracking-[0.025em] uppercase w-auto mx-auto hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-800 hover:-translate-y-1 hover:scale-[1.02] hover:text-white active:-translate-y-0.5 active:scale-[1.01] focus:outline-2 focus:outline-blue-500/50 focus:outline-offset-2 group">
              <span className="text-white whitespace-nowrap">View All Experienced Jobs</span>
              <ArrowRight className="w-[18px] h-[18px] text-white transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>
      </section>


      {/* Compact Features Section */}
      <section className="bg-gradient-to-br from-slate-50 via-slate-100 to-white py-16 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-5 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 overflow-visible"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-[25px] text-sm font-semibold mb-6 shadow-[0_4px_15px_rgba(59,130,246,0.25)] uppercase tracking-[0.5px]">
              <Star className="w-[18px] h-[18px] text-white stroke-white" />
              <span className="text-white">Why Choose Us?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[2.8rem] font-extrabold text-slate-800 mb-6 leading-[1.3] tracking-[-0.03em] text-center w-full relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent py-4 overflow-visible min-h-[3.5rem]">
              Why Choose mycareerbuild?
            </h2>
            <p className="text-lg text-slate-500 max-w-[500px] mx-auto leading-relaxed">
              Experience the future of job searching with our cutting-edge platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -8,
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                className="bg-gradient-to-br from-white/90 to-slate-50/80 rounded-[20px] p-8 backdrop-blur-[10px] border border-white/20 relative overflow-hidden transition-all duration-300 h-auto md:h-[200px] flex flex-col justify-between"
              >
                <div className="relative w-15 h-15 mb-4 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-blue-500 z-20 relative" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-15 h-15 bg-blue-500/15 rounded-full"></div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <h3 className="text-xl font-bold text-slate-800 mb-3 leading-snug">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{feature.description}</p>
                </div>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-700 rounded-none rounded-r-sm"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 text-slate-800">
        <div className="max-w-[1200px] mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center overflow-visible"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-[2.8rem] font-extrabold text-slate-800 mb-6 leading-[1.3] tracking-[-0.03em] text-center w-full relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent py-4 overflow-visible min-h-[3.5rem]">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-slate-500 mb-8 max-w-[600px] mx-auto font-normal text-center">
              Join thousands of professionals who found their dream jobs with us
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="/signup" className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg text-decoration-none font-semibold text-base transition-all duration-300 min-w-[160px] bg-blue-500 text-white border-none hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md">
                Get Started Free
              </a>
              <a href="/jobs" className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg text-decoration-none font-semibold text-base transition-all duration-300 min-w-[160px] bg-transparent text-blue-900 border-2 border-blue-900 hover:bg-blue-900 hover:text-white hover:-translate-y-0.5">
                Browse Jobs
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-16 pb-12 relative overflow-hidden">
        <div className="container max-w-7xl mx-auto px-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 w-full flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white px-6 py-2.5 rounded-[30px] text-sm font-bold mb-6 shadow-[0_8px_25px_rgba(59,130,246,0.4),0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] uppercase tracking-[0.5px]">
              <Shield className="w-[18px] h-[18px] text-white stroke-white" />
              <span className="text-white">Trusted Partnerships</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[3.2rem] font-extrabold text-slate-800 mb-6 leading-tight tracking-[-0.03em] text-center inline-block w-auto mx-auto relative">
              WE <span className="text-slate-800">COLLABORATED</span> WITH
            </h2>
            <p className="text-xl text-slate-500 max-w-[800px] mx-auto leading-relaxed font-normal text-center">
              Proud to partner with leading government organizations and industry bodies 
              to provide the best opportunities for job seekers.
            </p>
          </motion.div>

          <div className="w-full overflow-x-auto">
            <div className="flex lg:grid lg:grid-cols-10 gap-3 mb-2 max-w-[1400px] mx-auto px-4 py-4 rounded-2xl bg-white/60 border border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-sm">
            {collaborations.map((collaboration, index) => (
              <motion.div
                key={collaboration.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, -6, 0, 6, 0],
                  x: [-2, 0, 2, 0, -2],
                  rotate: [0, 1.2, 0, -1.2, 0]
                }}
                transition={{
                  opacity: { duration: 0.5, delay: index * 0.05 },
                  y: { repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: index * 0.08 },
                  x: { repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: index * 0.08 },
                  rotate: { repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: index * 0.08 }
                }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
                drag
                dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                dragElastic={0.1}
                dragMomentum={false}
                whileDrag={{ 
                  scale: 1.15,
                  rotate: 5,
                  zIndex: 1000,
                  boxShadow: "0 25px 80px rgba(59, 130, 246, 0.3)"
                }}
                className="flex items-center justify-center p-3 bg-transparent rounded-lg transition-all duration-300 cursor-pointer relative overflow-hidden min-h-[80px] min-w-[140px] lg:min-w-0 transform-gpu cursor-grab select-none touch-none hover:-translate-y-0.5 hover:scale-[1.02] active:cursor-grabbing active:scale-[1.1] active:rotate-[3deg]"
                style={{ animationDelay: `${index * 0.5}s` }}
                title={`${collaboration.name} - Drag to move`}
              >
                <img 
                  src={collaboration.logo} 
                  alt={collaboration.name}
                  className="max-w-full max-h-[60px] w-auto h-auto object-contain grayscale-[0.3] brightness-[0.95] transition-all duration-300 z-20 relative transform-gpu hover:grayscale-0 hover:brightness-[1.05] hover:scale-[1.05]"
                />
                <div className="absolute top-2 right-2 opacity-0 transition-all duration-300 z-30 hover:opacity-100 active:opacity-100">
                  <div className="grid grid-cols-3 gap-0.5 w-3 h-3">
                    <span className="w-0.5 h-0.5 bg-blue-500/60 rounded-full transition-all duration-200 active:bg-blue-500 active:scale-[1.2]"></span>
                    <span className="w-0.5 h-0.5 bg-blue-500/60 rounded-full transition-all duration-200 active:bg-blue-500 active:scale-[1.2]"></span>
                    <span className="w-0.5 h-0.5 bg-blue-500/60 rounded-full transition-all duration-200 active:bg-blue-500 active:scale-[1.2]"></span>
                    <span className="w-0.5 h-0.5 bg-blue-500/60 rounded-full transition-all duration-200 active:bg-blue-500 active:scale-[1.2]"></span>
                    <span className="w-0.5 h-0.5 bg-blue-500/60 rounded-full transition-all duration-200 active:bg-blue-500 active:scale-[1.2]"></span>
                    <span className="w-0.5 h-0.5 bg-blue-500/60 rounded-full transition-all duration-200 active:bg-blue-500 active:scale-[1.2]"></span>
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;