/**
 * Build Optimization Script
 * 
 * Optimize build output for production deployment
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function optimizeBuild() {
  console.log('🚀 Starting build optimization...');

  try {
    // Run Next.js build
    console.log('📦 Building Next.js application...');
    await execAsync('npm run build');

    // Analyze bundle size
    console.log('📊 Analyzing bundle size...');
    await execAsync('npm run analyze');

    console.log('✅ Build optimization complete!');
  } catch (error) {
    console.error('❌ Build optimization failed:', error);
    process.exit(1);
  }
}

optimizeBuild();

