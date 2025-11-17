import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  User,
  Award,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { applicationsAPI, jobsAPI, usersAPI, candidatesAPI } from '../../services/api';
import { Application } from '../../types/application.d';
import { Job } from '../../types/job';
import EmployerLayout from '../../components/employer/EmployerLayout';

interface ApplicationWithCandidate extends Application {
  candidate?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    skills?: string[];
    experience?: string;
    resumeUrl?: string;
  };
}

const JobApplications: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<ApplicationWithCandidate[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithCandidate | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const resolveResumeUrl = (url?: string | null) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${url}`;
  };

  const handleResumeAction = async (
    application: ApplicationWithCandidate,
    action: 'view' | 'download'
  ) => {
    if (resumeLoading) return;
    const candidateId =
      application.candidate?.id ||
      (application as any).userId ||
      (application as any).candidateId;
    const fallbackUrl = resolveResumeUrl(application.resumeUrl || application.candidate?.resumeUrl);

    if (!candidateId && !fallbackUrl) {
      alert('Resume not available for this candidate.');
      return;
    }

    try {
      setResumeLoading(true);
      let finalUrl = fallbackUrl;

      if (candidateId) {
        try {
          const { downloadUrl } = await candidatesAPI.downloadResume(candidateId);
          finalUrl = downloadUrl || finalUrl;
        } catch (error) {
          console.error('Error fetching signed resume URL:', error);
          if (!fallbackUrl) throw error;
        }
      }

      if (!finalUrl) {
        alert('Resume not available for this candidate.');
        return;
      }

      if (action === 'view') {
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
      } else {
        const link = document.createElement('a');
        link.href = finalUrl;
        link.download = `resume-${application.candidate?.name || 'candidate'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error handling resume action:', error);
      alert('Unable to access the resume. Please try again later.');
    } finally {
      setResumeLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      loadJobApplications();
    }
  }, [jobId]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const loadJobApplications = async () => {
    if (!jobId) return;

    setLoading(true);
    try {
      const [jobData, appsData] = await Promise.all([
        jobsAPI.fetchJobById(jobId),
        applicationsAPI.getJobApplications(jobId)
      ]);

      setJob(jobData);
      
      // Load candidate details for each application
      const appsWithCandidates = await Promise.all(
        appsData.map(async (app) => {
          try {
            const candidate = await usersAPI.fetchUserById((app as any).userId || app.id);
            return {
              ...app,
              candidate: {
                id: candidate.id,
                name: candidate.name,
                email: candidate.email,
                phone: candidate.phone,
                location: (candidate as any).location || (candidate as any).city,
                skills: (candidate as any).skills || [],
                experience: (candidate as any).experience,
                resumeUrl: (candidate as any).resumeUrl
              }
            };
          } catch (error) {
            console.error(`Error loading candidate for application ${app.id}:`, error);
            return app;
          }
        })
      );

      setApplications(appsWithCandidates as unknown as ApplicationWithCandidate[]);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.candidate?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidate?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    setUpdatingStatus(applicationId);
    try {
      await applicationsAPI.updateApplication(applicationId, { status: newStatus as any });
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus as any } : app
        )
      );

      if (selectedApplication?.id === applicationId) {
        setSelectedApplication(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: '#f59e0b', bg: '#fffbeb', label: 'Pending' };
      case 'reviewed':
        return { icon: Eye, color: '#6366f1', bg: '#eef2ff', label: 'Reviewed' };
      case 'accepted':
        return { icon: CheckCircle, color: '#10b981', bg: '#f0fdf4', label: 'Accepted' };
      case 'rejected':
        return { icon: XCircle, color: '#ef4444', bg: '#fef2f2', label: 'Rejected' };
      default:
        return { icon: AlertCircle, color: '#6b7280', bg: '#f3f4f6', label: 'Unknown' };
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return applications.length;
    return applications.filter(app => app.status === status).length;
  };

  if (loading) {
    return (
      <EmployerLayout>
        <div className="min-h-screen p-0">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-gray-500 text-base m-0">Loading applications...</p>
          </div>
        </div>
      </EmployerLayout>
    );
  }

  if (!job) {
    return (
      <EmployerLayout>
        <div className="min-h-screen p-0">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
            <Briefcase size={64} className="text-gray-400" />
            <h2 className="text-3xl font-bold text-gray-800 m-0">Job Not Found</h2>
            <p className="text-gray-500 text-base m-0">The job you're looking for doesn't exist.</p>
            <button className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 mt-3 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(59,130,246,0.3)]" onClick={() => navigate('/employer/jobs')}>
              <ArrowLeft size={16} />
              Back to Manage Jobs
            </button>
          </div>
        </div>
      </EmployerLayout>
    );
  }

  const StatusIcon = selectedApplication ? getStatusInfo(selectedApplication.status).icon : Clock;

  return (
    <EmployerLayout>
      <div className="min-h-screen p-0">
        {/* Header */}
        <motion.div
          className="bg-gradient-to-br from-blue-800 to-blue-500 text-white p-4 sm:p-6 md:p-8 rounded-2xl mb-6 shadow-[0_4px_20px_rgba(59,130,246,0.2)]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button className="inline-flex items-center gap-2 py-2.5 px-5 bg-white/15 border border-white/30 rounded-lg text-white text-sm font-medium cursor-pointer transition-all duration-200 mb-5 backdrop-blur-[10px] hover:bg-white/25 hover:border-white/50" onClick={() => navigate('/employer/jobs')}>
            <ArrowLeft size={18} />
            <span className="text-white">Back to Jobs</span>
          </button>

          <div className="text-center">
            <h1 className="flex items-center justify-center gap-3 text-3xl font-bold m-0 mb-2 text-white">
              <Users size={32} />
              Applications for: {job.title}
            </h1>
            <p className="text-base m-0 opacity-90 text-white">
              {applications.length} {applications.length === 1 ? 'application' : 'applications'} received
            </p>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="bg-white rounded-2xl p-6 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Status Tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            <button
              className={`py-2.5 px-5 border rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ${
                statusFilter === 'all' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white border-transparent shadow-[0_4px_12px_rgba(59,130,246,0.3)]' 
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setStatusFilter('all')}
            >
              All ({getStatusCount('all')})
            </button>
            <button
              className={`py-2.5 px-5 border rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ${
                statusFilter === 'pending' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white border-transparent shadow-[0_4px_12px_rgba(59,130,246,0.3)]' 
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending ({getStatusCount('pending')})
            </button>
            <button
              className={`py-2.5 px-5 border rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ${
                statusFilter === 'reviewed' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white border-transparent shadow-[0_4px_12px_rgba(59,130,246,0.3)]' 
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setStatusFilter('reviewed')}
            >
              Reviewed ({getStatusCount('reviewed')})
            </button>
            <button
              className={`py-2.5 px-5 border rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ${
                statusFilter === 'accepted' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white border-transparent shadow-[0_4px_12px_rgba(59,130,246,0.3)]' 
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setStatusFilter('accepted')}
            >
              Accepted ({getStatusCount('accepted')})
            </button>
            <button
              className={`py-2.5 px-5 border rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ${
                statusFilter === 'rejected' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white border-transparent shadow-[0_4px_12px_rgba(59,130,246,0.3)]' 
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setStatusFilter('rejected')}
            >
              Rejected ({getStatusCount('rejected')})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 px-4 pl-12 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 transition-all duration-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
            />
          </div>
        </motion.div>

        {/* Applications List */}
        <div className="min-h-[400px]">
          {filteredApplications.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-20 px-5 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Users size={64} className="text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 m-0 mb-2">No Applications Found</h3>
              <p className="text-base text-gray-500 m-0">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No one has applied to this job yet'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-5">
              {filteredApplications.map((application, index) => {
                const statusInfo = getStatusInfo(application.status);
                const ApplicationStatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={application.id}
                    className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 cursor-pointer transition-all duration-300 flex flex-col min-h-[280px] h-full hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:border-blue-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => setSelectedApplication(application)}
                  >
                    <div className="flex flex-col flex-1">
                      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-200">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white flex-shrink-0">
                          <User size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-800 m-0 mb-1 overflow-hidden text-ellipsis whitespace-nowrap">{application.candidate?.name || 'Unknown'}</h3>
                          <p className="text-sm text-gray-500 m-0 overflow-hidden text-ellipsis whitespace-nowrap">{application.candidate?.email}</p>
                        </div>
                        <div 
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold flex-shrink-0"
                          style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                        >
                          <ApplicationStatusIcon size={14} />
                          <span>{statusInfo.label}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mb-4 flex-1">
                        {application.candidate?.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone size={14} className="flex-shrink-0" />
                            <span>{application.candidate.phone}</span>
                          </div>
                        )}
                        {application.candidate?.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin size={14} className="flex-shrink-0" />
                            <span>{application.candidate.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={14} className="flex-shrink-0" />
                          <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {application.candidate?.skills && application.candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
                          {application.candidate.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="py-1 px-2.5 bg-gray-100 border border-gray-200 rounded-md text-xs font-semibold text-gray-700">{typeof skill === 'string' ? skill : (skill as any)?.skill || String(skill)}</span>
                          ))}
                          {application.candidate.skills.length > 3 && (
                            <span className="py-1 px-2.5 bg-gradient-to-r from-blue-500 to-blue-700 text-white border-transparent rounded-md text-xs font-semibold">+{application.candidate.skills.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto pt-4">
                      <button
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border bg-gradient-to-r from-blue-500 to-blue-700 text-white border-transparent hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplication(application);
                        }}
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Application Details Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-[1000] px-3 sm:px-5 py-6 overflow-y-auto" onClick={() => setSelectedApplication(null)}>
            <motion.div
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start py-4 sm:py-6 md:py-7 px-4 sm:px-6 md:px-8 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 m-0 mb-1">Application Details</h2>
                  <p className="text-base text-gray-500 m-0">{selectedApplication.candidate?.name}</p>
                </div>
                <button className="bg-none border-none text-gray-400 cursor-pointer p-1 transition-colors duration-200 hover:text-red-500" onClick={() => setSelectedApplication(null)}>
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-4 sm:p-6 md:p-8">
                {/* Candidate Info */}
                <div className="mb-7">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 m-0 mb-4">Candidate Information</h3>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                    <div className="flex gap-3">
                      <User size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</div>
                        <div className="text-sm text-gray-800 font-medium">{selectedApplication.candidate?.name || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Mail size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</div>
                        <div className="text-sm text-gray-800 font-medium">{selectedApplication.candidate?.email}</div>
                      </div>
                    </div>
                    {selectedApplication.candidate?.phone && (
                    <div className="flex gap-3">
                        <Phone size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</div>
                          <div className="text-sm text-gray-800 font-medium">{selectedApplication.candidate.phone}</div>
                        </div>
                      </div>
                    )}
                    {selectedApplication.candidate?.location && (
                      <div className="flex gap-3">
                        <MapPin size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</div>
                          <div className="text-sm text-gray-800 font-medium">{selectedApplication.candidate.location}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Info */}
                <div className="mb-7">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 m-0 mb-4">Application Information</h3>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                    <div className="flex gap-3">
                      <Calendar size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Applied Date</div>
                        <div className="text-sm text-gray-800 font-medium">
                          {new Date(selectedApplication.appliedAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <StatusIcon size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</div>
                        <div className="text-sm text-gray-800 font-medium">{getStatusInfo(selectedApplication.status).label}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                {selectedApplication.coverLetter && (
                  <div className="mb-7">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 m-0 mb-4">Cover Letter</h3>
                    <div className="py-4 px-5 bg-gray-50 rounded-lg border border-gray-200 leading-relaxed text-gray-700 whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {selectedApplication.candidate?.skills && selectedApplication.candidate.skills.length > 0 && (
                  <div className="mb-7">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 m-0 mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.candidate.skills.map((skill, idx) => (
                        <span key={idx} className="py-2 px-4 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700">{typeof skill === 'string' ? skill : (skill as any)?.skill || String(skill)}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume */}
                {(selectedApplication.resumeUrl || selectedApplication.candidate?.resumeUrl || (selectedApplication as any).userId) && (
                  <div className="mb-7">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 m-0 mb-4">Resume</h3>
                    <div className="flex gap-3 flex-col min-[400px]:flex-row">
                      <button
                        className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 flex-1 min-w-[140px] justify-center hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(59,130,246,0.3)] disabled:opacity-60 disabled:cursor-not-allowed w-full"
                        onClick={() => handleResumeAction(selectedApplication, 'view')}
                        disabled={resumeLoading}
                      >
                        <FileText size={16} />
                        {resumeLoading ? 'Loading...' : 'View Resume'}
                      </button>
                      <button 
                        className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg font-semibold transition-all duration-300 flex-1 min-w-[140px] justify-center hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,185,129,0.3)] disabled:opacity-60 disabled:cursor-not-allowed w-full"
                        onClick={() => handleResumeAction(selectedApplication, 'download')}
                        disabled={resumeLoading}
                      >
                        <Download size={16} />
                        {resumeLoading ? 'Preparing...' : 'Download Resume'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Status Actions */}
                <div className="mb-0">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 m-0 mb-4">Update Status</h3>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                    <button
                      className={`flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-2 ${
                        selectedApplication.status === 'pending' 
                          ? 'bg-amber-500 text-white border-amber-500' 
                          : 'bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-100 hover:border-amber-500'
                      } ${updatingStatus === selectedApplication.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'pending')}
                      disabled={updatingStatus === selectedApplication.id}
                    >
                      <Clock size={16} />
                      Pending
                    </button>
                    <button
                      className={`flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-2 ${
                        selectedApplication.status === 'reviewed' 
                          ? 'bg-indigo-500 text-white border-indigo-500' 
                          : 'bg-indigo-50 text-indigo-500 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-500'
                      } ${updatingStatus === selectedApplication.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'reviewed')}
                      disabled={updatingStatus === selectedApplication.id}
                    >
                      <Eye size={16} />
                      Reviewed
                    </button>
                    <button
                      className={`flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-2 ${
                        selectedApplication.status === 'accepted' 
                          ? 'bg-green-500 text-white border-green-500' 
                          : 'bg-green-50 text-green-500 border-green-200 hover:bg-green-100 hover:border-green-500'
                      } ${updatingStatus === selectedApplication.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'accepted')}
                      disabled={updatingStatus === selectedApplication.id}
                    >
                      <CheckCircle size={16} />
                      Accept
                    </button>
                    <button
                      className={`flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-2 ${
                        selectedApplication.status === 'rejected' 
                          ? 'bg-red-500 text-white border-red-500' 
                          : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100 hover:border-red-500'
                      } ${updatingStatus === selectedApplication.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                      disabled={updatingStatus === selectedApplication.id}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </EmployerLayout>
  );
};

export default JobApplications;

