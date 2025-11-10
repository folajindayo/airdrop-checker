import { NextRequest } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/realtime/[address]
 * Server-Sent Events (SSE) endpoint for real-time updates
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isValidAddress(address)) {
      return new Response('Invalid address', { status: 400 });
    }

    const normalizedAddress = address.toLowerCase();

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send initial connection message
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', address: normalizedAddress })}\n\n`));

        // Simulate real-time updates (in production, this would connect to actual event sources)
        const interval = setInterval(() => {
          const update = {
            type: 'eligibility_update',
            address: normalizedAddress,
            timestamp: new Date().toISOString(),
            data: {
              score: Math.floor(Math.random() * 100),
              newAirdrops: Math.floor(Math.random() * 3),
            },
          };

          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
          } catch (error) {
            clearInterval(interval);
            controller.close();
          }
        }, 30000); // Update every 30 seconds

        // Cleanup on client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Realtime API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

