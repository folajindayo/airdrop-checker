/**
 * Database seeding utilities for tests
 * Provides functions to seed test database with sample data
 */

import type { AirdropProject } from '@airdrop-finder/shared';

/**
 * Seed test airdrop projects
 */
export async function seedAirdropProjects(
  projects: Partial<AirdropProject>[]
): Promise<AirdropProject[]> {
  // In a real implementation, this would insert into the database
  // For now, return mock data
  return projects.map((project, index) => ({
    id: project.id || `project-${index}`,
    name: project.name || `Test Project ${index}`,
    description: project.description || 'Test description',
    status: project.status || 'confirmed',
    snapshotDate: project.snapshotDate,
    claimDate: project.claimDate,
    website: project.website,
    twitter: project.twitter,
    discord: project.discord,
    chains: project.chains || [1],
    criteria: project.criteria || [],
    estimatedValue: project.estimatedValue || 0,
    eligibilityScore: project.eligibilityScore || 0,
  })) as AirdropProject[];
}

/**
 * Seed test reminders
 */
export async function seedReminders(reminders: any[]): Promise<any[]> {
  // In a real implementation, this would insert into the database
  return reminders.map((reminder, index) => ({
    id: reminder.id || `reminder-${index}`,
    ...reminder,
    createdAt: reminder.createdAt || new Date().toISOString(),
  }));
}

/**
 * Seed test claims
 */
export async function seedClaims(claims: any[]): Promise<any[]> {
  // In a real implementation, this would insert into the database
  return claims.map((claim, index) => ({
    id: claim.id || `claim-${index}`,
    ...claim,
    createdAt: claim.createdAt || new Date().toISOString(),
  }));
}

/**
 * Clear all test data
 */
export async function clearTestData(): Promise<void> {
  // In a real implementation, this would clear the test database
  // For now, it's a no-op
}

/**
 * Create default test data
 */
export async function createDefaultTestData() {
  const projects = await seedAirdropProjects([
    {
      id: 'zora',
      name: 'Zora',
      status: 'confirmed',
      chains: [1, 8453],
    },
    {
      id: 'base',
      name: 'Base',
      status: 'confirmed',
      chains: [8453],
    },
  ]);

  return { projects };
}

