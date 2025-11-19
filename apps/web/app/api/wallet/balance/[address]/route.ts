import { NextRequest, NextResponse } from "next/server";
import { walletService } from "@/lib/services/walletService";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!walletService.isValidAddress(address)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }

    const balance = await walletService.getBalance(address);

    return NextResponse.json({
      address,
      balance,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch balance" },
      { status: 500 }
    );
  }
}

