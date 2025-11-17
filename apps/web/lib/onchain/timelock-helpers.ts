/**
 * Timelock helper functions for features 798-827
 * Utilities for timelock queue management and delay calculations
 */

export function calculateTimelockExecutionTime(queuedAt: Date, delaySeconds: number): Date {
  return new Date(queuedAt.getTime() + delaySeconds * 1000);
}

export function getTimeRemaining(executionTime: Date): number {
  const now = Date.now();
  const execution = executionTime.getTime();
  return Math.max(0, Math.floor((execution - now) / 1000));
}

export function formatTimelockDelay(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export function isTimelockExecutable(executionTime: Date): boolean {
  return Date.now() >= executionTime.getTime();
}

export function getTimelockUrgency(timeRemaining: number, totalDelay: number): 'low' | 'medium' | 'high' {
  if (totalDelay === 0) return 'low';
  const ratio = timeRemaining / totalDelay;
  if (ratio < 0.1) return 'high';
  if (ratio < 0.5) return 'medium';
  return 'low';
}

