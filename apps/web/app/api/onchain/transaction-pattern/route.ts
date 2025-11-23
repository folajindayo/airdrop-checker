import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import type { TransactionPatternRequest, TransactionPattern } from '@/lib/onchain/types';
import { classifyTransactionPattern, calculateBehaviorScore } from '@/lib/onchain/helpers';

export async function POST(request: NextRequest) {
  try {
    const body: TransactionPatternRequest = await request.json();
    const { address, chainId, timeRange = 30 } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Missing required parameter: address' },
        { status: 400 }
      );
    }

    // Analyze transaction patterns (simplified)
    const characteristics = ['regular'];
    const patternType = classifyTransactionPattern(characteristics);
    
    const patterns = [{
      type: patternType,
      confidence: 85,
      characteristics,
    }];

    const behaviorScore = calculateBehaviorScore(patterns);
    const riskLevel = behaviorScore > 70 ? 'low' : behaviorScore > 40 ? 'medium' : 'high';

    const pattern: TransactionPattern = {
      address,
      patterns,
      behaviorScore,
      riskLevel,
    };

    return NextResponse.json({
      success: true,
      ...pattern,
      type: 'transaction-pattern',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze transaction patterns' },
      { status: 500 }
    );
  }
}

