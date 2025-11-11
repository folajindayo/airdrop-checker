'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { TrendingUp, AlertCircle, CheckCircle2, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProbabilityPredictorProps {
  address: string;
  airdrops: Array<{
    projectId: string;
    project: string;
    score: number;
  }>;
  activityLevel?: number;
  gasSpentUSD?: number;
  className?: string;
}

interface ProbabilityPrediction {
  projectId: string;
  projectName: string;
  probability: number;
  confidence: 'high' | 'medium' | 'low';
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }>;
  estimatedValue?: number;
  recommendedActions: string[];
}

interface ProbabilityPredictorData {
  address: string;
  predictions: ProbabilityPrediction[];
  overallProbability: number;
  topOpportunities: ProbabilityPrediction[];
  timestamp: number;
}

export function ProbabilityPredictor({
  address,
  airdrops,
  activityLevel = 30,
  gasSpentUSD = 0,
  className = '',
}: ProbabilityPredictorProps) {
  const [data, setData] = useState<ProbabilityPredictorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || airdrops.length === 0) return;
    predictProbabilities();
  }, [address, airdrops, activityLevel, gasSpentUSD]);

  async function predictProbabilities() {
    if (!address || airdrops.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/probability-predictor/${address}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airdrops,
          activityLevel,
          gasSpentUSD,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to predict probabilities');
      }

      const predictorData = await response.json();
      setData(predictorData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

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

  if (error || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Probability Predictor</CardTitle>
          <CardDescription>Error loading predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Airdrop Probability Predictor
        </CardTitle>
        <CardDescription>ML-powered probability predictions for airdrop eligibility</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Probability */}
        <div className="bg-muted/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Probability</p>
              <p className="text-4xl font-bold mt-1">{data.overallProbability.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <Progress value={data.overallProbability} className="h-2 mt-4" />
        </div>

        {/* Top Opportunities */}
        {data.topOpportunities.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Top Opportunities</h3>
            <div className="space-y-3">
              {data.topOpportunities.map((prediction) => (
                <div
                  key={prediction.projectId}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{prediction.projectName}</span>
                      <Badge className={getConfidenceColor(prediction.confidence)}>
                        {prediction.confidence.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{prediction.probability.toFixed(1)}%</p>
                      {prediction.estimatedValue && (
                        <p className="text-xs text-muted-foreground">
                          Est: {formatCurrency(prediction.estimatedValue)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Progress value={prediction.probability} className="h-1.5 mb-3" />
                  
                  {/* Factors */}
                  {prediction.factors.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {prediction.factors.slice(0, 3).map((factor, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs"
                        >
                          {factor.impact === 'positive' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : factor.impact === 'negative' ? (
                            <AlertCircle className="h-3 w-3 text-red-600" />
                          ) : (
                            <div className="h-3 w-3 rounded-full bg-gray-400" />
                          )}
                          <span className="text-muted-foreground">{factor.factor}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommended Actions */}
                  {prediction.recommendedActions.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs font-medium mb-1">Recommendations:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {prediction.recommendedActions.map((action, index) => (
                          <li key={index}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Predictions */}
        <div>
          <h3 className="font-semibold mb-3">All Predictions</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.predictions.map((prediction) => (
              <div
                key={prediction.projectId}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{prediction.projectName}</span>
                    <Badge variant="outline" className={getConfidenceColor(prediction.confidence)}>
                      {prediction.confidence}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{prediction.probability.toFixed(0)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



