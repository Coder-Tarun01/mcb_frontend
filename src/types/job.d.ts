export interface Job {
  id: string;
  title: string;
  company: string;
  companyId?: string | null;
  location?: string | null;
  type?: string | null;
  category?: string | null;
  isRemote?: boolean | null;
  locationType?: string | null;
  description?: string | null;
  
  // Legacy fields for backward compatibility
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  experience?: {
    min: number;
    max: number;
  };
  jobType?: string; // Alias for type for backward compatibility
  experienceLevel?: string; // String version of experience
  requirements?: string[];
  skills?: string[];
  postedDate?: string;
  applicationDeadline?: string;
  companyLogo?: string;
  jobUrl?: string; // External job URL from API
  // Additional fields used by components
  rating?: number;
  applicantsCount?: number;
  isBookmarked?: boolean;
  isNew?: boolean;
}

export interface JobFilter {
  keyword?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experience?: string;
  jobType?: string;
  company?: string;
}
