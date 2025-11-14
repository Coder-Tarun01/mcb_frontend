export interface NotificationResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type {
  Job,
  MarketingHealth,
  NotificationLog,
  MarketingRunSummary,
  CSVUploadSummary,
  MarketingContact,
  MarketingPagination,
  FresherSubscriber,
} from '../services/notificationService';