export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'job' | 'system' | 'reminder';
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  
  // Related data (when included)
  relatedId?: string; // ID of related job, application, etc.
  relatedType?: 'job' | 'application' | 'company';
}

export interface NotificationCreate {
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'job' | 'system' | 'reminder';
  relatedId?: string;
  relatedType?: 'job' | 'application' | 'company';
}

export interface NotificationUpdate {
  isRead?: boolean;
  title?: string;
  message?: string;
}
