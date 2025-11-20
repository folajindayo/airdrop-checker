/**
 * Number Utilities
 */

export function truncate(num: number, decimals: number = 2): number {
  return Math.floor(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function percentage(value: number, total: number): number {
  return (value / total) * 100;
}

export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
