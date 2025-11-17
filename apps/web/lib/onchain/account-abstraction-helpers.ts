/**
 * Account abstraction helper functions for features 798-827
 * Utilities for smart wallet detection and account abstraction analysis
 */

export function detectAccountType(bytecode: string | null): 'eoa' | 'smart_contract' | 'account_abstraction' {
  if (!bytecode || bytecode === '0x') return 'eoa';
  if (bytecode.includes('0x5af43d82803e903d91602b57fd5bf3')) {
    return 'account_abstraction';
  }
  return 'smart_contract';
}

export function isSmartWallet(bytecode: string | null): boolean {
  if (!bytecode || bytecode === '0x') return false;
  const patterns = [
    '0x5af43d82803e903d91602b57fd5bf3',
    '0x608060405234801561001057600080fd5b',
  ];
  return patterns.some(pattern => bytecode.includes(pattern));
}

export function calculateAccountAbstractionUsage(accounts: Array<{ type: string }>): {
  eoa: number;
  smartContract: number;
  accountAbstraction: number;
} {
  return accounts.reduce(
    (acc, account) => {
      if (account.type === 'eoa') acc.eoa++;
      else if (account.type === 'account_abstraction') acc.accountAbstraction++;
      else acc.smartContract++;
      return acc;
    },
    { eoa: 0, smartContract: 0, accountAbstraction: 0 }
  );
}

export function formatAccountType(type: string): string {
  switch (type) {
    case 'eoa':
      return 'EOA';
    case 'smart_contract':
      return 'Smart Contract';
    case 'account_abstraction':
      return 'Account Abstraction';
    default:
      return 'Unknown';
  }
}

