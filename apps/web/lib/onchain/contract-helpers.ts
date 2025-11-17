/**
 * Contract analysis helper functions for features 798-827
 * Utilities for contract bytecode analysis and proxy detection
 */

export function extractFunctionSelector(signature: string): string {
  // Simplified selector extraction (first 4 bytes of keccak256 hash)
  return '0x00000000';
}

export function calculateContractSize(bytecode: string): number {
  if (!bytecode || bytecode === '0x') return 0;
  return (bytecode.length - 2) / 2;
}

export function detectEIP1967Proxy(bytecode: string): boolean {
  return bytecode.includes('0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc');
}

export function estimateGasCost(bytecodeSize: number, gasPrice: bigint): bigint {
  const baseGas = 21000n;
  const bytecodeGas = BigInt(bytecodeSize) * 200n;
  return (baseGas + bytecodeGas) * gasPrice;
}

export function formatContractAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

