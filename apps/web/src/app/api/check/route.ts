import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, airdropId } = body;

    if (!address || !airdropId) {
      return NextResponse.json(
        { error: "Address and airdropId are required" },
        { status: 400 }
      );
    }

    // Mock eligibility check - in real app, check smart contract or API
    const isEligible = Math.random() > 0.5;
    const amount = isEligible ? Math.floor(Math.random() * 1000) : 0;

    return NextResponse.json({
      address,
      airdropId,
      eligible: isEligible,
      amount: isEligible ? `${amount} tokens` : "0",
      checked: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check eligibility" },
      { status: 500 }
    );
  }
}

