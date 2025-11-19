import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, chain, totalAmount, startDate, endDate, requirements } = body;

    if (!name || !chain || !totalAmount) {
      return NextResponse.json(
        { error: "Name, chain, and totalAmount are required" },
        { status: 400 }
      );
    }

    // Mock airdrop creation
    const airdrop = {
      id: `airdrop_${Date.now()}`,
      name,
      description: description || "",
      chain,
      status: "active",
      totalAmount,
      participants: 0,
      startDate: startDate || new Date().toISOString(),
      endDate,
      requirements: requirements || [],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      airdrop,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create airdrop" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Airdrop ID is required" },
        { status: 400 }
      );
    }

    // Mock airdrop update
    const updatedAirdrop = {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      airdrop: updatedAirdrop,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update airdrop" },
      { status: 500 }
    );
  }
}

