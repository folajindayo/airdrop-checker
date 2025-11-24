export interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  connected: boolean;
}

export interface WalletTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  status: "pending" | "confirmed" | "failed";
}

export class WalletService {
  async connectWallet(): Promise<WalletInfo> {
    // Mock implementation - in real app, use web3 provider
    return {
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
      balance: `${(Math.random() * 10).toFixed(4)} ETH`,
      chainId: 1,
      connected: true,
    };
  }

  async disconnectWallet(): Promise<void> {
    // Mock implementation
    console.log("Wallet disconnected");
  }

  async getBalance(address: string): Promise<string> {
    // Mock implementation
    return `${(Math.random() * 10).toFixed(4)} ETH`;
  }

  async getTransactions(address: string, limit: number = 10): Promise<WalletTransaction[]> {
    // Mock implementation
    return Array.from({ length: limit }, (_, i) => ({
      hash: `0x${Math.random().toString(16).slice(2)}`,
      from: i % 2 === 0 ? address : `0x${Math.random().toString(16).slice(2, 42)}`,
      to: i % 2 === 0 ? `0x${Math.random().toString(16).slice(2, 42)}` : address,
      value: `${(Math.random() * 5).toFixed(4)} ETH`,
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      status: "confirmed",
    }));
  }

  async switchNetwork(chainId: number): Promise<boolean> {
    // Mock implementation
    console.log(`Switching to chain ${chainId}`);
    return true;
  }

  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}

export const walletService = new WalletService();

