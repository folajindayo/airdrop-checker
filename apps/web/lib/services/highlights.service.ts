/**
 * Airdrop highlights service
 */

import { findAllProjects } from '../db/models/project';
import { getHighlightedAirdrops } from '../analyzers/airdrop-highlights';
import type { AirdropProject } from '@airdrop-finder/shared';

export async function getAirdropHighlights(): Promise<AirdropProject[]> {
  const projects = await findAllProjects();
  return getHighlightedAirdrops(projects);
}

