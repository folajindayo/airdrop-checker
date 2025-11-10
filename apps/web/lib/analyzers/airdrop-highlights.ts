import type { AirdropProject } from '@airdrop-finder/shared';
import { daysUntil, parseEstimatedValue, sortBySnapshotAscending } from './utils';

export interface SnapshotHighlight {
  projectId: string;
  name: string;
  status: string;
  snapshotDate: string;
  daysUntilSnapshot: number;
}

export interface ValueHighlight {
  projectId: string;
  name: string;
  status: string;
  estimatedValue: string;
  estimatedValueUSD: number;
}

export interface ActivityHighlight {
  projectId: string;
  name: string;
  status: string;
  updatedAt?: Date;
  hoursSinceUpdate: number | null;
}

export interface AirdropHighlights {
  upcomingSnapshots: SnapshotHighlight[];
  highestValue: ValueHighlight[];
  recentlyUpdated: ActivityHighlight[];
  generatedAt: string;
}

export function buildAirdropHighlights(projects: AirdropProject[]): AirdropHighlights {
  const now = new Date();

  const upcomingSnapshots = sortBySnapshotAscending(
    projects.filter((project) => {
      const days = daysUntil(project.snapshotDate);
      return days !== null && days >= 0;
    })
  )
    .slice(0, 5)
    .map<SnapshotHighlight>((project) => ({
      projectId: project.id,
      name: project.name,
      status: project.status,
      snapshotDate: project.snapshotDate!,
      daysUntilSnapshot: Math.max(daysUntil(project.snapshotDate) ?? 0, 0),
    }));

  const highestValue = [...projects]
    .map((project) => ({
      project,
      value: parseEstimatedValue(project.estimatedValue),
    }))
    .filter(({ value }) => value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map<ValueHighlight>(({ project, value }) => ({
      projectId: project.id,
      name: project.name,
      status: project.status,
      estimatedValue: project.estimatedValue!,
      estimatedValueUSD: value,
    }));

  const recentlyUpdated = [...projects]
    .filter((project) => project.updatedAt)
    .map((project) => {
      const updatedAt = project.updatedAt ? new Date(project.updatedAt) : undefined;
      const hoursSinceUpdate = updatedAt
        ? Math.round((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60))
        : null;

      return {
        projectId: project.id,
        name: project.name,
        status: project.status,
        updatedAt,
        hoursSinceUpdate,
      } satisfies ActivityHighlight;
    })
    .filter((highlight) => highlight.hoursSinceUpdate !== null)
    .sort((a, b) => (a.hoursSinceUpdate ?? Infinity) - (b.hoursSinceUpdate ?? Infinity))
    .slice(0, 5);

  return {
    upcomingSnapshots,
    highestValue,
    recentlyUpdated,
    generatedAt: now.toISOString(),
  };
}

