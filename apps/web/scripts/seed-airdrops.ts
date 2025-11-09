#!/usr/bin/env node

/**
 * Seed script to populate MongoDB with initial airdrop projects
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { AIRDROPS } from '../../../packages/shared/data';
import {
  createProject,
  isCollectionEmpty,
  createIndexes,
  findAllProjects,
} from '../lib/db/models/project';
import { getClient } from '../lib/db/client';

async function seedAirdrops() {
  console.log('🌱 Starting airdrop database seeding...');

  try {
    // Check if collection is already populated
    const isEmpty = await isCollectionEmpty();

    if (!isEmpty) {
      const existingProjects = await findAllProjects();
      console.log(
        `⚠️  Database already contains ${existingProjects.length} projects.`
      );
      console.log('Skipping seed. Delete existing data first if you want to reseed.');
      return;
    }

    // Create indexes
    console.log('📑 Creating database indexes...');
    await createIndexes();
    console.log('✅ Indexes created successfully');

    // Insert projects
    console.log(`📦 Inserting ${AIRDROPS.length} airdrop projects...`);
    
    for (const airdrop of AIRDROPS) {
      await createProject(airdrop);
      console.log(`  ✓ Added: ${airdrop.name} (${airdrop.status})`);
    }

    console.log(`\n✅ Successfully seeded ${AIRDROPS.length} airdrop projects!`);
    
    // Display summary
    const projects = await findAllProjects();
    const summary = projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Summary:');
    Object.entries(summary).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close connection
    const client = await getClient();
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seed script
seedAirdrops()
  .then(() => {
    console.log('\n✨ Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

