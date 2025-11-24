/**
 * Blockchain utility functions
 * Helper functions for blockchain interactions
 */

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Truncate address for display
 */
export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format wei to ether
 */
export function formatWei(wei: string | number, decimals: number = 18): string {
  const weiNum = BigInt(wei);
  const divisor = BigInt(10 ** decimals);
  const result = Number(weiNum) / Number(divisor);

  return result.toFixed(Math.min(decimals, 6));
}

/**
 * Format ether to wei
 */
export function toWei(ether: string | number, decimals: number = 18): string {
  const etherNum = Number(ether);
  const multiplier = BigInt(10 ** decimals);
  const wei = BigInt(Math.floor(etherNum * Number(multiplier)));

  return wei.toString();
}

/**
 * Get block explorer URL
 */
export function getExplorerUrl(
  chainId: number,
  type: "address" | "tx" | "block",
  value: string
): string {
  const explorers: Record<number, string> = {
    1: "https://etherscan.io",
    5: "https://goerli.etherscan.io",
    137: "https://polygonscan.com",
    56: "https://bscscan.com",
    42161: "https://arbiscan.io",
  };

  const baseUrl = explorers[chainId] || explorers[1];

  switch (type) {
    case "address":
      return `${baseUrl}/address/${value}`;
    case "tx":
      return `${baseUrl}/tx/${value}`;
    case "block":
      return `${baseUrl}/block/${value}`;
    default:
      return baseUrl;
  }
}

/**
 * Get chain name from ID
 */
export function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: "Ethereum",
    5: "Goerli",
    137: "Polygon",
    56: "BSC",
    42161: "Arbitrum",
    10: "Optimism",
    8453: "Base",
  };

  return chains[chainId] || "Unknown";
}

/**
 * Check if address is contract
 */
export async function isContract(address: string, provider: any): Promise<boolean> {
  try {
    const code = await provider.getCode(address);
    return code !== "0x";
  } catch {
    return false;
  }
}

/**
 * Compare addresses (case-insensitive)
 */
export function addressesEqual(addr1: string, addr2: string): boolean {
  return addr1.toLowerCase() === addr2.toLowerCase();
}

/**
 * Checksum address
 */
export function checksumAddress(address: string): string {
  return address; // Basic implementation - real one would use keccak256
}

/**
 * Get network icon
 */
export function getChainIcon(chainId: number): string {
  const icons: Record<number, string> = {
    1: "⟠",
    137: "⬢",
    56: "⬡",
    42161: "🔷",
    10: "🔴",
    8453: "🔵",
  };

  return icons[chainId] || "⛓️";
}

