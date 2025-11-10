import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

interface ExportData {
  address: string;
  format: 'json' | 'csv' | 'txt';
  data: {
    airdrops?: any[];
    portfolio?: any;
    gasData?: any;
    claims?: any[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, format = 'json', data } = body;

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      );
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Data object is required' },
        { status: 400 }
      );
    }

    let exportContent = '';
    let contentType = 'application/json';
    let filename = `airdrop-data-${address.slice(0, 8)}.json`;

    if (format === 'json') {
      exportContent = JSON.stringify({
        address,
        exportedAt: new Date().toISOString(),
        ...data,
      }, null, 2);
      contentType = 'application/json';
      filename = `airdrop-data-${address.slice(0, 8)}.json`;
    } else if (format === 'csv') {
      // Convert airdrops to CSV
      if (data.airdrops && Array.isArray(data.airdrops)) {
        const headers = ['Project', 'Status', 'Score', 'Criteria Met'];
        const rows = data.airdrops.map((a: any) => [
          a.project || a.projectId,
          a.status || 'unknown',
          a.score || 0,
          a.criteria?.filter((c: any) => c.met).length || 0,
        ]);
        
        exportContent = [
          headers.join(','),
          ...rows.map((row: any[]) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');
      }
      contentType = 'text/csv';
      filename = `airdrop-data-${address.slice(0, 8)}.csv`;
    } else if (format === 'txt') {
      // Convert to human-readable text
      const lines: string[] = [];
      lines.push(`Airdrop Eligibility Report`);
      lines.push(`Address: ${address}`);
      lines.push(`Exported: ${new Date().toLocaleString()}`);
      lines.push('');
      
      if (data.airdrops && Array.isArray(data.airdrops)) {
        lines.push('Airdrop Eligibility:');
        data.airdrops.forEach((a: any) => {
          lines.push(`- ${a.project || a.projectId}: ${a.score}% (${a.status})`);
        });
      }
      
      if (data.portfolio) {
        lines.push('');
        lines.push(`Portfolio Value: $${data.portfolio.totalValue?.toFixed(2) || '0.00'}`);
      }
      
      if (data.gasData) {
        lines.push('');
        lines.push(`Total Gas Spent: $${data.gasData.totalGasSpentUSD?.toFixed(2) || '0.00'}`);
      }
      
      exportContent = lines.join('\n');
      contentType = 'text/plain';
      filename = `airdrop-data-${address.slice(0, 8)}.txt`;
    }

    return new NextResponse(exportContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

