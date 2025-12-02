import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Smartphone, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoginFormValues, loginSchema } from '../../utils/validation';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { logger } from '../../utils/logger';

const LoginForm: React.FC = () => {
  const { login, loginWithOTP } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid }, watch } = useForm<LoginFormValues>({
    mode: 'onChange',
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const emailValue = watch('email');

  const clearErrors = () => {
    setEmailError('');
    setOtpError('');
    setEmailSuccess(false);
  };

  // Helper function to determine redirect path after login and handle external job auto-open
  const getRedirectPath = (userRole: string): string => {
    // Check for redirect query parameter first
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      // Only use redirect param for candidates (not employers)
      // This ensures employers always go to their dashboard
      if (userRole !== 'employer') {
        return decodeURIComponent(redirectParam);
      }
    }
    
    // Default behavior: redirect to appropriate dashboard based on role
    return userRole === 'employer' ? '/employer/dashboard' : '/dashboard';
  };

  // Note: We no longer auto-open external jobs after login.
  // User must click Apply button again on the job details page.

  const handleOTPLogin = async () => {
    // Clear previous errors
    setEmailError('');
    setOtpError('');
    setEmailSuccess(false);

    if (!emailValue || !emailValue.trim()) {
      setEmailError('Please enter your email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    logger.debug('OTP login triggered', { emailValue, otpSent });
    setIsLoading(true);
    
    try {
      if (!otpSent) {
        // Send OTP
        logger.debug('Sending OTP to', emailValue);
        const response = await authAPI.sendOTP(emailValue.trim().toLowerCase());
        logger.debug('OTP response', response);
        if (response.success) {
          setEmailSuccess(true);
          setOtpSent(true);
          toast.success('OTP sent successfully to your email');
        }
      } else {
        // Verify OTP
        if (!otpCode || otpCode.length !== 6) {
          setOtpError('Please enter the OTP sent to your email');
          return;
        }
        
        logger.debug('Verifying OTP', { emailValue, otpCode });
        const success = await loginWithOTP(emailValue.trim().toLowerCase(), otpCode);
        if (success) {
          toast.success('Login successful');
          // Get user from localStorage to determine redirect path
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const redirectPath = getRedirectPath(user.role || '');
          navigate(redirectPath);
                  }
      }
    } catch (error: any) {
      logger.error('OTP error', error);
      
      // Handle specific error cases with user-friendly messages
      if (error.status === 404 || error.message?.includes('not found') || error.message?.includes('No account found')) {
        setEmailError('This email is not registered. Please check your email or create an account first.');
      } else if (error.status === 400 && error.message?.includes('OTP')) {
        setOtpError('Invalid or expired OTP. Please request a new one.');
        setOtpCode(''); // Clear OTP input
      } else if (error.status === 429) {
        setEmailError('Please wait a few minutes before requesting another OTP.');
      } else if (error.status === 0 || error.message?.includes('network') || error.message?.includes('fetch')) {
        toast.error('Something went wrong. Please try again later.');
      } else {
        toast.error(error.message || 'Something went wrong. Please try again later.');
      }
      
      if (otpSent) {
        setOtpCode(''); // Clear OTP input on error
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    logger.debug('Form submitted', { loginMethod, otpSent, values });
    setIsLoading(true);
    try {
      if (loginMethod === 'email') {
        // Traditional email/password login
        const success = await login(values.email.trim().toLowerCase(), values.password, values.rememberMe);
        if (success) {
          const expiryMessage = values.rememberMe ? 'Logged in successfully - you\'ll stay logged in for 30 days' : 'Logged in successfully';
          toast.success(expiryMessage);
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const redirectPath = getRedirectPath(user.role || '');
          navigate(redirectPath);
        } else {
          toast.error('Login failed. Please try again.');
        }
      } else {
        // OTP login
        if (!otpSent) {
          // Send OTP
          logger.debug('Sending OTP to', values.email);
          try {
            const response = await authAPI.sendOTP(values.email.trim().toLowerCase());
            logger.debug('OTP response', response);
            if (response.success) {
              toast.success('OTP sent successfully to your email');
              setOtpSent(true);
            }
          } catch (error: any) {
            logger.error('OTP send error', error);
            toast.error(error.message || 'Failed to send OTP. Please try again.');
          }
        } else {
          // Verify OTP
          if (!otpCode || otpCode.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
          }
          
          try {
            const response = await authAPI.verifyOTP(values.email.trim().toLowerCase(), otpCode);
            if (response.success) {
              // Store token and user data
              localStorage.setItem('token', response.token);
              localStorage.setItem('user', JSON.stringify(response.user));
              
              toast.success('Login successful');
              const redirectPath = getRedirectPath(response.user.role || '');
          navigate(redirectPath);
                        await handleExternalJobAfterLogin(redirectPath, response.user.role || '');
            }
          } catch (error: any) {
            toast.error(error.message || 'Invalid OTP. Please try again.');
            setOtpCode(''); // Clear OTP input on error
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
        <p className="text-gray-600">Welcome back! Please sign in to your account.</p>
      </div>

      {/* Login Method Toggle */}
      <div className="mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('email');
              setOtpSent(false);
              setOtpCode('');
              clearErrors();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all duration-200 ${
              loginMethod === 'email'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Mail size={18} />
            <span className="font-medium">Email & Password</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('otp');
              setOtpSent(false);
              setOtpCode('');
              clearErrors();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all duration-200 ${
              loginMethod === 'otp'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Smartphone size={18} />
            <span className="font-medium">OTP Login</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className={`h-5 w-5 ${emailError ? 'text-red-400' : emailSuccess ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                emailError ? 'border-red-300 bg-red-50' : 
                emailSuccess ? 'border-green-300 bg-green-50' :
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              aria-invalid={!!errors.email || !!emailError}
              aria-describedby={errors.email ? 'email-error' : emailError ? 'email-error-custom' : undefined}
              {...register('email')}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {emailSuccess && <CheckCircle className="h-5 w-5 text-green-400" />}
              {emailError && <XCircle className="h-5 w-5 text-red-400" />}
            </div>
          </div>
          <AnimatePresence>
            {(errors.email || emailError) && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                id={errors.email ? 'email-error' : 'email-error-custom'}
                className="mt-1 text-sm text-red-600 flex items-center gap-1"
              >
                <AlertCircle size={14} />
                {emailError || errors.email?.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Password Field (only for email login) */}
        {loginMethod === 'email' && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
                className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
        )}

        {/* OTP Field (only for OTP login) */}
        {loginMethod === 'otp' && otpSent && (
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Smartphone className={`h-5 w-5 ${otpError ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                id="otp"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => {
                  // Only allow numbers and limit to 6 digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpCode(value);
                  // Clear error when user starts typing
                  if (otpError) setOtpError('');
                }}
                className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center text-lg font-mono tracking-widest ${
                  otpError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                maxLength={6}
                autoComplete="one-time-code"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {otpError && <XCircle className="h-5 w-5 text-red-400" />}
              </div>
            </div>
            <AnimatePresence>
              {otpError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 text-sm text-red-600 flex items-center gap-1"
                >
                  <AlertCircle size={14} />
                  {otpError}
                </motion.p>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {emailSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mb-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle size={16} />
                    OTP sent successfully! Check your email for the 6-digit code.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Enter the 6-digit code sent to your email
              </p>
              <button
                type="button"
                onClick={async () => {
                  setOtpError('');
                  setOtpCode('');
                  try {
                    const response = await authAPI.sendOTP(emailValue || '');
                    if (response.success) {
                      toast.success('OTP resent successfully');
                    }
                  } catch (error: any) {
                    if (error.status === 404 || error.message?.includes('not found')) {
                      setEmailError('This email is not registered. Please check your email or create an account first.');
                    } else if (error.status === 429) {
                      setEmailError('Please wait a few minutes before requesting another OTP.');
                    } else {
                      toast.error(error.message || 'Failed to resend OTP');
                    }
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
                disabled={isLoading}
              >
                Resend OTP
              </button>
            </div>
          </div>
        )}

        {/* Remember Me & Forgot Password (only for email login) */}
        {loginMethod === 'email' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...register('rememberMe')}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          type={loginMethod === 'otp' ? 'button' : 'submit'}
          disabled={isLoading || (loginMethod === 'email' && !isValid) || (loginMethod === 'otp' && (!emailValue || !emailValue.trim()))}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={loginMethod === 'otp' ? handleOTPLogin : undefined}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {loginMethod === 'otp' 
                ? (otpSent ? 'Verify OTP' : 'Send OTP')
                : 'Sign In'
              }
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-500 font-semibold transition-colors"
          >
            Sign up here
          </Link>
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> If you're having trouble logging in, please try registering a new account instead.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
