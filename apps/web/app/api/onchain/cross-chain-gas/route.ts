import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';

export const dynamic = 'force-dynamic';

const supportedChains = [
  { id: 1, chain: mainnet, name: 'Ethereum' },
  { id: 8453, chain: base, name: 'Base' },
  { id: 42161, chain: arbitrum, name: 'Arbitrum' },
  { id: 10, chain: optimism, name: 'Optimism' },
  { id: 137, chain: polygon, name: 'Polygon' },
];

export async function GET(request: NextRequest) {
  try {
    const gasData = [];

    for (const chainInfo of supportedChains) {
      const client = createPublicClient({
        chain: chainInfo.chain,
        transport: http(),
      });


