/**
 * Type definitions for Protocol Insights component
 */

export interface FocusArea {
  category: string;
  categoryLabel: string;
  interactions: number;
  uniqueProtocols: number;
  score: number;
  status: 'strong' | 'needs_attention' | 'missing';
  recommendation: string;
}

export interface CategoryScore {
  category: string;
  categoryLabel: string;
  score: number;
  interactions: number;
  uniqueProtocols: number;
  status: 'strong' | 'needs_attention' | 'missing';
}

export interface TimelineEntry {
  id: string;
  txHash: string;
  date: string;
  protocol: string;
  category: string;
  categoryLabel: string;
  chainId: number;
  chainName: string;
  description: string;
}

export interface ProtocolBreakdownEntry {
  protocol: string;
  category: string;
  categoryLabel: string;
  chainId: number;
  chainName: string;
  interactionCount: number;
  firstInteraction?: string;
  lastInteraction?: string;
  daysActive: number;
}

export interface MonthlyActivity {
  month: string;
  interactionCount: number;
  uniqueProtocols: number;
}

export type MomentumDirection = 'up' | 'steady' | 'down';
export type VelocityTrend = 'accelerating' | 'steady' | 'cooling';
export type DecayStatus = 'fresh' | 'warm' | 'stale';

export interface VelocityMetrics {
  currentAvgDaily: number;
  previousAvgDaily: number;
  percentChange: number;
  deltaInteractions: number;
  trend: VelocityTrend;
}

export interface DecayMetrics {
  daysSinceInteraction: number | null;
  status: DecayStatus;
}

export interface CoverageMetrics {
  score: number;
  coveredCategories: string[];
  totalCategories: number;
  missingCategories: string[];
}

export interface DormantProtocol {
  protocol: string;
  categoryLabel: string;
  daysSinceInteraction: number | null;
  lastInteraction?: string;
}

export interface DiversityMetrics {
  score: number;
  entropy: number;
  categoryDistribution: Array<{ category: string; percentage: number }>;
}

export interface ProtocolInsightsData {
  focusAreas: FocusArea[];
  categoryScores: CategoryScore[];
  timeline: TimelineEntry[];
  protocolBreakdown: ProtocolBreakdownEntry[];
  monthlyActivity: MonthlyActivity[];
  momentum: MomentumDirection;
  velocity: VelocityMetrics;
  decay: DecayMetrics;
  coverage: CoverageMetrics;
  dormantProtocols: DormantProtocol[];
  diversity: DiversityMetrics;
}

