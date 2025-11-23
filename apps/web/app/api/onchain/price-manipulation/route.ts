import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { PriceManipulationRequest, PriceManipulation } from '@/lib/onchain/types';
import { calculateManipulationScore } from '@/lib/onchain/helpers';

export async function POST(request: NextRequest) {
  try {
    const body: PriceManipulationRequest = await request.json();
    const { tokenAddress, chainId, timeRange = 7 } = body;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: tokenAddress' },
        { status: 400 }
      );
    }

    // Detect price manipulation (simplified)
    const suspiciousEvents: PriceManipulation['suspiciousEvents'] = [];
    const manipulationScore = calculateManipulationScore(suspiciousEvents);
    const isManipulated = manipulationScore > 50;
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (manipulationScore > 70) riskLevel = 'high';
    else if (manipulationScore > 40) riskLevel = 'medium';

    const manipulation: PriceManipulation = {
      tokenAddress,
      isManipulated,
      manipulationScore,
      suspiciousEvents,
      riskLevel,
    };

    return NextResponse.json({
      success: true,
      ...manipulation,
      type: 'price-manipulation',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to detect price manipulation' },
      { status: 500 }
    );
  }
}

