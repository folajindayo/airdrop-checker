import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stats = {
      totalAirdrops: 156,
      activeAirdrops: 42,
      upcomingAirdrops: 28,
      endedAirdrops: 86,
      totalValueUSD: "12345678",
      totalParticipants: 234567,
      chains: {
        ethereum: 78,
        polygon: 45,
        arbitrum: 33,
      },
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
