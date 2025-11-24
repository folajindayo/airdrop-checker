import { NextResponse } from 'next/server';
import { findAllProjects } from '@/lib/db/models/project';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'snapshot' | 'claim' | 'announcement';
  project: string;
  status: string;
  description?: string;
}

/**
 * GET /api/calendar
 * Returns upcoming airdrop events (snapshots, claims, announcements)
 */
export async function GET() {
  try {
    const projects = await findAllProjects();

    const events: CalendarEvent[] = [];
    const now = new Date();

    // Process each project for potential events
    projects.forEach((project) => {
      // Add snapshot date if available and in the future
      if (project.snapshotDate) {
        const snapshotDate = new Date(project.snapshotDate);

        if (snapshotDate > now) {
          events.push({
            id: `snapshot-${project.id}`,
            title: `${project.name} Snapshot`,
            date: project.snapshotDate,
            type: 'snapshot',
            project: project.name,
            status: project.status,
            description: `Snapshot date for ${project.name} airdrop eligibility`,
          });
        }
      }

      // Add claim events for confirmed airdrops
      if (project.status === 'confirmed' && project.claimUrl) {
        // Estimate claim date as 30 days after snapshot if snapshot exists
        const claimDate = project.snapshotDate
          ? new Date(new Date(project.snapshotDate).getTime() + 30 * 24 * 60 * 60 * 1000)
          : new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // or 60 days from now

        if (claimDate > now) {
          events.push({
            id: `claim-${project.id}`,
            title: `${project.name} Claim Opens`,
            date: claimDate.toISOString(),
            type: 'claim',
            project: project.name,
            status: project.status,
            description: `Claim period opens for ${project.name} airdrop`,
          });
        }
      }

      // Add announcement events for rumored airdrops
      if (project.status === 'rumored') {
        // Estimate announcement as 90 days from now
        const announcementDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

        events.push({
          id: `announcement-${project.id}`,
          title: `${project.name} Expected Announcement`,
          date: announcementDate.toISOString(),
          type: 'announcement',
          project: project.name,
          status: project.status,
          description: `Expected announcement period for ${project.name} airdrop`,
        });
      }
    });

    // Sort events by date
    const sortedEvents = events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group events by month
    const groupedByMonth = sortedEvents.reduce((acc, event) => {
      const monthKey = new Date(event.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });

      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }

      acc[monthKey].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);

    return NextResponse.json({
      success: true,
      totalEvents: sortedEvents.length,
      events: sortedEvents,
      groupedByMonth,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch calendar events',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

