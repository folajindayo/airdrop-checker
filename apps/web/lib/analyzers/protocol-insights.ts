import type { ProtocolInteraction, GoldRushTransaction } from '@airdrop-finder/shared';
import { CHAIN_ID_TO_NAME } from '@airdrop-finder/shared';
import {
  KNOWN_PROTOCOLS,
  getCategoryLabel,
  type ProtocolCategory,
  type ProtocolMetadata,
} from './protocols';

export interface ProtocolBreakdownEntry {
  protocol: string;
  category: ProtocolCategory;
  categoryLabel: string;
  chainId: number;
  chainName: string;
  interactionCount: number;
  firstInteraction?: string;
  lastInteraction?: string;
  daysActive: number;
}

export interface TimelineEntry {
  id: string;
  txHash: string;
  date: string;
  protocol: string;
  category: ProtocolCategory;
  categoryLabel: string;
  chainId: number;
  chainName: string;
  description: string;
}

export interface FocusArea {
  category: ProtocolCategory;
  categoryLabel: string;
  interactions: number;
  uniqueProtocols: number;
  score: number;
  status: 'strong' | 'needs_attention' | 'missing';
  recommendation: string;
}

export interface CategoryScore {
  category: ProtocolCategory;
  categoryLabel: string;
  score: number;
  interactions: number;
  uniqueProtocols: number;
  status: FocusArea['status'];
}

export interface MonthlyActivity {
  month: string; // YYYY-MM
  interactionCount: number;
  uniqueProtocols: number;
}

export interface ProtocolInsights {
  address: string;
  summary: {
    totalProtocols: number;
    activeCategories: number;
    newProtocolsLast30d: number;
    avgInteractionsPerProtocol: number;
    engagementScore: number;
    momentum: {
      direction: 'up' | 'steady' | 'down';
      percentChange: number;
      deltaInteractions: number;
    };
    streak: {
      activeDays: number;
      lastActiveDate?: string;
    };
    lastInteraction?: string;
    mostActiveCategory?: {
      category: ProtocolCategory;
      label: string;
      interactionCount: number;
    };
  };
  breakdown: ProtocolBreakdownEntry[];
  timeline: TimelineEntry[];
  focusAreas: FocusArea[];
  categoryScores: CategoryScore[];
  monthlyActivity: MonthlyActivity[];
  generatedAt: string;
}

const CATEGORY_RECOMMENDATIONS: Record<ProtocolCategory, string> = {
  dex: 'Execute swaps or provide liquidity on a DEX to build trading history.',
  bridge: 'Bridge assets across chains to qualify for interoperability airdrops.',
  defi: 'Supply or borrow assets on lending protocols to signal DeFi participation.',
  restaking: 'Restake ETH or LSTs to capture restaking protocol points.',
  nft: 'Mint or trade NFTs on creator platforms to remain eligible for cultural airdrops.',
  infrastructure: 'Interact with infrastructure protocols to diversify eligibility.',
  tooling: 'Use onchain tooling products to be an early adopter.',
  other: 'Explore experimental protocols to diversify activity footprint.',
};

function resolveCategory(metadata: ProtocolMetadata | null): ProtocolCategory {
  return metadata?.category ?? 'other';
}

function calculateDaysBetween(start?: Date, end?: Date): number {
  if (!start || !end) return 0;
  const diff = end.getTime() - start.getTime();
  return Math.max(Math.round(diff / (1000 * 60 * 60 * 24)), 0);
}

export function buildProtocolBreakdown(
  interactions: ProtocolInteraction[]
): ProtocolBreakdownEntry[] {
  return interactions.map((interaction) => {
    const metadata = KNOWN_PROTOCOLS[interaction.contractAddress];
    const category = resolveCategory(metadata);
    const first = interaction.firstInteraction
      ? interaction.firstInteraction.toISOString()
      : undefined;
    const last = interaction.lastInteraction
      ? interaction.lastInteraction.toISOString()
      : undefined;
    const daysActive = calculateDaysBetween(
      interaction.firstInteraction,
      interaction.lastInteraction
    );

    return {
      protocol: interaction.protocol,
      category,
      categoryLabel: getCategoryLabel(category),
      chainId: interaction.chainId,
      chainName: CHAIN_ID_TO_NAME[interaction.chainId] || `Chain ${interaction.chainId}`,
      interactionCount: interaction.interactionCount,
      firstInteraction: first,
      lastInteraction: last,
      daysActive,
    };
  });
}

export function buildTimeline(
  chainTransactions: Record<number, GoldRushTransaction[]>
): TimelineEntry[] {
  const events: TimelineEntry[] = [];

  Object.entries(chainTransactions).forEach(([chainIdStr, transactions]) => {
    const chainId = Number(chainIdStr);
    const chainName = CHAIN_ID_TO_NAME[chainId] || `Chain ${chainId}`;

    transactions.forEach((tx) => {
      const metadata = KNOWN_PROTOCOLS[tx.to_address?.toLowerCase() ?? ''];
      if (!metadata) return;

      const category = resolveCategory(metadata);

      events.push({
        id: `${tx.tx_hash}-${category}`,
        txHash: tx.tx_hash,
        date: new Date(tx.block_signed_at).toISOString(),
        protocol: metadata.name,
        category,
        categoryLabel: getCategoryLabel(category),
        chainId,
        chainName,
        description: `Interaction with ${metadata.name} on ${chainName}`,
      });
    });
  });

  return events
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50);
}

export function buildMonthlyActivity(timeline: TimelineEntry[]): MonthlyActivity[] {
  const monthlyMap = new Map<string, { count: number; protocols: Set<string> }>();

  timeline.forEach((entry) => {
    const month = entry.date.slice(0, 7);
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { count: 0, protocols: new Set() });
    }
    const record = monthlyMap.get(month)!;
    record.count += 1;
    record.protocols.add(entry.protocol);
  });

  return Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      interactionCount: data.count,
      uniqueProtocols: data.protocols.size,
    }))
    .sort((a, b) => (a.month < b.month ? -1 : 1))
    .slice(-12);
}

export function buildFocusAreas(
  breakdown: ProtocolBreakdownEntry[]
): FocusArea[] {
  const categoryStats = new Map<
    ProtocolCategory,
    { interactions: number; protocols: Set<string> }
  >();

  breakdown.forEach((entry) => {
    if (!categoryStats.has(entry.category)) {
      categoryStats.set(entry.category, { interactions: 0, protocols: new Set() });
    }
    const stats = categoryStats.get(entry.category)!;
    stats.interactions += entry.interactionCount;
    stats.protocols.add(entry.protocol);
  });

  const categories = Object.keys(CATEGORY_RECOMMENDATIONS) as ProtocolCategory[];

  return categories.map((category) => {
    const stats = categoryStats.get(category) ?? {
      interactions: 0,
      protocols: new Set<string>(),
    };
    const interactions = stats.interactions;
    const uniqueProtocols = stats.protocols.size;

    const interactionFactor = Math.min(interactions / 20, 1);
    const diversityFactor = Math.min(uniqueProtocols / 5, 1);
    const score = Math.round((interactionFactor * 0.6 + diversityFactor * 0.4) * 100);

    let status: FocusArea['status'] = 'missing';
    if (score >= 70) {
      status = 'strong';
    } else if (interactions > 0) {
      status = 'needs_attention';
    }

    return {
      category,
      categoryLabel: getCategoryLabel(category),
      interactions,
      uniqueProtocols,
      score,
      status,
      recommendation: CATEGORY_RECOMMENDATIONS[category],
    };
  });
}

function calculateMomentum(monthlyActivity: MonthlyActivity[]): {
  direction: 'up' | 'steady' | 'down';
  percentChange: number;
  deltaInteractions: number;
} {
  if (monthlyActivity.length < 2) {
    return {
      direction: 'steady',
      percentChange: 0,
      deltaInteractions: 0,
    };
  }

  const sorted = [...monthlyActivity].sort((a, b) =>
    a.month < b.month ? -1 : 1
  );

  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  const delta = latest.interactionCount - previous.interactionCount;
  const percent =
    previous.interactionCount === 0
      ? latest.interactionCount > 0
        ? 100
        : 0
      : Math.round((delta / previous.interactionCount) * 100);

  let direction: 'up' | 'steady' | 'down' = 'steady';

  if (percent > 5) direction = 'up';
  else if (percent < -5) direction = 'down';

  return {
    direction,
    percentChange: percent,
    deltaInteractions: delta,
  };
}

function calculateActiveStreakDays(timeline: TimelineEntry[]): {
  activeDays: number;
  lastActiveDate?: string;
} {
  if (timeline.length === 0) {
    return { activeDays: 0 };
  }

  const uniqueDates = Array.from(
    new Set(timeline.map((event) => event.date.slice(0, 10)))
  )
    .map((date) => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime());

  const now = new Date();
  let streak = 0;

  for (let i = 0; i < uniqueDates.length; i++) {
    const diffDays = Math.floor(
      (now.getTime() - uniqueDates[i].getTime()) / (1000 * 60 * 60 * 24)
    );

    if (i === 0) {
      if (diffDays > 1) break;
      streak += 1;
    } else {
      const previousDate = uniqueDates[i - 1];
      const gapDays = Math.floor(
        (previousDate.getTime() - uniqueDates[i].getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (gapDays <= 1) {
        streak += 1;
      } else {
        break;
      }
    }
  }

  return {
    activeDays: streak,
    lastActiveDate: uniqueDates[0]?.toISOString(),
  };
}

export function buildProtocolInsights(
  address: string,
  interactions: ProtocolInteraction[],
  chainTransactions: Record<number, GoldRushTransaction[]>
): ProtocolInsights {
  const breakdown = buildProtocolBreakdown(interactions);
  const timeline = buildTimeline(chainTransactions);
  const monthlyActivity = buildMonthlyActivity(timeline);
  const focusAreas = buildFocusAreas(breakdown);

  const totalProtocols = new Set(breakdown.map((entry) => entry.protocol)).size;
  const last30d = new Date();
  last30d.setDate(last30d.getDate() - 30);

  const categoryScores: CategoryScore[] = focusAreas.map((area) => ({
    category: area.category,
    categoryLabel: area.categoryLabel,
    score: area.score,
    interactions: area.interactions,
    uniqueProtocols: area.uniqueProtocols,
    status: area.status,
  }));

  const engagementScore =
    categoryScores.length > 0
      ? Math.round(
          categoryScores.reduce((sum, category) => sum + category.score, 0) /
            categoryScores.length
        )
      : 0;

  const momentum = calculateMomentum(monthlyActivity);
  const streak = calculateActiveStreakDays(timeline);

  const newProtocolsLast30d = breakdown.filter((entry) => {
    if (!entry.firstInteraction) return false;
    const first = new Date(entry.firstInteraction);
    return first >= last30d;
  }).length;

  const avgInteractions =
    breakdown.reduce((sum, entry) => sum + entry.interactionCount, 0) /
    Math.max(breakdown.length, 1);

  const mostActiveCategory = focusAreas
    .filter((area) => area.interactions > 0)
    .sort((a, b) => b.interactions - a.interactions)[0];

  const lastInteraction = timeline[0]?.date;

  return {
    address,
    summary: {
      totalProtocols,
      activeCategories: focusAreas.filter((area) => area.interactions > 0).length,
      newProtocolsLast30d,
      avgInteractionsPerProtocol: Number(avgInteractions.toFixed(2)),
      engagementScore,
      momentum,
      streak,
      lastInteraction,
      mostActiveCategory: mostActiveCategory
        ? {
            category: mostActiveCategory.category,
            label: mostActiveCategory.categoryLabel,
            interactionCount: mostActiveCategory.interactions,
          }
        : undefined,
    },
    breakdown,
    timeline,
    focusAreas,
    categoryScores,
    monthlyActivity,
    generatedAt: new Date().toISOString(),
  };
}

