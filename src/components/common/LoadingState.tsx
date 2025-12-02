/**
 * Standardized loading state component for pages
 * Provides consistent loading UI with optional empty state handling
 */

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export interface LoadingStateProps {
  /** Whether content is currently loading */
  loading: boolean;
  /** Whether to show empty state when not loading and no data */
  showEmpty?: boolean;
  /** Empty state configuration */
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    message: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  /** Children to render when not loading */
  children: React.ReactNode;
  /** Custom loading message */
  loadingMessage?: string;
  /** Custom empty state component */
  customEmptyState?: React.ReactNode;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  showEmpty = false,
  emptyState,
  children,
  loadingMessage,
  customEmptyState,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
        <LoadingSpinner size="medium" message={loadingMessage || 'Loading...'} />
      </div>
    );
  }

  if (showEmpty && (emptyState || customEmptyState)) {
    if (customEmptyState) {
      return <>{customEmptyState}</>;
    }

    if (emptyState) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          {emptyState.icon && (
            <div className="mb-4 text-gray-300">
              {emptyState.icon}
            </div>
          )}
          <h3 className="text-2xl font-bold text-gray-800 m-0 mb-2">
            {emptyState.title}
          </h3>
          <p className="text-gray-500 text-base m-0 mb-4">
            {emptyState.message}
          </p>
          {emptyState.action && (
            <button
              onClick={emptyState.action.onClick}
              className="py-3 px-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none rounded-lg text-15 font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
            >
              {emptyState.action.label}
            </button>
          )}
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default LoadingState;

