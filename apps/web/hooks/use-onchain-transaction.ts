'use client';

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useState } from 'react';

/**
 * Hook for executing onchain transactions using Reown wallet
 */
export function useOnchainTransaction() {
  const { address, isConnected, chain } = useAccount();
  const { open } = useAppKit();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const [loading, setLoading] = useState(false);

  const executeTransaction = async (
    endpoint: string,
    params: Record<string, any>
  ): Promise<{ hash?: string; error?: string }> => {
    if (!isConnected) {
      open();
      return { error: 'Please connect your wallet' };
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
      writeContract({
        address: data.transaction.to,
        abi: [], // ABI not needed for raw transactions
        functionName: '', // Not used for raw transactions
        args: [],
        value: data.transaction.value,
        data: data.transaction.data,
        gas: data.transaction.gas,
        gasPrice: data.transaction.gasPrice,
        maxFeePerGas: data.transaction.maxFeePerGas,
        maxPriorityFeePerGas: data.transaction.maxPriorityFeePerGas,
        nonce: data.transaction.nonce,
      });

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
    connect: () => open(),
  };
}

