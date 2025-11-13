/**
 * Structured logging utility
 * Provides consistent logging across the application
 */

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log entry structure
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Logger class
 * Provides structured logging with context
 */
class Logger {
  private context: Record<string, unknown> = {};
  private minLevel: LogLevel = LogLevel.INFO;

  constructor() {
    this.setMinLevel(this.getEnvironmentLogLevel());
  }

  /**
   * Set minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Add persistent context to all logs
   */
  addContext(context: Record<string, unknown>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear persistent context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const logContext = {
      ...context,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };
    this.log(LogLevel.ERROR, message, logContext);
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...context },
    };

    this.output(entry);
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentIndex = levels.indexOf(this.minLevel);
    const logIndex = levels.indexOf(level);
    return logIndex >= currentIndex;
  }

  /**
   * Output log entry
   */
  private output(entry: LogEntry): void {
    const formattedMessage = this.formatMessage(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.log(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }

    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry);
    }
  }

  /**
   * Format log message
   */
  private formatMessage(entry: LogEntry): string {
    if (process.env.NODE_ENV === 'development') {
      // Pretty print for development
      return JSON.stringify(entry, null, 2);
    }

    // Compact JSON for production
    return JSON.stringify(entry);
  }

  /**
   * Send log to external logging service
   */
  private sendToLoggingService(entry: LogEntry): void {
    // Implement integration with logging service
    // Examples: DataDog, LogRocket, Papertrail, CloudWatch
    // This is a placeholder for production logging
  }

  /**
   * Get log level from environment
   */
  private getEnvironmentLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();

    switch (envLevel) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();

/**
 * Create child logger with additional context
 * 
 * @param context - Context to add to all logs from this logger
 * @returns New logger instance with context
 * 
 * @example
 * ```typescript
 * const apiLogger = createLogger({ service: 'api', endpoint: '/airdrop-check' });
 * apiLogger.info('Processing request');
 * ```
 */
export function createLogger(context: Record<string, unknown>): Logger {
  const childLogger = new Logger();
  childLogger.addContext(context);
  return childLogger;
}

/**
 * Log API request
 * 
 * @example
 * ```typescript
 * logApiRequest(request, { endpoint: '/api/airdrops', method: 'GET' });
 * ```
 */
export function logApiRequest(
  request: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
  },
  context?: Record<string, unknown>
): void {
  logger.info('API Request', {
    method: request.method,
    url: request.url,
    ...context,
  });
}

/**
 * Log API response
 * 
 * @example
 * ```typescript
 * logApiResponse(response, { statusCode: 200, duration: 150 });
 * ```
 */
export function logApiResponse(
  response: {
    statusCode?: number;
    duration?: number;
  },
  context?: Record<string, unknown>
): void {
  logger.info('API Response', {
    statusCode: response.statusCode,
    duration: response.duration,
    ...context,
  });
}

/**
 * Log performance metric
 * 
 * @example
 * ```typescript
 * logPerformance('database_query', 250, { query: 'findMany' });
 * ```
 */
export function logPerformance(
  operation: string,
  durationMs: number,
  context?: Record<string, unknown>
): void {
  logger.info('Performance Metric', {
    operation,
    durationMs,
    ...context,
  });
}

/**
 * Log cache hit/miss
 * 
 * @example
 * ```typescript
 * logCacheAccess('airdrop-check:0x...', true);
 * ```
 */
export function logCacheAccess(key: string, hit: boolean, context?: Record<string, unknown>): void {
  logger.debug('Cache Access', {
    key,
    hit,
    ...context,
  });
}

/**
 * Log external API call
 * 
 * @example
 * ```typescript
 * logExternalApiCall('GoldRush', '/api/balances', 200, 350);
 * ```
 */
export function logExternalApiCall(
  service: string,
  endpoint: string,
  statusCode: number,
  durationMs: number,
  context?: Record<string, unknown>
): void {
  logger.info('External API Call', {
    service,
    endpoint,
    statusCode,
    durationMs,
    ...context,
  });
}

