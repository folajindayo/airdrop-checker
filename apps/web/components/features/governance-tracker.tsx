'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  Vote,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Proposal {
  id: string;
  title: string;
  description: string;
  protocol: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  startDate: string;
  endDate: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  totalVotes: number;
  category: string;
  proposer: string;
  link?: string;
}

interface VotingStats {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  rejectedProposals: number;
  participationRate: number;
  userVotes: number;
}

interface GovernanceData {
  stats: VotingStats;
  proposals: Proposal[];
  userVotingHistory: {
    protocol: string;
    votes: number;
    votingPower: number;
  }[];
  protocolActivity: {
    protocol: string;
    proposals: number;
    participation: number;
  }[];
}

interface GovernanceTrackerProps {
  address: string;
}

const COLORS = ['#10b981', '#ef4444', '#6b7280', '#3b82f6'];

export function GovernanceTracker({ address }: GovernanceTrackerProps) {
  const [data, setData] = useState<GovernanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'passed' | 'rejected'>('all');

  useEffect(() => {
    if (address) {
      fetchGovernanceData();
    }
  }, [address]);

  async function fetchGovernanceData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/governance/${address}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching governance data:', error);
      toast.error('Failed to load governance data');
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'bg-blue-600';
      case 'passed':
        return 'bg-green-600';
      case 'rejected':
        return 'bg-red-600';
      case 'pending':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  }

  function getTimeRemaining(endDate: string) {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
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
        <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No governance data available</p>
      </Card>
    );
  }

  const filteredProposals =
    filter === 'all' ? data.proposals : data.proposals.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Proposals</p>
            <Vote className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{data.stats.totalProposals}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Active</p>
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{data.stats.activeProposals}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Passed</p>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{data.stats.passedProposals}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{data.stats.rejectedProposals}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-muted-foreground">Your Votes</p>
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">{data.stats.userVotes}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voting History */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Voting Power by Protocol</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.userVotingHistory}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="protocol" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                }}
              />
              <Bar dataKey="votingPower" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Protocol Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Protocol Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.protocolActivity}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="protocol" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                }}
              />
              <Legend />
              <Bar dataKey="proposals" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Proposals" />
              <Bar dataKey="participation" fill="#10b981" radius={[8, 8, 0, 0]} name="Participation %" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'passed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('passed')}
        >
          Passed
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </Button>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map((proposal) => {
          const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
          const forPercent = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
          const againstPercent = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
          const abstainPercent = totalVotes > 0 ? (proposal.votesAbstain / totalVotes) * 100 : 0;
          const quorumReached = totalVotes >= proposal.quorum;

          return (
            <Card key={proposal.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{proposal.protocol}</Badge>
                    <Badge className={getStatusColor(proposal.status)}>
                      {proposal.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{proposal.category}</Badge>
                    {quorumReached && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Quorum Reached
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {proposal.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Proposed by: {proposal.proposer.slice(0, 10)}...</span>
                    <span>•</span>
                    <span>
                      {new Date(proposal.startDate).toLocaleDateString()} -{' '}
                      {new Date(proposal.endDate).toLocaleDateString()}
                    </span>
                    {proposal.status === 'active' && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 font-medium">
                          {getTimeRemaining(proposal.endDate)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {proposal.link && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={proposal.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Voting Results */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">For</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {forPercent.toFixed(1)}% ({proposal.votesFor.toLocaleString()} votes)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full transition-all"
                      style={{ width: `${forPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">Against</span>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      {againstPercent.toFixed(1)}% ({proposal.votesAgainst.toLocaleString()} votes)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 rounded-full transition-all"
                      style={{ width: `${againstPercent}%` }}
                    />
                  </div>
                </div>

                {proposal.votesAbstain > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Abstain</span>
                      <span className="text-sm font-semibold text-gray-600">
                        {abstainPercent.toFixed(1)}% ({proposal.votesAbstain.toLocaleString()} votes)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-600 rounded-full transition-all"
                        style={{ width: `${abstainPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <span>
                    Total votes: {totalVotes.toLocaleString()} / Quorum: {proposal.quorum.toLocaleString()}
                  </span>
                  <span>
                    Participation: {((totalVotes / proposal.totalVotes) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {proposal.status === 'active' && (
                <div className="flex gap-2 mt-4">
                  <Button variant="default" className="flex-1">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Vote For
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Vote Against
                  </Button>
                  <Button variant="outline">Abstain</Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <div className="flex items-start gap-4">
          <Vote className="h-8 w-8 text-purple-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Governance Insights</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  You've participated in {data.stats.userVotes} votes across{' '}
                  {data.userVotingHistory.length} protocols
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  {data.stats.activeProposals} active proposals waiting for your vote
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>
                  Average participation rate: {data.stats.participationRate.toFixed(1)}%
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

