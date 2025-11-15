/**
 * Trending airdrops service
 */

import { findAllProjects } from '../db/models/project';
import { calculateTrendingScore } from '../analyzers/trending-airdrops';
import type { TrendingProjectSummary } from '@airdrop-finder/shared';

export async function getTrendingAirdrops(limit: number = 10): Promise<TrendingProjectSummary[]> {
  const projects = await findAllProjects();
  const trending = await calculateTrendingScore(projects);
  return trending.slice(0, limit);
}

