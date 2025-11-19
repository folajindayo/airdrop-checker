/**
 * Smart contract type definitions
 */

export interface ContractABI {
  name: string;
  type: "function" | "event" | "constructor" | "fallback" | "receive";
  inputs?: ABIParameter[];
  outputs?: ABIParameter[];
  stateMutability?: "pure" | "view" | "nonpayable" | "payable";
  anonymous?: boolean;
}

export interface ABIParameter {
  name: string;
  type: string;
  indexed?: boolean;
  components?: ABIParameter[];
  internalType?: string;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to: string | null;
  gasUsed: string;
  cumulativeGasUsed: string;
  contractAddress: string | null;
  logs: Log[];
  status: boolean;
}

export interface Log {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  data: string;
  gas: string;
  gasPrice: string;
  nonce: number;
  blockNumber?: number;
  blockHash?: string;
  transactionIndex?: number;
}

export interface Block {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  miner: string;
  gasLimit: string;
  gasUsed: string;
  transactions: string[] | Transaction[];
}

export interface ContractCall<T = any> {
  method: string;
  args: any[];
  options?: {
    from?: string;
    gas?: string;
    gasPrice?: string;
    value?: string;
  };
}

export interface ContractSendOptions {
  from: string;
  gas?: string;
  gasPrice?: string;
  value?: string;
  nonce?: number;
}

export type ContractEventFilter = {
  fromBlock?: number | "latest";
  toBlock?: number | "latest";
  address?: string | string[];
  topics?: (string | string[] | null)[];
};

