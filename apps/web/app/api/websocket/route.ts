import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/websocket
 * WebSocket connection endpoint information
 * Note: Actual WebSocket implementation would require a WebSocket server
 * This provides connection details and upgrade instructions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (address && !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    // WebSocket connection information
    const wsInfo = {
      protocol: 'ws',
      secureProtocol: 'wss',
      endpoint: '/ws',
      supportedEvents: [
        'eligibility_update',
        'new_airdrop',
        'score_change',
        'claim_available',
        'snapshot_reminder',
        'portfolio_update',
      ],
      connectionFormat: {
        type: 'connect',
        address: address || 'optional',
        events: ['eligibility_update', 'new_airdrop'],
      },
      messageFormat: {
        type: 'event',
        event: 'eligibility_update',
        data: {},
        timestamp: '2024-01-15T12:00:00Z',
      },
      heartbeat: {
        interval: 30000, // 30 seconds
        timeout: 60000, // 60 seconds
      },
    };

    return NextResponse.json({
      success: true,
      websocket: wsInfo,
      instructions: {
        connection: 'Connect to wss://api.airdrop-finder.com/ws',
        authentication: 'Send address and events in initial message',
        heartbeat: 'Respond to ping messages with pong',
        reconnection: 'Automatically reconnect on disconnect',
      },
      example: {
        javascript: `
const ws = new WebSocket('wss://api.airdrop-finder.com/ws');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'connect',
    address: '0x...',
    events: ['eligibility_update', 'new_airdrop']
  }));
};
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
        `,
      },
    });
  } catch (error) {
    console.error('WebSocket API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get WebSocket information',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



