# Vercel Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Your repository pushed to GitHub

## Step 1: Push Your Code to GitHub

```bash
# If you haven't already, initialize git and push to GitHub
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the project root:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Choose your account
   - Link to existing project? **No**
   - Project name? `airdrop-checker` (or your preferred name)
   - In which directory is your code? `./`
   - Override settings? **Yes**
   - Build Command: `cd apps/web && npm run build`
   - Output Directory: `apps/web/.next`
   - Development Command: `cd apps/web && npm run dev`

5. Deploy to production:
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard (Web Interface)

1. Go to https://vercel.com/new

2. Import your GitHub repository

3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `cd apps/web && npm run build`
   - **Output Directory**: `apps/web/.next`
   - **Install Command**: `npm install`

4. Add Environment Variables (see Step 3 below)

5. Click "Deploy"

## Step 3: Add Environment Variables

### Using Vercel Dashboard:

1. Go to your project on Vercel
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add the following variables:

#### Required Environment Variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | `5c4d877bba011237894e33bce008ddd1` | Production, Preview, Development |
| `GOLDRUSH_API_KEY` | `cqt_rQMcBkPqGr9GVCkpQrHbHvfgRKr` | Production, Preview, Development |
| `DATABASE_URL` | `postgresql://postgres:jZEokyUlaozzpRNrtFuYSneJKYDVSwYw@nozomi.proxy.rlwy.net:39734/railway` | Production, Preview, Development |

### Using Vercel CLI:

```bash
# Add environment variables
vercel env add NEXT_PUBLIC_REOWN_PROJECT_ID
# When prompted, enter: 5c4d877bba011237894e33bce008ddd1
# Select: Production, Preview, Development

vercel env add GOLDRUSH_API_KEY
# When prompted, enter: cqt_rQMcBkPqGr9GVCkpQrHbHvfgRKr
# Select: Production, Preview, Development

vercel env add DATABASE_URL
# When prompted, enter: postgresql://postgres:jZEokyUlaozzpRNrtFuYSneJKYDVSwYw@nozomi.proxy.rlwy.net:39734/railway
# Select: Production, Preview, Development
```

## Step 4: Run Database Migrations

After deployment, you need to seed your database:

### Option A: Using Vercel CLI

```bash
# Connect to your production environment
vercel env pull .env.production

# Run the seed script
cd apps/web
DATABASE_URL="postgresql://postgres:jZEokyUlaozzpRNrtFuYSneJKYDVSwYw@nozomi.proxy.rlwy.net:39734/railway" npx tsx scripts/seed-airdrops.ts
```

### Option B: Using Vercel Edge Functions

The database should be automatically seeded on first run, but if needed, you can trigger it by visiting:
```
https://your-deployment-url.vercel.app/api/seed
```

(Note: Create this API route if it doesn't exist)

## Step 5: Verify Deployment

1. Visit your deployment URL (provided by Vercel after deployment)
2. Test the following:
   - ✅ Homepage loads correctly
   - ✅ Wallet connection works
   - ✅ Airdrop checking functionality
   - ✅ Database connectivity

## Deployment URL

After successful deployment, you'll receive a URL like:
- **Production**: `https://airdrop-checker.vercel.app`
- **Preview**: `https://airdrop-checker-git-branch-name.vercel.app`

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify environment variables are set correctly

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check if Railway database allows external connections
3. Ensure Prisma schema is up to date

### API Routes Not Working

1. Check that API routes are in `apps/web/app/api/`
2. Verify environment variables are accessible
3. Check Vercel function logs

## Custom Domain (Optional)

1. Go to your project settings on Vercel
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you push to other branches or open a PR

## Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Pull environment variables
vercel env pull

# List all deployments
vercel ls

# Remove a deployment
vercel rm [deployment-url]
```

## Next Steps

1. **Set up Custom Domain**: Add your custom domain in Vercel settings
2. **Enable Analytics**: Turn on Vercel Analytics in project settings
3. **Configure Monitoring**: Set up error tracking (Sentry, etc.)
4. **Add CI/CD**: Configure GitHub Actions for additional checks

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Community: https://github.com/vercel/vercel/discussions

---

## Quick Deploy Button

Add this to your README.md for one-click deployment:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/airdrop-checker&env=NEXT_PUBLIC_REOWN_PROJECT_ID,GOLDRUSH_API_KEY,DATABASE_URL)
```

## Environment Variables Summary

```env
# Required for production
NEXT_PUBLIC_REOWN_PROJECT_ID=5c4d877bba011237894e33bce008ddd1
GOLDRUSH_API_KEY=cqt_rQMcBkPqGr9GVCkpQrHbHvfgRKr
DATABASE_URL=postgresql://postgres:jZEokyUlaozzpRNrtFuYSneJKYDVSwYw@nozomi.proxy.rlwy.net:39734/railway
```

