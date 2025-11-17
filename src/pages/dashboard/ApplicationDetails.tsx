import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Trash2,
  AlertCircle,
  DollarSign,
  Users,
  Send,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { applicationsAPI, jobsAPI } from '../../services/api';
import { Application } from '../../types/application.d';
import { Job } from '../../types/job';
import { buildJobSlug } from '../../utils/slug';

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadApplicationDetails();
    }
  }, [id]);

  const loadApplicationDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const appData = await applicationsAPI.getApplication(id);
      setApplication(appData);

      // Load job details if available
      if (appData.jobId) {
        try {
          const jobData = await jobsAPI.fetchJobById(appData.jobId);
          setJob(jobData);
        } catch (error) {
          console.error('Error loading job details:', error);
        }
      }
    } catch (error) {
      console.error('Error loading application:', error);
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!id) return;

    setWithdrawing(true);
    try {
      await applicationsAPI.withdrawApplication(id);
      navigate('/dashboard/applied', { 
        state: { message: 'Application withdrawn successfully' } 
      });
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert('Failed to withdraw application. Please try again.');
    } finally {
      setWithdrawing(false);
      setShowWithdrawModal(false);
    }
  };

  const resolveResumeUrl = (url?: string | null) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${url}`;
  };

  const handleResumeAction = async (action: 'view' | 'download') => {
    if (!application || resumeLoading) return;

    let finalUrl: string | null = resolveResumeUrl(application.resumeUrl);

    try {
      setResumeLoading(true);
      const { downloadUrl } = await applicationsAPI.getApplicationResumeUrl(application.id);
      finalUrl = downloadUrl || finalUrl;
    } catch (error) {
      console.error('Error fetching resume URL:', error);
      if (!finalUrl) {
        alert('Unable to access resume. Please try again later.');
        return;
      }
    } finally {
      setResumeLoading(false);
    }

    if (!finalUrl) {
      alert('Resume not available.');
      return;
    }

    if (action === 'view') {
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    } else {
      const link = document.createElement('a');
      link.href = finalUrl;
      link.download = `resume-${job?.title || 'application'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: '#f59e0b',
          bg: '#fffbeb',
          label: 'Pending Review',
          description: 'Your application is waiting to be reviewed by the employer'
        };
      case 'reviewed':
        return {
          icon: Eye,
          color: '#6366f1',
          bg: '#eef2ff',
          label: 'Under Review',
          description: 'The employer is currently reviewing your application'
        };
      case 'accepted':
        return {
          icon: CheckCircle,
          color: '#10b981',
          bg: '#f0fdf4',
          label: 'Accepted',
          description: 'Congratulations! Your application has been accepted'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: '#ef4444',
          bg: '#fef2f2',
          label: 'Not Selected',
          description: 'Unfortunately, your application was not selected this time'
        };
      default:
        return {
          icon: AlertCircle,
          color: '#6b7280',
          bg: '#f3f4f6',
          label: 'Unknown',
          description: 'Application status unknown'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-base m-0">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
          <FileText size={64} className="text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Not Found</h2>
          <p className="text-gray-600 mb-6">The application you're looking for doesn't exist or has been removed.</p>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            onClick={() => navigate('/dashboard/applied')}
          >
            <ArrowLeft size={16} />
            Back to Applied Jobs
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(application.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen pt-0 pb-6 px-6 bg-gray-50">
      <div className="w-full max-w-7xl mx-auto border-2 border-gray-200 rounded-2xl p-4 sm:p-6">
      {/* Back Button */}
      <motion.button
        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-all duration-200 mb-6 w-full sm:w-auto justify-center sm:justify-start"
        onClick={() => navigate('/dashboard/applied')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4 }}
      >
        <ArrowLeft size={18} />
        <span>Back to Applied Jobs</span>
      </motion.button>

      {/* Application Header */}
      <motion.div
        className="bg-white rounded-2xl p-5 sm:p-8 shadow-md border border-gray-200 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-6">
          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 break-words">
              {job?.title || application.job?.title || 'Job Title'}
            </h1>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Building2 size={18} />
              <span className="text-lg font-medium">
                {job?.company || application.job?.company || 'Company Name'}
              </span>
            </div>
            {(job?.location || application.job?.location) && (
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin size={16} />
                <span>{job?.location || application.job?.location}</span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
              style={{ 
                backgroundColor: statusInfo.bg,
                color: statusInfo.color,
                border: `2px solid ${statusInfo.color}`
              }}
            >
              <StatusIcon size={20} />
              <span>{statusInfo.label}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <motion.div
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2 className="flex items-center gap-2.5 text-xl font-bold text-gray-800 mb-6">
              <Clock size={24} className="text-blue-500" />
              Application Status
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 rounded-full mt-2 flex-shrink-0 bg-blue-500" />
                <div className="flex-1">
                  <div className="text-base font-semibold text-gray-800">Application Submitted</div>
                  <div className="text-sm text-gray-500">
                    {new Date(application.appliedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                  ['reviewed', 'accepted', 'rejected'].includes(application.status) ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <div className="text-base font-semibold text-gray-800">Under Review</div>
                  <div className="text-sm text-gray-500">
                    {['reviewed', 'accepted', 'rejected'].includes(application.status)
                      ? 'Reviewed by employer'
                      : 'Waiting for review'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                  application.status === 'accepted' ? 'bg-green-500' : 
                  application.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <div className="text-base font-semibold text-gray-800">Final Decision</div>
                  <div className="text-sm text-gray-500">
                    {application.status === 'accepted' && 'Congratulations! Accepted'}
                    {application.status === 'rejected' && 'Not selected'}
                    {!['accepted', 'rejected'].includes(application.status) && 'Pending decision'}
                  </div>
                </div>
              </div>
            </div>

            <div 
              className="flex items-center gap-3 p-4 rounded-lg mt-6"
              style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
            >
              <StatusIcon size={20} />
              <p className="text-sm font-medium">{statusInfo.description}</p>
            </div>
          </motion.div>

          {/* Application Details */}
          <motion.div
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="flex items-center gap-2.5 text-xl font-bold text-gray-800 mb-6">
              <FileText size={24} className="text-blue-500" />
              Application Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Calendar size={16} />
                  Applied Date
                </div>
                <div className="text-base text-gray-800">
                  {new Date(application.appliedAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Clock size={16} />
                  Status
                </div>
                <div className="text-base font-semibold" style={{ color: statusInfo.color }}>
                  {statusInfo.label}
                </div>
              </div>

              {application.coverLetter && (
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <FileText size={16} />
                    Cover Letter
                  </div>
                  <div className="text-base text-gray-800 bg-gray-50 p-4 rounded-lg">
                    {application.coverLetter}
                  </div>
                </div>
              )}

              {application.resumeUrl && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Download size={16} />
                    Resume
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => handleResumeAction('view')}
                      disabled={resumeLoading}
                    >
                      <FileText size={16} />
                      {resumeLoading ? 'Loading...' : 'View Resume'}
                    </button>
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => handleResumeAction('download')}
                      disabled={resumeLoading}
                    >
                      <Download size={16} />
                      {resumeLoading ? 'Preparing...' : 'Download Resume'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Job Information */}
          {job && (
            <motion.div
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h2 className="flex items-center gap-2.5 text-xl font-bold text-gray-800 mb-6">
                <Briefcase size={24} className="text-blue-500" />
                Job Information
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 size={16} />
                    <span className="text-lg">{job.company}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  {job.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} />
                      <span>{job.location}</span>
                    </div>
                  )}

                  {job.type && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase size={16} />
                      <span>{job.type}</span>
                    </div>
                  )}

                  {job.category && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users size={16} />
                      <span>{job.category}</span>
                    </div>
                  )}
                </div>

                {job.description && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{job.description}</p>
                  </div>
                )}

                <button 
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
                  View Full Job Posting
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              {application.status === 'pending' && (
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={withdrawing}
                >
                  <Trash2 size={18} />
                  Withdraw Application
                </button>
              )}

              {job && (
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
                  <Briefcase size={18} />
                  View Job Details
                </button>
              )}

              <button
                className="w-full flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                onClick={() => navigate('/dashboard/applied')}
              >
                <ArrowLeft size={18} />
                Back to Applications
              </button>
            </div>
          </motion.div>

          {/* Application Stats */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Info</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: statusInfo.color }}>
                  <StatusIcon size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="text-base font-semibold" style={{ color: statusInfo.color }}>
                    {statusInfo.label}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-blue-500">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Applied</div>
                  <div className="text-base font-semibold text-gray-800">
                    {new Date(application.appliedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-indigo-500">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Time Elapsed</div>
                  <div className="text-base font-semibold text-gray-800">
                    {Math.floor((Date.now() - new Date(application.appliedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Tip</h3>
            <p className="text-sm text-blue-700">
              {application.status === 'pending' && 
                'Be patient! Employers typically review applications within 7-14 days. Consider applying to more jobs to increase your chances.'}
              {application.status === 'reviewed' && 
                "Great! Your application is under review. Keep an eye on your email for updates."}
              {application.status === 'accepted' && 
                'Congratulations! Follow up with the employer to discuss next steps.'}
              {application.status === 'rejected' && 
                "Don't give up! Use this as a learning experience and keep applying to other opportunities."}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Withdraw Confirmation Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowWithdrawModal(false)}>
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <AlertCircle size={48} className="text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Withdraw Application?</h2>
            </div>
            <p className="text-gray-600 mb-8 text-center">
              Are you sure you want to withdraw your application for{' '}
              <strong>{job?.title || 'this position'}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
                onClick={() => setShowWithdrawModal(false)}
                disabled={withdrawing}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                onClick={handleWithdraw}
                disabled={withdrawing}
              >
                {withdrawing ? 'Withdrawing...' : 'Yes, Withdraw'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ApplicationDetails;

