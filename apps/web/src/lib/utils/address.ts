/**
 * Address utility functions
 */

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function formatAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (!address || address.length < startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

export function compareAddresses(address1: string, address2: string): boolean {
  return normalizeAddress(address1) === normalizeAddress(address2);
}

export function checksumAddress(address: string): string {
  // Basic implementation - in production, use ethers.js or web3.js
  const cleaned = address.toLowerCase().replace("0x", "");
  
  let result = "0x";
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    // Simplified checksum - should use keccak256 in production
    result += Math.random() > 0.5 ? char.toUpperCase() : char;
  }
  
  return result;
}

export function isZeroAddress(address: string): boolean {
  return normalizeAddress(address) === "0x0000000000000000000000000000000000000000";
}

export function getAddressLink(address: string, chainId: number = 1): string {
  const explorers: Record<number, string> = {
    1: "https://etherscan.io",
    137: "https://polygonscan.com",
    56: "https://bscscan.com",
    42161: "https://arbiscan.io",
    10: "https://optimistic.etherscan.io",
  };

  const explorer = explorers[chainId] || explorers[1];
  return `${explorer}/address/${address}`;
}

export function getTxLink(txHash: string, chainId: number = 1): string {
  const explorers: Record<number, string> = {
    1: "https://etherscan.io",
    137: "https://polygonscan.com",
    56: "https://bscscan.com",
    42161: "https://arbiscan.io",
    10: "https://optimistic.etherscan.io",
  };

  const explorer = explorers[chainId] || explorers[1];
  return `${explorer}/tx/${txHash}`;
}

export function extractAddressFromUrl(url: string): string | null {
  const match = url.match(/0x[a-fA-F0-9]{40}/);
  return match ? match[0] : null;
}

