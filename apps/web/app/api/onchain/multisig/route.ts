import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

// Gnosis Safe multisig ABI
const gnosisSafeAbi = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
      { name: 'operation', type: 'uint8' }, // 0=call, 1=delegatecall
      { name: 'safeTxGas', type: 'uint256' },
      { name: 'baseGas', type: 'uint256' },
      { name: 'gasPrice', type: 'uint256' },
      { name: 'gasToken', type: 'address' },
      { name: 'refundReceiver', type: 'address' },
      { name: 'nonce', type: 'uint256' },
    ],
    name: 'execTransaction',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
      { name: 'operation', type: 'uint8' },
      { name: 'safeTxGas', type: 'uint256' },
      { name: 'baseGas', type: 'uint256' },
      { name: 'gasPrice', type: 'uint256' },
      { name: 'gasToken', type: 'address' },
      { name: 'refundReceiver', type: 'address' },
      { name: 'nonce', type: 'uint256' },
    ],
    name: 'encodeTransactionData',
    outputs: [{ name: '', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      safeAddress,
      to,
      value = '0',
      data = '0x',
      operation = 0, // 0=call, 1=delegatecall
      chainId,
      nonce,
    } = body;

    if (!safeAddress || !to || !chainId || nonce === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: safeAddress, to, chainId, nonce' },
        { status: 400 }
      );
    }

    const chain = chains[chainId as keyof typeof chains];
    if (!chain) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}` },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    // Prepare transaction data for multisig
    // Note: This prepares the transaction, but actual execution requires signatures
    const transactionData = {
      to: to as Address,
      value: BigInt(value),
      data: data as `0x${string}`,
      operation: operation as 0 | 1,
      safeTxGas: BigInt(0),
      baseGas: BigInt(0),
      gasPrice: BigInt(0),
      gasToken: '0x0000000000000000000000000000000000000000' as Address,
      refundReceiver: '0x0000000000000000000000000000000000000000' as Address,
      nonce: BigInt(nonce),
    };

    // Encode transaction data (for signing)
    const encodedData = await publicClient.readContract({
      address: safeAddress as Address,
      abi: gnosisSafeAbi,
      functionName: 'encodeTransactionData',
      args: [
        transactionData.to,
        transactionData.value,
        transactionData.data,
        transactionData.operation,
        transactionData.safeTxGas,
        transactionData.baseGas,
        transactionData.gasPrice,
        transactionData.gasToken,
        transactionData.refundReceiver,
        transactionData.nonce,
      ],
    });

    return NextResponse.json({
      success: true,
      safeAddress,
      transaction: {
        to: transactionData.to,
        value: transactionData.value.toString(),
        data: transactionData.data,
        operation,
      },
      encodedData,
      nonce: nonce.toString(),
      chainId,
      type: 'multisig_transaction',
      message: `Prepare multisig transaction from ${safeAddress} to ${to}`,
      note: 'This transaction requires signatures from multiple owners. Use Gnosis Safe SDK to collect signatures and execute.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare multisig transaction' },
      { status: 500 }
    );
  }
}

