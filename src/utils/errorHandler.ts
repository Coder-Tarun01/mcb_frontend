/**
 * Centralized error handling utility
 * Provides consistent error messages and handling patterns
 */

import { logger } from './logger';

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  retryable?: boolean;
  userMessage: string;
}

/**
 * Converts various error types to a standardized AppError
 */
export function normalizeError(error: any): AppError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Network request failed',
      code: 'NETWORK_ERROR',
      status: 0,
      retryable: true,
      userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
    };
  }

  // API errors with status codes
  if (error.status) {
    const status = error.status;
    const errorMessage = error.message || 'An error occurred';
    
    switch (status) {
      case 401:
        return {
          message: errorMessage,
          code: error.code || 'UNAUTHORIZED',
          status: 401,
          retryable: false,
          userMessage: error.code === 'TOKEN_EXPIRED' 
            ? 'Your session has expired. Please log in again.'
            : 'Authentication required. Please log in.',
        };
      
      case 403:
        return {
          message: errorMessage,
          code: 'FORBIDDEN',
          status: 403,
          retryable: false,
          userMessage: 'You do not have permission to perform this action.',
        };
      
      case 404:
        return {
          message: errorMessage,
          code: 'NOT_FOUND',
          status: 404,
          retryable: false,
          userMessage: 'The requested resource was not found.',
        };
      
      case 422:
        return {
          message: errorMessage,
          code: 'VALIDATION_ERROR',
          status: 422,
          retryable: false,
          userMessage: errorMessage || 'Please check your input and try again.',
        };
      
      case 429:
        return {
          message: errorMessage,
          code: 'RATE_LIMIT',
          status: 429,
          retryable: true,
          userMessage: 'Too many requests. Please wait a moment and try again.',
        };
      
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: errorMessage,
          code: 'SERVER_ERROR',
          status: status,
          retryable: true,
          userMessage: 'Server error. Please try again later.',
        };
      
      default:
        return {
          message: errorMessage,
          code: 'HTTP_ERROR',
          status: status,
          retryable: status >= 500,
          userMessage: errorMessage || 'An error occurred. Please try again.',
        };
    }
  }

  // Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      code: (error as any).code,
      retryable: false,
      userMessage: error.message || 'An unexpected error occurred. Please try again.',
    };
  }

  // String errors
  if (typeof error === 'string') {
    return {
      message: error,
      retryable: false,
      userMessage: error,
    };
  }

  // Unknown error format
  logger.error('Unknown error format', error);
  return {
    message: 'Unknown error',
    code: 'UNKNOWN_ERROR',
    retryable: false,
    userMessage: 'An unexpected error occurred. Please try again.',
  };
}

/**
 * Handles errors with logging and returns user-friendly message
 */
export function handleError(error: any, context?: string): string {
  const normalizedError = normalizeError(error);
  
  if (context) {
    logger.error(`Error in ${context}`, error);
  } else {
    logger.error('Error occurred', error);
  }
  
  return normalizedError.userMessage;
}

/**
 * Checks if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  const normalizedError = normalizeError(error);
  return normalizedError.retryable || false;
}

/**
 * Gets error code for programmatic handling
 */
export function getErrorCode(error: any): string | undefined {
  const normalizedError = normalizeError(error);
  return normalizedError.code;
}

