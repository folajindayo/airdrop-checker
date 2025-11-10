'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle,
  Calculator,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TaxTransaction {
  date: string;
  type: 'buy' | 'sell' | 'swap' | 'income' | 'gift' | 'airdrop';
  asset: string;
  amount: number;
  costBasis: number;
  proceeds: number;
  gainLoss: number;
  taxable: boolean;
}

interface TaxSummary {
  totalGains: number;
  totalLosses: number;
  netGainLoss: number;
  shortTermGains: number;
  longTermGains: number;
  incomeReceived: number;
  taxableEvents: number;
  estimatedTax: number;
}

interface TaxData {
  summary: TaxSummary;
  transactions: TaxTransaction[];
  monthlyBreakdown: { month: string; gains: number; losses: number }[];
  assetBreakdown: { asset: string; gainLoss: number; transactions: number }[];
  taxBrackets: { bracket: string; amount: number; rate: number }[];
}

interface TaxReportGeneratorProps {
  address: string;
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

export function TaxReportGenerator({ address }: TaxReportGeneratorProps) {
  const [data, setData] = useState<TaxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [taxRate, setTaxRate] = useState(24);

  useEffect(() => {
    if (address) {
      fetchTaxData();
    }
  }, [address, taxYear]);

  async function fetchTaxData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/tax-report/${address}?year=${taxYear}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching tax data:', error);
      toast.error('Failed to load tax report');
    } finally {
      setLoading(false);
    }
  }

  function downloadReport(format: 'csv' | 'pdf') {
    toast.success(`Downloading ${format.toUpperCase()} report...`);
    // In production, this would generate and download the actual report
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'buy':
        return 'bg-green-600';
      case 'sell':
        return 'bg-red-600';
      case 'swap':
        return 'bg-blue-600';
      case 'income':
        return 'bg-purple-600';
      case 'airdrop':
        return 'bg-yellow-600';
      case 'gift':
        return 'bg-pink-600';
      default:
        return 'bg-gray-600';
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No tax data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Tax Report Generator</h2>
              <p className="text-sm text-muted-foreground">
                Comprehensive crypto tax calculations for {taxYear}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={taxYear}
              onChange={(e) => setTaxYear(Number(e.target.value))}
              className="px-3 py-2 bg-background border rounded-md"
            >
              {[2024, 2023, 2022, 2021, 2020].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={() => downloadReport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button onClick={() => downloadReport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Tax Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Net Gain/Loss</p>
            {data.summary.netGainLoss >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          <p
            className={`text-3xl font-bold ${
              data.summary.netGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            ${Math.abs(data.summary.netGainLoss).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.summary.netGainLoss >= 0 ? 'Gain' : 'Loss'}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Short-Term Gains</p>
            <Calendar className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold">${data.summary.shortTermGains.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{'<1 year'}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Long-Term Gains</p>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${data.summary.longTermGains.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{'>1 year'}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Estimated Tax</p>
            <DollarSign className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">
            ${data.summary.estimatedTax.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">@ {taxRate}% rate</p>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Gains</p>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            ${data.summary.totalGains.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Losses</p>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            ${data.summary.totalLosses.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Income Received</p>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">${data.summary.incomeReceived.toLocaleString()}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Gains/Losses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Bar dataKey="gains" fill="#10b981" name="Gains" />
              <Bar dataKey="losses" fill="#ef4444" name="Losses" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Asset Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Gains/Losses by Asset</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.assetBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ asset, gainLoss }) =>
                  `${asset}: $${gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString()}`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="gainLoss"
              >
                {data.assetBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tax Calculator */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Tax Calculator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm mb-2 block">Your Tax Rate (%)</label>
            <Input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              min="0"
              max="50"
            />
          </div>
          <div>
            <label className="text-sm mb-2 block">Estimated Tax Owed</label>
            <div className="h-10 flex items-center px-3 bg-background border rounded-md">
              <span className="text-2xl font-bold text-red-600">
                ${((data.summary.netGainLoss * taxRate) / 100).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Taxable Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-sm font-semibold">Date</th>
                <th className="text-left p-3 text-sm font-semibold">Type</th>
                <th className="text-left p-3 text-sm font-semibold">Asset</th>
                <th className="text-right p-3 text-sm font-semibold">Amount</th>
                <th className="text-right p-3 text-sm font-semibold">Cost Basis</th>
                <th className="text-right p-3 text-sm font-semibold">Proceeds</th>
                <th className="text-right p-3 text-sm font-semibold">Gain/Loss</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.slice(0, 20).map((tx, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-3 text-sm">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Badge className={getTypeColor(tx.type)}>{tx.type.toUpperCase()}</Badge>
                  </td>
                  <td className="p-3 text-sm font-medium">{tx.asset}</td>
                  <td className="p-3 text-sm text-right">{tx.amount.toFixed(4)}</td>
                  <td className="p-3 text-sm text-right">${tx.costBasis.toLocaleString()}</td>
                  <td className="p-3 text-sm text-right">${tx.proceeds.toLocaleString()}</td>
                  <td
                    className={`p-3 text-sm text-right font-semibold ${
                      tx.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    ${tx.gainLoss >= 0 ? '+' : ''}
                    {tx.gainLoss.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.transactions.length > 20 && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Showing 20 of {data.transactions.length} transactions. Download full report for complete
            data.
          </p>
        )}
      </Card>

      {/* Tax Brackets */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tax Bracket Breakdown</h3>
        <div className="space-y-3">
          {data.taxBrackets.map((bracket, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-semibold">{bracket.bracket}</p>
                <p className="text-sm text-muted-foreground">{bracket.rate}% tax rate</p>
              </div>
              <p className="text-lg font-bold">${bracket.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Disclaimer */}
      <Card className="p-6 bg-yellow-500/10 border-yellow-500/20">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Important Tax Disclaimer</h3>
            <p className="text-sm text-muted-foreground mb-3">
              This tax report is for informational purposes only and should not be considered
              professional tax advice. Tax laws vary by jurisdiction and change frequently.
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>Consult with a qualified tax professional for your specific situation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>Verify all calculations and transactions before filing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>Keep detailed records of all crypto transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>Report all taxable events to your local tax authority</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

