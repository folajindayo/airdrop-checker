/**
 * Contract ABI Validator
 * Validate contract ABI structure
 * POST /api/onchain/contract-abi-validator
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { abi } = body;

    if (!abi || !Array.isArray(abi)) {
      return NextResponse.json(
        { error: 'Invalid ABI: must be an array' },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    for (const item of abi) {
      if (!item.type) {
        errors.push('ABI item missing type field');
      }
      if (item.type === 'function' && !item.name) {
        errors.push('Function missing name field');
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      valid: errors.length === 0,
      errors,
      warnings,
      abiItemCount: abi.length,
      type: 'abi-validator',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to validate ABI' },
      { status: 500 }
    );
  }
}
