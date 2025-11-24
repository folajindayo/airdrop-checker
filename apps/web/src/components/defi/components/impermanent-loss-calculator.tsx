'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  TrendingDown,
  DollarSign,
  Percent,
  AlertTriangle,
  Info,
  Calculator,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ILCalculation {
  impermanentLoss: number;
  impermanentLossPercent: number;
  hodlValue: number;
  lpValue: number;
  feesEarned: number;
  netProfit: number;
  netProfitPercent: number;
}

interface PriceScenario {
  priceChange: number;
  impermanentLoss: number;
  withFees: number;
}

export function ImpermanentLossCalculator() {
  const [tokenAAmount, setTokenAAmount] = useState(1000);
  const [tokenBAmount, setTokenBAmount] = useState(1000);
  const [tokenAPrice, setTokenAPrice] = useState(100);
  const [tokenBPrice, setTokenBPrice] = useState(1);
  const [newTokenAPrice, setNewTokenAPrice] = useState(150);
  const [newTokenBPrice, setNewTokenBPrice] = useState(1);
  const [dailyVolume, setDailyVolume] = useState(100000);
  const [poolTVL, setPoolTVL] = useState(1000000);
  const [feeRate, setFeeRate] = useState(0.3);
  const [daysHeld, setDaysHeld] = useState(30);
  const [calculation, setCalculation] = useState<ILCalculation | null>(null);
  const [scenarios, setScenarios] = useState<PriceScenario[]>([]);

  useEffect(() => {
    calculateIL();
    generateScenarios();
  }, [
    tokenAAmount,
    tokenBAmount,
    tokenAPrice,
    tokenBPrice,
    newTokenAPrice,
    newTokenBPrice,
    dailyVolume,
    poolTVL,
    feeRate,
    daysHeld,
  ]);

  function calculateIL() {
    // Initial values
    const initialValueA = tokenAAmount * tokenAPrice;
    const initialValueB = tokenBAmount * tokenBPrice;
    const initialTotal = initialValueA + initialValueB;

    // Price ratio change
    const initialRatio = tokenAPrice / tokenBPrice;
    const newRatio = newTokenAPrice / newTokenBPrice;
    const priceRatioChange = newRatio / initialRatio;

    // Calculate IL using the standard formula
    const ilMultiplier = (2 * Math.sqrt(priceRatioChange)) / (1 + priceRatioChange);
    const impermanentLossPercent = ((ilMultiplier - 1) * 100);

    // HODL value (if tokens were held separately)
    const hodlValueA = tokenAAmount * newTokenAPrice;
    const hodlValueB = tokenBAmount * newTokenBPrice;
    const hodlValue = hodlValueA + hodlValueB;

    // LP value (with IL)
    const lpValue = initialTotal * ilMultiplier;

    // Calculate fees earned
    const poolShare = initialTotal / poolTVL;
    const dailyFees = dailyVolume * (feeRate / 100);
    const feesEarned = dailyFees * poolShare * daysHeld;

    // Net profit/loss
    const impermanentLoss = hodlValue - lpValue;
    const netProfit = lpValue + feesEarned - initialTotal;
    const netProfitPercent = (netProfit / initialTotal) * 100;

    setCalculation({
      impermanentLoss,
      impermanentLossPercent,
      hodlValue,
      lpValue,
      feesEarned,
      netProfit,
      netProfitPercent,
    });
  }

  function generateScenarios() {
    const scenarios: PriceScenario[] = [];
    const priceChanges = [-90, -75, -50, -25, 0, 25, 50, 75, 100, 150, 200, 300, 500];

    for (const change of priceChanges) {
      const multiplier = 1 + change / 100;
      const priceRatioChange = multiplier;
      const ilMultiplier = (2 * Math.sqrt(priceRatioChange)) / (1 + priceRatioChange);
      const ilPercent = (ilMultiplier - 1) * 100;

      // Estimate fees for this scenario
      const poolShare = (tokenAAmount * tokenAPrice + tokenBAmount * tokenBPrice) / poolTVL;
      const dailyFees = dailyVolume * (feeRate / 100);
      const feesEarned = dailyFees * poolShare * daysHeld;
      const initialTotal = tokenAAmount * tokenAPrice + tokenBAmount * tokenBPrice;
      const feesPercent = (feesEarned / initialTotal) * 100;

      scenarios.push({
        priceChange: change,
        impermanentLoss: ilPercent,
        withFees: ilPercent + feesPercent,
      });
    }

    setScenarios(scenarios);
  }

  function getILColor(percent: number) {
    if (percent >= 0) return 'text-green-600';
    if (percent > -5) return 'text-yellow-600';
    return 'text-red-600';
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          LP Position Calculator
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Initial Position */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground">Initial Position</h4>
            <div>
              <label className="text-sm mb-2 block">Token A Amount</label>
              <Input
                type="number"
                value={tokenAAmount}
                onChange={(e) => setTokenAAmount(Number(e.target.value))}
                placeholder="1000"
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">Token A Initial Price ($)</label>
              <Input
                type="number"
                value={tokenAPrice}
                onChange={(e) => setTokenAPrice(Number(e.target.value))}
                placeholder="100"
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">Token B Amount</label>
              <Input
                type="number"
                value={tokenBAmount}
                onChange={(e) => setTokenBAmount(Number(e.target.value))}
                placeholder="1000"
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">Token B Initial Price ($)</label>
              <Input
                type="number"
                value={tokenBPrice}
                onChange={(e) => setTokenBPrice(Number(e.target.value))}
                placeholder="1"
              />
            </div>
          </div>

          {/* Current Position */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground">Current Prices</h4>
            <div>
              <label className="text-sm mb-2 block">Token A Current Price ($)</label>
              <Input
                type="number"
                value={newTokenAPrice}
                onChange={(e) => setNewTokenAPrice(Number(e.target.value))}
                placeholder="150"
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">Token B Current Price ($)</label>
              <Input
                type="number"
                value={newTokenBPrice}
                onChange={(e) => setNewTokenBPrice(Number(e.target.value))}
                placeholder="1"
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">Days Held</label>
              <Input
                type="number"
                value={daysHeld}
                onChange={(e) => setDaysHeld(Number(e.target.value))}
                placeholder="30"
              />
            </div>
          </div>
        </div>

        {/* Pool Parameters */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold text-sm text-muted-foreground mb-4">Pool Parameters</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm mb-2 block">Daily Volume ($)</label>
              <Input
                type="number"
                value={dailyVolume}
                onChange={(e) => setDailyVolume(Number(e.target.value))}
                placeholder="100000"
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">Pool TVL ($)</label>
              <Input
                type="number"
                value={poolTVL}
                onChange={(e) => setPoolTVL(Number(e.target.value))}
                placeholder="1000000"
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">Fee Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={feeRate}
                onChange={(e) => setFeeRate(Number(e.target.value))}
                placeholder="0.3"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {calculation && (
        <>
          {/* Main Results */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-muted-foreground">Impermanent Loss</p>
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <p className={`text-3xl font-bold ${getILColor(calculation.impermanentLossPercent)}`}>
                {calculation.impermanentLossPercent.toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ${Math.abs(calculation.impermanentLoss).toFixed(2)}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-muted-foreground">Fees Earned</p>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                ${calculation.feesEarned.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {((calculation.feesEarned / (tokenAAmount * tokenAPrice + tokenBAmount * tokenBPrice)) * 100).toFixed(2)}% of initial
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-muted-foreground">Net Profit/Loss</p>
                <Percent className="h-5 w-5 text-blue-600" />
              </div>
              <p className={`text-3xl font-bold ${getILColor(calculation.netProfitPercent)}`}>
                {calculation.netProfitPercent.toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ${calculation.netProfit.toFixed(2)}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-muted-foreground">LP vs HODL</p>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className={`text-3xl font-bold ${calculation.lpValue + calculation.feesEarned > calculation.hodlValue ? 'text-green-600' : 'text-red-600'}`}>
                {((calculation.lpValue + calculation.feesEarned - calculation.hodlValue) / calculation.hodlValue * 100).toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {calculation.lpValue + calculation.feesEarned > calculation.hodlValue ? 'LP Better' : 'HODL Better'}
              </p>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Initial Investment</span>
                  <span className="font-semibold">
                    ${(tokenAAmount * tokenAPrice + tokenBAmount * tokenBPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">HODL Value</span>
                  <span className="font-semibold">${calculation.hodlValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">LP Value (no fees)</span>
                  <span className="font-semibold">${calculation.lpValue.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fees Earned</span>
                  <span className="font-semibold text-green-600">
                    +${calculation.feesEarned.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">LP Value (with fees)</span>
                  <span className="font-semibold">
                    ${(calculation.lpValue + calculation.feesEarned).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Profit/Loss</span>
                  <span className={`font-semibold ${calculation.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculation.netProfit >= 0 ? '+' : ''}${calculation.netProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* IL Scenarios Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Impermanent Loss Scenarios</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={scenarios}>
                <defs>
                  <linearGradient id="colorIL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWithFees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="priceChange"
                  className="text-xs"
                  label={{ value: 'Price Change (%)', position: 'insideBottom', offset: -5 }}
                  tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}%`}
                />
                <YAxis
                  className="text-xs"
                  label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                  labelFormatter={(label) => `Price Change: ${label > 0 ? '+' : ''}${label}%`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="impermanentLoss"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorIL)"
                  name="IL Only"
                />
                <Area
                  type="monotone"
                  dataKey="withFees"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorWithFees)"
                  name="IL + Fees"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Info Card */}
          <Card className="p-6 bg-blue-500/10 border-blue-500/20">
            <div className="flex items-start gap-4">
              <Info className="h-8 w-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Understanding Impermanent Loss</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      Impermanent Loss occurs when the price ratio of tokens in a liquidity pool changes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      The larger the price change, the greater the impermanent loss
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      Trading fees can offset or exceed impermanent loss in high-volume pools
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      IL becomes "permanent" only when you withdraw your liquidity
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

