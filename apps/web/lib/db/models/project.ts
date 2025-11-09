import prisma from '../prisma';
import type { AirdropProject, AirdropStatus } from '@airdrop-finder/shared';

/**
 * Create a new airdrop project
 */
export async function createProject(
  project: Omit<AirdropProject, 'createdAt' | 'updatedAt'>
): Promise<AirdropProject> {
  const result = await prisma.airdropProject.create({
    data: {
      id: project.id,
      name: project.name,
      slug: project.slug,
      status: project.status,
      logo: project.logo,
      description: project.description,
      officialUrl: project.officialUrl,
      claimUrl: project.claimUrl,
      criteria: project.criteria as any,
      tags: project.tags || [],
      chainIds: project.chainIds || [],
      estimatedValue: project.estimatedValue,
      deadline: project.deadline,
    },
  });

  return {
    ...result,
    criteria: result.criteria as any,
  };
}

/**
 * Find all projects
 */
export async function findAllProjects(): Promise<AirdropProject[]> {
  const projects = await prisma.airdropProject.findMany();
  return projects.map(p => ({
    ...p,
    criteria: p.criteria as any,
  }));
}

/**
 * Find projects by status
 */
export async function findProjectsByStatus(
  status: AirdropStatus
): Promise<AirdropProject[]> {
  const projects = await prisma.airdropProject.findMany({
    where: { status },
  });
  return projects.map(p => ({
    ...p,
    criteria: p.criteria as any,
  }));
}

/**
 * Find a project by ID
 */
export async function findProjectById(id: string): Promise<AirdropProject | null> {
  const project = await prisma.airdropProject.findUnique({
    where: { id },
  });
  if (!project) return null;
  return {
    ...project,
    criteria: project.criteria as any,
  };
}

/**
 * Find a project by slug
 */
export async function findProjectBySlug(slug: string): Promise<AirdropProject | null> {
  const project = await prisma.airdropProject.findUnique({
    where: { slug },
  });
  if (!project) return null;
  return {
    ...project,
    criteria: project.criteria as any,
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
    await prisma.airdropProject.update({
      where: { id },
      data: {
        ...updates,
        criteria: updates.criteria as any,
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
    await prisma.airdropProject.delete({
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
  const results = await prisma.airdropProject.groupBy({
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
  const count = await prisma.airdropProject.count();
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
