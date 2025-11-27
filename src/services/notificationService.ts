import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL } from './api';

// Types
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  experience?: string;
  notifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  type: string;
  status: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface MarketingHealth {
  lastRunAt: string | null;
  lastBatchId: string | null;
  pendingJobsCount: number;
  failureRate24h: number;
  runs24h: number;
  failures24h: number;
}

export interface MarketingRunSummary {
  ok: boolean;
  skipped: boolean;
  reason?: string;
  batchId: string;
  startedAt: string;
  finishedAt: string;
  jobsQueried: number;
  jobsIncluded: number;
  contactsAttempted: number;
  contactsSucceeded: number;
  contactsFailed: number;
  errors?: Array<Record<string, unknown>>;
}

export interface CSVUploadSummary {
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors?: Array<{ row: number; email?: string; message: string }>;
}

export interface MarketingContact {
  id: number;
  fullName: string;
  email: string;
  mobileNo: string | null;
  branch: string | null;
  experience: string | null;
  telegramChatId: string | null;
  createdAt: string;
}

export interface MarketingPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FresherSubscriber {
  id: number;
  email: string;
  fullName: string;
  mobileNo: string | null;
  branch: string | null;
  experience: string | null;
  createdAt: string;
}

const API_URL = `${API_BASE_URL}/notifications`;

class NotificationService {
  private static instance: NotificationService;
  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: string;
      adminKey: string;
      marketingToken?: string;
      data?: any;
      params?: Record<string, any>;
      headers?: Record<string, string>;
    }
  ): Promise<T> {
    try {
      const { method = 'GET', adminKey, marketingToken, data, params, headers = {} } = options;
      const requestHeaders: Record<string, string> = {
        'X-Admin-Key': adminKey,
        ...headers,
      };

      if (marketingToken) {
        requestHeaders['X-Marketing-Token'] = marketingToken;
      }

      const response: AxiosResponse<T> = await axios({
        method,
        url: `${API_URL}${endpoint}`,
        headers: requestHeaders,
        data,
        params,
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // Fresher Jobs
  async fetchFresherJobs(params: { adminKey: string; includeNotified?: boolean }): Promise<{
    success: boolean;
    data: { jobs: Job[] };
    message?: string;
  }> {
    return this.request('/jobs/freshers', {
      adminKey: params.adminKey,
      params: { includeNotified: params.includeNotified },
    });
  }

  // Notification Logs
  async fetchLogs(adminKey: string, limit?: number): Promise<{
    success: boolean;
    data: { success: NotificationLog[]; failed: NotificationLog[] };
  }> {
    return this.request('/logs', {
      adminKey,
      params: { limit },
    });
  }

  // Marketing Health
  async fetchMarketingHealth(adminKey: string): Promise<{
    success: boolean;
    data: {
      last_run_at: string | null;
      last_batch_id: string | null;
      pending_jobs_count: number;
      failure_rate_24h: number;
      runs_24h: number;
      failures_24h: number;
    };
  }> {
    return this.request('/marketing/health', {
      adminKey,
      marketingToken: adminKey,
    });
  }

  async fetchMarketingContacts(params: {
    adminKey: string;
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
  }): Promise<{
    success: boolean;
    data: { contacts: MarketingContact[]; pagination: MarketingPagination };
    message?: string;
  }> {
    return this.request('/marketing/contacts', {
      adminKey: params.adminKey,
      params: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
      },
    });
  }

  async fetchAllMarketingContactIds(adminKey: string): Promise<{
    success: boolean;
    data: { ids: number[]; total: number };
  }> {
    return this.request('/marketing/contacts/all-ids', {
      adminKey,
    });
  }

  async fetchMarketingContactDetails(params: {
    adminKey: string;
    ids: number[];
  }): Promise<{
    success: boolean;
    data: { contacts: MarketingContact[]; count: number };
  }> {
    return this.request('/marketing/contacts/details', {
      method: 'POST',
      adminKey: params.adminKey,
      data: { ids: params.ids },
    });
  }

  async createMarketingContact(params: {
    adminKey: string;
    payload: {
      fullName: string;
      email: string;
      mobileNo?: string;
      branch?: string;
      experience?: string;
    };
  }): Promise<{
    success: boolean;
    data: MarketingContact;
    message?: string;
  }> {
    return this.request('/marketing/contacts', {
      method: 'POST',
      adminKey: params.adminKey,
      data: {
        fullName: params.payload.fullName,
        email: params.payload.email,
        mobileNo: params.payload.mobileNo,
        branch: params.payload.branch,
        experience: params.payload.experience,
      },
    });
  }

  async updateMarketingContact(params: {
    adminKey: string;
    contactId: number;
    payload: {
      fullName: string;
      email: string;
      mobileNo?: string;
      branch?: string;
      experience?: string;
    };
  }): Promise<{
    success: boolean;
    data: MarketingContact;
    message?: string;
  }> {
    return this.request(`/marketing/contacts/${params.contactId}`, {
      method: 'PUT',
      adminKey: params.adminKey,
      data: {
        fullName: params.payload.fullName,
        email: params.payload.email,
        mobileNo: params.payload.mobileNo,
        branch: params.payload.branch,
        experience: params.payload.experience,
      },
    });
  }

  async deleteMarketingContact(params: {
    adminKey: string;
    contactId: number;
  }): Promise<{
    success: boolean;
    data?: { id: number };
    message?: string;
  }> {
    return this.request(`/marketing/contacts/${params.contactId}`, {
      method: 'DELETE',
      adminKey: params.adminKey,
    });
  }

  async fetchFresherSubscribers(params: {
    adminKey: string;
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<{
    success: boolean;
    data: { subscribers: FresherSubscriber[]; pagination: MarketingPagination };
    message?: string;
  }> {
    return this.request('/subscribers', {
      adminKey: params.adminKey,
      params: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      },
    });
  }

  // Upload Subscribers CSV
  async uploadSubscribersCsv(file: File, adminKey: string): Promise<{
    success: boolean;
    data: CSVUploadSummary;
    message?: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/upload-csv', {
      method: 'POST',
      adminKey,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Trigger Marketing Digest
  async triggerMarketingDigest(params: {
    adminKey: string;
    force?: boolean;
    bulkMode?: 'default' | 'fresher' | string;
    dryRun?: boolean;
    contactLimit?: number;
    contactIds?: number[];
  }): Promise<{
    success: boolean;
    data: MarketingRunSummary;
    message?: string;
  }> {
    return this.request('/marketing/trigger', {
      method: 'POST',
      adminKey: params.adminKey,
      data: {
        force: params.force,
        bulkMode: params.bulkMode,
        dryRun: params.dryRun,
        contactLimit: params.contactLimit,
        contactIds: params.contactIds,
      },
    });
  }

  // Get Last Run Summary
  async fetchLastRunSummary(adminKey: string): Promise<{
    success: boolean;
    data: MarketingRunSummary | null;
    message?: string;
  }> {
    return this.request('/marketing/summary', {
      adminKey,
    });
  }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;