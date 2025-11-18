import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Heart,
  Target,
  Award,
  Eye,
  Send
} from 'lucide-react';
import { analyticsAPI, applicationsAPI } from '../../services/api';

interface UserAnalytics {
  overview: {
    totalJobs?: number;
    activeJobs?: number;
    totalApplications?: number;
    newApplications?: number;
    profileViews?: number;
    responseRate?: number;
  };
  recentActivity?: any[];
  jobStats?: any[];
  monthlyStats?: {
    applications: number[];
    views: number[];
    months: string[];
  };
}

interface ApplicationWithDetails {
  id: string;
  jobId: string;
  status: string;
  appliedAt: string;
  job?: {
    title: string;
    company: string;
  };
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [userAnalytics, userApplications] = await Promise.all([
        analyticsAPI.getUserAnalytics(),
        applicationsAPI.getUserApplications().catch(() => [])
      ]);

      setAnalytics(userAnalytics);
      setApplications(Array.isArray(userApplications) ? userApplications : []);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics({ 
        overview: { 
          totalApplications: 0, 
          newApplications: 0, 
          profileViews: 0, 
          responseRate: 0 
        } 
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStatusCount = (status: string) => {
    return applications.filter(app => app.status === status).length;
  };

  const calculatePercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getRecentApplications = () => {
    return applications
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-0">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-base m-0">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  const totalApps = analytics?.overview?.totalApplications || 0;
  const totalSaved = applications.length; // Use applications array length for saved jobs
  const pendingCount = calculateStatusCount('pending');
  const acceptedCount = calculateStatusCount('accepted');
  const rejectedCount = calculateStatusCount('rejected');
  const reviewedCount = calculateStatusCount('reviewed');

  return (
    <div className="min-h-screen pt-0 pb-6 px-4 sm:px-6 bg-gray-50">
      <div className="w-full max-w-7xl mx-auto border-2 border-gray-300 rounded-xl p-4 sm:p-6 bg-transparent">
      {/* Page Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Analytics Overview</h1>
        <p className="text-gray-500 mb-6">Track your job search performance and profile engagement</p>
        </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Send size={20} className="text-blue-600" />
          </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{totalApps}</div>
              <div className="text-sm text-gray-500">Total Applications</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">Your job search activity</div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-blue-600" />
          </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{acceptedCount}</div>
              <div className="text-sm text-gray-500">Accepted</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">{calculatePercentage(acceptedCount, totalApps)}% success rate</div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock size={20} className="text-blue-600" />
          </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">Awaiting response</div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Heart size={20} className="text-blue-600" />
          </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{totalSaved}</div>
              <div className="text-sm text-gray-500">Saved Jobs</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">Jobs on your watchlist</div>
        </motion.div>
      </div>

      {/* Application Status Chart */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Application Status Overview
            </h2>
            <div className="flex gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Accepted
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                Reviewed
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-300"></span>
                Pending
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                Rejected
              </span>
            </div>
          </div>

          <div className="py-2">
            {totalApps === 0 ? (
              <div className="text-center py-15 px-5 text-gray-400">
                <FileText size={48} className="mb-3" />
                <p className="m-1 text-base">No applications yet</p>
                <p className="text-sm text-gray-500">Start applying to jobs to see your analytics</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-5 mb-7">
                  {acceptedCount > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_60px] gap-3 items-center">
                      <div className="text-sm font-semibold text-gray-700">Accepted</div>
                      <div className="bg-gray-100 rounded-lg h-8 relative overflow-hidden">
                        <div 
                          className="h-full rounded-lg flex items-center px-3 transition-all duration-1000 ease-out bg-blue-500"
                          style={{ width: `${calculatePercentage(acceptedCount, totalApps)}%` }}
                        >
                          <span className="text-white text-sm font-bold">{acceptedCount}</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-500 text-right">{calculatePercentage(acceptedCount, totalApps)}%</div>
                    </div>
                  )}

                  {reviewedCount > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_60px] gap-3 items-center">
                      <div className="text-sm font-semibold text-gray-700">Reviewed</div>
                      <div className="bg-gray-100 rounded-lg h-8 relative overflow-hidden">
                        <div 
                          className="h-full rounded-lg flex items-center px-3 transition-all duration-1000 ease-out bg-blue-400"
                          style={{ width: `${calculatePercentage(reviewedCount, totalApps)}%` }}
                        >
                          <span className="text-white text-sm font-bold">{reviewedCount}</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-500 text-right">{calculatePercentage(reviewedCount, totalApps)}%</div>
                    </div>
                  )}

                  {pendingCount > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_60px] gap-3 items-center">
                      <div className="text-sm font-semibold text-gray-700">Pending</div>
                      <div className="bg-gray-100 rounded-lg h-8 relative overflow-hidden">
                        <div 
                          className="h-full rounded-lg flex items-center px-3 transition-all duration-1000 ease-out bg-blue-300"
                          style={{ width: `${calculatePercentage(pendingCount, totalApps)}%` }}
                        >
                          <span className="text-white text-sm font-bold">{pendingCount}</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-500 text-right">{calculatePercentage(pendingCount, totalApps)}%</div>
                    </div>
                  )}

                  {rejectedCount > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_60px] gap-3 items-center">
                      <div className="text-sm font-semibold text-gray-700">Rejected</div>
                      <div className="bg-gray-100 rounded-lg h-8 relative overflow-hidden">
                        <div 
                          className="h-full rounded-lg flex items-center px-3 transition-all duration-1000 ease-out bg-gray-400"
                          style={{ width: `${calculatePercentage(rejectedCount, totalApps)}%` }}
                        >
                          <span className="text-white text-sm font-bold">{rejectedCount}</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-500 text-right">{calculatePercentage(rejectedCount, totalApps)}%</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-blue-500">
                      <CheckCircle size={20} />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-2xl font-bold text-blue-600 leading-none mb-1">{acceptedCount}</div>
                      <div className="text-sm text-gray-500 font-medium">Accepted</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-blue-400">
                      <Eye size={20} />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-2xl font-bold text-blue-600 leading-none mb-1">{reviewedCount}</div>
                      <div className="text-sm text-gray-500 font-medium">Reviewed</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-blue-300">
                      <Clock size={20} />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-2xl font-bold text-blue-600 leading-none mb-1">{pendingCount}</div>
                      <div className="text-sm text-gray-500 font-medium">Pending</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-gray-400">
                      <XCircle size={20} />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-2xl font-bold text-blue-600 leading-none mb-1">{rejectedCount}</div>
                      <div className="text-sm text-gray-500 font-medium">Rejected</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Performance Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-blue-500">
                <Target size={20} />
              </div>
              <div className="text-sm font-semibold text-gray-700">Success Rate</div>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {calculatePercentage(acceptedCount, totalApps)}%
            </div>
            <div className="text-sm text-gray-500 mb-4">
              {acceptedCount} out of {totalApps} applications accepted
            </div>
            <div className="w-full bg-gray-100 rounded-lg h-2">
              <div 
                className="h-full rounded-lg bg-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${calculatePercentage(acceptedCount, totalApps)}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-blue-400">
                <Clock size={20} />
              </div>
              <div className="text-sm font-semibold text-gray-700">Response Rate</div>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {calculatePercentage(acceptedCount + rejectedCount, totalApps)}%
            </div>
            <div className="text-sm text-gray-500 mb-4">
              {acceptedCount + rejectedCount} responses received
            </div>
            <div className="w-full bg-gray-100 rounded-lg h-2">
              <div 
                className="h-full rounded-lg bg-blue-400 transition-all duration-1000 ease-out"
                style={{ width: `${calculatePercentage(acceptedCount + rejectedCount, totalApps)}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-blue-300">
                <Heart size={20} />
              </div>
              <div className="text-sm font-semibold text-gray-700">Job Interest</div>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {totalSaved}
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Jobs saved for later review
            </div>
            <div className="w-full bg-gray-100 rounded-lg h-2">
              <div 
                className="h-full rounded-lg bg-blue-300 transition-all duration-1000 ease-out"
                style={{ width: totalSaved > 0 ? '75%' : '0%' }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-blue-600">
                <TrendingUp size={20} />
              </div>
              <div className="text-sm font-semibold text-gray-700">Activity Level</div>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {totalApps + totalSaved}
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Total job-related actions
            </div>
            <div className="w-full bg-gray-100 rounded-lg h-2">
              <div 
                className="h-full rounded-lg bg-blue-600 transition-all duration-1000 ease-out"
                style={{ width: '80%' }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity Timeline */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Recent Activity
        </h2>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          {getRecentApplications().length === 0 ? (
            <div className="text-center py-15 px-5 text-gray-400">
              <Send size={48} className="mb-3" />
              <p className="m-1 text-base">No recent applications</p>
              <p className="text-sm text-gray-500">Start applying to jobs to build your activity timeline</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getRecentApplications().map((app, index) => (
                <motion.div
                  key={app.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                    app.status === 'accepted' ? 'bg-blue-500' :
                    app.status === 'reviewed' ? 'bg-blue-400' :
                    app.status === 'pending' ? 'bg-blue-300' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-base font-semibold text-gray-800">
                        {app.job?.title || 'Job Application'}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'reviewed' ? 'bg-blue-100 text-blue-600' :
                        app.status === 'pending' ? 'bg-blue-100 text-blue-500' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{app.job?.company || 'Company'}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={14} />
                      Applied on {new Date(app.appliedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Summary Overview */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Summary Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Application Breakdown</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Submitted:</span>
                <span className="text-sm font-semibold text-gray-800">{totalApps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Accepted:</span>
                <span className="text-sm font-semibold text-blue-600">{acceptedCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Under Review:</span>
                <span className="text-sm font-semibold text-blue-500">{reviewedCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending:</span>
                <span className="text-sm font-semibold text-blue-400">{pendingCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rejected:</span>
                <span className="text-sm font-semibold text-gray-600">{rejectedCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Job Search Activity</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Jobs Applied:</span>
                <span className="text-sm font-semibold text-gray-800">{totalApps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Jobs Saved:</span>
                <span className="text-sm font-semibold text-gray-800">{totalSaved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Actions:</span>
                <span className="text-sm font-semibold text-gray-800">{totalApps + totalSaved}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Success Metrics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate:</span>
                <span className="text-sm font-semibold text-blue-600">
                  {calculatePercentage(acceptedCount, totalApps)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Rate:</span>
                <span className="text-sm font-semibold text-blue-500">
                  {calculatePercentage(acceptedCount + rejectedCount, totalApps)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Rate:</span>
                <span className="text-sm font-semibold text-blue-400">
                  {calculatePercentage(pendingCount, totalApps)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Career Tips */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.9 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Career Tips
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {totalApps === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-blue-500">
                <Send size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Start Your Job Search</h3>
                <p className="text-sm text-blue-700">Begin applying to jobs to track your progress and improve your chances of landing your dream role.</p>
              </div>
            </div>
          )}

          {pendingCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-blue-400">
                <Clock size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Applications Pending</h3>
                <p className="text-sm text-blue-700">You have {pendingCount} applications awaiting response. Stay patient and continue exploring new opportunities.</p>
              </div>
            </div>
          )}

          {totalApps > 0 && calculatePercentage(acceptedCount, totalApps) >= 30 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-blue-600">
                <Award size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Great Success Rate!</h3>
                <p className="text-sm text-blue-700">Your {calculatePercentage(acceptedCount, totalApps)}% acceptance rate is excellent! Keep up the good work.</p>
              </div>
            </div>
          )}

          {totalSaved > 5 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-blue-500">
                <Heart size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Review Saved Jobs</h3>
                <p className="text-sm text-blue-700">You have {totalSaved} saved jobs. Consider applying to some of them to increase your opportunities.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Analytics;

