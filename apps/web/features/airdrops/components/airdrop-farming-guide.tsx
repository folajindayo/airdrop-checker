'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  Sparkles,
  Target,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Star,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface AirdropStrategy {
  id: string;
  protocol: string;
  logo?: string;
  status: 'confirmed' | 'speculative' | 'rumored';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedValue: number;
  timeRequired: string;
  chain: string;
  category: string;
  tasks: Task[];
  tips: string[];
  requirements: string[];
  deadline?: string;
  links: {
    website?: string;
    twitter?: string;
    discord?: string;
    docs?: string;
  };
}

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
}

interface FarmingStats {
  totalStrategies: number;
  confirmedAirdrops: number;
  estimatedValue: number;
  completedTasks: number;
  activeStrategies: number;
}

interface AirdropFarmingData {
  stats: FarmingStats;
  strategies: AirdropStrategy[];
  hotStrategies: AirdropStrategy[];
  categories: { name: string; count: number }[];
}

export function AirdropFarmingGuide() {
  const [data, setData] = useState<AirdropFarmingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'speculative' | 'rumored'>('all');
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFarmingData();
  }, []);

  async function fetchFarmingData() {
    setLoading(true);
    try {
      const response = await fetch('/api/airdrop-farming');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching farming data:', error);
      toast.error('Failed to load airdrop farming guide');
    } finally {
      setLoading(false);
    }
  }

  function toggleTask(taskId: string) {
    setCompletedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
        toast.success('Task marked as incomplete');
      } else {
        newSet.add(taskId);
        toast.success('Task completed! 🎉');
      }
      return newSet;
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed':
        return 'bg-green-600';
      case 'speculative':
        return 'bg-blue-600';
      case 'rumored':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  }

  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-600/10';
      case 'medium':
        return 'text-yellow-600 bg-yellow-600/10';
      case 'hard':
        return 'text-red-600 bg-red-600/10';
      default:
        return 'text-gray-600 bg-gray-600/10';
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
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
        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No airdrop farming strategies available</p>
      </Card>
    );
  }

  const filteredStrategies =
    filter === 'all' ? data.strategies : data.strategies.filter((s) => s.status === filter);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Strategies</p>
            <Target className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{data.stats.totalStrategies}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Confirmed</p>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{data.stats.confirmedAirdrops}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Est. Value</p>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">
            ${(data.stats.estimatedValue / 1000).toFixed(0)}k
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Completed</p>
            <Sparkles className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold">{completedTasks.size}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Active</p>
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{data.stats.activeStrategies}</p>
        </Card>
      </div>

      {/* Hot Strategies */}
      <Card className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🔥 Hot Strategies - Act Now!
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.hotStrategies.map((strategy) => (
            <div
              key={strategy.id}
              className="p-4 bg-background border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {strategy.logo ? (
                    <img src={strategy.logo} alt={strategy.protocol} className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                      {strategy.protocol.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">{strategy.protocol}</h4>
                    <p className="text-xs text-muted-foreground">{strategy.chain}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(strategy.status)}>
                  {strategy.status.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Value:</span>
                  <span className="font-semibold text-green-600">
                    ${strategy.estimatedValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{strategy.timeRequired}</span>
                </div>
                {strategy.deadline && (
                  <div className="flex items-center gap-1 text-red-600">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs font-medium">Deadline: {new Date(strategy.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'confirmed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('confirmed')}
        >
          Confirmed
        </Button>
        <Button
          variant={filter === 'speculative' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('speculative')}
        >
          Speculative
        </Button>
        <Button
          variant={filter === 'rumored' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('rumored')}
        >
          Rumored
        </Button>
      </div>

      {/* Strategies List */}
      <div className="space-y-6">
        {filteredStrategies.map((strategy) => {
          const completedCount = strategy.tasks.filter((t) => completedTasks.has(t.id)).length;
          const progress = (completedCount / strategy.tasks.length) * 100;

          return (
            <Card key={strategy.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {strategy.logo ? (
                    <img src={strategy.logo} alt={strategy.protocol} className="h-16 w-16 rounded-full" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      {strategy.protocol.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">{strategy.protocol}</h3>
                      <Badge className={getStatusColor(strategy.status)}>
                        {strategy.status.toUpperCase()}
                      </Badge>
                      <Badge className={getDifficultyColor(strategy.difficulty)}>
                        {strategy.difficulty.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{strategy.chain}</span>
                      <span>•</span>
                      <span>{strategy.category}</span>
                      <span>•</span>
                      <span className="text-green-600 font-semibold">
                        Est. ${strategy.estimatedValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {strategy.links.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={strategy.links.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Progress: {completedCount}/{strategy.tasks.length} tasks
                  </span>
                  <span className="text-sm font-semibold text-blue-600">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Requirements */}
              {strategy.requirements.length > 0 && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Requirements:</p>
                  <ul className="space-y-1">
                    {strategy.requirements.map((req, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tasks */}
              <div className="space-y-2 mb-4">
                <p className="text-sm font-semibold">Tasks:</p>
                {strategy.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 border rounded-lg transition-all ${
                      completedTasks.has(task.id) ? 'bg-green-500/10 border-green-500/20' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                          completedTasks.has(task.id)
                            ? 'bg-green-600 border-green-600'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {completedTasks.has(task.id) && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`font-medium ${
                              completedTasks.has(task.id) ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {task.title}
                          </p>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{task.estimatedTime}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              {strategy.tips.length > 0 && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-600" />
                    Pro Tips:
                  </p>
                  <ul className="space-y-1">
                    {strategy.tips.map((tip, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {strategy.deadline && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm font-medium">
                    Deadline: {new Date(strategy.deadline).toLocaleDateString()} - Act fast!
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Disclaimer */}
      <Card className="p-6 bg-yellow-500/10 border-yellow-500/20">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Important Disclaimer</h3>
            <p className="text-sm text-muted-foreground">
              Airdrop farming involves risks and no guarantees. Estimated values are speculative.
              Always DYOR, never share private keys, be cautious of scams, and only invest time/money
              you can afford to lose. Past airdrops don't guarantee future results.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

