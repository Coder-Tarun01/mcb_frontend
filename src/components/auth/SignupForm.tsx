import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Briefcase, Building2, RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, User } from '../../types/user';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signupSchema, SignupFormValues } from '../../utils/validation';
import toast from 'react-hot-toast';

const SignupForm: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Captcha state
  const [captchaText, setCaptchaText] = useState('');
  const [captchaUserAnswer, setCaptchaUserAnswer] = useState('');
  
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<SignupFormValues>({
    mode: 'onChange',
    resolver: yupResolver(signupSchema),
    defaultValues: { role: 'employee' }
  });

  // Generate text-based captcha
  const generateCaptcha = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 5; // 5 character captcha
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setCaptchaText(result);
    setCaptchaUserAnswer('');
  };

  // Generate captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const onSubmit = async (data: SignupFormValues) => {
    // Validate captcha first
    if (captchaUserAnswer.trim().toLowerCase() !== captchaText.toLowerCase()) {
      toast.error('Please enter the captcha text correctly');
      return;
    }

    setIsLoading(true);
    try {
      const additionalData: Partial<User> = {};
      const role = data.role as UserRole;
      if (role === 'employer') {
        additionalData.companyName = (data.companyName || '').trim();
      } else if (role === 'employee') {
        additionalData.skills = (data.skills || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }

      const success = await signup(
        data.name.trim(),
        data.email.trim().toLowerCase(),
        data.password,
        role,
        additionalData
      );

      if (success) {
        toast.success('Account created successfully');
        const redirectPath = role === 'employer' ? '/employer/dashboard' : '/dashboard';
        navigate(redirectPath);
      } else {
        toast.error('Registration failed. Please try again.');
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
        <p className="text-gray-600">Join thousands of job seekers and employers.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Full Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              placeholder="Enter your full name"
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`relative cursor-pointer ${watch('role') === 'employee' ? 'ring-2 ring-blue-500' : ''}`}>
              <input
                type="radio"
                {...register('role')}
                value="employee"
                className="sr-only"
              />
              <div className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                watch('role') === 'employee' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex flex-col items-center text-center">
                  <Briefcase className={`h-8 w-8 mb-2 ${
                    watch('role') === 'employee' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className={`font-semibold ${
                    watch('role') === 'employee' ? 'text-blue-900' : 'text-gray-700'
                  }`}>
                    Job Seeker
                  </span>
                  <span className={`text-sm ${
                    watch('role') === 'employee' ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    Looking for opportunities
                  </span>
                </div>
              </div>
            </label>
            
            <label className={`relative cursor-pointer ${watch('role') === 'employer' ? 'ring-2 ring-blue-500' : ''}`}>
              <input
                type="radio"
                {...register('role')}
                value="employer"
                className="sr-only"
              />
              <div className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                watch('role') === 'employer' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex flex-col items-center text-center">
                  <Building2 className={`h-8 w-8 mb-2 ${
                    watch('role') === 'employer' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className={`font-semibold ${
                    watch('role') === 'employer' ? 'text-blue-900' : 'text-gray-700'
                  }`}>
                    Employer
                  </span>
                  <span className={`text-sm ${
                    watch('role') === 'employer' ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    Hiring talent
                  </span>
                </div>
              </div>
            </label>
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message as string}</p>
          )}
        </div>

        {/* Company Name Field (for employers) */}
        {watch('role') === 'employer' && (
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="companyName"
                placeholder="Enter your company name"
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.companyName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                aria-invalid={!!errors.companyName}
                aria-describedby={errors.companyName ? 'company-error' : undefined}
                {...register('companyName')}
              />
            </div>
            {errors.companyName && (
              <p id="company-error" className="mt-1 text-sm text-red-600">{errors.companyName.message as string}</p>
            )}
          </div>
        )}

        {/* Skills Field (for employees) */}
        {watch('role') === 'employee' && (
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
              Skills (comma-separated)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="skills"
                placeholder="e.g., React, JavaScript, Python"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
                {...register('skills')}
              />
            </div>
          </div>
        )}

        {/* Password Field */}
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
              placeholder="Create a password"
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

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Confirm your password"
              className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Captcha Section */}
        <div>
          <label htmlFor="captcha" className="block text-sm font-medium text-gray-700 mb-2">
            Security Check
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <span className="text-sm text-gray-600">Enter the text you see:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-bold text-gray-800 bg-white px-3 py-1 rounded border">
                  {captchaText}
                </span>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Generate new captcha"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                id="captcha"
                placeholder="Enter the text above"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
                value={captchaUserAnswer}
                onChange={(e) => setCaptchaUserAnswer(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div>
          <div className="flex items-start">
            <input 
              type="checkbox" 
              id="acceptTerms"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1" 
              {...register('acceptTerms')}
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
              I agree to the{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600">Please accept the Terms and Privacy Policy</p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !isValid}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Create Account
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-500 font-semibold transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
