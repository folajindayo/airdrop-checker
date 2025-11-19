import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onchain/token-gas-war-detector/[address]
 * Detect gas war patterns in competitive transactions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const chainId = searchParams.get('chainId');

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const cacheKey = `onchain-gas-war:${normalizedAddress}:${chainId || 'all'}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    const targetChainId = chainId ? parseInt(chainId) : 1;

    const detection: any = {
      address: normalizedAddress,
      chainId: targetChainId,
      gasWarDetected: false,
      maxGasPrice: 0,
      avgGasPrice: 0,
      timestamp: Date.now(),
    };

    try {
      const response = await goldrushClient.get(
        `/v2/${targetChainId}/addresses/${normalizedAddress}/transactions/`,
        { 'quote-currency': 'USD' }
      );

      if (response.data?.items) {
        const transactions = response.data.items;
        const gasPrices: number[] = [];
        
        transactions.forEach((tx: any) => {
          if (tx.gas_price) {
            const gasPrice = parseFloat(tx.gas_price);
            gasPrices.push(gasPrice);
          }
        });
        
        if (gasPrices.length > 0) {
          detection.maxGasPrice = Math.max(...gasPrices);
          detection.avgGasPrice = gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length;
          detection.gasWarDetected = detection.maxGasPrice > 200 || detection.avgGasPrice > 150;
        }
      }
    } catch (error) {
      console.error('Error detecting gas wars:', error);
    }

    cache.set(cacheKey, detection, 5 * 60 * 1000);

    return NextResponse.json(detection);
  } catch (error) {
    console.error('Gas war detector error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect gas war patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}





