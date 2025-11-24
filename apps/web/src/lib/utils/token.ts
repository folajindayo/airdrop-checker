/**
 * Token utility functions
 */

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
}

export function formatTokenAmount(
  amount: string | number | bigint,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  const value = typeof amount === "bigint" ? amount : BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;

  if (fractionalPart === 0n) {
    return integerPart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
  const trimmed = fractionalStr.slice(0, displayDecimals).replace(/0+$/, "");

  if (!trimmed) {
    return integerPart.toString();
  }

  return `${integerPart}.${trimmed}`;
}

export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  const [integer, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(integer + paddedFraction);
}

export function formatTokenBalance(
  balance: string | number | bigint,
  symbol: string,
  decimals: number = 18
): string {
  const formatted = formatTokenAmount(balance, decimals);
  return `${formatted} ${symbol}`;
}

export function compareTokenAmounts(
  a: bigint,
  b: bigint
): -1 | 0 | 1 {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function addTokenAmounts(...amounts: bigint[]): bigint {
  return amounts.reduce((sum, amount) => sum + amount, 0n);
}

export function subtractTokenAmounts(a: bigint, b: bigint): bigint {
  return a - b;
}

export function multiplyTokenAmount(amount: bigint, multiplier: number): bigint {
  return amount * BigInt(Math.floor(multiplier * 1000)) / 1000n;
}

export function divideTokenAmount(amount: bigint, divisor: number): bigint {
  return amount / BigInt(Math.floor(divisor));
}

export function isValidTokenAmount(amount: string): boolean {
  return /^\d+(\.\d+)?$/.test(amount);
}

export function normalizeTokenSymbol(symbol: string): string {
  return symbol.toUpperCase().trim();
}

export function getTokenLogo(symbol: string): string {
  const normalized = normalizeTokenSymbol(symbol);
  return `/tokens/${normalized}.svg`;
}

