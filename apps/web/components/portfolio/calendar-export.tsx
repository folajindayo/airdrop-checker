'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarExportProps {
  address: string;
  className?: string;
}

export function CalendarExport({ address, className = '' }: CalendarExportProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!address) {
      toast.error('Address is required');
      return;
    }

    setExporting(true);

    try {
      const response = await fetch(`/api/calendar-export/${address}?format=ical`);

      if (!response.ok) {
        throw new Error('Failed to export calendar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `airdrop-calendar-${address.slice(0, 8)}.ics`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Calendar exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export calendar');
    } finally {
      setExporting(false);
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Export
        </CardTitle>
        <CardDescription>Export airdrop snapshots and claims to your calendar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">What's included:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Upcoming snapshot dates</li>
            <li>• Claim window openings</li>
            <li>• Important airdrop deadlines</li>
            <li>• Estimated values and project info</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Compatible with:</strong> Google Calendar, Apple Calendar, Outlook, and other iCal-compatible applications
          </p>
        </div>

        <Button 
          onClick={handleExport} 
          className="w-full" 
          disabled={exporting || !address}
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export Calendar (.ics)'}
        </Button>
      </CardContent>
    </Card>
  );
}

