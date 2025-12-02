import { Job, JobFilter } from '../types/job';
import { User } from '../types/user';
import { SuggestionResponseDto } from '../types/search';
import { logger } from '../utils/logger';
import { normalizeError } from '../utils/errorHandler';

// Default backend URL for production/staging when env var is not set
// Uses the publicly accessible API base
const DEFAULT_BACKEND_URL = 'https://mcb.instatripplan.com';

function resolveBackendBaseUrl(): string {
  const envUrl = (process.env.REACT_APP_API_URL || '').trim();
  if (envUrl.length > 0) {
    return envUrl.replace(/\/+$/, '');
  }

  return DEFAULT_BACKEND_URL.replace(/\/+$/, '');
}

export const BACKEND_BASE_URL = resolveBackendBaseUrl();
export const API_BASE_URL = BACKEND_BASE_URL.endsWith('/api')
  ? BACKEND_BASE_URL
  : `${BACKEND_BASE_URL}/api`;

// Additional TypeScript interfaces for API responses
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  isImportant: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export interface FresherNotificationJob {
  id: number;
  title: string;
  company: string;
  location?: string | null;
  experience?: string | null;
  jobType: string;
  link?: string | null;
  notifySent: number;
  createdAt: string;
}

export interface FresherNotificationStats {
  total: number;
  pending: number;
  notified: number;
}

export interface NotificationCsvError {
  row: number;
  email?: string;
  message: string;
}

export interface NotificationCsvSummary {
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: NotificationCsvError[];
}

export interface NotificationLogEntry {
  timestamp: string | null;
  status: string;
  meta?: Record<string, unknown> | string;
  raw: string;
}

export interface NotificationLogData {
  success: NotificationLogEntry[];
  failed: NotificationLogEntry[];
}

export interface NotificationRunSummary {
  ok: boolean;
  source: string;
  jobsQueried: number;
  jobsNotified: number;
  recipientsAttempted: number;
  recipientsSucceeded: number;
  recipientsFailed: number;
  skipped: boolean;
  errors: Array<Record<string, unknown>>;
}

export interface NotificationJobsResult {
  jobs: FresherNotificationJob[];
  stats: FresherNotificationStats;
}

export interface NotificationApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AdminKeyOptions {
  adminKey: string;
}

export interface FetchFresherJobsOptions extends AdminKeyOptions {
  includeNotified?: boolean;
  limit?: number;
}

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'rejected' | 'hired' | 'withdrawn';
  coverLetter?: string;
  resumeId?: string;
  additionalDocuments?: any;
  answers?: any;
  appliedAt: string;
  lastUpdated: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  score?: number;
  isShortlisted: boolean;
  interviewScheduledAt?: string;
  interviewNotes?: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  foundedYear?: number;
  headquarters?: string;
  logo?: string;
  culture?: string;
  values?: string[];
  benefits?: string[];
  socialMedia?: any;
  isVerified: boolean;
  rating?: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
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

export interface SearchFilters {
  locations: string[];
  types: string[];
  categories: string[];
}

// Centralized Backend URL Configuration
// Single URL configuration for both API and static file access

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Enhanced error handling interface
interface APIError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Helper function to make authenticated requests with enhanced error handling
const makeRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  
  // Don't set Content-Type for FormData, let browser set it with boundary
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (parseError) {
        // If response is not JSON, create a basic error structure
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        };
      }

      // Use normalized error handling
      const normalizedError = normalizeError({
        message: errorData.message,
        status: response.status,
        code: errorData.code,
        details: errorData.details
      });

      const apiError: APIError = {
        message: normalizedError.userMessage,
        status: normalizedError.status,
        code: normalizedError.code,
        details: errorData.details
      };

      // Handle 401 errors with session expiration
      if (response.status === 401) {
        const errorCode = errorData.code;
        if (errorCode === 'TOKEN_EXPIRED') {
          window.dispatchEvent(new CustomEvent('sessionExpired'));
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      throw apiError;
    }

    return response;
  } catch (error) {
    // Use normalized error handling for network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const normalizedError = normalizeError(error);
      const networkError: APIError = {
        message: normalizedError.userMessage,
        status: normalizedError.status || 0,
        code: normalizedError.code || 'NETWORK_ERROR'
      };
      throw networkError;
    }
    throw error;
  }
};

// Helper function to make requests without JSON content-type (for file uploads)
const makeFormRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the server. Please make sure the backend is running.');
    }
    throw error;
  }
};

// Enhanced Auth API calls with proper error handling
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'employee' | 'employer';
    phone?: string;
    companyName?: string;
    skills?: string[];
  }): Promise<{ token: string; user: User }> => {
    try {
      const response = await makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      // Handle different response structures
      if (data.token && data.user) {
        return data;
      } else if (data.data && data.data.token && data.data.user) {
        return data.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      logger.apiError('/auth/register', error);
      throw error;
    }
  },

  login: async (credentials: { email: string; password: string; rememberMe?: boolean }): Promise<{ token: string; user: User }> => {
    try {
      const response = await makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      // Handle different response structures
      if (data.token && data.user) {
        return data;
      } else if (data.data && data.data.token && data.data.user) {
        return data.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      logger.apiError('/auth/login', error);
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await makeRequest('/auth/me');
      const data = await response.json();
      
      // Handle different response structures
      if (data.user) {
        return data.user;
      } else if (data.data && data.data.user) {
        return data.data.user;
      } else if (data.id) {
        // If the response is the user object directly
        return data;
      } else {
        throw new Error('Invalid user data format');
      }
    } catch (error) {
      logger.apiError('/auth/me', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await makeRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      logger.apiError('/auth/change-password', error);
      throw error;
    }
  },

  // OTP Login functions
  sendOTP: async (email: string): Promise<{ success: boolean; message: string; email?: string }> => {
    try {
      const response = await makeRequest('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      return data;
    } catch (error) {
      logger.apiError('/auth/send-otp', error);
      throw error;
    }
  },

  verifyOTP: async (email: string, otp: string): Promise<{ success: boolean; message: string; token: string; user: User }> => {
    try {
      const response = await makeRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      return data;
    } catch (error) {
      logger.apiError('/auth/verify-otp', error);
      throw error;
    }
  },

  // File upload functions
  uploadResume: async (file: File): Promise<{ message: string; resumeUrl: string }> => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await makeRequest('/profile/upload-resume', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        }
      });
      
      return await response.json();
    } catch (error) {
      logger.apiError('/upload/resume', error);
      throw error;
    }
  },

  uploadAvatar: async (file: File): Promise<{ message: string; avatarUrl: string }> => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await makeRequest('/profile/upload-avatar', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        }
      });
      
      return await response.json();
    } catch (error) {
      logger.apiError('/upload/avatar', error);
      throw error;
    }
  },

  uploadCompanyLogo: async (file: File): Promise<{ message: string; companyLogo: string }> => {
    try {
      // Use S3 upload API instead of profile upload
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await makeRequest('/upload?folder=company-logos', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        }
      });
      
      const uploadResult = await response.json();
      
      if (uploadResult.success && uploadResult.data?.url) {
        // Update user profile with S3 URL
        const profileResponse = await makeRequest('/profile', {
          method: 'PUT',
          body: JSON.stringify({ companyLogo: uploadResult.data.url }),
        });
        // Consume the response without assigning to avoid unused var
        await profileResponse.json();
        
        return {
          message: 'Company logo uploaded successfully',
          companyLogo: uploadResult.data.url
        };
      } else {
        throw new Error(uploadResult.message || 'Failed to upload company logo');
      }
    } catch (error) {
      logger.apiError('/upload/company-logo (profile)', error);
      throw error;
    }
  },

  // Enhanced auth functions
  refreshToken: async (): Promise<{ token: string; user: User }> => {
    try {
      const response = await makeRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') }),
      });
      
      const data = await response.json();
      
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      } else {
        throw new Error('Invalid refresh token response');
      }
    } catch (error) {
      logger.apiError('/auth/refresh', error);
      // If refresh fails, logout user
      authAPI.logout();
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get stored user data
  getStoredUser: (): User | null => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      logger.error('Error parsing stored user data', error);
      return null;
    }
  }
};

// Employer-specific API calls
type EmployerJobFilterOptions = {
  employerId?: string | null;
  companyId?: string | null;
  companyName?: string | null;
};

const normalizeValue = (value?: string | null): string | null => {
  if (value === null || value === undefined) return null;
  return String(value).trim().toLowerCase() || null;
};

const filterJobsForEmployer = (jobs: any[], options?: EmployerJobFilterOptions): any[] => {
  if (!Array.isArray(jobs) || !jobs.length || !options) return Array.isArray(jobs) ? jobs : [];

  const employerId = normalizeValue(options.employerId || null);
  const companyId = normalizeValue(options.companyId || null);
  const companyName = normalizeValue(options.companyName || null);

  return jobs.filter((job) => {
    const jobEmployerId = normalizeValue(job?.employerId || job?.employer_id || job?.userId || job?.user_id || job?.createdBy || job?.created_by);
    const jobCompanyId = normalizeValue(job?.companyId || job?.company_id || job?.company?.id || job?.company?.companyId);

    let jobCompanyName: string | null = null;
    if (typeof job?.company === 'string') {
      jobCompanyName = job.company;
    } else if (typeof job?.companyName === 'string') {
      jobCompanyName = job.companyName;
    } else if (typeof job?.company_name === 'string') {
      jobCompanyName = job.company_name;
    } else if (job?.company && typeof job.company.name === 'string') {
      jobCompanyName = job.company.name;
    } else if (typeof job?.organizationName === 'string') {
      jobCompanyName = job.organizationName;
    }
    const normalizedCompanyName = normalizeValue(jobCompanyName);

    let matches = false;

    if (employerId && jobEmployerId) {
      matches = jobEmployerId === employerId;
    }

    if (!matches && companyId && jobCompanyId) {
      matches = jobCompanyId === companyId;
    }

    if (!matches && companyName && normalizedCompanyName) {
      matches = normalizedCompanyName === companyName;
    }

    return matches;
  });
};

export const employerAPI = {
  // Get employer's jobs with application counts
  getMyJobs: async (options?: EmployerJobFilterOptions): Promise<Job[]> => {
    try {
      const response = await makeRequest('/jobs/employer/my-jobs');
      const data = await response.json();
      logger.debug('Employer jobs response', data);
      if (Array.isArray(data)) {
        return filterJobsForEmployer(data, options);
      }
      if (Array.isArray((data as any)?.jobs)) {
        return filterJobsForEmployer((data as any).jobs, options);
      }
      return [];
    } catch (error: any) {
      logger.apiError('/jobs/employer', error);

      // Fallback: if employer endpoint fails (e.g. not implemented yet), attempt to filter regular jobs by company
      if (options?.companyName || options?.companyId || options?.employerId) {
        try {
          logger.warn('Falling back to jobsAPI.fetchJobs using employer filters', options);
          const fallback = await jobsAPI.fetchJobs({
            company: options.companyName || undefined,
            limit: 100,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          });

          const fallbackJobs = Array.isArray((fallback as any)?.jobs) ? (fallback as any).jobs : fallback;
          if (Array.isArray(fallbackJobs)) {
            const filteredFallback = filterJobsForEmployer(fallbackJobs, options);
            return filteredFallback;
          }
        } catch (fallbackError) {
          logger.apiError('/jobs (fallback)', fallbackError);
        }
      }

      throw error;
    }
  },

  // Get all applications for employer's jobs
  getAllApplications: async (): Promise<Application[]> => {
    try {
      const response = await makeRequest('/applications/employer/all');
      const data = await response.json();
      logger.debug('Employer applications response', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      logger.apiError('/applications/employer', error);
      throw error;
    }
  },

  // Get employer dashboard stats
  getStats: async (): Promise<{
    totalJobs: number;
    totalApplications: number;
    pendingApplications: number;
    reviewedApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    responseRate: number;
  }> => {
    try {
      const response = await makeRequest('/applications/employer/stats');
      const data = await response.json();
      logger.debug('Employer stats response', data);
      return data;
    } catch (error) {
      logger.apiError('/analytics/employer', error);
      throw error;
    }
  },
};

// Enhanced Jobs API calls with comprehensive functionality
export const jobsAPI = {
  // Get jobs from our backend (DB-only)
  fetchJobs: async (filters?: JobFilter & {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    type?: string;
    category?: string;
    company?: string;
    isRemote?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    jobs: Job[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.page) queryParams.append('page', String(filters.page));
      if (filters?.limit) queryParams.append('limit', String(filters.limit));
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.location) queryParams.append('location', filters.location);
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.experience) queryParams.append('experience', filters.experience);
      if (typeof filters?.isRemote !== 'undefined') queryParams.append('isRemote', String(filters.isRemote));
      if (filters?.company) queryParams.append('company', filters.company);
      if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const response = await makeRequest(`/jobs?${queryParams.toString()}`);
      const data = await response.json();
      // Backend returns { jobs, pagination }
      return data;
    } catch (error) {
      logger.apiError('/jobs', error);
      throw error;
    }
  },

  // Get Home Page Jobs (all 4 categories)
  fetchHomePageJobs: async (): Promise<{
    remote: Job[];
    fresher: Job[];
    government: Job[];
    experienced: Job[];
  }> => {
    try {
      const response = await makeRequest('/jobs/home-jobs');
      const data = await response.json();
      return data;
    } catch (error) {
      logger.apiError('/jobs (home page)', error);
      throw error;
    }
  },

  // Get job by ID
  fetchJobById: async (id: string): Promise<Job> => {
    try {
      const response = await makeRequest(`/jobs/${id}`);
      return response.json();
    } catch (error) {
      logger.apiError('/jobs/:id', error);
      throw error;
    }
  },

  // Create new job
  createJob: async (jobData: Partial<Job>): Promise<Job> => {
    try {
      const response = await makeRequest('/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create job');
      }
      
      const data = await response.json();
      logger.info('Job created successfully', data);
      return data;
    } catch (error) {
      logger.apiError('/jobs (create)', error);
      throw error;
    }
  },

  // Update existing job
  updateJob: async (id: string, jobData: Partial<Job>): Promise<Job> => {
    try {
      const response = await makeRequest(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(jobData),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/jobs/:id (update)', error);
      throw error;
    }
  },

  // Delete job
  deleteJob: async (id: string): Promise<{ success: boolean; deleted: number }> => {
    try {
      const response = await makeRequest(`/jobs/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    } catch (error) {
      logger.apiError('/jobs/:id (delete)', error);
      throw error;
    }
  },

  // Search jobs with advanced filters
  searchJobs: async (filters: JobFilter): Promise<Job[]> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.keyword) queryParams.append('q', filters.keyword);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.jobType) queryParams.append('type', filters.jobType);
      if (filters.company) queryParams.append('company', filters.company);
      if (filters.salaryMin) queryParams.append('minSalary', filters.salaryMin.toString());
      if (filters.salaryMax) queryParams.append('maxSalary', filters.salaryMax.toString());
      
      const response = await makeRequest(`/search/jobs?${queryParams.toString()}`);
      return response.json();
    } catch (error) {
      logger.apiError('/jobs/search', error);
      throw error;
    }
  },

  // Get jobs by company
  getJobsByCompany: async (companyId: string): Promise<Job[]> => {
    try {
      const response = await makeRequest(`/companies/${companyId}/jobs`);
      return response.json();
    } catch (error) {
      logger.apiError('/jobs/company/:companyId', error);
      throw error;
    }
  },

  // Get job statistics
  getJobStats: async (): Promise<{
    totalJobs: number;
    activeJobs: number;
    expiredJobs: number;
    totalApplications: number;
  }> => {
    try {
      const response = await makeRequest('/jobs/stats');
      return response.json();
    } catch (error) {
      logger.apiError('/jobs/:id/stats', error);
      throw error;
    }
  },

  // Bulk operations
  bulkDeleteJobs: async (jobIds: string[]): Promise<{ success: boolean; deleted: number }> => {
    try {
      const response = await makeRequest('/jobs/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ jobIds }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/jobs/bulk-delete', error);
      throw error;
    }
  },

  // Update job status
  updateJobStatus: async (id: string, status: 'active' | 'inactive' | 'expired'): Promise<Job> => {
    try {
      const response = await makeRequest(`/jobs/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/jobs/:id/status', error);
      throw error;
    }
  },

  // Get job applications
  getJobApplications: async (jobId: string): Promise<any[]> => {
    try {
      const response = await makeRequest(`/jobs/${jobId}/applications`);
      return response.json();
    } catch (error) {
      logger.apiError('/jobs/:id/applications', error);
      throw error;
    }
  },

  // Record apply click for external jobs
  recordApplyClick: async (jobId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await makeRequest(`/jobs/${jobId}/apply-click`, {
        method: 'POST',
      });
      return response.json();
    } catch (error) {
      logger.apiError('/jobs/:id/apply-click', error);
      throw error;
    }
  },
};

// Enhanced Users API calls with proper error handling
export const usersAPI = {
  // Update user profile
  updateProfile: async (profileData: any): Promise<any> => {
    try {
      logger.debug('Sending profile update request', profileData);
      
      const response = await makeRequest('/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const data = await response.json();
      logger.info('Profile update successful', data);
      return data;
    } catch (error) {
      logger.apiError('/profile', error);
      throw error;
    }
  },

  // Get all users with pagination and filtering
  fetchUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    users: User[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.role) queryParams.append('role', params.role);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await makeRequest(`/users?${queryParams.toString()}`);
      const data = await response.json();
      
      // Handle different response structures
      if (data.users && Array.isArray(data.users)) {
        return data;
      } else if (Array.isArray(data)) {
        return { users: data };
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      logger.apiError('/users', error);
      throw error;
    }
  },

  // Get user by ID
  fetchUserById: async (id: string): Promise<User> => {
    try {
      const response = await makeRequest(`/users/${id}`);
      const data = await response.json();
      
      // Handle different response structures
      if (data.user) {
        return data.user;
      } else if (data.id) {
        return data;
      } else {
        throw new Error('Invalid user data format');
      }
    } catch (error) {
      logger.apiError('/users/:id', error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'employee' | 'employer';
    phone?: string;
    companyName?: string;
    skills?: string[];
  }): Promise<User> => {
    try {
      const response = await makeRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      // Handle different response structures
      if (data.user) {
        return data.user;
      } else if (data.id) {
        return data;
      } else {
        throw new Error('Invalid user creation response');
      }
    } catch (error) {
      logger.apiError('/users (create)', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    try {
      const response = await makeRequest(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      // Handle different response structures
      if (data.user) {
        return data.user;
      } else if (data.id) {
        return data;
      } else {
        throw new Error('Invalid user update response');
      }
    } catch (error) {
      logger.apiError('/users/:id (update)', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await makeRequest(`/users/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      logger.apiError('/users/:id (delete)', error);
      throw error;
    }
  },

  // Enhanced user management functions
  searchUsers: async (searchTerm: string, filters?: {
    role?: string;
    location?: string;
    skills?: string[];
  }): Promise<User[]> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('search', searchTerm);
      
      if (filters?.role) queryParams.append('role', filters.role);
      if (filters?.location) queryParams.append('location', filters.location);
      if (filters?.skills) queryParams.append('skills', filters.skills.join(','));

      const response = await makeRequest(`/users/search?${queryParams.toString()}`);
      const data = await response.json();
      
      return Array.isArray(data) ? data : data.users || [];
    } catch (error) {
      logger.apiError('/users/search', error);
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async (): Promise<{
    totalUsers: number;
    employees: number;
    employers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  }> => {
    try {
      const response = await makeRequest('/users/stats');
      return response.json();
    } catch (error) {
      logger.apiError('/users/stats', error);
      throw error;
    }
  },

  // Bulk operations
  bulkDeleteUsers: async (userIds: string[]): Promise<{ success: boolean; deletedCount: number }> => {
    try {
      const response = await makeRequest('/users/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ userIds }),
      });
      
      return response.json();
    } catch (error) {
      logger.apiError('/users/bulk-delete', error);
      throw error;
    }
  },

  // Update user role
  updateUserRole: async (id: string, role: 'employee' | 'employer'): Promise<User> => {
    try {
      const response = await makeRequest(`/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      
      const data = await response.json();
      return data.user || data;
    } catch (error) {
      logger.apiError('/users/:id/role', error);
      throw error;
    }
  },

  // Deactivate/Activate user
  toggleUserStatus: async (id: string, isActive: boolean): Promise<User> => {
    try {
      const response = await makeRequest(`/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ isActive }),
      });
      
      const data = await response.json();
      return data.user || data;
    } catch (error) {
      logger.apiError('/users/:id/status', error);
      throw error;
    }
  }
};

// Applications API calls
export const applicationsAPI = {
  applyToJob: async (jobId: string, applicationData: {
    coverLetter?: string;
    resumeUrl?: string;
  }): Promise<{ success: boolean; applicationId?: string }> => {
    const response = await makeRequest('/applications', {
      method: 'POST',
      body: JSON.stringify({
        jobId,
        coverLetter: applicationData.coverLetter,
        resumeUrl: applicationData.resumeUrl,
      }),
    });

    const result = await response.json();
    return { success: true, applicationId: result.id };
  },

  getUserApplications: async (): Promise<Application[]> => {
    const response = await makeRequest('/applications');
    return response.json();
  },

  getJobApplications: async (jobId: string): Promise<Application[]> => {
    const response = await makeRequest(`/applications/job/${jobId}`);
    return response.json();
  },

  getApplication: async (applicationId: string): Promise<Application> => {
    const response = await makeRequest(`/applications/${applicationId}`);
    return response.json();
  },

  updateApplication: async (applicationId: string, data: Partial<Application>): Promise<Application> => {
    const response = await makeRequest(`/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  withdrawApplication: async (applicationId: string): Promise<{ success: boolean }> => {
    const response = await makeRequest(`/applications/${applicationId}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    return { success: result.deleted };
  },

  getApplicationResumeUrl: async (applicationId: string): Promise<{ downloadUrl: string }> => {
    const response = await makeRequest(`/applications/${applicationId}/resume/download`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || 'Failed to get resume URL');
    }
    if (!data?.downloadUrl) {
      throw new Error('Resume URL not available');
    }
    return { downloadUrl: data.downloadUrl };
  },

  // Update application status (employer only)
  updateApplicationStatus: async (applicationId: string, status: 'pending' | 'reviewed' | 'accepted' | 'rejected'): Promise<Application> => {
    try {
      const response = await makeRequest(`/applications/${applicationId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/applications/:id/status', error);
      throw error;
    }
  },

  // Bulk update application statuses (employer only)
  bulkUpdateApplicationStatus: async (applicationIds: string[], status: 'pending' | 'reviewed' | 'accepted' | 'rejected'): Promise<{ success: boolean; updated: number }> => {
    try {
      const response = await makeRequest('/applications/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ applicationIds, status }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/applications/bulk-update', error);
      throw error;
    }
  },

  // Get application statistics
  getApplicationStats: async (): Promise<{
    totalApplications: number;
    pendingApplications: number;
    reviewedApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    applicationsThisMonth: number;
  }> => {
    try {
      const response = await makeRequest('/applications/stats');
      return response.json();
    } catch (error) {
      logger.apiError('/applications/stats', error);
      throw error;
    }
  },

  // Search applications
  searchApplications: async (filters: {
    keyword?: string;
    status?: string;
    jobTitle?: string;
    company?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Application[]> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.keyword) queryParams.append('q', filters.keyword);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.jobTitle) queryParams.append('jobTitle', filters.jobTitle);
      if (filters.company) queryParams.append('company', filters.company);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      
      const response = await makeRequest(`/search/applications?${queryParams.toString()}`);
      return response.json();
    } catch (error) {
      logger.apiError('/applications/search', error);
      throw error;
    }
  },

  // Get application analytics
  getApplicationAnalytics: async (): Promise<{
    applicationsByStatus: { [key: string]: number };
    applicationsByMonth: { month: string; count: number }[];
    topJobs: { jobTitle: string; applications: number }[];
  }> => {
    try {
      const response = await makeRequest('/applications/analytics');
      return response.json();
    } catch (error) {
      logger.apiError('/applications/analytics', error);
      throw error;
    }
  }
};

// Search API calls
export const searchAPI = {
  searchJobs: async (filters: JobFilter): Promise<Job[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters.keyword) queryParams.append('q', filters.keyword);
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.jobType) queryParams.append('type', filters.jobType);
    if (filters.company) queryParams.append('company', filters.company);
    if (filters.salaryMin) queryParams.append('minSalary', filters.salaryMin.toString());
    if (filters.salaryMax) queryParams.append('maxSalary', filters.salaryMax.toString());
    
    const response = await makeRequest(`/search/jobs?${queryParams.toString()}`);
    return response.json();
  },

  getFilterOptions: async (): Promise<SearchFilters> => {
    const response = await makeRequest('/search/filters');
    return response.json();
  },

  getRecommendedJobs: async (): Promise<Job[]> => {
    const response = await makeRequest('/search/recommended');
    return response.json();
  },

  // Autocomplete functions
  autocomplete: async (query: string): Promise<{ jobs: Job[]; companies: string[]; locations: string[]; skills: string[] }> => {
    try {
      if (!query || query.length < 2) {
        return { jobs: [], companies: [], locations: [], skills: [] };
      }
      const response = await makeRequest(`/search/autocomplete?q=${encodeURIComponent(query)}&limit=5`);
      return response.json();
    } catch (error) {
      logger.apiError('/autocomplete', error);
      return { jobs: [], companies: [], locations: [], skills: [] };
    }
  },

  autocompleteJobTitles: async (query: string): Promise<string[]> => {
    try {
      if (!query || query.length < 2) return [];
      const response = await makeRequest(`/search/autocomplete/titles?q=${encodeURIComponent(query)}&limit=10`);
      return response.json();
    } catch (error) {
      logger.apiError('/autocomplete/titles', error);
      return [];
    }
  },

  autocompleteCompanies: async (query: string): Promise<string[]> => {
    try {
      if (!query || query.length < 2) return [];
      const response = await makeRequest(`/search/autocomplete/companies?q=${encodeURIComponent(query)}&limit=10`);
      return response.json();
    } catch (error) {
      logger.apiError('/autocomplete/companies', error);
      return [];
    }
  },

  autocompleteLocations: async (query: string): Promise<string[]> => {
    try {
      if (!query || query.length < 2) return [];
      const response = await makeRequest(`/search/autocomplete/locations?q=${encodeURIComponent(query)}&limit=10`);
      return response.json();
    } catch (error) {
      logger.apiError('/autocomplete/locations', error);
      return [];
    }
  },
};

// Suggest API calls (advanced autocomplete with fuzzy search)
export const suggestAPI = {
  fetchSuggestions: async (query: string, signal?: AbortSignal): Promise<SuggestionResponseDto> => {
    try {
      if (!query || query.length < 2) {
        return { jobs: [], companies: [], locations: [], skills: [] };
      }
      const response = await makeRequest(`/suggest?query=${encodeURIComponent(query)}`, {
        signal,
      });
      return response.json();
    } catch (error: any) {
      // Don't log AbortError as it's expected when cancelling requests
      if (error?.name !== 'AbortError') {
        logger.apiError('/suggest', error);
      }
      // Re-throw AbortError so caller can handle it
      throw error;
    }
  },
};

// Enhanced Saved Jobs API calls with comprehensive functionality
export const savedJobsAPI = {
  // Get user's saved jobs with advanced filtering and pagination
  getSavedJobs: async (filters?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'savedAt' | 'jobTitle' | 'company' | 'location';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    savedJobs: any[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await makeRequest(`/saved-jobs?${queryParams.toString()}`);
      const data = await response.json();
      logger.debug('Saved Jobs API Response', data);
      
      // Handle different response structures
      if (Array.isArray(data)) {
        return { savedJobs: data };
      }
      
      return data;
    } catch (error) {
      logger.apiError('/saved-jobs', error);
      throw error;
    }
  },

  // Save a job
  saveJob: async (jobId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await makeRequest('/saved-jobs', {
        method: 'POST',
        body: JSON.stringify({ jobId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save job');
      }
      
      // Consume the response without assigning to avoid unused var
      await response.json();
      return { success: true, message: 'Job saved successfully' };
    } catch (error) {
      logger.apiError('/saved-jobs (save)', error);
      throw error;
    }
  },

  // Unsave a job
  unsaveJob: async (jobId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await makeRequest(`/saved-jobs/${jobId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unsave job');
      }
      
      const result = await response.json();
      return { success: result.deleted, message: 'Job removed from saved jobs' };
    } catch (error) {
      logger.apiError('/saved-jobs/:id (unsave)', error);
      throw error;
    }
  },

  // Check if a job is saved
  isJobSaved: async (jobId: string): Promise<boolean> => {
    try {
      const response = await makeRequest(`/saved-jobs/check/${jobId}`);
      
      if (!response.ok) {
        logger.apiError('/saved-jobs/check', new Error(response.statusText));
        return false;
      }
      
      const result = await response.json();
      return result.isSaved || false;
    } catch (error) {
      logger.apiError('/saved-jobs/check', error);
      return false;
    }
  },

  // Bulk save jobs
  bulkSaveJobs: async (jobIds: string[]): Promise<{ success: boolean; saved: number; errors: string[] }> => {
    try {
      const response = await makeRequest('/saved-jobs/bulk-save', {
        method: 'POST',
        body: JSON.stringify({ jobIds }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/saved-jobs/bulk-save', error);
      throw error;
    }
  },

  // Bulk unsave jobs
  bulkUnsaveJobs: async (jobIds: string[]): Promise<{ success: boolean; removed: number }> => {
    try {
      const response = await makeRequest('/saved-jobs/bulk-unsave', {
        method: 'POST',
        body: JSON.stringify({ jobIds }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/saved-jobs/bulk-unsave', error);
      throw error;
    }
  },

  // Get saved jobs statistics
  getSavedJobsStats: async (): Promise<{
    totalSaved: number;
    recentSaved: number;
    lastUpdated: string;
  }> => {
    try {
      const response = await makeRequest('/saved-jobs/stats');
      const data = await response.json();
      return data;
    } catch (error) {
      logger.apiError('/saved-jobs/stats', error);
      throw error;
    }
  },

  // Search saved jobs
  searchSavedJobs: async (filters: {
    keyword?: string;
    company?: string;
    location?: string;
    jobType?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any[]> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.keyword) queryParams.append('q', filters.keyword);
      if (filters.company) queryParams.append('company', filters.company);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.jobType) queryParams.append('jobType', filters.jobType);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      
      const response = await makeRequest(`/search/saved-jobs?${queryParams.toString()}`);
      return response.json();
    } catch (error) {
      logger.apiError('/saved-jobs/search', error);
      throw error;
    }
  },

  // Get saved jobs analytics
  getSavedJobsAnalytics: async (): Promise<{
    savedJobsByMonth: { month: string; count: number }[];
    topCompanies: { company: string; count: number }[];
    topCategories: { category: string; count: number }[];
    savedJobsByLocation: { location: string; count: number }[];
  }> => {
    try {
      const response = await makeRequest('/saved-jobs/analytics');
      return response.json();
    } catch (error) {
      logger.apiError('/saved-jobs/analytics', error);
      throw error;
    }
  },

  // Clear all saved jobs
  clearAllSavedJobs: async (): Promise<{ success: boolean; cleared: number }> => {
    try {
      const response = await makeRequest('/saved-jobs/clear-all', {
        method: 'DELETE',
      });
      return response.json();
    } catch (error) {
      logger.apiError('/saved-jobs/clear', error);
      throw error;
    }
  }
};

// Candidates API calls
export const candidatesAPI = {
  // Get all candidates with filtering
  getCandidates: async (filters?: {
    search?: string;
    location?: string;
    experience?: string;
    skills?: string;
    minRating?: number;
    page?: number;
    limit?: number;
  }): Promise<{ candidates: any[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.location && filters.location !== 'all') queryParams.append('location', filters.location);
      if (filters?.experience && filters.experience !== 'all') queryParams.append('experience', filters.experience);
      if (filters?.skills && filters.skills !== 'all') queryParams.append('skills', filters.skills);
      if (filters?.minRating) queryParams.append('minRating', filters.minRating.toString());
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      
      const response = await makeRequest(`/candidates?${queryParams.toString()}`);
      return response.json();
    } catch (error) {
      logger.apiError('/candidates', error);
      throw error;
    }
  },

  // Get a single candidate by ID
  getCandidate: async (id: string): Promise<any> => {
    try {
      const response = await makeRequest(`/candidates/${id}`);
      return response.json();
    } catch (error) {
      logger.apiError('/candidates/:id', error);
      throw error;
    }
  },

  // Get signed resume download URL for a candidate (employer only)
  downloadResume: async (id: string): Promise<{ downloadUrl: string; candidateName?: string }> => {
    try {
      const response = await makeRequest(`/candidates/${id}/resume/download`);
      const data = await response.json();
      if (data?.url) {
        return { downloadUrl: data.url, candidateName: data.fileName };
      }
      if (data?.downloadUrl) {
        return { downloadUrl: data.downloadUrl, candidateName: data.candidateName };
      }
      throw new Error(data?.message || 'Failed to get resume download URL');
    } catch (error) {
      logger.apiError('/candidates/:id/resume', error);
      throw error;
    }
  },
};

// Saved Candidates API calls
export const savedCandidatesAPI = {
  // Get all saved candidates
  getSavedCandidates: async (): Promise<any[]> => {
    try {
      const response = await makeRequest('/saved-candidates');
      return response.json();
    } catch (error) {
      logger.apiError('/saved-candidates', error);
      throw error;
    }
  },

  // Save a candidate
  saveCandidate: async (candidateId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await makeRequest('/saved-candidates', {
        method: 'POST',
        body: JSON.stringify({ candidateId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save candidate');
      }
      
      return { success: true, message: 'Candidate saved successfully' };
    } catch (error) {
      logger.apiError('/saved-candidates (save)', error);
      throw error;
    }
  },

  // Unsave a candidate
  unsaveCandidate: async (candidateId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await makeRequest(`/saved-candidates/${candidateId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unsave candidate');
      }
      
      return { success: true, message: 'Candidate removed from saved' };
    } catch (error) {
      logger.apiError('/saved-candidates/:id (unsave)', error);
      throw error;
    }
  },

  // Check if a candidate is saved
  isCandidateSaved: async (candidateId: number): Promise<boolean> => {
    try {
      const response = await makeRequest(`/saved-candidates/${candidateId}/check`);
      
      if (!response.ok) {
        logger.apiError('/saved-candidates/check', new Error(response.statusText));
        return false;
      }
      
      const result = await response.json();
      return result.isSaved || false;
    } catch (error) {
      logger.apiError('/saved-candidates/check', error);
      return false;
    }
  },
};

// Resume Data Interfaces
export interface ResumeHeadline {
  headline: string;
  updatedAt?: string;
}

export interface KeySkill {
  id?: string;
  skill: string;
  category?: string;
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Employment {
  id?: string;
  position: string;
  company: string;
  duration: string;
  availability: string;
  role: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  achievements?: string[];
}

export interface Education {
  id?: string;
  level: string;
  institution: string;
  year: string;
  fieldOfStudy?: string;
  gpa?: string;
  honors?: string;
  description?: string;
}

export interface ITSkill {
  id?: string;
  skill: string;
  version: string;
  lastUsed: string;
  experience: string;
  proficiency?: number;
}

export interface Project {
  id?: string;
  name: string;
  company: string;
  duration: string;
  description: string;
  technologies?: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProfileSummary {
  summary: string;
  characterCount: number;
  updatedAt?: string;
}

export interface Accomplishment {
  id?: string;
  type: 'Online Profile' | 'Work Sample' | 'Research Publication' | 'Presentation' | 'Patent' | 'Certification';
  title: string;
  url?: string;
  description?: string;
  date?: string;
}

export interface DesiredCareer {
  industry: string;
  functionalArea: string;
  role: string;
  jobType: string;
  employmentType: string;
  availabilityToJoin: string;
  expectedSalary: string;
  desiredShift?: string;
  desiredLocation?: string;
  desiredIndustry?: string;
}

export interface PersonalDetails {
  dateOfBirth: string;
  permanentAddress: string;
  gender: string;
  areaPinCode: string;
  maritalStatus: string;
  hometown: string;
  passportNumber: string;
  workPermit: string;
  differentlyAbled: string;
  languages: string;
  phone?: string;
  email?: string;
}

export interface ResumeData {
  resumeHeadline: ResumeHeadline;
  keySkills: KeySkill[];
  employment: Employment[];
  education: Education[];
  itSkills: ITSkill[];
  projects: Project[];
  profileSummary: ProfileSummary;
  accomplishments: Accomplishment[];
  desiredCareer: DesiredCareer;
  personalDetails: PersonalDetails;
  resumeUrl?: string;
  avatarUrl?: string;
}

// Profile API calls
export const profileAPI = {
  getProfile: async (): Promise<any> => {
    const response = await makeRequest('/profile');
    return response.json();
  },

  updateProfile: async (profileData: any): Promise<any> => {
    const response = await makeRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.json();
  },

  uploadResume: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await makeFormRequest('/profile/upload-resume', {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  uploadAvatar: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await makeFormRequest('/profile/upload-avatar', {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  uploadCompanyLogo: async (file: File): Promise<any> => {
    try {
      // Use S3 upload API instead of profile upload
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await makeFormRequest('/upload?folder=company-logos', {
        method: 'POST',
        body: formData,
      });
      
      const uploadResult = await response.json();
      
      if (uploadResult.success && uploadResult.data?.url) {
        // Update user profile with S3 URL
        const profileResponse = await makeRequest('/profile', {
          method: 'PUT',
          body: JSON.stringify({ companyLogo: uploadResult.data.url }),
        });
        // Consume the response without assigning to avoid unused var
        await profileResponse.json();
        
        return {
          message: 'Company logo uploaded successfully',
          companyLogo: uploadResult.data.url
        };
      } else {
        throw new Error(uploadResult.message || 'Failed to upload company logo');
      }
    } catch (error) {
      logger.apiError('/upload/company-logo (company)', error);
      throw error;
    }
  },

  getSkills: async (): Promise<string[]> => {
    const response = await makeRequest('/profile/skills');
    const data = await response.json();
    logger.debug('getSkills API response', data);
    // The API returns { skills: [...] }, so extract the skills array
    return data.skills || [];
  },

  updateSkills: async (skills: string[]): Promise<any> => {
    const response = await makeRequest('/profile/skills', {
      method: 'PUT',
      body: JSON.stringify({ skills }),
    });
    const data = await response.json();
    logger.info('updateSkills API response', data);
    return data;
  },

  // Resume-specific API calls
  getResumeData: async (): Promise<ResumeData> => {
    try {
      const response = await makeRequest('/profile/resume');
      const data = await response.json();
      return data;
    } catch (error) {
      logger.apiError('/profile/resume', error);
      throw error;
    }
  },

  updateResumeHeadline: async (headline: string): Promise<ResumeHeadline> => {
    try {
      const response = await makeRequest('/profile/resume/headline', {
        method: 'PUT',
        body: JSON.stringify({ headline }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/profile/resume/headline', error);
      throw error;
    }
  },

  updateKeySkills: async (skills: KeySkill[]): Promise<KeySkill[]> => {
    try {
      const response = await makeRequest('/profile/resume/skills', {
        method: 'PUT',
        body: JSON.stringify({ skills }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/profile/resume/skills', error);
      throw error;
    }
  },

  updateEmployment: async (employment: Employment[]): Promise<Employment[]> => {
    try {
      const response = await makeRequest('/profile/resume/employment', {
        method: 'PUT',
        body: JSON.stringify({ employment }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/profile/resume/employment', error);
      throw error;
    }
  },

  updateEducation: async (education: Education[]): Promise<Education[]> => {
    try {
      const response = await makeRequest('/profile/resume/education', {
        method: 'PUT',
        body: JSON.stringify({ education }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/profile/resume/education', error);
      throw error;
    }
  },

  updateITSkills: async (itSkills: ITSkill[]): Promise<ITSkill[]> => {
    try {
      const response = await makeRequest('/profile/resume/it-skills', {
        method: 'PUT',
        body: JSON.stringify({ itSkills }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/profile/resume/it-skills', error);
      throw error;
    }
  },

  updateProjects: async (projects: Project[]): Promise<Project[]> => {
    try {
      const response = await makeRequest('/profile/resume/projects', {
        method: 'PUT',
        body: JSON.stringify({ projects }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/profile/resume/projects', error);
      throw error;
    }
  },

  updateProfileSummary: async (summary: string): Promise<ProfileSummary> => {
    try {
      const response = await makeRequest('/profile/resume/summary', {
        method: 'PUT',
        body: JSON.stringify({ summary }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/profile/resume/summary', error);
      throw error;
    }
  },

  updateAccomplishments: async (accomplishments: Accomplishment[]): Promise<Accomplishment[]> => {
    try {
      const response = await makeRequest('/profile/resume/accomplishments', {
        method: 'PUT',
        body: JSON.stringify({ accomplishments }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/profile/resume/accomplishments', error);
      throw error;
    }
  },

  updateDesiredCareer: async (career: DesiredCareer): Promise<DesiredCareer> => {
    try {
      const response = await makeRequest('/profile/resume/career', {
        method: 'PUT',
        body: JSON.stringify({ career }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/profile/resume/career', error);
      throw error;
    }
  },

  updatePersonalDetails: async (personalDetails: PersonalDetails): Promise<PersonalDetails> => {
    try {
      const response = await makeRequest('/profile/resume/personal', {
        method: 'PUT',
        body: JSON.stringify({ personalDetails }),
      });
      return response.json();
    } catch (error) {
      logger.apiError('/profile/resume/personal', error);
      throw error;
    }
  },
};

// Companies API calls
export const companiesAPI = {
  getCompanies: async (): Promise<Company[]> => {
    const response = await makeRequest('/companies');
    return response.json();
  },

  getCompany: async (id: string): Promise<Company> => {
    const response = await makeRequest(`/companies/${id}`);
    return response.json();
  },

  getCompanyJobs: async (id: string): Promise<Job[]> => {
    const response = await makeRequest(`/companies/${id}/jobs`);
    return response.json();
  },
};

// Notifications API calls
export const notificationsAPI = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await makeRequest('/notifications');
    return response.json();
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await makeRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
    return response.json();
  },

  updateNotification: async (notificationId: string, data: Partial<Notification>): Promise<Notification> => {
    const response = await makeRequest(`/notifications/${notificationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteNotification: async (notificationId: string): Promise<{ success: boolean }> => {
    const response = await makeRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  createNotification: async (notificationData: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }): Promise<Notification> => {
    const response = await makeRequest('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
    return response.json();
  }
};

const ADMIN_KEY_HEADER = 'X-Admin-Key';

export const notificationAdminAPI = {
  fetchFresherJobs: async (options: FetchFresherJobsOptions): Promise<NotificationApiResponse<NotificationJobsResult>> => {
    const trimmedKey = options?.adminKey?.trim();
    if (!trimmedKey) {
      throw new Error('Admin key is required');
    }

    const params = new URLSearchParams();
    if (options?.includeNotified) {
      params.set('includeNotified', 'true');
    }
    if (typeof options?.limit === 'number') {
      params.set('limit', String(options.limit));
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await makeRequest(`/notifications/jobs/freshers${query}` , {
      headers: {
        [ADMIN_KEY_HEADER]: trimmedKey,
      },
    });
    const json = (await response.json()) as NotificationApiResponse<NotificationJobsResult>;
    if (!json.success) {
      throw new Error(json.error || json.message || 'Failed to fetch fresher jobs');
    }
    return {
      success: true,
      message: json.message,
      data:
        json.data || {
          jobs: [],
          stats: {
            total: 0,
            pending: 0,
            notified: 0,
          },
        },
    };
  },

  uploadSubscribersCsv: async (file: File, adminKey: string): Promise<NotificationApiResponse<NotificationCsvSummary>> => {
    const trimmedKey = adminKey.trim();
    if (!trimmedKey) {
      throw new Error('Admin key is required');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await makeFormRequest('/notifications/upload-csv', {
      method: 'POST',
      body: formData,
      headers: {
        [ADMIN_KEY_HEADER]: trimmedKey,
      },
    });

    const json = (await response.json()) as NotificationApiResponse<NotificationCsvSummary>;
    if (!json.success) {
      throw new Error(json.error || json.message || 'Failed to upload subscriber CSV');
    }

    return {
      success: true,
      message: json.message,
      data: json.data,
    };
  },

  triggerManualSend: async (adminKey: string): Promise<NotificationApiResponse<NotificationRunSummary>> => {
    const trimmedKey = adminKey.trim();
    if (!trimmedKey) {
      throw new Error('Admin key is required');
    }

    try {
      const response = await makeRequest('/notifications/send-mails', {
        headers: {
          [ADMIN_KEY_HEADER]: trimmedKey,
        },
      });
      const json = (await response.json()) as NotificationApiResponse<NotificationRunSummary>;
      if (!json.success) {
        return {
          success: false,
          message: json.error || json.message,
          data: json.data,
        };
      }
      return json;
    } catch (error) {
      const apiError = error as APIError;
      const details = (apiError?.details || null) as NotificationApiResponse<NotificationRunSummary> | null;
      if (details) {
        return {
          success: false,
          message: details.error || details.message || apiError.message,
          data: details.data,
        };
      }
      throw error;
    }
  },

  fetchLogs: async (adminKey: string, limit?: number): Promise<NotificationApiResponse<NotificationLogData>> => {
    const trimmedKey = adminKey.trim();
    if (!trimmedKey) {
      throw new Error('Admin key is required');
    }

    const params = new URLSearchParams();
    if (typeof limit === 'number') {
      params.set('limit', String(limit));
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await makeRequest(`/notifications/logs${query}`, {
      headers: {
        [ADMIN_KEY_HEADER]: trimmedKey,
      },
    });
    const json = (await response.json()) as NotificationApiResponse<NotificationLogData>;
    if (!json.success) {
      throw new Error(json.error || json.message || 'Failed to fetch notification logs');
    }
    return {
      success: true,
      message: json.message,
      data: json.data || { success: [], failed: [] },
    };
  },
};

// Analytics API calls
export const analyticsAPI = {
  getApplicationAnalytics: async (): Promise<AnalyticsData> => {
    const response = await makeRequest('/analytics/applications');
    return response.json();
  },

  getJobAnalytics: async (): Promise<AnalyticsData> => {
    const response = await makeRequest('/analytics/jobs');
    return response.json();
  },

  getUserAnalytics: async (): Promise<AnalyticsData> => {
    const response = await makeRequest('/analytics/user');
    return response.json();
  }
};

// Legacy functions for backward compatibility
export const fetchJobs = async (): Promise<Job[]> => {
  const { jobs } = await jobsAPI.fetchJobs();
  return jobs;
};

export const fetchJobById = async (id: string): Promise<Job | null> => {
  try {
    return await jobsAPI.fetchJobById(id);
  } catch (error) {
    logger.apiError('/jobs/:id (fetchJob)', error);
    return null;
  }
};

export const searchJobs = async (filters: JobFilter): Promise<Job[]> => {
  return await searchAPI.searchJobs(filters);
};

// Utility function for handling API responses with better error handling
export const handleAPIResponse = async <T>(apiCall: () => Promise<T>): Promise<{ data?: T; error?: APIError }> => {
  try {
    const data = await apiCall();
    return { data };
  } catch (error) {
    logger.error('API Error in handleAPIResponse', error);
    return { error: error as APIError };
  }
};

// Enhanced job application with better error handling
export const applyToJob = async (jobId: string, applicationData: {
  name: string;
  email: string;
  resume: File | null;
}): Promise<{ success: boolean; error?: string; applicationId?: string }> => {
  try {
    const result = await applicationsAPI.applyToJob(jobId, {
      coverLetter: `Application from ${applicationData.name} (${applicationData.email})`,
      resumeUrl: applicationData.resume ? URL.createObjectURL(applicationData.resume) : undefined,
    });
    return { success: true, applicationId: result.applicationId };
  } catch (error) {
    logger.apiError('/applications (applyToJob)', error);
    const apiError = error as APIError;
    return { success: false, error: apiError.message };
  }
};

// Enhanced API functions with better error handling
export const enhancedAPI = {
  // Get notifications with unread count
  getNotificationsWithCount: async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
    const response = await makeRequest('/notifications');
    const data = await response.json();
    const notifications = Array.isArray(data) ? data : data.notifications || [];
    const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
    return { notifications, unreadCount };
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async (): Promise<{ success: boolean }> => {
    const response = await makeRequest('/notifications/read-all', {
      method: 'PUT',
    });
    return response.json();
  },

  // Get user dashboard data
  getDashboardData: async (): Promise<{
    user: User;
    notifications: Notification[];
    recentApplications: Application[];
    savedJobs: Job[];
  }> => {
    const [user, notifications, applications, savedJobsResponse] = await Promise.all([
      authAPI.getCurrentUser(),
      notificationsAPI.getNotifications(),
      applicationsAPI.getUserApplications(),
      savedJobsAPI.getSavedJobs()
    ]);

    // Extract savedJobs array from the response
    const savedJobs = savedJobsResponse.savedJobs || savedJobsResponse || [];

    return {
      user,
      notifications,
      recentApplications: applications.slice(0, 5), // Get last 5 applications
      savedJobs
    };
  },

  // Search with advanced filters
  advancedJobSearch: async (filters: JobFilter & {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    jobs: Job[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await makeRequest(`/search/jobs?${queryParams.toString()}`);
    return response.json();
  }
};

// Resume Sections API
export const resumeSectionsAPI = {
  // Resume Overview
  getOverview: async () => {
    const response = await makeRequest('/resume-sections/overview');
    return response.json();
  },

  // Resume Headline
  getHeadline: async () => {
    const response = await makeRequest('/resume-sections/headline');
    return response.json();
  },
  updateHeadline: async (data: { headline: string }) => {
    const response = await makeRequest('/resume-sections/headline', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Skills
  getSkills: async () => {
    const response = await makeRequest('/resume-sections/skills');
    return response.json();
  },
  updateSkills: async (data: { skills: any[] }) => {
    const response = await makeRequest('/resume-sections/skills', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Employment
  getEmployment: async () => {
    const response = await makeRequest('/resume-sections/employment');
    return response.json();
  },
  updateEmployment: async (data: { employment: any[] }) => {
    const response = await makeRequest('/resume-sections/employment', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Education
  getEducation: async () => {
    const response = await makeRequest('/resume-sections/education');
    return response.json();
  },
  updateEducation: async (data: { education: any[] }) => {
    const response = await makeRequest('/resume-sections/education', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Projects
  getProjects: async () => {
    const response = await makeRequest('/resume-sections/projects');
    return response.json();
  },
  updateProjects: async (data: { projects: any[] }) => {
    const response = await makeRequest('/resume-sections/projects', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Profile Summary
  getProfileSummary: async () => {
    const response = await makeRequest('/resume-sections/profile-summary');
    return response.json();
  },
  updateProfileSummary: async (data: { summary: string }) => {
    const response = await makeRequest('/resume-sections/profile-summary', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Accomplishments
  getAccomplishments: async () => {
    const response = await makeRequest('/resume-sections/accomplishments');
    return response.json();
  },
  updateAccomplishments: async (data: { accomplishments: any[] }) => {
    const response = await makeRequest('/resume-sections/accomplishments', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Desired Career Profile
  getDesiredCareer: async () => {
    const response = await makeRequest('/resume-sections/desired-career');
    return response.json();
  },
  updateDesiredCareer: async (data: { careerProfile: any }) => {
    const response = await makeRequest('/resume-sections/desired-career', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

      // Personal Details
      getPersonalDetails: async () => {
        const response = await makeRequest('/resume-sections/personal-details');
        return response.json();
      },
      updatePersonalDetails: async (data: { personalDetails: any }) => {
        const response = await makeRequest('/resume-sections/personal-details', {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        return response.json();
      },

      // Generic CRUD operations
      createSectionItem: async (section: string, data: any) => {
        const response = await makeRequest(`/resume-sections/${section}`, {
          method: 'POST',
          body: JSON.stringify({ section, data })
        });
        return response.json();
      },
      deleteSectionItem: async (section: string, itemId: string) => {
        const response = await makeRequest(`/resume-sections/${section}/${itemId}`, {
          method: 'DELETE',
          body: JSON.stringify({ section })
        });
        return response.json();
      }
    };

// Export makeRequest function for use in other services
export { makeRequest };
