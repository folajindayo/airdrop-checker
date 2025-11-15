import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get('contractAddress');

    if (!contractAddress) {
      return NextResponse.json({ error: 'Contract address required' }, { status: 400 });
    }

    const complexity = {
      linesOfCode: Math.floor(Math.random() * 5000),
      cyclomaticComplexity: Math.floor(Math.random() * 100),
      functionCount: Math.floor(Math.random() * 50),
      dependencies: Math.floor(Math.random() * 20),
    };

    return NextResponse.json({
      success: true,
      contractAddress,
      ...complexity,
      complexityScore: Math.floor((complexity.cyclomaticComplexity + complexity.functionCount) / 2),
      risk: complexity.cyclomaticComplexity > 50 ? 'high' : 'moderate',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

