'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  Target,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Info,
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
} from 'recharts';

interface AirdropProject {
  name: string;
  logo?: string;
  probability: number;
  estimatedValue: number;
  criteria: {
    name: string;
    met: boolean;
    weight: number;
  }[];
  deadline?: string;
  chain: string;
  status: 'confirmed' | 'likely' | 'speculative';
}

interface ProbabilityFactors {
  factor: string;
  score: number;
  maxScore: number;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

interface ProbabilityData {
  overallScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  projects: AirdropProject[];
  factors: ProbabilityFactors[];
  radarData: { factor: string; score: number; fullMark: number }[];
  recommendations: string[];
  estimatedTotal: number;
}

interface AirdropProbabilityScoreProps {
  address: string;
}

export function AirdropProbabilityScore({ address }: AirdropProbabilityScoreProps) {
  const [data, setData] = useState<ProbabilityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchProbabilityData();
    }
  }, [address]);

  async function fetchProbabilityData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/airdrop-probability/${address}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching probability data:', error);
      toast.error('Failed to load airdrop probability score');
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
        return 'text-red-600 bg-red-600/10';
      default:
        return 'text-gray-600 bg-gray-600/10';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed':
        return 'bg-green-600';
      case 'likely':
        return 'bg-blue-600';
      case 'speculative':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  }

  function getImpactColor(impact: string) {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
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
        <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No probability data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <div className="h-28 w-28 rounded-full bg-background flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold">{data.overallScore}</p>
                    <p className="text-xs text-muted-foreground">/ 100</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2">
                <Badge className={`text-2xl font-bold px-4 py-2 ${getGradeColor(data.grade)}`}>
                  {data.grade}
                </Badge>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Airdrop Probability Score</h2>
              <p className="text-muted-foreground mb-4">
                Your wallet has a{' '}
                <span className="font-semibold text-purple-600">
                  {data.overallScore >= 80
                    ? 'very high'
                    : data.overallScore >= 60
                    ? 'high'
                    : data.overallScore >= 40
                    ? 'moderate'
                    : 'low'}
                </span>{' '}
                chance of receiving airdrops
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span className="text-sm">
                    Eligible for <span className="font-semibold">{data.projects.length}</span> airdrops
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm">
                    Est. Value:{' '}
                    <span className="font-semibold">${data.estimatedTotal.toLocaleString()}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Probability Factors Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Probability Factors</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={data.radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="factor" className="text-xs" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Factor Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Factor Breakdown</h3>
          <div className="space-y-3">
            {data.factors.map((factor) => (
              <div key={factor.factor} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{factor.factor}</span>
                    <Badge variant="outline" className={getImpactColor(factor.impact)}>
                      {factor.impact}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold">
                    {factor.score}/{factor.maxScore}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all"
                    style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{factor.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Eligible Airdrops */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Eligible Airdrops</h3>
        <div className="space-y-4">
          {data.projects.map((project) => {
            const metCriteria = project.criteria.filter((c) => c.met).length;
            const totalCriteria = project.criteria.length;
            const completionRate = (metCriteria / totalCriteria) * 100;

            return (
              <div
                key={project.name}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-4 flex-1">
                    {project.logo ? (
                      <img src={project.logo} alt={project.name} className="h-12 w-12 rounded-full" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                        {project.name.substring(0, 2)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{project.name}</h4>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{project.chain}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Probability: <span className="font-semibold text-purple-600">{project.probability}%</span>
                        </span>
                        <span className="text-muted-foreground">
                          Est. Value:{' '}
                          <span className="font-semibold text-green-600">
                            ${project.estimatedValue.toLocaleString()}
                          </span>
                        </span>
                        {project.deadline && (
                          <span className="text-red-600 text-xs font-medium">
                            Deadline: {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-600 text-white">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{project.probability}</p>
                        <p className="text-[8px]">%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Criteria Met: {metCriteria}/{totalCriteria}
                    </span>
                    <span className="text-xs font-semibold text-purple-600">
                      {completionRate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Criteria */}
                <div className="space-y-2">
                  {project.criteria.map((criterion, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {criterion.met ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={criterion.met ? '' : 'text-muted-foreground'}>
                          {criterion.name}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {criterion.weight}% weight
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 bg-blue-500/10 border-blue-500/20">
        <div className="flex items-start gap-4">
          <Zap className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Boost Your Probability</h3>
            <ul className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-purple-500/10 border-purple-500/20">
        <div className="flex items-start gap-4">
          <Info className="h-8 w-8 text-purple-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">How Probability is Calculated</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Your airdrop probability score is calculated using advanced machine learning algorithms
              that analyze multiple factors:
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>
                  <strong>Activity Level:</strong> Transaction frequency and consistency
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>
                  <strong>Protocol Diversity:</strong> Number of unique protocols used
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>
                  <strong>Early Adoption:</strong> Using protocols before they become mainstream
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>
                  <strong>Value Locked:</strong> Amount and duration of assets in protocols
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>
                  <strong>Community Engagement:</strong> Governance participation and social activity
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

