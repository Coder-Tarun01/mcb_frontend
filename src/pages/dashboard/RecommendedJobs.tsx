import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  Heart,
  Send,
  Eye,
  TrendingUp,
  Target,
  Award,
  Zap,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  Search,
  Star,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle,
  Globe
} from 'lucide-react';
import { searchAPI, savedJobsAPI, applicationsAPI, jobsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Job } from '../../types/job';
import { buildJobSlug } from '../../utils/slug';

interface RecommendedJob extends Job {
  matchPercentage?: number;
  matchReasons?: string[];
  priority?: 'high' | 'medium' | 'low';
}

const RecommendedJobs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [savingJob, setSavingJob] = useState<string | null>(null);
  const [applyingJob, setApplyingJob] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendedJobs();
    loadSavedJobs();
    loadAppliedJobs();
  }, []);

  const loadRecommendedJobs = async () => {
    setLoading(true);
    try {
      const recommendedJobs = await searchAPI.getRecommendedJobs();
      
      // Add match percentage and reasons (simulated AI matching)
      const jobsWithMatching = recommendedJobs.map((job) => {
        const matchPercentage = Math.floor(Math.random() * 30) + 70; // 70-100%
        const reasons = generateMatchReasons(job, matchPercentage);
        const priority = matchPercentage >= 90 ? 'high' : matchPercentage >= 80 ? 'medium' : 'low';
        
        return {
          ...job,
          matchPercentage,
          matchReasons: reasons,
          priority
        };
      });

      // Sort by match percentage (highest first)
      jobsWithMatching.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
      
      setJobs(jobsWithMatching);
    } catch (error) {
      console.error('Error loading recommended jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMatchReasons = (job: Job, matchPercentage: number): string[] => {
    const reasons: string[] = [];
    
    if (job.skills && job.skills.length > 0) {
      reasons.push(`Skills match: ${job.skills.slice(0, 2).join(', ')}`);
    }
    if (job.location) {
      reasons.push(`Location preference: ${job.location}`);
    }
    if (job.type) {
      reasons.push(`Job type: ${job.type}`);
    }
    if (matchPercentage >= 90) {
      reasons.push('Highly recommended based on your profile');
    }
    if (job.isRemote) {
      reasons.push('Remote work available');
    }
    
    return reasons.slice(0, 3);
  };

  const loadSavedJobs = async () => {
    try {
      const response = await savedJobsAPI.getSavedJobs();
      const saved = new Set(response.savedJobs?.map((job: any) => job.jobId) || []);
      setSavedJobs(saved);
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  };

  const loadAppliedJobs = async () => {
    try {
      const applications = await applicationsAPI.getUserApplications();
      const applied = new Set(applications.map((app: any) => app.jobId));
      setAppliedJobs(applied);
    } catch (error) {
      console.error('Error loading applied jobs:', error);
    }
  };

  const handleSaveJob = async (jobId: string) => {
    setSavingJob(jobId);
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
      console.error('Error saving job:', error);
    } finally {
      setSavingJob(null);
    }
  };

  const handleQuickApply = async (jobId: string) => {
    // Find the job to check if it's an external job
    const job = jobs.find(j => j.id === jobId);
    const jobUrl = (job as any)?.jobUrl;
    
    // If it's an external job, redirect to external URL
    if (jobUrl) {
      try {
        await jobsAPI.recordApplyClick(jobId);
      } catch (error) {
        console.error('Error recording apply click:', error);
      }
      window.open(jobUrl, '_blank');
      return;
    }
    
    // Internal job - apply through the system
    setApplyingJob(jobId);
    try {
      await applicationsAPI.applyToJob(jobId, {
        coverLetter: 'Quick apply from recommended jobs',
      });
      setAppliedJobs(prev => new Set(prev).add(jobId));
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Failed to apply. Please try again.');
    } finally {
      setApplyingJob(null);
    }
  };

  const getMatchColor = (percentage: number = 0) => {
    if (percentage >= 90) return '#2563eb'; // blue-600
    if (percentage >= 80) return '#3b82f6'; // blue-500
    return '#60a5fa'; // blue-400
  };

  const getPriorityBadge = (priority: string = 'low') => {
    switch (priority) {
      case 'high':
        return { label: 'Top Match', color: '#2563eb', icon: Award };
      case 'medium':
        return { label: 'Great Match', color: '#3b82f6', icon: Target };
      default:
        return { label: 'Good Match', color: '#60a5fa', icon: TrendingUp };
    }
  };

  const filteredJobs = filterPriority === 'all' 
    ? jobs 
    : jobs.filter(job => job.priority === filterPriority);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-blue-800 mb-3">Finding Your Perfect Matches</h3>
            <p className="text-blue-600 text-lg">We're analyzing thousands of opportunities for you...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Compact Professional Header Section */}
      <motion.div 
        className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-8 px-6 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-blue-600/90 to-blue-800/90"></div>
        <div className="relative max-w-7xl mx-auto z-10 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white !text-white" style={{color: 'white !important'}}>Recommended Jobs</h1>
                </div>
                <p className="text-white text-sm mb-4 font-medium !text-white" style={{color: 'white !important'}}>
                  Discover opportunities tailored to your skills and preferences
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 backdrop-blur-sm">
                    <Star size={14} className="text-yellow-300" />
                    <span className="text-white text-sm font-semibold !text-white" style={{color: 'white !important'}}>{jobs.filter(j => j.priority === 'high').length} Top Matches</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 backdrop-blur-sm">
                    <Target size={14} className="text-white" />
                    <span className="text-white text-sm font-semibold !text-white" style={{color: 'white !important'}}>{jobs.length} Total Opportunities</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="bg-white border border-blue-200 rounded-lg pl-10 pr-3 py-2.5 text-blue-800 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 w-full sm:w-64 shadow-sm text-sm"
                />
              </div>
              <select className="bg-white border border-blue-200 rounded-lg px-3 py-2.5 text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm text-sm">
                <option className="text-blue-800">All Categories</option>
                <option className="text-blue-800">IT / Software</option>
                <option className="text-blue-800">Marketing</option>
                <option className="text-blue-800">Finance</option>
                <option className="text-blue-800">Design</option>
              </select>
              <button 
                className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md text-sm"
                onClick={loadRecommendedJobs}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Professional Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-700"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <Award size={28} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-800">{jobs.filter(j => j.priority === 'high').length}</div>
                <div className="text-blue-600 text-sm font-semibold">Top Matches</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Star size={18} className="text-yellow-500" />
              <span className="font-medium">Highest compatibility</span>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Target size={28} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-800">{jobs.filter(j => j.priority === 'medium').length}</div>
                <div className="text-blue-600 text-sm font-semibold">Great Matches</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle size={18} className="text-green-500" />
              <span className="font-medium">Strong potential</span>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-500"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                <Zap size={28} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-800">{jobs.length}</div>
                <div className="text-blue-600 text-sm font-semibold">Total Opportunities</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <TrendingUp size={18} className="text-blue-500" />
              <span className="font-medium">All recommendations</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Professional Filter Controls */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Filter size={20} className="text-white" />
                </div>
                <span className="font-bold text-blue-800 text-lg">Filter Jobs</span>
              </div>
              <select
                className="px-6 py-3 bg-white border-2 border-blue-200 rounded-xl text-blue-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All Matches ({jobs.length})</option>
                <option value="high">Top Matches ({jobs.filter(j => j.priority === 'high').length})</option>
                <option value="medium">Great Matches ({jobs.filter(j => j.priority === 'medium').length})</option>
                <option value="low">Good Matches ({jobs.filter(j => j.priority === 'low').length})</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-2">
              <button
                className={`px-6 py-3 rounded-lg transition-all duration-200 font-semibold flex items-center gap-2 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-blue-600 hover:bg-blue-100'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 size={20} />
                Grid
              </button>
              <button
                className={`px-6 py-3 rounded-lg transition-all duration-200 font-semibold flex items-center gap-2 ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-blue-600 hover:bg-blue-100'
                }`}
                onClick={() => setViewMode('list')}
              >
                <List size={20} />
                List
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Jobs Grid/List */}
      <div className="max-w-7xl mx-auto px-6">
        {filteredJobs.length === 0 ? (
          <motion.div 
            className="bg-white rounded-2xl p-16 shadow-lg border border-blue-100 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <Sparkles size={48} className="text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-blue-800 mb-4">No Matches Found</h3>
            <p className="text-blue-600 mb-8 text-lg">Try adjusting your filter or refresh recommendations</p>
            <button 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
              onClick={loadRecommendedJobs}
            >
              <RefreshCw size={20} />
              Refresh Recommendations
            </button>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8' : 'space-y-6'}>
            {filteredJobs.map((job, index) => {
              const priorityBadge = getPriorityBadge(job.priority);
              const PriorityIcon = priorityBadge.icon;
              const isSaved = savedJobs.has(job.id);
              const isApplied = appliedJobs.has(job.id);

              return (
                <motion.div
                  key={job.id}
                  className={`group bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 relative ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Match Badge */}
                  <div 
                    className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg z-10"
                    style={{ backgroundColor: getMatchColor(job.matchPercentage) }}
                  >
                    <Zap size={14} fill="currentColor" />
                    <span>{job.matchPercentage}% Match</span>
                  </div>

                  {/* Priority Badge */}
                  <div 
                    className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-white/95 backdrop-blur-sm shadow-md z-10 border border-blue-200"
                    style={{ color: priorityBadge.color }}
                  >
                    <PriorityIcon size={14} />
                    <span>{priorityBadge.label}</span>
                  </div>

                  <div className={`p-8 pt-20 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    {/* Company Logo and Save Button */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                        {job.logo ? (
                          <img src={job.logo} alt={job.company} className="w-10 h-10 object-contain" />
                        ) : (
                          <Building2 size={32} className="text-white" />
                        )}
                      </div>
                      <button
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          isSaved 
                            ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                        onClick={() => handleSaveJob(job.id)}
                        disabled={savingJob === job.id}
                      >
                        {isSaved ? <Heart fill="currentColor" size={24} /> : <Heart size={24} />}
                      </button>
                    </div>

                    {/* Job Title and Company */}
                    <h3 
                      className="text-xl font-bold text-blue-900 mb-3 cursor-pointer hover:text-blue-700 transition-colors line-clamp-2"
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
                      {job.title}
                    </h3>
                    <p className="text-blue-600 font-semibold text-lg mb-6">{job.company}</p>

                    {/* Job Details */}
                    <div className="space-y-3 mb-6">
                      {job.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin size={16} className="mr-3 text-blue-500" />
                          <span className="font-medium">{job.location}</span>
                        </div>
                      )}
                      {job.type && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase size={16} className="mr-3 text-blue-500" />
                          <span className="font-medium">{job.type}</span>
                        </div>
                      )}
                      {job.salary && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign size={16} className="mr-3 text-green-500" />
                          <span className="font-bold text-green-600 text-base">
                            ${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Match Reasons */}
                    {job.matchReasons && job.matchReasons.length > 0 && (
                      <div className="mb-6">
                        <div className="text-sm font-bold text-blue-700 mb-3">Why this matches:</div>
                        <div className="space-y-2">
                          {job.matchReasons.map((reason, idx) => (
                            <div key={idx} className="text-sm text-gray-600 flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="font-medium">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-3 mb-6">
                        {job.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-2" />
                        <span className="font-medium">
                          Posted {new Date(job.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      {job.isRemote && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700 border border-green-200">
                          <Globe size={14} className="mr-1" />
                          Remote
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-blue-100 border-t border-blue-200">
                    <div className="flex gap-4">
                      {isApplied ? (
                        <button className="flex-1 bg-gray-400 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-3 text-sm font-bold" disabled>
                          <CheckCircle size={18} />
                          Applied
                        </button>
                      ) : (
                        <button
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-3 text-sm font-bold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                          onClick={() => handleQuickApply(job.id)}
                          disabled={applyingJob === job.id}
                        >
                          <Send size={18} />
                          {applyingJob === job.id ? 'Applying...' : 'Quick Apply'}
                        </button>
                      )}
                      <button
                        className="flex-1 bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-200 hover:border-blue-300 px-6 py-3 rounded-xl flex items-center justify-center gap-3 text-sm font-bold transition-all duration-300 hover:scale-105"
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
                        <Eye size={18} />
                        View Details
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedJobs;

