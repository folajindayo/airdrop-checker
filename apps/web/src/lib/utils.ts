/**
 * General Utility Functions
 */

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

