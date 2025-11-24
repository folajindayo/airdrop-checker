import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Mock airdrop details
    const airdrop = {
      id,
      name: `Airdrop Project ${id}`,
      description: "Detailed description of the airdrop project",
      chain: "ethereum",
      status: "active",
      totalAmount: "100000 tokens",
      participants: 5432,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      requirements: [
        "Hold at least 0.1 ETH",
        "Complete on-chain transactions",
        "Join Discord server",
      ],
      website: "https://example.com",
      twitter: "@example",
      discord: "https://discord.gg/example",
    };

    return NextResponse.json(airdrop);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch airdrop" },
      { status: 500 }
    );
  }
}

