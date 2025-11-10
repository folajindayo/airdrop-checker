'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileJson, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface DataExporterProps {
  address: string;
  data: {
    airdrops?: any[];
    portfolio?: any;
    gasData?: any;
    claims?: any[];
  };
  className?: string;
}

export function DataExporter({ address, data, className = '' }: DataExporterProps) {
  const [format, setFormat] = useState<'json' | 'csv' | 'txt'>('json');
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!address || !data) {
      toast.error('No data available to export');
      return;
    }

    setExporting(true);
    
    try {
      const response = await fetch('/api/export-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          format,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const extension = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'txt';
      a.download = `airdrop-data-${address.slice(0, 8)}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  }

  const getFormatIcon = (fmt: string) => {
    switch (fmt) {
      case 'json':
        return <FileJson className="h-4 w-4" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'txt':
        return <FileText className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
        <CardDescription>Export your airdrop data in various formats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <Select value={format} onValueChange={(value: 'json' | 'csv' | 'txt') => setFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  JSON
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV
                </div>
              </SelectItem>
              <SelectItem value="txt">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Text
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <p className="font-medium mb-1">Data Included:</p>
          <ul className="space-y-1 text-muted-foreground">
            {data.airdrops && <li>• Airdrop eligibility scores</li>}
            {data.portfolio && <li>• Portfolio data</li>}
            {data.gasData && <li>• Gas spending data</li>}
            {data.claims && <li>• Claim history</li>}
          </ul>
        </div>

        <Button 
          onClick={handleExport} 
          className="w-full" 
          disabled={exporting || !data}
        >
          {getFormatIcon(format)}
          <span className="ml-2">
            {exporting ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
          </span>
        </Button>
      </CardContent>
    </Card>
  );
}

