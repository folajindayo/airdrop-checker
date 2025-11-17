/**
 * Validation helpers for new onchain features (738-767)
 * Ensures data integrity for Reown Wallet integrations
 */

export function validateAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function validateTokenAddress(address: string): boolean {
  return validateAddress(address);
}

export function validateChainId(chainId: number): boolean {
  const supportedChains = [1, 8453, 42161, 10, 137];
  return supportedChains.includes(chainId);
}

export function validateAmount(amount: string): boolean {
  const num = Number(amount);
  return !isNaN(num) && num >= 0;
}

export function sanitizeInput(input: string): string {
  return input.trim().toLowerCase();
}

export function validateMarketCap(marketCap: string): boolean {
  const num = Number(marketCap);
  return !isNaN(num) && num >= 0;
}

export function validateVolume(volume: string): boolean {
  const num = Number(volume);
  return !isNaN(num) && num >= 0;
}

export function validatePrice(price: string): boolean {
  const num = Number(price);
  return !isNaN(num) && num > 0;
}

export function validateSupply(supply: string): boolean {
  const num = Number(supply);
  return !isNaN(num) && num >= 0;
}

export function validatePercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}

