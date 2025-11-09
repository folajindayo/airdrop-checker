import { Collection, ObjectId } from 'mongodb';
import { getDatabase } from '../client';
import type { AirdropProject, AirdropStatus } from '@airdrop-finder/shared';

const COLLECTION_NAME = 'projects';

/**
 * Get projects collection
 */
async function getCollection(): Promise<Collection<AirdropProject>> {
  const db = await getDatabase();
  return db.collection<AirdropProject>(COLLECTION_NAME);
}

/**
 * Create a new airdrop project
 */
export async function createProject(
  project: Omit<AirdropProject, 'createdAt' | 'updatedAt'>
): Promise<AirdropProject> {
  const collection = await getCollection();
  
  const now = new Date();
  const newProject: AirdropProject = {
    ...project,
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(newProject as any);
  return newProject;
}

/**
 * Find all projects
 */
export async function findAllProjects(): Promise<AirdropProject[]> {
  const collection = await getCollection();
  return collection.find({}).toArray();
}

/**
 * Find projects by status
 */
export async function findProjectsByStatus(
  status: AirdropStatus
): Promise<AirdropProject[]> {
  const collection = await getCollection();
  return collection.find({ status }).toArray();
}

/**
 * Find a project by ID
 */
export async function findProjectById(id: string): Promise<AirdropProject | null> {
  const collection = await getCollection();
  return collection.findOne({ id });
}

/**
 * Find a project by slug
 */
export async function findProjectBySlug(slug: string): Promise<AirdropProject | null> {
  const collection = await getCollection();
  return collection.findOne({ slug });
}

/**
 * Update a project
 */
export async function updateProject(
  id: string,
  updates: Partial<Omit<AirdropProject, 'id' | 'createdAt'>>
): Promise<boolean> {
  const collection = await getCollection();
  
  const result = await collection.updateOne(
    { id },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    }
  );

  return result.modifiedCount > 0;
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<boolean> {
  const collection = await getCollection();
  const result = await collection.deleteOne({ id });
  return result.deletedCount > 0;
}

/**
 * Count projects by status
 */
export async function countProjectsByStatus(): Promise<Record<string, number>> {
  const collection = await getCollection();
  
  const results = await collection
    .aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  return results.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Check if collection is empty
 */
export async function isCollectionEmpty(): Promise<boolean> {
  const collection = await getCollection();
  const count = await collection.countDocuments();
  return count === 0;
}

/**
 * Create indexes for the collection
 */
export async function createIndexes(): Promise<void> {
  const collection = await getCollection();
  
  await collection.createIndex({ id: 1 }, { unique: true });
  await collection.createIndex({ slug: 1 }, { unique: true });
  await collection.createIndex({ status: 1 });
  await collection.createIndex({ tags: 1 });
}

