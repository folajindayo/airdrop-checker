/**
 * Number Utility Functions
 * Comprehensive utilities for number manipulation and formatting
 */

/**
 * Format number with commas
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format as percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format large numbers (K, M, B, T)
 */
export function formatCompactNumber(num: number, decimals: number = 1): string {
  const absNum = Math.abs(num);
  
  if (absNum >= 1e12) return `${(num / 1e12).toFixed(decimals)}T`;
  if (absNum >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (absNum >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (absNum >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  
  return num.toString();
}

/**
 * Format file size
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}

/**
 * Round to decimal places
 */
export function round(num: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Clamp number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Check if number is in range
 */
export function inRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}

/**
 * Check if number is even
 */
export function isEven(num: number): boolean {
  return num % 2 === 0;
}

/**
 * Check if number is odd
 */
export function isOdd(num: number): boolean {
  return num % 2 !== 0;
}

/**
 * Check if number is positive
 */
export function isPositive(num: number): boolean {
  return num > 0;
}

/**
 * Check if number is negative
 */
export function isNegative(num: number): boolean {
  return num < 0;
}

/**
 * Generate random number between min and max
 */
export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random integer between min and max
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max + 1));
}

/**
 * Calculate percentage
 */
export function percentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Calculate percentage change
 */
export function percentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calculate average of numbers
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return sum(numbers) / numbers.length;
}

/**
 * Calculate sum of numbers
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0);
}

/**
 * Calculate median of numbers
 */
export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

/**
 * Find minimum value
 */
export function min(numbers: number[]): number {
  return Math.min(...numbers);
}

/**
 * Find maximum value
 */
export function max(numbers: number[]): number {
  return Math.max(...numbers);
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(numbers: number[]): number {
  const avg = average(numbers);
  const squaredDiffs = numbers.map((num) => Math.pow(num - avg, 2));
  const variance = average(squaredDiffs);
  return Math.sqrt(variance);
}

/**
 * Interpolate between two numbers
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Map number from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Check if number is integer
 */
export function isInteger(num: number): boolean {
  return Number.isInteger(num);
}

/**
 * Check if number is float
 */
export function isFloat(num: number): boolean {
  return Number.isFinite(num) && !Number.isInteger(num);
}

/**
 * Check if value is numeric
 */
export function isNumeric(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Convert to number safely
 */
export function toNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Parse integer safely
 */
export function parseInt(value: string, radix: number = 10, defaultValue: number = 0): number {
  const num = Number.parseInt(value, radix);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Parse float safely
 */
export function parseFloat(value: string, defaultValue: number = 0): number {
  const num = Number.parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Calculate factorial
 */
export function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}

/**
 * Calculate greatest common divisor
 */
export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Calculate least common multiple
 */
export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

/**
 * Check if number is prime
 */
export function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  
  return true;
}

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Calculate compound interest
 */
export function compoundInterest(
  principal: number,
  rate: number,
  time: number,
  frequency: number = 1
): number {
  return principal * Math.pow(1 + rate / frequency, frequency * time);
}

/**
 * Round up to nearest multiple
 */
export function roundUpToNearest(num: number, nearest: number): number {
  return Math.ceil(num / nearest) * nearest;
}

/**
 * Round down to nearest multiple
 */
export function roundDownToNearest(num: number, nearest: number): number {
  return Math.floor(num / nearest) * nearest;
}

/**
 * Calculate moving average
 */
export function movingAverage(numbers: number[], windowSize: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < numbers.length - windowSize + 1; i++) {
    const window = numbers.slice(i, i + windowSize);
    result.push(average(window));
  }
  
  return result;
}

/**
 * Normalize number to 0-1 range
 */
export function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

/**
 * Denormalize from 0-1 range
 */
export function denormalize(value: number, min: number, max: number): number {
  return value * (max - min) + min;
}

/**
 * Sign of number (-1, 0, or 1)
 */
export function sign(num: number): number {
  return Math.sign(num);
}

/**
 * Absolute value
 */
export function abs(num: number): number {
  return Math.abs(num);
}

/**
 * Floor value
 */
export function floor(num: number): number {
  return Math.floor(num);
}

/**
 * Ceiling value
 */
export function ceil(num: number): number {
  return Math.ceil(num);
}

/**
 * Truncate decimal places
 */
export function trunc(num: number): number {
  return Math.trunc(num);
}

