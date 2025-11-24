import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

// ENS Reverse Registrar ABI
const ensReverseRegistrarAbi = [
  {
    inputs: [{ name: 'name', type: 'string' }],
    name: 'setName',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// ENS Reverse Registrar address on mainnet
const ENS_REVERSE_REGISTRAR = '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, ensName, chainId = 1 } = body;

    if (!address || !ensName) {
      return NextResponse.json(
        { error: 'Missing required fields: address, ensName' },
        { status: 400 }
      );
    }

    // ENS is only available on Ethereum mainnet
    if (chainId !== 1) {
      return NextResponse.json(
        { error: 'ENS reverse records are only available on Ethereum mainnet (chainId: 1)' },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    const transaction = {
      to: ENS_REVERSE_REGISTRAR as Address,
      data: publicClient.encodeFunctionData({
        abi: ensReverseRegistrarAbi,
        functionName: 'setName',
        args: [ensName],
      }),
    };

    return NextResponse.json({
      success: true,
      transaction,
      chainId: 1,
      address,
      ensName,
      reverseRegistrar: ENS_REVERSE_REGISTRAR,
      type: 'set_ens_name',
      message: `Set ENS reverse record for ${address} to ${ensName}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare ENS reverse record transaction' },
      { status: 500 }
    );
  }
}

