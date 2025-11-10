'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Award,
  Trophy,
  Star,
  Users,
  Calendar,
  ExternalLink,
  Twitter,
  Github,
  Globe,
  Shield,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface ENSProfile {
  name: string;
  avatar?: string;
  description?: string;
  twitter?: string;
  github?: string;
  website?: string;
  email?: string;
}

interface POAP {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  eventDate: string;
  eventId: string;
  chain: string;
}

interface Credential {
  type: string;
  name: string;
  issuer: string;
  issuedDate: string;
  verified: boolean;
  description?: string;
  icon?: string;
}

interface ReputationScore {
  overall: number;
  ens: number;
  poaps: number;
  credentials: number;
  activity: number;
}

interface SocialReputationData {
  address: string;
  ensProfile?: ENSProfile;
  poaps: POAP[];
  credentials: Credential[];
  reputationScore: ReputationScore;
  badges: string[];
  followerCount?: number;
  followingCount?: number;
  joinDate?: string;
}

interface SocialReputationProps {
  address: string;
}

const BADGE_ICONS: Record<string, any> = {
  'Early Adopter': Calendar,
  'NFT Collector': Trophy,
  'DeFi User': Zap,
  'DAO Member': Users,
  'Verified': Shield,
  'Power User': Star,
};

export function SocialReputation({ address }: SocialReputationProps) {
  const [data, setData] = useState<SocialReputationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'poaps' | 'credentials'>('overview');

  useEffect(() => {
    if (address) {
      fetchSocialReputation();
    }
  }, [address]);

  async function fetchSocialReputation() {
    setLoading(true);
    try {
      const response = await fetch(`/api/social-reputation/${address}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching social reputation:', error);
      toast.error('Failed to load social reputation');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No social reputation data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {data.ensProfile?.avatar ? (
                  <img src={data.ensProfile.avatar} alt="Profile" className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    {address.slice(2, 4).toUpperCase()}
                  </div>
                )}
              </Avatar>
              {data.ensProfile && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold">
                {data.ensProfile?.name || `${address.slice(0, 6)}...${address.slice(-4)}`}
              </h2>
              {data.ensProfile?.description && (
                <p className="text-sm text-muted-foreground mt-1">{data.ensProfile.description}</p>
              )}
            </div>
          </div>

          {/* Social Links */}
          {data.ensProfile && (
            <div className="flex flex-wrap gap-2">
              {data.ensProfile.twitter && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://twitter.com/${data.ensProfile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </a>
                </Button>
              )}
              {data.ensProfile.github && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://github.com/${data.ensProfile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </a>
                </Button>
              )}
              {data.ensProfile.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={data.ensProfile.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex-1 grid grid-cols-3 gap-4 ml-auto">
            <div className="text-center">
              <div className="text-2xl font-bold">{data.poaps.length}</div>
              <div className="text-sm text-muted-foreground">POAPs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.credentials.length}</div>
              <div className="text-sm text-muted-foreground">Credentials</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.badges.length}</div>
              <div className="text-sm text-muted-foreground">Badges</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Reputation Score */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Reputation Score</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="col-span-1 md:col-span-2 text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
                <circle
                  className="text-primary stroke-current"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                  strokeDasharray={`${(data.reputationScore.overall / 100) * 351.86} 351.86`}
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div className="absolute text-3xl font-bold">{data.reputationScore.overall}</div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Overall Score</p>
          </div>

          <div className="col-span-1 md:col-span-3 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">ENS Profile</span>
                <span className="text-sm font-bold">{data.reputationScore.ens}/100</span>
              </div>
              <Progress value={data.reputationScore.ens} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">POAPs</span>
                <span className="text-sm font-bold">{data.reputationScore.poaps}/100</span>
              </div>
              <Progress value={data.reputationScore.poaps} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Credentials</span>
                <span className="text-sm font-bold">{data.reputationScore.credentials}/100</span>
              </div>
              <Progress value={data.reputationScore.credentials} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Activity</span>
                <span className="text-sm font-bold">{data.reputationScore.activity}/100</span>
              </div>
              <Progress value={data.reputationScore.activity} className="h-2" />
            </div>
          </div>
        </div>
      </Card>

      {/* Badges */}
      {data.badges.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Achievement Badges</h3>
          <div className="flex flex-wrap gap-3">
            {data.badges.map((badge, index) => {
              const Icon = BADGE_ICONS[badge] || Award;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg"
                >
                  <Icon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{badge}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Button>
        <Button
          variant={activeTab === 'poaps' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('poaps')}
        >
          POAPs ({data.poaps.length})
        </Button>
        <Button
          variant={activeTab === 'credentials' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('credentials')}
        >
          Credentials ({data.credentials.length})
        </Button>
      </div>

      {/* POAPs Tab */}
      {activeTab === 'poaps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.poaps.map((poap) => (
            <Card key={poap.id} className="p-4 hover:shadow-lg transition-shadow">
              <img
                src={poap.imageUrl}
                alt={poap.name}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
              <h4 className="font-semibold mb-1">{poap.name}</h4>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{poap.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(poap.eventDate).toLocaleDateString()}</span>
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={`https://poap.gallery/event/${poap.eventId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Credentials Tab */}
      {activeTab === 'credentials' && (
        <div className="space-y-3">
          {data.credentials.map((credential, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{credential.name}</h4>
                    {credential.verified && (
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{credential.issuer}</p>
                  {credential.description && (
                    <p className="text-sm text-muted-foreground mb-2">{credential.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Issued: {new Date(credential.issuedDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">{credential.type}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent POAPs */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent POAPs</h3>
            <div className="space-y-3">
              {data.poaps.slice(0, 3).map((poap) => (
                <div key={poap.id} className="flex items-center gap-3">
                  <img src={poap.imageUrl} alt={poap.name} className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{poap.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(poap.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Credentials */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Credentials</h3>
            <div className="space-y-3">
              {data.credentials.slice(0, 3).map((credential, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{credential.name}</p>
                    <p className="text-xs text-muted-foreground">{credential.issuer}</p>
                  </div>
                  {credential.verified && <Shield className="h-4 w-4 text-green-600" />}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

