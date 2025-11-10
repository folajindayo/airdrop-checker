import type {
  AirdropProject,
  TrendingProjectSummary,
  TrendingSignal,
  TrendingSignalType,
  AirdropStatus,
} from '@airdrop-finder/shared';
import { daysUntil, parseEstimatedValue } from './utils';

interface TrendingOptions {
  limit?: number;
  status?: AirdropStatus[];
  chain?: string | null;
}

const STATUS_WEIGHTS: Record<AirdropStatus, number> = {
  confirmed: 28,
  rumored: 18,
  speculative: 10,
  expired: 2,
};

const SIGNAL_LABELS: Record<TrendingSignalType, string> = {
  status: 'High confidence status',
  value: 'Estimated value available',
  snapshot: 'Snapshot window active',
  activity: 'Recently updated project',
  claim: 'Claim window open',
  chain: 'Multi-chain exposure',
};

function buildSignal(type: TrendingSignalType, weight: number): TrendingSignal {
  return {
    type,
    weight,
    label: SIGNAL_LABELS[type],
  };
}

function scoreProject(project: AirdropProject): {
  score: number;
  signals: TrendingSignal[];
} {
  let score = STATUS_WEIGHTS[project.status] ?? 0;
  const signals: TrendingSignal[] = [buildSignal('status', STATUS_WEIGHTS[project.status])];

  const estimatedValue = parseEstimatedValue(project.estimatedValue);
  if (estimatedValue > 0) {
    const valueWeight =
      estimatedValue >= 5e7 ? 18 : estimatedValue >= 1e7 ? 12 : estimatedValue >= 1e6 ? 8 : 5;
    score += valueWeight;
    signals.push(buildSignal('value', valueWeight));
  }

  const snapshotDiff = daysUntil(project.snapshotDate);
  if (snapshotDiff !== null) {
    if (snapshotDiff >= 0 && snapshotDiff <= 3) {
      score += 16;
      signals.push(buildSignal('snapshot', 16));
    } else if (snapshotDiff > 3 && snapshotDiff <= 14) {
      score += 10;
      signals.push(buildSignal('snapshot', 10));
    } else if (snapshotDiff < 0 && snapshotDiff >= -7) {
      score += 8;
      signals.push(buildSignal('snapshot', 8));
    }
  }

  if (project.updatedAt) {
    const hoursSinceUpdate = (Date.now() - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceUpdate <= 24) {
      score += 12;
      signals.push(buildSignal('activity', 12));
    } else if (hoursSinceUpdate <= 72) {
      score += 8;
      signals.push(buildSignal('activity', 8));
    } else if (hoursSinceUpdate <= 168) {
      score += 4;
      signals.push(buildSignal('activity', 4));
    }
  }

  if (project.claimUrl) {
    score += 10;
    signals.push(buildSignal('claim', 10));
  }

  const chainCount = project.chains?.length ?? 0;
  if (chainCount > 1) {
    const chainWeight = Math.min((chainCount - 1) * 2, 8);
    score += chainWeight;
    signals.push(buildSignal('chain', chainWeight));
  }

  return {
    score: Math.min(Math.round(score), 100),
    signals,
  };
}

export function calculateTrendingProjects(
  projects: AirdropProject[],
  options: TrendingOptions = {}
): TrendingProjectSummary[] {
  const { limit = 5, status, chain } = options;

  const filtered = projects.filter((project) => {
    const statusMatch = status ? status.includes(project.status) : true;
    const chainMatch = chain
      ? project.chains?.some(
          (chainName) => chainName.toLowerCase() === chain.toLowerCase()
        ) ?? false
      : true;

    return statusMatch && chainMatch;
  });

  return filtered
    .map((project) => {
      const { score, signals } = scoreProject(project);
      return {
        projectId: project.id,
        name: project.name,
        status: project.status,
        trendingScore: score,
        signals,
        chains: project.chains ?? [],
        estimatedValue: project.estimatedValue,
        snapshotDate: project.snapshotDate,
        claimUrl: project.claimUrl,
        websiteUrl: project.websiteUrl,
        logoUrl: project.logoUrl,
        updatedAt: project.updatedAt,
      } satisfies TrendingProjectSummary;
    })
    .sort((a, b) => {
      if (b.trendingScore !== a.trendingScore) {
        return b.trendingScore - a.trendingScore;
      }

      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, limit);
}

