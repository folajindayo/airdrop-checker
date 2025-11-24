import prisma from '../prisma';
import type { AirdropProject, AirdropStatus } from '@airdrop-finder/shared';

/**
 * Create a new airdrop project
 */
export async function createProject(
  project: Omit<AirdropProject, 'createdAt' | 'updatedAt'>
): Promise<AirdropProject> {
  const result = await prisma.project.create({
    data: {
      id: project.id,
      name: project.name,
      status: project.status,
      description: project.description,
      logoUrl: project.logoUrl,
      websiteUrl: project.websiteUrl,
      twitterUrl: project.twitterUrl,
      claimUrl: project.claimUrl,
      criteria: project.criteria as any,
      chains: project.chains || [],
      estimatedValue: project.estimatedValue,
      snapshotDate: project.snapshotDate,
    },
  });

  return {
    id: result.id,
    name: result.name,
    description: result.description || undefined,
    status: result.status as AirdropStatus,
    logoUrl: result.logoUrl || undefined,
    websiteUrl: result.websiteUrl || undefined,
    twitterUrl: result.twitterUrl || undefined,
    claimUrl: result.claimUrl || undefined,
    criteria: result.criteria as any,
    chains: result.chains || [],
    estimatedValue: result.estimatedValue || undefined,
    snapshotDate: result.snapshotDate || undefined,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Find all projects
 */
export async function findAllProjects(): Promise<AirdropProject[]> {
  const projects = await prisma.project.findMany();
  return projects.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || undefined,
    status: p.status as AirdropStatus,
    logoUrl: p.logoUrl || undefined,
    websiteUrl: p.websiteUrl || undefined,
    twitterUrl: p.twitterUrl || undefined,
    claimUrl: p.claimUrl || undefined,
    criteria: p.criteria as any,
    chains: p.chains || [],
    estimatedValue: p.estimatedValue || undefined,
    snapshotDate: p.snapshotDate || undefined,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

/**
 * Find projects by status
 */
export async function findProjectsByStatus(
  status: AirdropStatus
): Promise<AirdropProject[]> {
  const projects = await prisma.project.findMany({
    where: { status },
  });
  return projects.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || undefined,
    status: p.status as AirdropStatus,
    logoUrl: p.logoUrl || undefined,
    websiteUrl: p.websiteUrl || undefined,
    twitterUrl: p.twitterUrl || undefined,
    claimUrl: p.claimUrl || undefined,
    criteria: p.criteria as any,
    chains: p.chains || [],
    estimatedValue: p.estimatedValue || undefined,
    snapshotDate: p.snapshotDate || undefined,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

/**
 * Find a project by ID
 */
export async function findProjectById(id: string): Promise<AirdropProject | null> {
  const p = await prisma.project.findUnique({
    where: { id },
  });
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    description: p.description || undefined,
    status: p.status as AirdropStatus,
    logoUrl: p.logoUrl || undefined,
    websiteUrl: p.websiteUrl || undefined,
    twitterUrl: p.twitterUrl || undefined,
    claimUrl: p.claimUrl || undefined,
    criteria: p.criteria as any,
    chains: p.chains || [],
    estimatedValue: p.estimatedValue || undefined,
    snapshotDate: p.snapshotDate || undefined,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/**
 * Update a project
 */
export async function updateProject(
  id: string,
  updates: Partial<Omit<AirdropProject, 'id' | 'createdAt'>>
): Promise<boolean> {
  try {
    await prisma.project.update({
      where: { id },
      data: {
        name: updates.name,
        description: updates.description,
        status: updates.status,
        logoUrl: updates.logoUrl,
        websiteUrl: updates.websiteUrl,
        twitterUrl: updates.twitterUrl,
        claimUrl: updates.claimUrl,
        criteria: updates.criteria as any,
        chains: updates.chains,
        estimatedValue: updates.estimatedValue,
        snapshotDate: updates.snapshotDate,
      },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<boolean> {
  try {
    await prisma.project.delete({
      where: { id },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Count projects by status
 */
export async function countProjectsByStatus(): Promise<Record<string, number>> {
  const results = await prisma.project.groupBy({
    by: ['status'],
    _count: true,
  });

  return results.reduce((acc, curr) => {
    acc[curr.status] = curr._count;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Check if collection is empty
 */
export async function isCollectionEmpty(): Promise<boolean> {
  const count = await prisma.project.count();
  return count === 0;
}

/**
 * Create indexes for the collection (Prisma handles this automatically via schema)
 */
export async function createIndexes(): Promise<void> {
  // Indexes are defined in schema.prisma and created via migrations
  // This function is kept for compatibility with the seed script
  console.log('Indexes are managed by Prisma schema');
}
