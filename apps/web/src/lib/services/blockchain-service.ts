/**
 * @fileoverview Blockchain interaction service
 * Handles blockchain-specific operations and queries
 */

import { logger } from '../monitoring/logger';
import { CacheService } from './cache-service';
import { SUPPORTED_CHAINS } from '../constants/chains';

/**
 * Blockchain network interface
 */
export interface BlockchainNetwork {
  /** Chain ID */
  chainId: number;
  /** Chain name */
  name: string;
  /** RPC URL */
  rpcUrl: string;
  /** Explorer URL */
  explorerUrl: string;
  /** Native currency */
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  /** Is testnet */
  testnet: boolean;
}

/**
 * Transaction interface
 */
export interface Transaction {
  /** Transaction hash */
  hash: string;
  /** From address */
  from: string;
  /** To address */
  to: string | null;
  /** Value transferred */
  value: string;
  /** Gas used */
  gasUsed?: string;
  /** Gas price */
  gasPrice?: string;
  /** Block number */
  blockNumber: number;
  /** Block timestamp */
  timestamp: number;
  /** Transaction status */
  status: 'success' | 'failed' | 'pending';
  /** Contract address (for contract creation) */
  contractAddress?: string | null;
}

/**
 * Token balance interface
 */
export interface TokenBalance {
  /** Token contract address */
  contractAddress: string;
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** Token decimals */
  decimals: number;
  /** Balance in smallest unit */
  balance: string;
  /** Balance in human-readable format */
  balanceFormatted: string;
  /** USD value */
  usdValue?: number;
  /** Token logo URL */
  logoUrl?: string;
}

/**
 * Block interface
 */
export interface Block {
  /** Block number */
  number: number;
  /** Block hash */
  hash: string;
  /** Parent hash */
  parentHash: string;
  /** Timestamp */
  timestamp: number;
  /** Miner/validator address */
  miner: string;
  /** Gas used */
  gasUsed: string;
  /** Gas limit */
  gasLimit: string;
  /** Transaction count */
  transactionCount: number;
}

/**
 * Blockchain service class
 */
export class BlockchainService {
  private cache: CacheService;
  private networks: Map<number, BlockchainNetwork>;

  constructor() {
    this.cache = new CacheService({
      defaultTTL: 60, // 1 minute default cache
      maxSize: 1000,
    });

    // Initialize supported networks
    this.networks = new Map();
    SUPPORTED_CHAINS.forEach((chain) => {
      this.networks.set(chain.chainId, {
        chainId: chain.chainId,
        name: chain.name,
        rpcUrl: chain.rpcUrl,
        explorerUrl: chain.explorerUrl,
        nativeCurrency: chain.nativeCurrency,
        testnet: chain.testnet || false,
      });
    });
  }

  /**
   * Get network by chain ID
   */
  getNetwork(chainId: number): BlockchainNetwork | undefined {
    return this.networks.get(chainId);
  }

  /**
   * Get all supported networks
   */
  getAllNetworks(): BlockchainNetwork[] {
    return Array.from(this.networks.values());
  }

  /**
   * Get mainnet networks only
   */
  getMainnetNetworks(): BlockchainNetwork[] {
    return this.getAllNetworks().filter((network) => !network.testnet);
  }

  /**
   * Check if address is valid
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Check if transaction hash is valid
   */
  isValidTxHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }

  /**
   * Normalize address to checksum format
   */
  normalizeAddress(address: string): string {
    return address.toLowerCase();
  }

  /**
   * Get address transactions (mock implementation)
   */
  async getTransactions(
    address: string,
    chainId: number,
    options?: {
      startBlock?: number;
      endBlock?: number;
      limit?: number;
    }
  ): Promise<Transaction[]> {
    const cacheKey = `tx_${chainId}_${address}_${JSON.stringify(options || {})}`;

    return this.cache.get(cacheKey, async () => {
      logger.info('Fetching transactions', { address, chainId, options });

      // In production, this would call actual blockchain API
      // For now, return mock data
      return [];
    });
  }

  /**
   * Get token balances for address
   */
  async getTokenBalances(
    address: string,
    chainId: number
  ): Promise<TokenBalance[]> {
    const cacheKey = `balances_${chainId}_${address}`;

    return this.cache.get(cacheKey, async () => {
      logger.info('Fetching token balances', { address, chainId });

      // In production, this would call actual blockchain API
      return [];
    });
  }

  /**
   * Get native balance
   */
  async getNativeBalance(address: string, chainId: number): Promise<string> {
    const cacheKey = `native_balance_${chainId}_${address}`;

    return this.cache.get(cacheKey, async () => {
      logger.info('Fetching native balance', { address, chainId });

      // In production, this would call actual blockchain API
      return '0';
    });
  }

  /**
   * Get block by number
   */
  async getBlock(blockNumber: number, chainId: number): Promise<Block | null> {
    const cacheKey = `block_${chainId}_${blockNumber}`;

    return this.cache.get(
      cacheKey,
      async () => {
        logger.info('Fetching block', { blockNumber, chainId });

        // In production, this would call actual blockchain API
        return null;
      },
      300 // Cache blocks for 5 minutes
    );
  }

  /**
   * Get latest block number
   */
  async getLatestBlockNumber(chainId: number): Promise<number> {
    const cacheKey = `latest_block_${chainId}`;

    return this.cache.get(
      cacheKey,
      async () => {
        logger.info('Fetching latest block number', { chainId });

        // In production, this would call actual blockchain API
        return 0;
      },
      10 // Cache for 10 seconds
    );
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(
    txHash: string,
    chainId: number
  ): Promise<Transaction | null> {
    const cacheKey = `tx_${chainId}_${txHash}`;

    return this.cache.get(
      cacheKey,
      async () => {
        logger.info('Fetching transaction', { txHash, chainId });

        // In production, this would call actual blockchain API
        return null;
      },
      300 // Cache transactions for 5 minutes
    );
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(
    txHash: string,
    chainId: number
  ): Promise<any> {
    const cacheKey = `receipt_${chainId}_${txHash}`;

    return this.cache.get(cacheKey, async () => {
      logger.info('Fetching transaction receipt', { txHash, chainId });

      // In production, this would call actual blockchain API
      return null;
    });
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(
    from: string,
    to: string,
    value: string,
    chainId: number,
    data?: string
  ): Promise<string> {
    logger.info('Estimating gas', { from, to, value, chainId });

    // In production, this would call actual blockchain API
    return '21000'; // Default gas limit for ETH transfer
  }

  /**
   * Get gas price
   */
  async getGasPrice(chainId: number): Promise<string> {
    const cacheKey = `gas_price_${chainId}`;

    return this.cache.get(
      cacheKey,
      async () => {
        logger.info('Fetching gas price', { chainId });

        // In production, this would call actual blockchain API
        return '0';
      },
      30 // Cache for 30 seconds
    );
  }

  /**
   * Get EIP-1559 fee data
   */
  async getFeeData(chainId: number): Promise<{
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    gasPrice: string;
  }> {
    const cacheKey = `fee_data_${chainId}`;

    return this.cache.get(
      cacheKey,
      async () => {
        logger.info('Fetching fee data', { chainId });

        // In production, this would call actual blockchain API
        return {
          maxFeePerGas: '0',
          maxPriorityFeePerGas: '0',
          gasPrice: '0',
        };
      },
      30 // Cache for 30 seconds
    );
  }

  /**
   * Decode contract call data
   */
  decodeCallData(data: string): {
    method: string;
    params: any[];
  } | null {
    try {
      // In production, this would use ABI decoder
      if (data.length < 10) return null;

      const methodSignature = data.slice(0, 10);
      const params = data.slice(10);

      return {
        method: methodSignature,
        params: [], // Would decode params in production
      };
    } catch (error) {
      logger.error('Error decoding call data', { error, data });
      return null;
    }
  }

  /**
   * Get contract code
   */
  async getCode(address: string, chainId: number): Promise<string> {
    const cacheKey = `code_${chainId}_${address}`;

    return this.cache.get(
      cacheKey,
      async () => {
        logger.info('Fetching contract code', { address, chainId });

        // In production, this would call actual blockchain API
        return '0x';
      },
      3600 // Cache contract code for 1 hour
    );
  }

  /**
   * Check if address is contract
   */
  async isContract(address: string, chainId: number): Promise<boolean> {
    const code = await this.getCode(address, chainId);
    return code !== '0x' && code.length > 2;
  }

  /**
   * Get explorer URL for address
   */
  getExplorerAddressUrl(address: string, chainId: number): string | null {
    const network = this.getNetwork(chainId);
    if (!network) return null;

    return `${network.explorerUrl}/address/${address}`;
  }

  /**
   * Get explorer URL for transaction
   */
  getExplorerTxUrl(txHash: string, chainId: number): string | null {
    const network = this.getNetwork(chainId);
    if (!network) return null;

    return `${network.explorerUrl}/tx/${txHash}`;
  }

  /**
   * Get explorer URL for block
   */
  getExplorerBlockUrl(blockNumber: number, chainId: number): string | null {
    const network = this.getNetwork(chainId);
    if (!network) return null;

    return `${network.explorerUrl}/block/${blockNumber}`;
  }

  /**
   * Format wei to ether
   */
  formatWeiToEther(wei: string, decimals: number = 18): string {
    try {
      const value = BigInt(wei);
      const divisor = BigInt(10 ** decimals);
      const ether = Number(value) / Number(divisor);
      return ether.toFixed(decimals);
    } catch {
      return '0';
    }
  }

  /**
   * Format ether to wei
   */
  formatEtherToWei(ether: string, decimals: number = 18): string {
    try {
      const value = parseFloat(ether);
      const multiplier = BigInt(10 ** decimals);
      const wei = BigInt(Math.floor(value * 10 ** decimals));
      return wei.toString();
    } catch {
      return '0';
    }
  }

  /**
   * Clear cache for specific address
   */
  clearAddressCache(address: string): void {
    const pattern = new RegExp(`_${address}(_|$)`);
    this.cache.clear(pattern);
  }

  /**
   * Clear cache for specific chain
   */
  clearChainCache(chainId: number): void {
    const pattern = new RegExp(`^\\w+_${chainId}_`);
    this.cache.clear(pattern);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();

