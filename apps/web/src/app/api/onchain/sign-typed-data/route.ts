import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, types, message, address, primaryType } = body;

    if (!domain || !types || !message || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: domain, types, message, address' },
        { status: 400 }
      );
    }

    // Validate EIP-712 structure
    if (!domain.name || !domain.chainId || !domain.verifyingContract) {
      return NextResponse.json(
        { error: 'Domain must include: name, chainId, verifyingContract' },
        { status: 400 }
      );
    }

    // Prepare typed data for signing
    // The actual signing happens on the client side using Reown wallet
    const typedData = {
      domain: {
        name: domain.name,
        version: domain.version || '1',
        chainId: domain.chainId,
        verifyingContract: domain.verifyingContract,
        salt: domain.salt,
      },
      types,
      message,
      primaryType: primaryType || Object.keys(types)[0],
    };

    return NextResponse.json({
      success: true,
      typedData,
      address,
      type: 'sign_typed_data',
      instruction: 'Use Reown wallet to sign this EIP-712 typed data',
      signature: null, // Will be returned by wallet after signing
      note: 'This endpoint prepares the typed data for signing. Use Reown wallet SDK to actually sign it.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to prepare typed data for signing' },
      { status: 500 }
    );
  }
}

