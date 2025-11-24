import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * GET /api/og?score=75&address=0x123...
 * Generate OpenGraph image for sharing
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const score = searchParams.get('score') || '0';
    const address = searchParams.get('address') || '';

    const scoreNum = parseInt(score, 10);
    const truncatedAddress = address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : '';

    const scoreColor = scoreNum >= 70 ? '#10b981' : scoreNum >= 40 ? '#f59e0b' : '#ef4444';
    const scoreLabel = scoreNum >= 70 ? 'High Likelihood' : scoreNum >= 40 ? 'Moderate Chance' : 'Low Chance';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#0f172a',
            fontFamily: 'system-ui',
          }}
        >
          {/* Background gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 30% 50%, rgba(79, 70, 229, 0.3), transparent 50%)',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: '#f1f5f9',
                marginBottom: 20,
              }}
            >
              Airdrop Finder
            </div>

            <div
              style={{
                fontSize: 28,
                color: '#94a3b8',
                marginBottom: 40,
              }}
            >
              {truncatedAddress || 'Wallet Eligibility Report'}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '60px 80px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                borderRadius: 24,
                border: '2px solid rgba(148, 163, 184, 0.3)',
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  color: '#94a3b8',
                  marginBottom: 10,
                }}
              >
                Overall Airdrop Readiness
              </div>

              <div
                style={{
                  fontSize: 120,
                  fontWeight: 'bold',
                  color: scoreColor,
                  marginBottom: 10,
                }}
              >
                {score}
                <span style={{ fontSize: 60, color: '#94a3b8' }}>/100</span>
              </div>

              <div
                style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: scoreColor,
                }}
              >
                {scoreLabel}
              </div>
            </div>

            <div
              style={{
                fontSize: 20,
                color: '#94a3b8',
                marginTop: 40,
              }}
            >
              Check your eligibility at airdrop-finder.com
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}

