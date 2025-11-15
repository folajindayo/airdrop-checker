'use client';

import * as React from 'react';
import { Download, FileJson, FileText, FileSpreadsheet, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface ExportOptions {
  filename?: string;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  onExportError?: (error: Error) => void;
}

// Export to JSON
export function exportToJSON(data: any, options: ExportOptions = {}) {
  const { filename = 'data.json', onExportStart, onExportComplete, onExportError } = options;

  try {
    onExportStart?.();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, filename);
    onExportComplete?.();
  } catch (error) {
    onExportError?.(error as Error);
  }
}

// Export to CSV
export function exportToCSV(data: any[], options: ExportOptions = {}) {
  const { filename = 'data.csv', onExportStart, onExportComplete, onExportError } = options;

  try {
    onExportStart?.();

    if (data.length === 0) {
      throw new Error('No data to export');
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value).replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      });
      csvRows.push(values.join(','));
    }

    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, filename);
    onExportComplete?.();
  } catch (error) {
    onExportError?.(error as Error);
  }
}

// Export to Text
export function exportToText(content: string, options: ExportOptions = {}) {
  const { filename = 'data.txt', onExportStart, onExportComplete, onExportError } = options;

  try {
    onExportStart?.();
    const blob = new Blob([content], { type: 'text/plain' });
    downloadBlob(blob, filename);
    onExportComplete?.();
  } catch (error) {
    onExportError?.(error as Error);
  }
}

// Helper to download blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export dropdown button
export function ExportButton({
  data,
  filename = 'export',
  formats = ['json', 'csv', 'txt'],
  variant = 'default',
  size = 'default',
  className,
}: {
  data: any;
  filename?: string;
  formats?: Array<'json' | 'csv' | 'txt'>;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = (format: 'json' | 'csv' | 'txt') => {
    const options: ExportOptions = {
      filename: `${filename}.${format}`,
      onExportStart: () => setIsExporting(true),
      onExportComplete: () => setIsExporting(false),
      onExportError: (error) => {
        console.error('Export error:', error);
        setIsExporting(false);
      },
    };

    switch (format) {
      case 'json':
        exportToJSON(data, options);
        break;
      case 'csv':
        // Convert to array if needed
        const csvData = Array.isArray(data) ? data : [data];
        exportToCSV(csvData, options);
        break;
      case 'txt':
        const textContent =
          typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        exportToText(textContent, options);
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isExporting}
          className={className}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.includes('json') && (
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <FileJson className="mr-2 h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
        )}
        {formats.includes('csv') && (
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
        )}
        {formats.includes('txt') && (
          <DropdownMenuItem onClick={() => handleExport('txt')}>
            <FileText className="mr-2 h-4 w-4" />
            Export as Text
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Export card with options
export function ExportCard({
  title = 'Export Data',
  description,
  data,
  filename = 'export',
  className,
}: {
  title?: string;
  description?: string;
  data: any;
  filename?: string;
  className?: string;
}) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = (format: 'json' | 'csv' | 'txt') => {
    const options: ExportOptions = {
      filename: `${filename}.${format}`,
      onExportStart: () => setIsExporting(true),
      onExportComplete: () => setIsExporting(false),
    };

    switch (format) {
      case 'json':
        exportToJSON(data, options);
        break;
      case 'csv':
        const csvData = Array.isArray(data) ? data : [data];
        exportToCSV(csvData, options);
        break;
      case 'txt':
        const textContent =
          typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        exportToText(textContent, options);
        break;
    }
  };

  return (
    <Card className={cn('p-6', className)}>
      <h3 className="font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          onClick={() => handleExport('json')}
          disabled={isExporting}
          className="flex flex-col h-auto py-4 gap-2"
        >
          <FileJson className="h-8 w-8" />
          <span className="text-xs">JSON</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="flex flex-col h-auto py-4 gap-2"
        >
          <FileSpreadsheet className="h-8 w-8" />
          <span className="text-xs">CSV</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => handleExport('txt')}
          disabled={isExporting}
          className="flex flex-col h-auto py-4 gap-2"
        >
          <FileText className="h-8 w-8" />
          <span className="text-xs">Text</span>
        </Button>
      </div>
    </Card>
  );
}

// Airdrop eligibility export
export function AirdropEligibilityExport({
  eligibilityData,
  walletAddress,
  className,
}: {
  eligibilityData: any;
  walletAddress: string;
  className?: string;
}) {
  return (
    <ExportCard
      title="Export Eligibility Report"
      description="Download your airdrop eligibility data in various formats"
      data={{
        address: walletAddress,
        timestamp: new Date().toISOString(),
        ...eligibilityData,
      }}
      filename={`airdrop-eligibility-${walletAddress.slice(0, 8)}`}
      className={className}
    />
  );
}

// Transaction history export
export function TransactionHistoryExport({
  transactions,
  walletAddress,
  className,
}: {
  transactions: any[];
  walletAddress: string;
  className?: string;
}) {
  // Format transactions for export
  const formattedTransactions = transactions.map((tx) => ({
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    timestamp: new Date(tx.timestamp).toISOString(),
    status: tx.status,
  }));

  return (
    <ExportButton
      data={formattedTransactions}
      filename={`transactions-${walletAddress.slice(0, 8)}`}
      formats={['json', 'csv']}
      className={className}
    />
  );
}

// Portfolio snapshot export
export function PortfolioSnapshotExport({
  portfolioData,
  className,
}: {
  portfolioData: {
    totalValue: string;
    tokens: any[];
    nfts: any[];
    protocols: any[];
  };
  className?: string;
}) {
  const exportData = {
    snapshot_date: new Date().toISOString(),
    total_value: portfolioData.totalValue,
    tokens: portfolioData.tokens.map((token) => ({
      symbol: token.symbol,
      balance: token.balance,
      value: token.value,
    })),
    nfts: portfolioData.nfts.map((nft) => ({
      name: nft.name,
      collection: nft.collection,
    })),
    protocols: portfolioData.protocols,
  };

  return (
    <ExportCard
      title="Export Portfolio Snapshot"
      description="Save a snapshot of your current portfolio"
      data={exportData}
      filename={`portfolio-snapshot-${new Date().toISOString().split('T')[0]}`}
      className={className}
    />
  );
}

// Bulk export multiple items
export function BulkExportButton({
  items,
  itemName = 'items',
  className,
}: {
  items: any[];
  itemName?: string;
  className?: string;
}) {
  return (
    <ExportButton
      data={items}
      filename={`${itemName}-${new Date().toISOString().split('T')[0]}`}
      formats={['json', 'csv']}
      variant="outline"
      className={className}
    />
  );
}

// Image export/screenshot
export async function exportAsImage(
  elementId: string,
  filename: string = 'screenshot.png'
) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  // In production, use html-to-image or similar library
  // This is a placeholder implementation
  console.log('Exporting element as image:', elementId);

  // For now, just show a message
  alert('Image export feature requires html-to-image library');
}

export function ScreenshotButton({
  targetId,
  filename = 'screenshot.png',
  className,
}: {
  targetId: string;
  filename?: string;
  className?: string;
}) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleScreenshot = async () => {
    setIsExporting(true);
    try {
      await exportAsImage(targetId, filename);
    } catch (error) {
      console.error('Screenshot error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleScreenshot}
      disabled={isExporting}
      className={className}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Capturing...
        </>
      ) : (
        <>
          <Image className="mr-2 h-4 w-4" />
          Screenshot
        </>
      )}
    </Button>
  );
}

