'use client';

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useState } from 'react';

/**
 * Hook for executing onchain transactions using Reown wallet
 * All transactions require Reown Wallet connection via @reown/appkit
 */
export function useOnchainTransaction() {
  const { address, isConnected, chain } = useAccount();
  const { open } = useAppKit();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { sendTransaction } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const [loading, setLoading] = useState(false);

  const executeTransaction = async (
    endpoint: string,
    params: Record<string, any>
  ): Promise<{ hash?: string; error?: string }> => {
    if (!isConnected) {
      open(); // Open Reown Wallet connection modal
      return { error: 'Please connect your Reown wallet' };
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/onchain/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          from: address,
          chainId: chain?.id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        return { error: data.error || 'Failed to prepare transaction' };
      }

      // Execute transaction using Reown wallet via wagmi
      if (data.transaction.data) {
        // Contract call
        writeContract({
          address: data.transaction.to,
          abi: [], // ABI not needed for raw transactions
          functionName: '', // Not used for raw transactions
          args: [],
          value: data.transaction.value ? BigInt(data.transaction.value) : undefined,
          data: data.transaction.data as `0x${string}`,
          gas: data.transaction.gas ? BigInt(data.transaction.gas) : undefined,
          gasPrice: data.transaction.gasPrice ? BigInt(data.transaction.gasPrice) : undefined,
          maxFeePerGas: data.transaction.maxFeePerGas ? BigInt(data.transaction.maxFeePerGas) : undefined,
          maxPriorityFeePerGas: data.transaction.maxPriorityFeePerGas ? BigInt(data.transaction.maxPriorityFeePerGas) : undefined,
          nonce: data.transaction.nonce ? Number(data.transaction.nonce) : undefined,
        });
      } else {
        // Simple transfer
        sendTransaction({
          to: data.transaction.to,
          value: data.transaction.value ? BigInt(data.transaction.value) : BigInt(0),
        });
      }

      return { hash: hash };
    } catch (err: any) {
      return { error: err.message || 'Transaction failed' };
    } finally {
      setLoading(false);
    }
  };

  return {
    executeTransaction,
    hash,
    isPending: isPending || loading,
    isConfirming,
    isConfirmed,
    error,
    isConnected,
    address,
    chain,
    connect: () => open(), // Open Reown Wallet modal
  };
}

