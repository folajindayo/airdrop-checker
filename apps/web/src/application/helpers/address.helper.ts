/**
 * Address Helper Functions
 */

export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function compareAddresses(addr1: string, addr2: string): boolean {
  return addr1.toLowerCase() === addr2.toLowerCase();
}

export function checksumAddress(address: string): string {
  // Simplified checksum implementation
  return address.toLowerCase();
}

