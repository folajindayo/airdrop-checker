/**
 * Wallet Adapter
 */

export interface WalletAdapter {
  connect(): Promise<string>;
  disconnect(): Promise<void>;
  getAddress(): string | null;
  getChainId(): number | null;
  switchChain(chainId: number): Promise<void>;
}

export class MetaMaskAdapter implements WalletAdapter {
  private address: string | null = null;
  private chainId: number | null = null;

  async connect(): Promise<string> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not installed');
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    this.address = accounts[0];
    return this.address;
  }

  async disconnect(): Promise<void> {
    this.address = null;
    this.chainId = null;
  }

  getAddress(): string | null {
    return this.address;
  }

  getChainId(): number | null {
    return this.chainId;
  }

  async switchChain(chainId: number): Promise<void> {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    this.chainId = chainId;
  }
}

