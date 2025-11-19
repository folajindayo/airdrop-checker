import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    // Mock trending airdrops
    const trending = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      id: `trending-${i}`,
      name: `Trending Airdrop ${i + 1}`,
      chain: ["ethereum", "polygon", "arbitrum"][i % 3],
      status: "active",
      participants: Math.floor(Math.random() * 10000) + 1000,
      amountUSD: `${Math.floor(Math.random() * 100000)} USD`,
      trending_score: Math.floor(Math.random() * 100),
    }));

    // Sort by trending score
    trending.sort((a, b) => b.trending_score - a.trending_score);

    return NextResponse.json({
      trending,
      count: trending.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch trending" },
      { status: 500 }
    );
  }
}
