'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/common/skeleton';
import { LineChart as LineChartIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SUPPORTED_CHAINS } from '@airdrop-finder/shared';

interface GasHistoryProps {
  className?: string;
}

interface GasPricePoint {
  timestamp: number;
  date: string;
  gasPrice: number;
  chainId: number;
  chainName: string;
}

interface GasHistoryData {
  chains: Record<number, {
    chainId: number;
    chainName: string;
    dataPoints: GasPricePoint[];
    average: number;
    min: number;
    max: number;
    current: number;
  }>;
  bestTimes: Array<{
    chainId: number;
    chainName: string;
    time: string;
    averageGas: number;
  }>;
  timestamp: number;
}

export function GasHistory({ className = '' }: GasHistoryProps) {
  const [data, setData] = useState<GasHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [days, setDays] = useState<number>(30);

  useEffect(() => {
    async function fetchGasHistory() {
      setLoading(true);
      
      try {
        const url = selectedChain !== 'all'
          ? `/api/gas-history?chainId=${selectedChain}&days=${days}`
          : `/api/gas-history?days=${days}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch gas history');
        }
        
        const historyData = await response.json();
        setData(historyData);
      } catch (error) {
        console.error('Error fetching gas history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGasHistory();
  }, [selectedChain, days]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Gas Price History</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatGasPrice = (price: number) => {
    if (price < 1) {
      return `${price.toFixed(3)} gwei`;
    }
    return `${price.toFixed(1)} gwei`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chainsToDisplay = selectedChain === 'all'
    ? Object.values(data.chains)
    : [data.chains[parseInt(selectedChain)]].filter(Boolean);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChartIcon className="h-5 w-5" />
          Gas Price History
        </CardTitle>
        <CardDescription>Historical gas price trends across chains</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Chain</label>
            <Select value={selectedChain} onValueChange={setSelectedChain}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                {SUPPORTED_CHAINS.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id.toString()}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Time Period</label>
            <Select value={days.toString()} onValueChange={(value) => setDays(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart */}
        {chainsToDisplay.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Price Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatGasPrice(value)}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Legend />
                {chainsToDisplay.map((chain) => (
                  <Line
                    key={chain.chainId}
                    type="monotone"
                    dataKey="gasPrice"
                    data={chain.dataPoints}
                    name={chain.chainName}
                    stroke={`hsl(${(chain.chainId * 60) % 360}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {chainsToDisplay.map((chain) => (
            <div key={chain.chainId} className="border rounded-lg p-4">
              <p className="text-sm font-medium mb-2">{chain.chainName}</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current</span>
                  <span className="font-semibold">{formatGasPrice(chain.current)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average</span>
                  <span>{formatGasPrice(chain.average)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min</span>
                  <span className="text-green-600">{formatGasPrice(chain.min)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max</span>
                  <span className="text-red-600">{formatGasPrice(chain.max)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Best Times */}
        {data.bestTimes.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Best Times to Transact</h3>
            <div className="space-y-2">
              {data.bestTimes.map((time, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{time.chainName}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{time.time}</p>
                    <p className="text-xs text-muted-foreground">
                      Avg: {formatGasPrice(time.averageGas)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

