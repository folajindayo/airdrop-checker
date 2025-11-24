/**
 * Number utility functions
 */

export function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toString();
}

export function formatPercent(value: number, decimals: number = 2): string {
  return (value * 100).toFixed(decimals) + "%";
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  decimals: number = 2
): string {
  const formatted = formatNumber(amount, decimals);
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };
  
  const symbol = symbols[currency] || currency;
  return `${symbol}${formatted}`;
}

export function parseNumber(str: string): number {
  const cleaned = str.replace(/[^0-9.-]/g, "");
  return parseFloat(cleaned) || 0;
}

export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function isEven(num: number): boolean {
  return num % 2 === 0;
}

export function isOdd(num: number): boolean {
  return num % 2 !== 0;
}

export function toOrdinal(num: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

export function roundTo(num: number, precision: number): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(num * multiplier) / multiplier;
}

export function floorTo(num: number, precision: number): number {
  const multiplier = Math.pow(10, precision);
  return Math.floor(num * multiplier) / multiplier;
}

export function ceilTo(num: number, precision: number): number {
  const multiplier = Math.pow(10, precision);
  return Math.ceil(num * multiplier) / multiplier;
}

export function inRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}

export function toFixedNumber(num: number, digits: number): number {
  return parseFloat(num.toFixed(digits));
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sumNumbers(...numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0);
}

export function averageNumbers(...numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return sumNumbers(...numbers) / numbers.length;
}

export function maxNumber(...numbers: number[]): number {
  return Math.max(...numbers);
}

export function minNumber(...numbers: number[]): number {
  return Math.min(...numbers);
}

export function isFiniteNumber(value: any): value is number {
  return typeof value === "number" && isFinite(value);
}

export function toNumber(value: any, fallback: number = 0): number {
  const num = Number(value);
  return isFiniteNumber(num) ? num : fallback;
}
