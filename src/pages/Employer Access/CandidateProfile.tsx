import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Download,
  FileText,
  MessageCircle,
  Star,
  Award,
  Calendar,
  User,
  Briefcase,
  Globe,
  Bookmark,
  BookmarkCheck,
  DollarSign,
  Languages,
  Clock,
  Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BACKEND_BASE_URL, candidatesAPI, savedCandidatesAPI } from '../../services/api';

interface Candidate {
  id: string;
  name: string;
  jobTitle: string;
  company?: string;
  location: string;
  rating: number;
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
  // Additional profile fields
  professionalTitle?: string;
  languages?: string;
  age?: string;
  currentSalary?: string;
  expectedSalary?: string;
  country?: string;
  postcode?: string;
  city?: string;
  fullAddress?: string;
}

const CandidateProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isEmployer } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!user || !isEmployer()) {
      navigate('/login');
      return;
    }
    
    if (id) {
      loadCandidate();
      checkBookmarkStatus();
    }
  }, [user, navigate, isEmployer, id]);

  const loadCandidate = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const candidateData = await candidatesAPI.getCandidate(id);
      setCandidate(candidateData);
    } catch (error) {
      console.error('Error loading candidate:', error);
      setError('Failed to load candidate profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    if (!id) return;
    
    try {
      const savedCandidates = await savedCandidatesAPI.getSavedCandidates();
      const isSaved = savedCandidates.some((sc: any) => sc.candidateId === id);
      setIsBookmarked(isSaved);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!id) return;
    
    try {
      if (isBookmarked) {
        await savedCandidatesAPI.unsaveCandidate(parseInt(id));
        setIsBookmarked(false);
      } else {
        await savedCandidatesAPI.saveCandidate(parseInt(id));
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
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

  const handleContactCandidate = () => {
    if (!candidate?.email) {
      alert('Email not available for this candidate');
      return;
    }
    
    const subject = encodeURIComponent('Job Opportunity - Interested in Your Profile');
    const body = encodeURIComponent(`Hi ${candidate.name},\n\nI came across your profile and I'm interested in discussing potential job opportunities with you.\n\nBest regards,\n${user?.name || 'Employer'}`);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(candidate.email)}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const handleViewResume = async () => {
    if (!id) {
      alert('Resume not available for this person');
      return;
    }

    try {
      const { downloadUrl } = await candidatesAPI.downloadResume(id);
      const finalUrl = resolveDownloadUrl(downloadUrl, candidate?.resumeUrl);

      if (!finalUrl) {
        throw new Error('Resume link is missing or invalid. Please ask the candidate to re-upload their resume.');
      }

      const opened = window.open(finalUrl, '_blank', 'noopener,noreferrer');
      if (!opened) {
        const link = document.createElement('a');
        link.href = finalUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error: any) {
      console.error('Error opening resume:', error);
      alert(error?.message || 'Unable to open resume.');
    }
  };

  const handleDownloadResume = async () => {
    if (!id) {
      alert('Resume not available for this person');
      return;
    }
    try {
      const { downloadUrl, candidateName } = await candidatesAPI.downloadResume(id);
      const finalUrl = resolveDownloadUrl(downloadUrl, candidate?.resumeUrl);

      if (!finalUrl) {
        throw new Error('Resume link is missing or invalid. Please ask the candidate to re-upload their resume.');
      }

      const opened = window.open(finalUrl, '_blank', 'noopener,noreferrer');

      if (!opened) {
        const link = document.createElement('a');
        link.href = finalUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        if (candidateName || candidate?.name) {
          link.download = `${candidateName || candidate?.name}_resume`;
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error: any) {
      console.error('Error downloading resume:', error);
      alert(error?.message || 'Unable to download resume.');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-5">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-gray-600">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p>Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-5">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-gray-600">
          <h3 className="text-red-600 mb-2">Error</h3>
          <p>{error || 'Candidate not found'}</p>
          <button onClick={() => navigate('/employer/candidates')} className="flex items-center gap-2 py-3 px-5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium cursor-pointer transition-all duration-300 text-decoration-none hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Candidates</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-4 sm:px-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
          <button onClick={() => navigate('/employer/candidates')} className="flex items-center gap-2 py-3 px-5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium cursor-pointer transition-all duration-300 text-decoration-none hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Candidates</span>
          </button>

        </div>

        {/* Profile Content */}
        <div className="flex flex-col gap-8">
          {/* Main Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200"
          >
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <div className="w-24 h-24 md:w-30 md:h-30 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-4xl flex-shrink-0 overflow-hidden">
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
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 m-0 mb-2 leading-tight">{candidate.name}</h1>
                {candidate.professionalTitle && (
                  <p className="text-base text-gray-600 m-0 mb-3 font-medium">{candidate.professionalTitle}</p>
                )}
                <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{candidate.location}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap justify-center md:justify-start">
              <button onClick={handleContactCandidate} className="flex items-center gap-2 py-3 px-5 rounded-lg font-semibold cursor-pointer transition-all duration-300 border-none text-sm bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5">
                <MessageCircle className="w-4 h-4 text-white" />
                <span className="text-white">Contact</span>
              </button>
              <button 
                onClick={handleDownloadResume} 
                disabled={!candidate.resumeUrl}
                className={`flex items-center gap-2 py-3 px-5 rounded-lg font-semibold cursor-pointer transition-all duration-300 border-none text-sm ${candidate.resumeUrl ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:-translate-y-0.5' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`} 
                title={candidate.resumeUrl ? 'Download Resume' : 'Resume not available for this candidate'}
              >
                <Download className="w-4 h-4" />
                <span>{candidate.resumeUrl ? 'Download Resume' : 'Resume Not Available'}</span>
              </button>
              <button onClick={handleBookmarkToggle} className={`flex items-center gap-2 py-3 px-5 rounded-lg font-semibold cursor-pointer transition-all duration-300 text-sm border ${isBookmarked ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5'}`}>
                {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{isBookmarked ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </motion.div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-900 m-0 mb-5">
                <User className="w-5 h-5 text-blue-500" />
                Basic Information
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                  <User className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Full Name</span>
                    <span className="text-sm text-gray-900 font-medium">{candidate.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                  <Briefcase className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Professional Title</span>
                    <span className="text-sm text-gray-900 font-medium">{candidate.professionalTitle || candidate.jobTitle || 'Not specified'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                  <Languages className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Languages</span>
                    <span className="text-sm text-gray-900 font-medium">{candidate.languages || 'Not specified'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                  <Clock className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Age</span>
                    <span className="text-sm text-gray-900 font-medium">{candidate.age || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-900 m-0 mb-5">
                <Mail className="w-5 h-5 text-blue-500" />
                Contact Information
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                  <Mail className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Email Address</span>
                    <span className="text-sm text-gray-900 font-medium">{candidate.email || 'Not provided'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                  <Phone className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Phone Number</span>
                    <span className="text-sm text-gray-900 font-medium">{candidate.phone || 'Not provided'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                  <Globe className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Country</span>
                    <span className="text-sm text-gray-900 font-medium">{candidate.country || 'Not specified'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                  <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">City</span>
                    <span className="text-sm text-gray-900 font-medium">{candidate.city || candidate.location || 'Not specified'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                  <Home className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Full Address</span>
                    <span className="text-sm text-gray-900 font-medium">{candidate.fullAddress || 'Not provided'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                  <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Postcode</span>
                    <span className="text-sm text-gray-900 font-medium">{candidate.postcode || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Professional Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-900 m-0 mb-5">
                <Briefcase className="w-5 h-5 text-blue-500" />
                Professional Information
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                  <Award className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Experience</span>
                    <span className="text-sm text-gray-900 font-medium">{candidate.experience}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                  <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Last Active</span>
                    <span className="text-sm text-gray-900 font-medium">{candidate.lastActive}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                  <DollarSign className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Current Salary</span>
                    <span className="text-sm text-gray-900 font-medium">{candidate.currentSalary || 'Not specified'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                  <DollarSign className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Expected Salary</span>
                    <span className="text-sm text-gray-900 font-medium">{candidate.expectedSalary || candidate.hourlyRate || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 col-span-full"
            >
              <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-900 m-0 mb-5">
                <Award className="w-5 h-5 text-blue-500" />
                Skills & Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills && candidate.skills.length > 0 ? (
                  candidate.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-50 text-blue-800 py-2 px-4 rounded-2xl text-sm font-medium border border-blue-200">
                      {typeof skill === 'string' ? skill : String(skill)}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-600 italic text-sm">No skills specified</span>
                )}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 col-span-full"
            >
              <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-900 m-0 mb-5">
                <FileText className="w-5 h-5 text-blue-500" />
                About
              </h3>
              <div className="flex flex-col gap-4">
                <p className="text-gray-700 leading-relaxed text-sm m-0">
                  {candidate.description || 'No description provided by the candidate.'}
                </p>
              </div>
            </motion.div>

            {/* Resume Section */}
            {candidate.resumeUrl ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 col-span-full"
              >
                <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-900 m-0 mb-5">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Resume
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={handleViewResume}
                      className="flex items-center gap-2 py-3 px-5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium cursor-pointer transition-all duration-300 text-sm hover:bg-gray-100 hover:border-gray-400"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Resume</span>
                    </button>
                    <button onClick={handleDownloadResume} className="flex items-center gap-2 py-3 px-5 bg-green-50 text-green-800 border border-green-200 rounded-lg font-medium cursor-pointer transition-all duration-300 text-sm hover:bg-green-100 hover:border-green-300">
                      <Download className="w-4 h-4" />
                      <span>Download Resume</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 col-span-full"
              >
                <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-900 m-0 mb-5">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Resume
                </h3>
                <p className="text-sm text-gray-600 m-0">Resume not available for this person</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CandidateProfile;
