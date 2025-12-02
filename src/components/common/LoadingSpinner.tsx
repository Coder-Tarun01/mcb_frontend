/**
 * Standardized loading spinner component
 * Provides consistent loading states across the application
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingSpinnerProps {
  /** Size of the spinner - 'small', 'medium', or 'large' */
  size?: 'small' | 'medium' | 'large';
  /** Optional message to display below the spinner */
  message?: string;
  /** Whether to show full page overlay */
  fullPage?: boolean;
  /** Custom className for styling */
  className?: string;
}

const sizeClasses = {
  small: 'w-6 h-6 border-2',
  medium: 'w-12 h-12 border-4',
  large: 'w-16 h-16 border-4',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  fullPage = false,
  className = '',
}) => {
  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-gray-200 border-t-blue-500 rounded-full animate-spin`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      />
      {message && (
        <motion.p
          className="text-gray-500 text-base m-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;

