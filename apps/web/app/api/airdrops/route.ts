import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const chain = searchParams.get("chain");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Mock data - in real app, query database or external API
    const mockAirdrops = Array.from({ length: 50 }, (_, i) => ({
      id: `airdrop-${i}`,
      name: `Airdrop Project ${i + 1}`,
      chain: ["ethereum", "polygon", "arbitrum"][i % 3],
      status: ["active", "upcoming", "ended"][i % 3],
      amount: `${Math.floor(Math.random() * 10000)} tokens`,
      deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    let filteredAirdrops = mockAirdrops;

    if (status) {
      filteredAirdrops = filteredAirdrops.filter((a) => a.status === status);
    }

    if (chain) {
      filteredAirdrops = filteredAirdrops.filter((a) => a.chain === chain);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredAirdrops.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: filteredAirdrops.length,
        totalPages: Math.ceil(filteredAirdrops.length / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch airdrops" },
      { status: 500 }
    );
  }
}
