/**
 * Centralized logging utility
 * In production, logs are suppressed unless explicitly enabled
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isLoggingEnabled = process.env.REACT_APP_ENABLE_LOGGING === 'true';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    // Always log errors
    if (level === LogLevel.ERROR) return true;
    // Log in development or if explicitly enabled
    return isDevelopment || isLoggingEnabled;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: Error | any, ...args: any[]): void {
    // Always log errors, but format them properly
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(`[ERROR] ${message}`, errorMessage, errorStack ? `\n${errorStack}` : '', ...args);
    
    // In production, you might want to send errors to an error tracking service
    // Example: Sentry.captureException(error);
  }

  // Convenience method for API errors
  apiError(endpoint: string, error: any, ...args: any[]): void {
    this.error(`API Error [${endpoint}]`, error, ...args);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;

