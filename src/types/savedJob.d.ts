export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  savedAt: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Related job data (when included)
  job?: {
    id: string;
    title: string;
    company: string;
    location?: string;
    type?: string;
    category?: string;
    isRemote?: boolean;
    description?: string;
  };
}

export interface SavedJobCreate {
  jobId: string;
}
