import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '../types/user';
import { authAPI, usersAPI } from '../services/api';
import { logger } from '../utils/logger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Check if user is logged in and validate token
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Verify token is still valid by fetching current user
          const currentUser = await authAPI.getCurrentUser();
          
          // Auto-fix: If user is employer and missing companyName, try to set it
          if (currentUser.role === 'employer' && !currentUser.companyName) {
            try {
              logger.debug('Auto-fixing missing company name for employer', currentUser.email);
              
              // Determine company name based on email domain
              let companyName = 'My Company';
              if (currentUser.email && currentUser.email.includes('@')) {
                // Extract company name from email domain
                const domain = currentUser.email.split('@')[1];
                const domainParts = domain.split('.');
                companyName = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1) + ' Solutions';
              }
              
              const updatedUser = await usersAPI.updateProfile({ companyName });
              currentUser.companyName = updatedUser.companyName;
              localStorage.setItem('user', JSON.stringify(currentUser));
              logger.info('Company name auto-fixed', currentUser.companyName);
            } catch (error) {
              logger.error('Failed to auto-fix company name', error);
            }
          }
          
          setUser(currentUser);
        } catch (error: any) {
          logger.debug('Token validation failed', error);
          // Token is invalid, clear storage
          authAPI.logout();
          setUser(null);
          
          // If it's a 401 error, show a message to the user
          if (error.status === 401) {
            logger.info('Session expired, user needs to login again');
            setSessionExpired(true);
          }
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string, rememberMe?: boolean): Promise<boolean> => {
    try {
      const response = await authAPI.login({ email, password, rememberMe });
      
      if (response.token && response.user) {
        let userToStore = { ...response.user };
        
        // Auto-fix: If backend didn't return companyName for employer, try to set it
        if (userToStore.role === 'employer' && !userToStore.companyName) {
          try {
            logger.debug('Auto-fixing missing company name during login', userToStore.email);
            
            // Determine company name based on email domain
            let companyName = 'My Company';
            if (userToStore.email && userToStore.email.includes('@')) {
              // Extract company name from email domain
              const domain = userToStore.email.split('@')[1];
              const domainParts = domain.split('.');
              companyName = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1) + ' Solutions';
            }
            
            const updatedUser = await usersAPI.updateProfile({ companyName });
            userToStore.companyName = updatedUser.companyName;
            logger.info('Company name auto-fixed during login', userToStore.companyName);
          } catch (error) {
            logger.error('Failed to auto-fix company name during login', error);
          }
        }
        
        // Fallback: If still no companyName, try to get it from localStorage
        if (userToStore.role === 'employer' && !userToStore.companyName) {
          const storedCompanyName = localStorage.getItem('employerCompanyName');
          if (storedCompanyName) {
            userToStore.companyName = storedCompanyName;
            logger.debug('Added companyName from localStorage to user object during login', userToStore.companyName);
          }
        }
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userToStore));
        setUser(userToStore);
        return true;
      }
      
      return false;
    } catch (error: any) {
      logger.error('Login error', error);
      
      // Handle specific error cases
      if (error.status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      } else if (error.status === 403) {
        throw new Error('Account is disabled. Please contact support.');
      } else if (error.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      } else if (error.status === 0) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else if (error.message && error.message.includes('temporarily unavailable')) {
        throw new Error('Login service is temporarily unavailable. Please try registering a new account or contact support.');
      } else {
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
  };

  const loginWithOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await authAPI.verifyOTP(email, otp);
      
      if (response.success && response.token && response.user) {
        let userToStore = { ...response.user };
        
        // Auto-fix: If backend didn't return companyName for employer, try to set it
        if (userToStore.role === 'employer' && !userToStore.companyName) {
          try {
            logger.debug('Auto-fixing missing company name during OTP login', userToStore.email);
            
            // Determine company name based on email domain
            let companyName = 'My Company';
            if (userToStore.email && userToStore.email.includes('@')) {
              // Extract company name from email domain
              const domain = userToStore.email.split('@')[1];
              const domainParts = domain.split('.');
              companyName = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1) + ' Solutions';
            }
            
            const updatedUser = await usersAPI.updateProfile({ companyName });
            userToStore.companyName = updatedUser.companyName;
            logger.info('Company name auto-fixed during OTP login', userToStore.companyName);
          } catch (error) {
            logger.error('Failed to auto-fix company name during OTP login', error);
          }
        }
        
        // Fallback: If still no companyName, try to get it from localStorage
        if (userToStore.role === 'employer' && !userToStore.companyName) {
          const storedCompanyName = localStorage.getItem('employerCompanyName');
          if (storedCompanyName) {
            userToStore.companyName = storedCompanyName;
            logger.debug('Added companyName from localStorage to user object during OTP login', userToStore.companyName);
          }
        }
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userToStore));
        setUser(userToStore);
        return true;
      }
      
      return false;
    } catch (error: any) {
      logger.error('OTP login error', error);
      
      // Handle specific error cases
      if (error.status === 400) {
        throw new Error('Invalid or expired OTP. Please try again.');
      } else if (error.status === 404) {
        throw new Error('No account found with this email address.');
      } else if (error.status === 0) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'OTP verification failed. Please try again.');
      }
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole, additionalData: Partial<User> = {}, rememberMe?: boolean): Promise<boolean> => {
    try {
      const registrationData = {
        name,
        email,
        password,
        role,
        phone: additionalData.phone || undefined,
        companyName: additionalData.companyName,
        skills: additionalData.skills || undefined,
      };
      
      logger.debug('Registration data being sent', registrationData);
      
      const response = await authAPI.register(registrationData);
      
      logger.debug('Registration response received', response);

      if (response.token && response.user) {
        let userToStore = { ...response.user };
        
        // Frontend fix: If backend didn't return companyName for employer, add it manually
        if (role === 'employer' && additionalData.companyName && !userToStore.companyName) {
          userToStore.companyName = additionalData.companyName;
          logger.debug('Added companyName to user object', userToStore.companyName);
        }
        
        // Store company name separately for robustness
        if (role === 'employer' && additionalData.companyName) {
          localStorage.setItem('employerCompanyName', additionalData.companyName);
          logger.debug('Stored companyName in localStorage', additionalData.companyName);
        }
        
        logger.debug('User data from registration', userToStore);
        logger.debug('Company name in user data', userToStore.companyName);
        
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userToStore));
        setUser(userToStore);
        return true;
      }
      return false;
    } catch (error: any) {
      logger.error('Signup error', error);
      
      // Handle specific error cases
      if (error.status === 409) {
        throw new Error('Email already exists. Please try a different email.');
      } else if (error.status === 422) {
        throw new Error('Invalid input data. Please check your information.');
      } else if (error.status === 0) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setSessionExpired(false);
  };

  const handleSessionExpired = () => {
    logger.info('Handling session expiration');
    authAPI.logout();
    setUser(null);
    setSessionExpired(true);
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isEmployee = (): boolean => {
    return user?.role === 'employee';
  };

  const isEmployer = (): boolean => {
    return user?.role === 'employer';
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const value: AuthContextType = {
    user,
    login,
    loginWithOTP,
    signup,
    logout,
    isLoading,
    hasRole,
    isEmployee,
    isEmployer,
    isAdmin,
    sessionExpired,
    handleSessionExpired
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
