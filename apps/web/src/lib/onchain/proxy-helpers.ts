/**
 * Proxy detection helper functions for features 798-827
 * Utilities for proxy contract analysis and upgrade monitoring
 */

export function detectProxyType(bytecode: string): 'eip1967' | 'eip1822' | 'custom' | 'none' {
  if (bytecode.includes('0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc')) {
    return 'eip1967';
  }
  if (bytecode.includes('0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7')) {
    return 'eip1822';
  }
  if (bytecode.includes('0x5af43d82803e903d91602b57fd5bf3')) {
    return 'custom';
  }
  return 'none';
}

export function calculateProxyRisk(upgradeCount: number, hasUpgrade: boolean): number {
  let risk = 0;
  if (hasUpgrade) risk += 30;
  risk += Math.min(upgradeCount * 10, 50);
  return Math.min(risk, 100);
}

export function formatProxyStatus(isProxy: boolean, upgradeCount: number): string {
  if (!isProxy) return 'Not a proxy';
  if (upgradeCount === 0) return 'Proxy (no upgrades)';
  return `Proxy (${upgradeCount} upgrade${upgradeCount > 1 ? 's' : ''})`;
}

export function getProxyImplementationSlot(proxyType: string): string {
  if (proxyType === 'eip1967') {
    return '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
  }
  return '0x0000000000000000000000000000000000000000000000000000000000000000';
}

