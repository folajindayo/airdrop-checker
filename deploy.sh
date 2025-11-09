#!/bin/bash

echo "🚀 Airdrop Finder - Vercel Deployment Script"
echo "=============================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed successfully!"
    echo ""
fi

# Login to Vercel
echo "🔐 Logging in to Vercel..."
vercel login

echo ""
echo "📝 Setting up environment variables..."
echo ""

# Set environment variables
echo "Setting NEXT_PUBLIC_REOWN_PROJECT_ID..."
echo "5c4d877bba011237894e33bce008ddd1" | vercel env add NEXT_PUBLIC_REOWN_PROJECT_ID production

echo "Setting GOLDRUSH_API_KEY..."
echo "cqt_rQMcBkPqGr9GVCkpQrHbHvfgRKr" | vercel env add GOLDRUSH_API_KEY production

echo "Setting DATABASE_URL..."
echo "postgresql://postgres:jZEokyUlaozzpRNrtFuYSneJKYDVSwYw@nozomi.proxy.rlwy.net:39734/railway" | vercel env add DATABASE_URL production

echo ""
echo "✅ Environment variables configured!"
echo ""

# Deploy to production
echo "🚢 Deploying to Vercel (Production)..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Visit the URL provided above to see your live application"
echo "2. Test wallet connection and airdrop checking functionality"
echo "3. (Optional) Add a custom domain in Vercel dashboard"
echo ""
echo "📚 For more information, see DEPLOYMENT_GUIDE.md"
echo ""

