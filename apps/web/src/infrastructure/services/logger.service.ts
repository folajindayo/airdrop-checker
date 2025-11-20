/**
 * Logger Service
 * Structured logging service with levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LoggerConfig {
  level?: LogLevel;
  prefix?: string;
  enabled?: boolean;
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export class LoggerService {
  private config: Required<LoggerConfig>;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: config.level ?? LogLevel.INFO,
      prefix: config.prefix ?? '',
      enabled: config.enabled ?? true,
    };
  }

  /**
   * Debug level log
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info level log
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warn level log
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Error level log
   */
  error(message: string, error?: Error | Record<string, any>): void {
    const context = error instanceof Error
      ? { error: error.message, stack: error.stack }
      : error;
    
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Core log method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.config.enabled || level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      level: LogLevel[level],
      message: this.formatMessage(message),
      timestamp: new Date(),
      context,
    };

    this.logs.push(entry);
    
    // Trim logs if exceeding max size
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    this.output(entry);
  }

  /**
   * Format log message
   */
  private formatMessage(message: string): string {
    return this.config.prefix ? `[${this.config.prefix}] ${message}` : message;
  }

  /**
   * Output log entry
   */
  private output(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const message = `[${timestamp}] [${entry.level}] ${entry.message}${contextStr}`;

    switch (entry.level) {
      case 'ERROR':
        console.error(message);
        break;
      case 'WARN':
        console.warn(message);
        break;
      case 'INFO':
        console.info(message);
        break;
      case 'DEBUG':
        console.debug(message);
        break;
    }
  }

  /**
   * Get recent logs
   */
  getLogs(limit?: number): LogEntry[] {
    return limit ? this.logs.slice(-limit) : [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    const levelName = LogLevel[level];
    return this.logs.filter((log) => log.level === levelName);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const logger = new LoggerService();

