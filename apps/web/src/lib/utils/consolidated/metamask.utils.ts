/**
 * MetaMask Utilities
 */

export async function isMetaMaskInstalled(): Promise<boolean> {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

export async function requestAccounts(): Promise<string[]> {
  if (!await isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  return accounts;
}

export async function switchChain(chainId: number): Promise<void> {
  if (!await isMetaMaskInstalled()) return;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      throw new Error('Chain not added to MetaMask');
    }
    throw error;
  }
}

