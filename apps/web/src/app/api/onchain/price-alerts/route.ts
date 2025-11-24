import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';
import { goldrushClient } from '@/lib/goldrush/client';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * POST /api/onchain/price-alerts
 * Create price alerts for tokens
 * GET /api/onchain/price-alerts
 * Get active price alerts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenAddress, chainId, targetPrice, condition, alertType } = body;

    if (!isValidAddress(tokenAddress)) {
      return NextResponse.json(
        { error: 'Invalid token address' },
        { status: 400 }
      );
    }

    if (!targetPrice || !condition || !chainId) {
      return NextResponse.json(
        { error: 'Missing required fields: targetPrice, condition, chainId' },
        { status: 400 }
      );
    }

    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tokenAddress: tokenAddress.toLowerCase(),
      chainId: parseInt(chainId),
      targetPrice: parseFloat(targetPrice),
      condition, // 'above' or 'below'
      alertType: alertType || 'price',
      status: 'active',
      createdAt: Date.now(),
    };

    const alertsKey = 'onchain-price-alerts';
    const alerts = (cache.get(alertsKey) as any[]) || [];
    alerts.push(alert);
    cache.set(alertsKey, alerts, 0);

    return NextResponse.json({
      success: true,
      alert,
      message: 'Price alert created successfully',
    });
  } catch (error) {
    console.error('Price alert creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create price alert',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tokenAddress = searchParams.get('tokenAddress');
    const chainId = searchParams.get('chainId');

    const alertsKey = 'onchain-price-alerts';
    let alerts = (cache.get(alertsKey) as any[]) || [];

    if (tokenAddress) {
      alerts = alerts.filter(a => 
        a.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
      );
    }

    if (chainId) {
      alerts = alerts.filter(a => a.chainId === parseInt(chainId));
    }

    const activeAlerts = alerts.filter(a => a.status === 'active');

    for (const alert of activeAlerts) {
      try {
        const currentPrice = await getCurrentPrice(alert.tokenAddress, alert.chainId);
        const shouldTrigger = checkAlertCondition(alert, currentPrice);

        if (shouldTrigger) {
          alert.status = 'triggered';
          alert.triggeredAt = Date.now();
          alert.triggeredPrice = currentPrice;
        }
      } catch (error) {
        console.error(`Error checking alert ${alert.id}:`, error);
      }
    }

    cache.set(alertsKey, alerts, 0);

    return NextResponse.json({
      alerts: activeAlerts,
      triggered: alerts.filter(a => a.status === 'triggered'),
      total: alerts.length,
    });
  } catch (error) {
    console.error('Price alerts fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch price alerts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function getCurrentPrice(tokenAddress: string, chainId: number): Promise<number> {
  try {
    const response = await goldrushClient.get(
      `/v2/${chainId}/tokens/${tokenAddress}/`,
      { 'quote-currency': 'USD' }
    );

    if (response.data?.quote_rate) {
      return parseFloat(response.data.quote_rate);
    }
  } catch (error) {
    console.error('Error fetching token price:', error);
  }

  return 0;
}

function checkAlertCondition(alert: any, currentPrice: number): boolean {
  if (alert.condition === 'above') {
    return currentPrice >= alert.targetPrice;
  } else if (alert.condition === 'below') {
    return currentPrice <= alert.targetPrice;
  }
  return false;
}

