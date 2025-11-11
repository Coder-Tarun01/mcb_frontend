export type UserRole = 'employee' | 'employer';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  skills?: string[] | null;
  resumeUrl?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  
  // Legacy fields for backward compatibility
  appliedJobs?: string[];
  profilePicture?: string;
  professionalTitle?: string;
  jobTitle?: string;
  languages?: string;
  age?: string;
  currentSalary?: string;
  expectedSalary?: string;
  description?: string;
  bio?: string;
  country?: string;
  postcode?: string;
  city?: string;
  location?: string;
  fullAddress?: string;
  address?: string;
  
  // Employer-specific fields
  companyName?: string;
  companyLogo?: string;
  companyDescription?: string;
  postedJobs?: string[];
  industry?: string;
  companySize?: string;
  foundedYear?: string;
  website?: string;
  
  // Employee-specific fields
  experience?: string;
  education?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithOTP: (email: string, otp: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: UserRole, additionalData?: Partial<User>) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
  isEmployee: () => boolean;
  isEmployer: () => boolean;
  sessionExpired: boolean;
  handleSessionExpired: () => void;
}
