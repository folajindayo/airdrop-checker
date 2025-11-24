/**
 * Logger utility for structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private level: LogLevel = 'info';
  
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.format('DEBUG', message, context));
    }
  }
  
  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.format('INFO', message, context));
    }
  }
  
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('WARN', message, context));
    }
  }
  
  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog('error')) {
      console.error(this.format('ERROR', message, { ...context, error }));
    }
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
  
  private format(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level}: ${message}${contextStr}`;
  }
}

export const logger = new Logger();

