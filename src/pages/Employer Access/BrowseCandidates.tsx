import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  MapPin,
  Star,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Filter,
  Users,
  Award,
  Calendar,
  Mail,
  ChevronDown,
  X,
  Briefcase,
  Download,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BACKEND_BASE_URL, candidatesAPI, savedCandidatesAPI } from '../../services/api';

interface Candidate {
  id: string;
  name: string;
  jobTitle: string;
  company?: string;
  location: string;
  experience: string;
  skills: string[];
  profileImage?: string;
  isBookmarked: boolean;
  lastActive: string;
  hourlyRate: string;
  email?: string;
  phone?: string;
  description?: string;
  resumeUrl?: string;
  professionalTitle?: string;
}

const BrowseCandidates: React.FC = () => {
  const navigate = useNavigate();
  const { user, isEmployer } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [skillsFilter, setSkillsFilter] = useState('all');
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [isJobTypeDropdownOpen, setIsJobTypeDropdownOpen] = useState(false);
  const jobTypeDropdownRef = useRef<HTMLDivElement>(null);
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedCandidateIds, setSavedCandidateIds] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  React.useEffect(() => {
    if (!user || !isEmployer()) {
      navigate('/login');
      return;
    }
    
    // Load saved candidates
    loadSavedCandidates();
    // Load candidates
    loadCandidates();
  }, [user, navigate, isEmployer]);

  // Reload candidates when filters change
  useEffect(() => {
    if (user && isEmployer()) {
      loadCandidates();
    }
  }, [searchTerm, locationFilter, experienceFilter, skillsFilter, pagination.page]);

  const loadSavedCandidates = async () => {
    try {
      const saved = await savedCandidatesAPI.getSavedCandidates();
      const savedIds = new Set(saved.map((sc: any) => sc.candidateId));
      setSavedCandidateIds(savedIds);
    } catch (error) {
      console.error('Error loading saved candidates:', error);
    }
  };

  const loadCandidates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await candidatesAPI.getCandidates({
        search: searchTerm || undefined,
        location: locationFilter,
        experience: experienceFilter,
        skills: skillsFilter,
        page: pagination.page,
        limit: pagination.limit,
      });

      // Transform backend data to match frontend interface
      const transformedCandidates = response.candidates.map((candidate: any) => ({
        id: candidate.id,
        name: candidate.name,
        jobTitle: candidate.jobTitle || 'Candidate',
        company: candidate.company,
        location: candidate.location || 'Remote',
        experience: candidate.experience || '0+ years',
        skills: candidate.skills || [],
        profileImage: candidate.profileImage,
        isBookmarked: savedCandidateIds.has(candidate.id),
        lastActive: formatLastActive(candidate.lastActive),
        hourlyRate: candidate.hourlyRate || candidate.salary || 'Negotiable',
        professionalTitle: candidate.professionalTitle || candidate.jobTitle,
        email: candidate.email || candidate.user?.email,
        // Ensure resume URL is captured if provided by backend in any common field
        resumeUrl: candidate.resumeUrl || candidate.user?.resumeUrl || candidate.profile?.resumeUrl,
      }));

      setCandidates(transformedCandidates);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading candidates:', error);
      setError('Failed to load candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatLastActive = (lastActive: any): string => {
    if (!lastActive) return 'Recently';
    
    const date = new Date(lastActive);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return 'Over a week ago';
  };

  // Available job types
  const jobTypes = ['Freelance', 'Internship', 'Full Time', 'Part Time', 'Temporary'];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (jobTypeDropdownRef.current && !jobTypeDropdownRef.current.contains(event.target as Node)) {
        setIsJobTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBookmarkToggle = async (candidateId: string) => {
    try {
      const isCurrentlySaved = savedCandidateIds.has(candidateId);
      
      if (isCurrentlySaved) {
        await savedCandidatesAPI.unsaveCandidate(parseInt(candidateId));
        setSavedCandidateIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(candidateId);
          return newSet;
        });
        
        // Update candidates state
        setCandidates(prev => 
          prev.map(c => c.id === candidateId ? { ...c, isBookmarked: false } : c)
        );
      } else {
        await savedCandidatesAPI.saveCandidate(parseInt(candidateId));
        setSavedCandidateIds(prev => new Set(prev).add(candidateId));
        
        // Update candidates state
        setCandidates(prev => 
          prev.map(c => c.id === candidateId ? { ...c, isBookmarked: true } : c)
        );
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleContactCandidate = (candidate: Candidate) => {
    if (candidate.email) {
      const subject = encodeURIComponent('Job Opportunity - Interested in Your Profile');
      const body = encodeURIComponent(`Hi ${candidate.name},\n\nI came across your profile and I'm interested in discussing potential job opportunities with you.\n\nBest regards,\n${user?.name || 'Employer'}`);
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(candidate.email)}&su=${subject}&body=${body}`;
      window.open(gmailUrl, '_blank');
    } else {
      alert('Email not available for this candidate');
    }
  };

  const handleViewProfile = (candidate: Candidate) => {
    // Navigate to candidate profile page
    navigate(`/employer/candidate-profile/${candidate.id}`);
  };

  const toAbsoluteUrl = (url?: string | null): string => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    const base = BACKEND_BASE_URL || (process.env.REACT_APP_API_URL || 'https://mcb.instatripplan.com').replace(/\/api\/?$/, '');
    return `${base.replace(/\/+$/, '')}/${String(url).replace(/^\/+/, '')}`;
  };

  const resolveDownloadUrl = (primary?: string, fallback?: string): string => {
    const pick = (value?: string) => {
      if (!value) return '';
      try {
        const parsed = new URL(value);
        if (parsed.pathname && parsed.pathname !== '/' && parsed.pathname.trim() !== '') {
          return parsed.toString();
        }
        return '';
      } catch {
        // Not an absolute URL, convert to absolute
        const abs = toAbsoluteUrl(value);
        try {
          const parsedAbsolute = new URL(abs);
          if (parsedAbsolute.pathname && parsedAbsolute.pathname !== '/' && parsedAbsolute.pathname.trim() !== '') {
            return parsedAbsolute.toString();
          }
        } catch {
          return abs;
        }
        return '';
      }
    };

    const primaryResolved = pick(primary);
    if (primaryResolved) return primaryResolved;

    const fallbackResolved = pick(fallback);
    if (fallbackResolved) return fallbackResolved;

    return '';
  };

  const handleDownloadResume = async (candidate: Candidate) => {
    try {
      const { downloadUrl, candidateName } = await candidatesAPI.downloadResume(candidate.id);
      const finalUrl = resolveDownloadUrl(downloadUrl, candidate.resumeUrl);

      if (!finalUrl) {
        throw new Error('Resume link is missing or invalid. Please ask the candidate to re-upload their resume.');
      }

      const opened = window.open(finalUrl, '_blank', 'noopener,noreferrer');

      if (!opened) {
        // Fallback for stricter popup blockers
        const link = document.createElement('a');
        link.href = finalUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        if (candidateName) {
          link.download = candidateName;
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error: any) {
      console.error('Error downloading resume:', error);
      alert(error?.message || 'Unable to download resume. Please try again later or contact support if the issue persists.');
    }
  };

  const handleJobTypeToggle = (jobType: string) => {
    setSelectedJobTypes(prev => {
      if (prev.includes(jobType)) {
        return prev.filter(type => type !== jobType);
      } else {
        return [...prev, jobType];
      }
    });
  };

  const handleJobTypeRemove = (jobType: string) => {
    setSelectedJobTypes(prev => prev.filter(type => type !== jobType));
  };

  const toggleJobTypeDropdown = () => {
    setIsJobTypeDropdownOpen(!isJobTypeDropdownOpen);
  };

  

  return (
    <div className="min-h-screen bg-slate-50 p-5 pt-5 flex justify-center items-start">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full m-0 p-4 sm:p-6 bg-white rounded-xl shadow-lg"
      >
        <div className="flex items-center mb-6 gap-5 relative flex-col sm:flex-row">
          <button onClick={() => navigate('/employer/dashboard')} className="flex items-center gap-2 bg-transparent border-none text-gray-600 text-[15px] font-medium cursor-pointer transition-all duration-300 flex-shrink-0 sm:absolute sm:left-0 z-10 hover:text-blue-700 hover:-translate-x-1 order-2 sm:order-1 w-full sm:w-auto justify-center sm:justify-start">
            <ArrowLeft className="w-[18px] h-[18px]" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex-1 text-center w-full flex justify-center items-center order-1 sm:order-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-500 m-0 leading-tight tracking-[-0.02em]">Browse Candidates</h1>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Search and Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200"
          >
            <div className="flex flex-col lg:flex-row items-stretch gap-4 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by skills, job title, or name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3.5 px-4 pl-12 border border-gray-300 rounded-lg bg-white text-base text-gray-800 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-gray-400"
                />
              </div>
              <button className="flex items-center gap-2 bg-blue-500 text-white border-none rounded-lg py-3.5 px-6 font-semibold text-sm cursor-pointer transition-all duration-300 whitespace-nowrap hover:bg-blue-600 hover:-translate-y-0.5 w-full lg:w-auto justify-center">
                <Search className="w-4 h-4 text-white" />
                <span className="text-white">Search</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <select 
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full py-3 px-4 pl-10 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 cursor-pointer transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                >
                  <option value="all">All Locations</option>
                  <option value="remote">Remote</option>
                  <option value="new york">New York</option>
                  <option value="san francisco">San Francisco</option>
                  <option value="seattle">Seattle</option>
                  <option value="austin">Austin</option>
                  <option value="chicago">Chicago</option>
                </select>
              </div>
              
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <select 
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="w-full py-3 px-4 pl-10 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 cursor-pointer transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                >
                  <option value="all">All Experience Levels</option>
                  <option value="1">1-2 years</option>
                  <option value="3">3-4 years</option>
                  <option value="5">5+ years</option>
                  <option value="7">7+ years</option>
                </select>
              </div>
              
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <select 
                  value={skillsFilter}
                  onChange={(e) => setSkillsFilter(e.target.value)}
                  className="w-full py-3 px-4 pl-10 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 cursor-pointer transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                >
                  <option value="all">All Skills</option>
                  <option value="react">React</option>
                  <option value="python">Python</option>
                  <option value="node">Node.js</option>
                  <option value="aws">AWS</option>
                  <option value="figma">Figma</option>
                </select>
              </div>

              <div className="relative" ref={jobTypeDropdownRef}>
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <div className="relative w-full">
                  <div 
                    className="w-full min-h-[44px] py-2 px-3 pl-10 border border-gray-300 rounded-lg bg-white cursor-pointer transition-all duration-300 flex items-center justify-between gap-2 hover:border-gray-400 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    onClick={toggleJobTypeDropdown}
                  >
                    <div className="flex-1 min-h-5 flex items-center">
                      {selectedJobTypes.length === 0 ? (
                        <span className="text-gray-400 text-sm">Select Job Types</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {selectedJobTypes.map((jobType, index) => (
                            <span key={index} className="inline-flex items-center gap-1.5 bg-blue-500 text-white py-1 px-2 rounded-2xl text-xs font-medium">
                              {jobType}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleJobTypeRemove(jobType);
                                }}
                                className="bg-transparent border-none text-white cursor-pointer flex items-center justify-center p-0 rounded-full transition-colors duration-200 w-4 h-4 hover:bg-white/20"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isJobTypeDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {isJobTypeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-[1000] max-h-50 overflow-y-auto mt-1">
                      {jobTypes.map((jobType) => (
                        <label key={jobType} className="flex items-center gap-2.5 py-2.5 px-3 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedJobTypes.includes(jobType)}
                            onChange={() => handleJobTypeToggle(jobType)}
                            className="w-4 h-4 border-2 border-gray-300 rounded-sm bg-white cursor-pointer relative appearance-none transition-all duration-200 checked:bg-blue-500 checked:border-blue-500 checked:after:content-[''] checked:after:absolute checked:after:top-0.5 checked:after:left-1 checked:after:w-1.5 checked:after:h-2.5 checked:after:border-solid checked:after:border-white checked:after:border-w-0 checked:after:border-b-2 checked:after:border-r-2 checked:after:rotate-45"
                          />
                          <span className="text-sm text-gray-700 font-medium select-none">{jobType}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
              <Users className="w-4 h-4 text-blue-500" />
              <span>{loading ? 'Loading...' : `${candidates.length} candidates found`}</span>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <div className="p-5 bg-red-50 border border-red-200 rounded-lg text-red-600 my-5">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-15 px-5 text-lg text-gray-600">
              <Users className="w-16 h-16 mb-5 mx-auto" />
              <p>Loading candidates...</p>
            </div>
          )}

          {/* Candidates Grid */}
          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 items-stretch">
                {candidates.map((candidate) => (
                <div key={candidate.id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 transition-all duration-300 relative h-full flex flex-col min-h-[400px] sm:min-h-[450px] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:border-blue-500">
                  <div className="flex items-start gap-4 mb-4 relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                      {candidate.profileImage ? (
                        (() => {
                          const raw = candidate.profileImage as string;
                          const isAbsolute = /^https?:\/\//i.test(raw);
                          const src = isAbsolute ? raw : `${BACKEND_BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
                          return <img src={src} alt={candidate.name} className="w-full h-full object-cover rounded-full" />
                        })()
                      ) : (
                        candidate.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-800 m-0 mb-1.5 leading-tight">{candidate.name}</h3>
                      <p className="text-sm text-gray-600 m-0 mb-1 font-medium">{candidate.professionalTitle || candidate.jobTitle}</p>
                      {candidate.company && (
                        <p className="text-xs text-gray-500 m-0 mb-2">at <span className="font-medium text-gray-700">{candidate.company}</span></p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500 m-0">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{candidate.location}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadResume(candidate)}
                      className="absolute top-0 right-0 bg-transparent border-none cursor-pointer p-2 rounded-md transition-all duration-300 hover:bg-blue-100 text-gray-600"
                      title="Download Resume"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Quick info vertical stack */}
                  <div className="flex flex-col gap-2 mb-4 text-xs text-gray-600 flex-shrink-0">
                    <button 
                      onClick={() => handleViewProfile(candidate)}
                      className="self-start inline-flex items-center gap-1 py-1.5 px-3 rounded-md text-xs font-semibold cursor-pointer transition-all duration-300 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    >
                      <Mail className="w-3.5 h-3.5 text-gray-700" />
                      <span>See Profile</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Active {candidate.lastActive}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      <span>{candidate.hourlyRate}</span>
                    </div>
                    {candidate.resumeUrl && (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Resume available</span>
                      </div>
                    )}
                  </div>

                  

                  <div className="flex flex-wrap gap-1.5 mb-5 flex-grow items-start">
                    {candidate.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="bg-blue-50 text-blue-500 py-1 px-2.5 rounded-xl text-xs font-medium border border-blue-200">
                        {typeof skill === 'string' ? skill : String(skill)}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 py-1 px-2.5 rounded-xl text-xs font-medium">
                        +{candidate.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-auto flex-shrink-0">
                    <button 
                      onClick={() => handleContactCandidate(candidate)}
                      className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 flex-1 justify-center bg-blue-500 text-white border-none hover:bg-blue-600 hover:-translate-y-0.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-white" />
                      <span className="text-white">Contact</span>
                    </button>
                    <button 
                      onClick={() => handleViewProfile(candidate)}
                      className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 flex-1 justify-center bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-gray-700" />
                      <span>View Profile</span>
                    </button>
                    {candidate.resumeUrl && (
                      <button 
                        onClick={() => handleDownloadResume(candidate)}
                        className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 flex-1 justify-center bg-emerald-500 text-white border-none hover:bg-emerald-600 hover:-translate-y-0.5"
                      >
                        <Download className="w-3.5 h-3.5 text-white" />
                        <span className="text-white">Download Resume</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              </div>

              {candidates.length === 0 && !loading && (
                <div className="text-center py-15 px-5 text-gray-500">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-5" />
                  <h3 className="text-xl font-semibold text-gray-700 m-0 mb-3">No candidates found</h3>
                  <p className="text-base m-0 leading-relaxed">Try adjusting your search criteria or filters to find more candidates.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BrowseCandidates;
