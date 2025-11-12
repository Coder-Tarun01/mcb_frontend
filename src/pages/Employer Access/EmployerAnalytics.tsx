import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { employerAPI } from '../../services/api';
import EmployerLayout from '../../components/employer/EmployerLayout';
import { User } from '../../types/user';

interface AnalyticsData {
  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  jobs: {
    total: number;
    byCategory: Array<{ category: string; count: number }>;
  };
}

const EMPTY_ANALYTICS: AnalyticsData = {
  applications: {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  },
  jobs: {
    total: 0,
    byCategory: [],
  },
};

const EmployerAnalytics: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'applications' | 'jobs'>('applications');
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async (currentUser: User) => {
    setLoading(true);
    setError(null);
    try {
      const storedCompanyName = localStorage.getItem('employerCompanyName');
      const employerCompanyName = currentUser.companyName || storedCompanyName || '';
      const employerCompanyId = (currentUser as any)?.companyId || (currentUser as any)?.company_id || '';

      if (!employerCompanyName && !employerCompanyId) {
        setAnalytics(EMPTY_ANALYTICS);
        setError('Add a company profile to view analytics.');
        setLoading(false);
        return;
      }

      const jobFilterOptions: {
        employerId: string;
        companyId?: string;
        companyName?: string;
      } = {
        employerId: currentUser.id,
      };

      const normalizedCompanyId = employerCompanyId?.toString().trim();
      const normalizedCompanyName = employerCompanyName.trim();

      if (normalizedCompanyId) {
        jobFilterOptions.companyId = normalizedCompanyId;
      }
      if (normalizedCompanyName) {
        jobFilterOptions.companyName = normalizedCompanyName;
      }

      // Use employer-specific API instead of general analytics, with frontend fallback filters
      const [statsData, jobsData] = await Promise.all([
        employerAPI.getStats(),
        employerAPI.getMyJobs(jobFilterOptions)
      ]);

      console.log('Employer analytics loaded:', { statsData, jobsData });

      // Count jobs by category
      const categoryMap = new Map<string, number>();
      jobsData.forEach((job: any) => {
        const category = job.category || 'Uncategorized';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });

      const byCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count
      }));

      setAnalytics({
        applications: {
          total: statsData.totalApplications || 0,
          pending: statsData.pendingApplications || 0,
          accepted: statsData.acceptedApplications || 0,
          rejected: statsData.rejectedApplications || 0,
        },
        jobs: {
          total: statsData.totalJobs || 0,
          byCategory: byCategory
        }
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      const message =
        (error as any)?.message ||
        (error as any)?.response?.data?.message ||
        'Unable to load analytics. Please try again.';
      setError(message);
      // Set default values instead of null
      setAnalytics(EMPTY_ANALYTICS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setAnalytics(EMPTY_ANALYTICS);
      setError('Please log in to view employer analytics.');
      setLoading(false);
      return;
    }

    if (user.role !== 'employer') {
      setAnalytics(EMPTY_ANALYTICS);
      setError('Employer access only.');
      setLoading(false);
      return;
    }

    loadAnalytics(user);
  }, [authLoading, user]);

  const handleRetry = () => {
    if (user && !authLoading && user.role === 'employer') {
      loadAnalytics(user);
    }
  };

  const calculatePercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  if (loading || authLoading) {
    return (
      <EmployerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-base m-0">Loading analytics...</p>
        </div>
      </EmployerLayout>
    );
  }

  const appData = analytics?.applications || EMPTY_ANALYTICS.applications;
  const jobData = analytics?.jobs || EMPTY_ANALYTICS.jobs;

  return (
    <EmployerLayout>
      <div className="min-h-screen p-0">
        {/* Page Header */}
        <motion.div
          className="bg-gradient-to-br from-blue-800 to-blue-500 text-white p-4 sm:p-6 md:p-8 rounded-2xl mb-8 shadow-[0_4px_20px_rgba(59,130,246,0.2)]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-between items-start gap-6">
            <div className="flex-1">
              <h1 className="flex items-center gap-3 text-3xl font-bold m-0 mb-2 text-white">
                <BarChart3 size={32} />
                Analytics Dashboard
              </h1>
              <p className="text-base m-0 opacity-90 text-white">
                Track your recruitment performance and insights
              </p>
            </div>
            <div className="flex items-center gap-2 py-2.5 px-4 bg-white/15 rounded-lg text-sm backdrop-blur-[10px] whitespace-nowrap text-white">
              <Calendar size={16} className="text-white" />
              <span className="text-white">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-all duration-200 hover:border-red-400 hover:text-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 mb-8">
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 flex items-center gap-5 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-500 before:to-blue-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="w-15 h-15 rounded-[14px] flex items-center justify-center text-white flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-700">
              <FileText size={24} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1.5 font-medium">Total Applications</div>
              <div className="text-3xl font-bold text-gray-800 mb-1.5 leading-none">{appData.total}</div>
              <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                <ArrowUp size={14} />
                <span>12% from last month</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 flex items-center gap-5 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-green-500 to-green-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="w-15 h-15 rounded-[14px] flex items-center justify-center text-white flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600">
              <CheckCircle size={24} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1.5 font-medium">Accepted</div>
              <div className="text-3xl font-bold text-gray-800 mb-1.5 leading-none">{appData.accepted}</div>
              <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                <ArrowUp size={14} />
                <span>{calculatePercentage(appData.accepted, appData.total)}% acceptance rate</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 flex items-center gap-5 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 to-orange-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="w-15 h-15 rounded-[14px] flex items-center justify-center text-white flex-shrink-0 bg-gradient-to-br from-amber-500 to-orange-600">
              <Clock size={24} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1.5 font-medium">Pending Review</div>
              <div className="text-3xl font-bold text-gray-800 mb-1.5 leading-none">{appData.pending}</div>
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                <Activity size={14} />
                <span>Requires attention</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 flex items-center gap-5 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-indigo-500 to-indigo-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="w-15 h-15 rounded-[14px] flex items-center justify-center text-white flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600">
              <Briefcase size={24} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1.5 font-medium">Active Jobs</div>
              <div className="text-3xl font-bold text-gray-800 mb-1.5 leading-none">{jobData.total}</div>
              <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                <ArrowUp size={14} />
                <span>All time postings</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fit,minmax(500px,1fr))] gap-6 mb-8">
          {/* Application Status Chart */}
          <motion.div
            className="bg-white rounded-2xl p-7 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="flex items-center gap-2.5 text-xl font-bold text-gray-800 m-0">
                <PieChart size={24} className="text-blue-500" />
                Application Status Distribution
              </h2>
              <div className="flex gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                  Accepted
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  Pending
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  Rejected
                </span>
              </div>
            </div>

            <div className="py-2">
              {/* Simple Bar Chart */}
              <div className="flex flex-col gap-5 mb-7">
                <div className="grid grid-cols-[100px_1fr_60px] gap-3 items-center">
                  <div className="text-sm font-semibold text-gray-700">Accepted</div>
                  <div className="bg-gray-100 rounded-lg h-8 relative overflow-hidden">
                    <div 
                      className="h-full rounded-lg flex items-center px-3 transition-[width] duration-1000 ease-out relative bg-gradient-to-r from-green-500 to-green-600 shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                      style={{ width: `${calculatePercentage(appData.accepted, appData.total)}%` }}
                    >
                      <span className="text-white text-xs font-bold">{appData.accepted}</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-500 text-right">{calculatePercentage(appData.accepted, appData.total)}%</div>
                </div>

                <div className="grid grid-cols-[100px_1fr_60px] gap-3 items-center">
                  <div className="text-sm font-semibold text-gray-700">Pending</div>
                  <div className="bg-gray-100 rounded-lg h-8 relative overflow-hidden">
                    <div 
                      className="h-full rounded-lg flex items-center px-3 transition-[width] duration-1000 ease-out relative bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
                      style={{ width: `${calculatePercentage(appData.pending, appData.total)}%` }}
                    >
                      <span className="text-white text-xs font-bold">{appData.pending}</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-500 text-right">{calculatePercentage(appData.pending, appData.total)}%</div>
                </div>

                <div className="grid grid-cols-[100px_1fr_60px] gap-3 items-center">
                  <div className="text-sm font-semibold text-gray-700">Rejected</div>
                  <div className="bg-gray-100 rounded-lg h-8 relative overflow-hidden">
                    <div 
                      className="h-full rounded-lg flex items-center px-3 transition-[width] duration-1000 ease-out relative bg-gradient-to-r from-red-500 to-red-600 shadow-[0_2px_8px_rgba(239,68,68,0.3)]"
                      style={{ width: `${calculatePercentage(appData.rejected, appData.total)}%` }}
                    >
                      <span className="text-white text-xs font-bold">{appData.rejected}</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-500 text-right">{calculatePercentage(appData.rejected, appData.total)}%</div>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="flex justify-around gap-5 pt-5 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-gradient-to-br from-green-500 to-green-600">
                    <CheckCircle size={20} />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-2xl font-bold text-gray-800 leading-none mb-1">{appData.accepted}</div>
                    <div className="text-xs text-gray-500 font-medium">Accepted</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-gradient-to-br from-amber-500 to-orange-600">
                    <Clock size={20} />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-2xl font-bold text-gray-800 leading-none mb-1">{appData.pending}</div>
                    <div className="text-xs text-gray-500 font-medium">Pending</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-gradient-to-br from-red-500 to-red-600">
                    <XCircle size={20} />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-2xl font-bold text-gray-800 leading-none mb-1">{appData.rejected}</div>
                    <div className="text-xs text-gray-500 font-medium">Rejected</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Jobs by Category Chart */}
          <motion.div
            className="bg-white rounded-2xl p-7 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="flex items-center gap-2.5 text-xl font-bold text-gray-800 m-0">
                <BarChart3 size={24} className="text-blue-500" />
                Jobs by Category
              </h2>
              <div className="text-sm font-semibold text-gray-500 py-1.5 px-3 bg-gray-100 rounded-md">
                Total: {jobData.total} jobs
              </div>
            </div>

            <div className="py-2">
              {jobData.byCategory.length === 0 ? (
                <div className="text-center py-15 px-5 text-gray-400">
                  <Briefcase size={48} className="mb-3 mx-auto" />
                  <p className="m-1 text-sm">No job categories data available</p>
                  <p className="text-xs text-gray-500">Post your first job to see analytics</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {jobData.byCategory.map((category, index) => (
                    <div key={index} className="grid grid-cols-[150px_1fr_60px] gap-3 items-center">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-semibold text-gray-700">{category.category || 'Uncategorized'}</div>
                        <div className="text-xs text-gray-500">{category.count} jobs</div>
                      </div>
                      <div className="bg-gray-100 rounded-lg h-6 overflow-hidden">
                        <div 
                          className="h-full rounded-lg transition-[width] duration-1000 ease-out shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
                          style={{ 
                            width: `${calculatePercentage(category.count, jobData.total)}%`,
                            background: `hsl(${index * 45}, 70%, 55%)`
                          }}
                        />
                      </div>
                      <div className="text-sm font-semibold text-gray-500 text-right">
                        {calculatePercentage(category.count, jobData.total)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <h2 className="flex items-center gap-2.5 text-2xl font-bold text-gray-800 m-0 mb-5">
            <Activity size={24} className="text-blue-500" />
            Performance Insights
          </h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
            <div className="bg-white rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-gradient-to-br from-green-500 to-green-600">
                  <TrendingUp size={20} />
                </div>
                <div className="text-sm font-semibold text-gray-700 flex-1">Acceptance Rate</div>
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2 leading-none">
                {calculatePercentage(appData.accepted, appData.total)}%
              </div>
              <div className="text-xs text-gray-500 mb-4">
                {appData.accepted} out of {appData.total} applications accepted
              </div>
              <div className="bg-gray-100 rounded-lg h-2 overflow-hidden">
                <div 
                  className="h-full rounded-lg transition-[width] duration-[1.2s] ease-out bg-gradient-to-r from-green-500 to-green-600"
                  style={{ width: `${calculatePercentage(appData.accepted, appData.total)}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-gradient-to-br from-amber-500 to-orange-600">
                  <Clock size={20} />
                </div>
                <div className="text-sm font-semibold text-gray-700 flex-1">Pending Reviews</div>
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2 leading-none">
                {calculatePercentage(appData.pending, appData.total)}%
              </div>
              <div className="text-xs text-gray-500 mb-4">
                {appData.pending} applications awaiting review
              </div>
              <div className="bg-gray-100 rounded-lg h-2 overflow-hidden">
                <div 
                  className="h-full rounded-lg transition-[width] duration-[1.2s] ease-out bg-gradient-to-r from-amber-500 to-orange-600"
                  style={{ width: `${calculatePercentage(appData.pending, appData.total)}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-gradient-to-br from-indigo-500 to-indigo-600">
                  <Briefcase size={20} />
                </div>
                <div className="text-sm font-semibold text-gray-700 flex-1">Active Postings</div>
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2 leading-none">
                {jobData.total}
              </div>
              <div className="text-xs text-gray-500 mb-4">
                {jobData.byCategory.length} {jobData.byCategory.length === 1 ? 'category' : 'categories'} 
              </div>
              <div className="bg-gray-100 rounded-lg h-2 overflow-hidden">
                <div 
                  className="h-full rounded-lg transition-[width] duration-[1.2s] ease-out bg-gradient-to-r from-indigo-500 to-indigo-600"
                  style={{ width: '85%' }}
                />
              </div>
            </div>

            <div className="bg-white rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-blue-700">
                  <Eye size={20} />
                </div>
                <div className="text-sm font-semibold text-gray-700 flex-1">Avg. Applications per Job</div>
              </div>
              <div className="text-4xl font-bold text-gray-800 mb-2 leading-none">
                {jobData.total > 0 ? Math.round(appData.total / jobData.total) : 0}
              </div>
              <div className="text-xs text-gray-500 mb-4">
                Applications received per posting
              </div>
              <div className="bg-gray-100 rounded-lg h-2 overflow-hidden">
                <div 
                  className="h-full rounded-lg transition-[width] duration-[1.2s] ease-out bg-gradient-to-r from-blue-500 to-blue-700"
                  style={{ width: '70%' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Summary */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <h2 className="flex items-center gap-2.5 text-2xl font-bold text-gray-800 m-0 mb-5">
            <PieChart size={24} className="text-blue-500" />
            Summary Overview
          </h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
            <div className="bg-white rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200">
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-200">
                <Users className="text-blue-500 w-6 h-6" />
                <h3 className="text-lg font-semibold text-gray-800 m-0">Application Overview</h3>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-gray-500 font-medium">Total Received:</span>
                  <span className="text-lg font-bold text-gray-800">{appData.total}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-gray-500 font-medium">Accepted:</span>
                  <span className="text-lg font-bold text-green-600">{appData.accepted}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-gray-500 font-medium">Pending:</span>
                  <span className="text-lg font-bold text-amber-500">{appData.pending}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-gray-500 font-medium">Rejected:</span>
                  <span className="text-lg font-bold text-red-500">{appData.rejected}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200">
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-200">
                <Briefcase className="text-blue-500 w-6 h-6" />
                <h3 className="text-lg font-semibold text-gray-800 m-0">Job Postings</h3>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-gray-500 font-medium">Total Jobs Posted:</span>
                  <span className="text-lg font-bold text-gray-800">{jobData.total}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-gray-500 font-medium">Categories:</span>
                  <span className="text-lg font-bold text-gray-800">{jobData.byCategory.length}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-gray-500 font-medium">Avg. per Category:</span>
                  <span className="text-lg font-bold text-gray-800">
                    {jobData.byCategory.length > 0 
                      ? Math.round(jobData.total / jobData.byCategory.length) 
                      : 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200">
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-200">
                <TrendingUp className="text-blue-500 w-6 h-6" />
                <h3 className="text-lg font-semibold text-gray-800 m-0">Performance Metrics</h3>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-gray-500 font-medium">Response Rate:</span>
                  <span className="text-lg font-bold text-green-600">
                    {appData.total > 0 
                      ? calculatePercentage(appData.accepted + appData.rejected, appData.total) 
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-gray-500 font-medium">Pending Rate:</span>
                  <span className="text-lg font-bold text-amber-500">
                    {calculatePercentage(appData.pending, appData.total)}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-gray-500 font-medium">Success Rate:</span>
                  <span className="text-lg font-bold text-green-600">
                    {calculatePercentage(appData.accepted, appData.total)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <h2 className="flex items-center gap-2.5 text-2xl font-bold text-gray-800 m-0 mb-5">
            <Activity size={24} className="text-blue-500" />
            Recommendations
          </h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
            {appData.pending > 0 && (
              <div className="bg-gradient-to-br from-white to-amber-50 rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 flex gap-4 border-l-4 border-l-amber-500 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-100 text-amber-500">
                  <Clock size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-800 m-0 mb-2">Review Pending Applications</h3>
                  <p className="text-sm text-gray-500 m-0 leading-relaxed">You have {appData.pending} applications waiting for review. Timely responses improve candidate experience.</p>
                </div>
              </div>
            )}

            {jobData.total === 0 && (
              <div className="bg-gradient-to-br from-white to-indigo-50 rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 flex gap-4 border-l-4 border-l-indigo-500 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-100 text-indigo-500">
                  <Briefcase size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-800 m-0 mb-2">Post Your First Job</h3>
                  <p className="text-sm text-gray-500 m-0 leading-relaxed">Start attracting top talent by posting your first job opening.</p>
                </div>
              </div>
            )}

            {appData.total > 0 && calculatePercentage(appData.accepted, appData.total) < 20 && (
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 flex gap-4 border-l-4 border-l-blue-500 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-500">
                  <TrendingUp size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-800 m-0 mb-2">Increase Acceptance Rate</h3>
                  <p className="text-sm text-gray-500 m-0 leading-relaxed">Your acceptance rate is {calculatePercentage(appData.accepted, appData.total)}%. Consider reviewing more applications to find the right talent.</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </EmployerLayout>
  );
};

export default EmployerAnalytics;

