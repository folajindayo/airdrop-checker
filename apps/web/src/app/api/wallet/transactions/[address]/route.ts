import { NextRequest, NextResponse } from "next/server";
import { walletService } from "@/lib/services/walletService";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!walletService.isValidAddress(address)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }

    const transactions = await walletService.getTransactions(address, limit);

    return NextResponse.json({
      address,
      transactions,
      count: transactions.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

