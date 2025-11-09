#!/usr/bin/env node

/**
 * Seed script to populate MongoDB with initial airdrop projects
 * Run with: pnpm seed (from apps/web directory)
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manually load .env.local file BEFORE any other imports
try {
  const envPath = resolve(__dirname, '../.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  console.log('✓ Loaded environment variables from .env.local');
} catch (error) {
  console.error('❌ Could not load .env.local file:', error);
  console.error('Make sure the .env.local file exists in apps/web/');
  process.exit(1);
}

// Now dynamically import modules that need environment variables
async function seedAirdrops() {
  console.log('🌱 Starting airdrop database seeding...');

  try {
    // Dynamic imports after env vars are set
    const { AIRDROPS } = await import('../../../packages/shared/data/index.js');
    const {
      createProject,
      isCollectionEmpty,
      createIndexes,
      findAllProjects,
    } = await import('../lib/db/models/project.js');
    const { getClient } = await import('../lib/db/client.js');

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
    // Close Prisma connection
    try {
      const prisma = (await import('../lib/db/prisma.js')).default;
      await prisma.$disconnect();
      console.log('\n🔌 Database connection closed');
    } catch (err) {
      console.error('Error closing connection:', err);
    }
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
