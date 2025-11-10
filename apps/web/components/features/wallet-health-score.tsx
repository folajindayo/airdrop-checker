'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  Heart,
  TrendingUp,
  Shield,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';

interface HealthMetric {
  category: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  details: string;
  recommendations: string[];
}

interface HealthScore {
  overall: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  metrics: HealthMetric[];
  strengths: string[];
  weaknesses: string[];
  riskLevel: 'low' | 'medium' | 'high';
  airdropReadiness: number;
}

interface HistoricalScore {
  date: string;
  score: number;
}

interface WalletHealthData {
  healthScore: HealthScore;
  historicalScores: HistoricalScore[];
  radarData: { metric: string; score: number; fullMark: number }[];
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: number;
  }[];
}

interface WalletHealthScoreProps {
  address: string;
}

export function WalletHealthScore({ address }: WalletHealthScoreProps) {
  const [data, setData] = useState<WalletHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchHealthData();
    }
  }, [address]);

  async function fetchHealthData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/wallet-health/${address}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching health data:', error);
      toast.error('Failed to load wallet health score');
    } finally {
      setLoading(false);
    }
  }

  function getGradeColor(grade: string) {
    switch (grade) {
      case 'S':
      case 'A':
        return 'text-green-600 bg-green-600/10';
      case 'B':
        return 'text-blue-600 bg-blue-600/10';
      case 'C':
        return 'text-yellow-600 bg-yellow-600/10';
      case 'D':
      case 'F':
        return 'text-red-600 bg-red-600/10';
      default:
        return 'text-gray-600 bg-gray-600/10';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'fair':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'poor':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high':
        return 'bg-red-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-green-600';
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
        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No wallet health data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card className="p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="h-28 w-28 rounded-full bg-background flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold">{data.healthScore.overall}</p>
                    <p className="text-xs text-muted-foreground">/ 100</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2">
                <Badge className={`text-2xl font-bold px-4 py-2 ${getGradeColor(data.healthScore.grade)}`}>
                  {data.healthScore.grade}
                </Badge>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Wallet Health Score</h2>
              <p className="text-muted-foreground mb-4">
                Your wallet is in{' '}
                <span className={getStatusColor(data.healthScore.metrics[0].status)}>
                  {data.healthScore.overall >= 80
                    ? 'excellent'
                    : data.healthScore.overall >= 60
                    ? 'good'
                    : data.healthScore.overall >= 40
                    ? 'fair'
                    : 'poor'}
                </span>{' '}
                condition
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">
                    Risk Level:{' '}
                    <span className="font-semibold capitalize">{data.healthScore.riskLevel}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span className="text-sm">
                    Airdrop Readiness:{' '}
                    <span className="font-semibold">{data.healthScore.airdropReadiness}%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Health Metrics Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Health Metrics Overview</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={data.radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" className="text-xs" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Historical Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Health Score Trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.historicalScores}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis domain={[0, 100]} className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Health Metrics</h3>
        <div className="space-y-4">
          {data.healthScore.metrics.map((metric) => (
            <div key={metric.category} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(metric.status)}
                  <div>
                    <h4 className="font-semibold">{metric.category}</h4>
                    <p className="text-sm text-muted-foreground">{metric.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {metric.score}/{metric.maxScore}
                  </p>
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="mb-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      metric.status === 'excellent'
                        ? 'bg-green-600'
                        : metric.status === 'good'
                        ? 'bg-blue-600'
                        : metric.status === 'fair'
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${(metric.score / metric.maxScore) * 100}%` }}
                  />
                </div>
              </div>
              {metric.recommendations.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">Recommendations:</p>
                  {metric.recommendations.map((rec, i) => (
                    <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      {rec}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-green-500/10 border-green-500/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {data.healthScore.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-1">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 bg-red-500/10 border-red-500/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {data.healthScore.weaknesses.map((weakness, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-red-600 mt-1">!</span>
                {weakness}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Actionable Recommendations</h3>
        <div className="space-y-3">
          {data.recommendations.map((rec, i) => (
            <div
              key={i}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority.toUpperCase()}
                  </Badge>
                  <h4 className="font-semibold">{rec.title}</h4>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Impact</p>
                  <p className="text-lg font-bold text-green-600">+{rec.impact}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{rec.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Button */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Ready to Improve Your Score?</h3>
            <p className="text-sm text-muted-foreground">
              Follow our recommendations to boost your wallet health and airdrop eligibility
            </p>
          </div>
          <Button size="lg" className="ml-4">
            <Award className="h-5 w-5 mr-2" />
            Get Started
          </Button>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-blue-500/10 border-blue-500/20">
        <div className="flex items-start gap-4">
          <Info className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">About Wallet Health Score</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Your Wallet Health Score is calculated based on multiple factors including activity
              diversity, security practices, DeFi participation, NFT holdings, and airdrop
              eligibility criteria.
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  <strong>S Grade (90-100):</strong> Exceptional wallet with diverse activities
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  <strong>A Grade (80-89):</strong> Excellent wallet with strong fundamentals
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  <strong>B Grade (70-79):</strong> Good wallet with room for improvement
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  <strong>C Grade (60-69):</strong> Average wallet needing attention
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

