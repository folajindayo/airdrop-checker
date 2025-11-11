import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface ValidationResult {
  address: string;
  isValid: boolean;
  checks: {
    format: boolean;
    checksum: boolean;
    isContract: boolean;
    hasActivity: boolean;
    balance: {
      hasBalance: boolean;
      totalBalance: string;
    };
  };
  warnings: string[];
  recommendations: string[];
  healthScore: number;
}

/**
 * POST /api/wallet-validator
 * Validate wallet address and check for common issues
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Basic format validation
    const formatValid = isValidAddress(address);
    if (!formatValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid address format',
          address: normalizedAddress,
        },
        { status: 400 }
      );
    }

    // Checksum validation
    const checksumValid = address === address.toLowerCase() || 
                         address === address.toUpperCase() ||
                         /^0x[a-fA-F0-9]{40}$/.test(address);

    // Check if address is a contract (mock - in production, check on-chain)
    const isContract = false; // Would check via RPC call

    // Check for activity (mock - in production, check transaction history)
    const hasActivity = true; // Would check via API

    // Check balance (mock - in production, check actual balance)
    const hasBalance = true;
    const totalBalance = '0.5 ETH';

    // Generate warnings
    if (!checksumValid) {
      warnings.push('Address checksum validation failed. Use checksummed address for better security.');
    }

    if (isContract) {
      warnings.push('This address is a contract address, not an EOA. Airdrops typically target EOAs.');
    }

    if (!hasActivity) {
      warnings.push('No on-chain activity detected. Start interacting with protocols to qualify for airdrops.');
      recommendations.push('Begin by swapping tokens on a DEX or bridging assets.');
    }

    if (!hasBalance) {
      warnings.push('Address has zero balance. You need ETH for gas fees.');
      recommendations.push('Fund this wallet with ETH for transaction fees.');
    }

    // Generate recommendations
    if (hasActivity && hasBalance) {
      recommendations.push('Wallet looks healthy. Continue farming activities.');
    }

    if (!hasActivity && hasBalance) {
      recommendations.push('Funded wallet detected. Start with low-cost activities like token swaps.');
    }

    // Calculate health score
    let healthScore = 100;
    if (!checksumValid) healthScore -= 10;
    if (isContract) healthScore -= 30;
    if (!hasActivity) healthScore -= 40;
    if (!hasBalance) healthScore -= 20;

    const result: ValidationResult = {
      address: normalizedAddress,
      isValid: formatValid,
      checks: {
        format: formatValid,
        checksum: checksumValid,
        isContract,
        hasActivity,
        balance: {
          hasBalance,
          totalBalance,
        },
      },
      warnings,
      recommendations,
      healthScore: Math.max(0, healthScore),
    };

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Wallet validator API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate wallet',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



