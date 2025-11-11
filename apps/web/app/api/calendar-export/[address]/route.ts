import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface CalendarEvent {
  uid: string;
  summary: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  url?: string;
}

function generateICal(events: CalendarEvent[]): string {
  const lines: string[] = [];
  
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Airdrop Finder//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  
  events.forEach((event) => {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.uid}`);
    lines.push(`SUMMARY:${event.summary}`);
    lines.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`);
    lines.push(`LOCATION:${event.location}`);
    lines.push(`DTSTART:${formatICalDate(event.startDate)}`);
    lines.push(`DTEND:${formatICalDate(event.endDate)}`);
    if (event.url) {
      lines.push(`URL:${event.url}`);
    }
    lines.push('END:VEVENT');
  });
  
  lines.push('END:VCALENDAR');
  
  return lines.join('\r\n');
}

function formatICalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'ical';

    // Fetch snapshots
    const snapshotsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/snapshots`
    );
    
    let snapshots: any[] = [];
    if (snapshotsResponse.ok) {
      const snapshotsData = await snapshotsResponse.json();
      snapshots = snapshotsData.snapshots || [];
    }

    // Convert snapshots to calendar events
    const events: CalendarEvent[] = snapshots.map((snapshot) => {
      const snapshotDate = new Date(snapshot.snapshotDate);
      const claimDate = snapshot.claimDate ? new Date(snapshot.claimDate) : null;

      const events: CalendarEvent[] = [];

      // Snapshot event
      events.push({
        uid: `snapshot-${snapshot.id}@airdrop-finder.com`,
        summary: `${snapshot.projectName} Snapshot`,
        description: `${snapshot.description}\n\nStatus: ${snapshot.status}\nEstimated Value: $${snapshot.estimatedValue || 'TBD'}`,
        location: snapshot.chainIds.map((id: number) => `Chain ${id}`).join(', '),
        startDate: snapshotDate,
        endDate: new Date(snapshotDate.getTime() + 24 * 60 * 60 * 1000),
      });

      // Claim event if available
      if (claimDate) {
        events.push({
          uid: `claim-${snapshot.id}@airdrop-finder.com`,
          summary: `${snapshot.projectName} Claim Window`,
          description: `Claim your ${snapshot.projectName} airdrop tokens.\n\nEstimated Value: $${snapshot.estimatedValue || 'TBD'}`,
          location: 'Airdrop Claim Portal',
          startDate: claimDate,
          endDate: new Date(claimDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 day window
        });
      }

      return events;
    }).flat();

    if (format === 'ical' || format === 'ics') {
      const icalContent = generateICal(events);
      
      return new NextResponse(icalContent, {
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="airdrop-calendar-${address.slice(0, 8)}.ics"`,
        },
      });
    } else {
      // Return JSON format
      return NextResponse.json({
        address,
        events: events.map((e) => ({
          ...e,
          startDate: e.startDate.toISOString(),
          endDate: e.endDate.toISOString(),
        })),
        format: 'json',
      });
    }
  } catch (error) {
    console.error('Error generating calendar:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar' },
      { status: 500 }
    );
  }
}



