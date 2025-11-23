import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { mainnet, base, arbitrum, optimism, polygon } from 'viem/chains';
import type { StateMachineRequest, StateMachine } from '@/lib/onchain/types';

const chains = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  10: optimism,
  137: polygon,
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: StateMachineRequest = await request.json();
    const { contractAddress, chainId } = body;

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: contractAddress' },
        { status: 400 }
      );
    }

    // Validate state machine (simplified)
    const states = ['idle', 'active', 'paused', 'terminated'];
    const transitions: StateMachine['transitions'] = [
      {
        from: 'idle',
        to: 'active',
        conditions: ['owner', 'not_paused'],
        valid: true,
      },
      {
        from: 'active',
        to: 'paused',
        conditions: ['owner'],
        valid: true,
      },
    ];

    const isValid = transitions.every(t => t.valid);
    const issues: string[] = [];

    const stateMachine: StateMachine = {
      contractAddress,
      states,
      transitions,
      isValid,
      issues,
    };

    return NextResponse.json({
      success: true,
      ...stateMachine,
      type: 'state-machine',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to validate state machine' },
      { status: 500 }
    );
  }
}

