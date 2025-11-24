import { NextRequest, NextResponse } from "next/server";
import { walletService } from "@/lib/services/walletService";

export async function POST(request: NextRequest) {
  try {
    const walletInfo = await walletService.connectWallet();

    return NextResponse.json({
      success: true,
      wallet: walletInfo,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to connect wallet",
      },
      { status: 500 }
    );
  }
}

