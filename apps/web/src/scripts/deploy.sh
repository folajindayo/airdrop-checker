#!/bin/bash
# Production Deployment Script
# Optimized build and deployment workflow

set -e

echo "🚀 Starting production deployment..."

# Run tests
echo "🧪 Running tests..."
npm run test

# Build application
echo "📦 Building application..."
npm run build

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Deploy to production
echo "🌐 Deploying to production..."
# Add your deployment command here

echo "✅ Deployment complete!"

