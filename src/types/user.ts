export type UserRole = 'employee' | 'employer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  phone?: string;
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  loginWithOTP: (email: string, otp: string) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    additionalData?: Partial<User>,
    rememberMe?: boolean
  ) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
  isEmployee: () => boolean;
  isEmployer: () => boolean;
  isAdmin: () => boolean;
  sessionExpired: boolean;
  handleSessionExpired: () => void;
}