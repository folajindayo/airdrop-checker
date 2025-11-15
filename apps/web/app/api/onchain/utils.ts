// Onchain utility functions
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function formatGwei(wei: bigint): string {
  return (Number(wei) / 1e9).toFixed(2);
}

export function calculatePriceImpact(amountIn: number, amountOut: number): number {
  return ((amountOut / amountIn - 1) * 100);
}

export function isHighGas(gasPriceGwei: number): boolean {
  return gasPriceGwei > 100;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

