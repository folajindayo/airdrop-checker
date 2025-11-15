import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet } from 'viem/chains';

export const dynamic = 'force-dynamic';

const erc20Abi = [
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token1 = searchParams.get('token1');
    const token2 = searchParams.get('token2');

    if (!token1 || !token2) {
      return NextResponse.json(
        { error: 'Both token1 and token2 addresses required' },
        { status: 400 }
      );
    }

