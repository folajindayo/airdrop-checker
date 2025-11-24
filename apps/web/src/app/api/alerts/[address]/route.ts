import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Mock alerts data
    const alerts = generateMockAlerts(address);

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Alerts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

function generateMockAlerts(address: string) {
  const now = Date.now();
  
  return [
    {
      id: '1',
      type: 'new_airdrop',
      title: 'New Airdrop Announced: Blast',
      message: 'Blast has announced their airdrop! You may be eligible based on your early deposits.',
      timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'urgent',
      projectId: 'blast',
      projectName: 'Blast',
      actionUrl: 'https://blast.io/airdrop',
    },
    {
      id: '2',
      type: 'snapshot',
      title: 'Snapshot Alert: LayerZero',
      message: 'LayerZero will take a snapshot in 48 hours. Make sure you meet the eligibility criteria.',
      timestamp: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      projectId: 'layerzero',
      projectName: 'LayerZero',
    },
    {
      id: '3',
      type: 'claim_live',
      title: 'Claim Now: Arbitrum',
      message: 'The Arbitrum airdrop claim is now live! Claim your ARB tokens before the deadline.',
      timestamp: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'urgent',
      projectId: 'arbitrum',
      projectName: 'Arbitrum',
      actionUrl: 'https://arbitrum.foundation/airdrop',
    },
    {
      id: '4',
      type: 'eligibility_change',
      title: 'Eligibility Update: zkSync',
      message: 'Your eligibility score for zkSync has increased to 85/100 based on recent activity.',
      timestamp: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'medium',
      projectId: 'zksync',
      projectName: 'zkSync',
    },
    {
      id: '5',
      type: 'new_airdrop',
      title: 'New Airdrop: Scroll',
      message: 'Scroll has announced their token distribution. Check your eligibility now.',
      timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'high',
      projectId: 'scroll',
      projectName: 'Scroll',
    },
    {
      id: '6',
      type: 'price_alert',
      title: 'Price Alert: OP Token',
      message: 'OP token price has increased by 15% in the last 24 hours.',
      timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low',
    },
    {
      id: '7',
      type: 'snapshot',
      title: 'Snapshot Complete: Starknet',
      message: 'Starknet snapshot has been completed. Results will be announced soon.',
      timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'medium',
      projectId: 'starknet',
      projectName: 'Starknet',
    },
  ];
}

