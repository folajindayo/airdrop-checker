import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface SecurityEvent {
  id: string;
  address: string;
  eventType: 'api_access' | 'webhook_triggered' | 'data_export' | 'key_generated' | 'key_revoked' | 'suspicious_activity';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// In-memory storage (in production, use database)
const securityAuditLog: Map<string, SecurityEvent[]> = new Map();

/**
 * GET /api/security/audit/[address]
 * Get security audit log for an address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();
    let events = securityAuditLog.get(normalizedAddress) || [];

    // Apply filters
    if (eventType) {
      events = events.filter((e) => e.eventType === eventType);
    }

    if (severity) {
      events = events.filter((e) => e.severity === severity);
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply limit
    const limitedEvents = events.slice(0, limit);

    // Calculate statistics
    const stats = {
      total: events.length,
      byType: {
        api_access: events.filter((e) => e.eventType === 'api_access').length,
        webhook_triggered: events.filter((e) => e.eventType === 'webhook_triggered').length,
        data_export: events.filter((e) => e.eventType === 'data_export').length,
        key_generated: events.filter((e) => e.eventType === 'key_generated').length,
        key_revoked: events.filter((e) => e.eventType === 'key_revoked').length,
        suspicious_activity: events.filter((e) => e.eventType === 'suspicious_activity').length,
      },
      bySeverity: {
        low: events.filter((e) => e.severity === 'low').length,
        medium: events.filter((e) => e.severity === 'medium').length,
        high: events.filter((e) => e.severity === 'high').length,
        critical: events.filter((e) => e.severity === 'critical').length,
      },
    };

    return NextResponse.json({
      success: true,
      address: normalizedAddress,
      events: limitedEvents,
      stats,
      pagination: {
        total: events.length,
        returned: limitedEvents.length,
        hasMore: events.length > limit,
      },
    });
  } catch (error) {
    console.error('Security audit API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch security audit log',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to log security event
 */
export function logSecurityEvent(
  address: string,
  eventType: SecurityEvent['eventType'],
  details: Record<string, any>,
  severity: SecurityEvent['severity'] = 'low',
  request?: NextRequest
) {
  const normalizedAddress = address.toLowerCase();
  const events = securityAuditLog.get(normalizedAddress) || [];

  const event: SecurityEvent = {
    id: `${normalizedAddress}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    address: normalizedAddress,
    eventType,
    details,
    ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    userAgent: request?.headers.get('user-agent') || undefined,
    timestamp: new Date().toISOString(),
    severity,
  };

  events.push(event);
  securityAuditLog.set(normalizedAddress, events);

  // Keep only last 1000 events per address
  if (events.length > 1000) {
    events.shift();
  }
}



