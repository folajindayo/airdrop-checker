'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import type { AirdropCheckResult } from '@airdrop-finder/shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportReportProps {
  address: string;
  overallScore: number;
  airdrops: AirdropCheckResult[];
}

export function ExportReport({ address, overallScore, airdrops }: ExportReportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsJSON = () => {
    const data = {
      wallet: address,
      overallScore,
      timestamp: new Date().toISOString(),
      airdrops: airdrops.map((airdrop) => ({
        project: airdrop.project,
        projectId: airdrop.projectId,
        status: airdrop.status,
        score: airdrop.score,
        criteriaCount: airdrop.criteria.length,
        criteriaMet: airdrop.criteria.filter((c) => c.met).length,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `airdrop-eligibility-${address.slice(0, 8)}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    setIsExporting(true);

    try {
      const headers = [
        'Project',
        'Status',
        'Score (%)',
        'Criteria Met',
        'Total Criteria',
        'Eligibility',
      ];

      const rows = airdrops.map((airdrop) => {
        const criteriaMet = airdrop.criteria.filter((c) => c.met).length;
        const totalCriteria = airdrop.criteria.length;
        const eligibility =
          airdrop.score >= 80
            ? 'High'
            : airdrop.score >= 50
            ? 'Medium'
            : airdrop.score >= 20
            ? 'Low'
            : 'Very Low';

        return [
          airdrop.project,
          airdrop.status,
          airdrop.score.toString(),
          criteriaMet.toString(),
          totalCriteria.toString(),
          eligibility,
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
        '',
        `Overall Score,${overallScore}`,
        `Wallet Address,${address}`,
        `Generated At,${new Date().toISOString()}`,
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `airdrop-eligibility-${address.slice(0, 8)}-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsText = () => {
    const content = [
      '=' .repeat(60),
      'AIRDROP ELIGIBILITY REPORT',
      '=' .repeat(60),
      '',
      `Wallet Address: ${address}`,
      `Overall Score: ${overallScore}/100`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '=' .repeat(60),
      'AIRDROP BREAKDOWN',
      '=' .repeat(60),
      '',
      ...airdrops.map((airdrop) => {
        const criteriaMet = airdrop.criteria.filter((c) => c.met).length;
        const totalCriteria = airdrop.criteria.length;

        return [
          `📋 ${airdrop.project} (${airdrop.status})`,
          `   Score: ${airdrop.score}%`,
          `   Criteria: ${criteriaMet}/${totalCriteria} met`,
          '',
          '   Criteria Details:',
          ...airdrop.criteria.map(
            (c) => `   ${c.met ? '✅' : '❌'} ${c.description}`
          ),
          '',
          '-'.repeat(60),
          '',
        ].join('\n');
      }),
      '',
      '=' .repeat(60),
      'END OF REPORT',
      '=' .repeat(60),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `airdrop-eligibility-${address.slice(0, 8)}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsJSON}>
          <FileText className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsCSV}>
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsText}>
          <FileText className="mr-2 h-4 w-4" />
          Export as Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

