export interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  coverLetter?: string | null;
  resumeUrl?: string | null;
  appliedAt: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Related data (when included)
  job?: {
    id: string;
    title: string;
    company: string;
    location?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApplicationCreate {
  jobId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface ApplicationUpdate {
  status?: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  coverLetter?: string;
  resumeUrl?: string;
}
