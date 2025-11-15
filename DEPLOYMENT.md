# Deployment Guide

This document outlines the deployment process for the airdrop-checker application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Build Process](#build-process)
- [Deployment Options](#deployment-options)
- [Database Migration](#database-migration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Access to deployment platform (Vercel, AWS, etc.)
- Database credentials (PostgreSQL)
- Required API keys (GoldRush, etc.)

## Environment Setup

### Required Environment Variables

Create a `.env.production` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# API Keys
GOLDRUSH_API_KEY="your-goldrush-api-key"

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"

# Analytics (optional)
NEXT_PUBLIC_GA_ID="GA-XXXXXXXX"
NEXT_PUBLIC_MIXPANEL_TOKEN="your-mixpanel-token"

# Security
JWT_SECRET="your-jwt-secret"
ENCRYPTION_KEY="your-encryption-key"

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Cache
REDIS_URL="redis://localhost:6379"
CACHE_TTL=300000
```

### Environment Variable Validation

The application validates environment variables on startup. Ensure all required variables are set before deploying.

## Build Process

### 1. Install Dependencies

```bash
npm install --production
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Build Application

```bash
npm run build
```

### 4. Test Build

```bash
npm start
```

Visit `http://localhost:3000` to verify the build works correctly.

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides seamless Next.js deployment with automatic scaling and CDN.

#### Steps:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

#### Environment Variables

Add environment variables in the Vercel dashboard:
- Project Settings → Environment Variables
- Add all variables from `.env.production`

#### Automatic Deployments

Connect your Git repository for automatic deployments:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment

### Option 2: AWS

Deploy to AWS using EC2, ECS, or Lambda.

#### EC2 Deployment:

1. Launch EC2 instance (Ubuntu 22.04 LTS)
2. Install Node.js and npm
3. Clone repository
4. Set environment variables
5. Build and start application
6. Configure reverse proxy (nginx)
7. Set up PM2 for process management

Example PM2 setup:
```bash
npm install -g pm2
pm2 start npm --name "airdrop-checker" -- start
pm2 startup
pm2 save
```

#### ECS Deployment:

1. Create Docker image
2. Push to ECR
3. Create ECS cluster
4. Define task definition
5. Create service

Example Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Option 3: Docker

Deploy using Docker containers.

#### Steps:

1. Build Docker image:
```bash
docker build -t airdrop-checker:latest .
```

2. Run container:
```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  --name airdrop-checker \
  airdrop-checker:latest
```

3. Use Docker Compose for multi-container setup:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: airdrop_checker
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## Database Migration

### Run Migrations

Before deploying, run database migrations:

```bash
npx prisma migrate deploy
```

### Seed Database (Optional)

```bash
npx prisma db seed
```

### Backup Strategy

Set up automated database backups:

```bash
# Daily backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

## Monitoring

### Application Monitoring

#### Health Checks

The application provides a health check endpoint:
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "uptime": 123456,
  "services": {
    "database": "ok",
    "cache": "ok"
  }
}
```

#### Performance Monitoring

Monitor key metrics:
- Response time
- Request rate
- Error rate
- CPU/Memory usage
- Database query performance

#### Logging

Application logs are structured and include:
- Request logs (method, URL, status, duration)
- Error logs (with stack traces)
- Performance logs (slow queries, timeouts)

View logs:
```bash
# PM2
pm2 logs airdrop-checker

# Docker
docker logs airdrop-checker

# Vercel
vercel logs
```

### External Monitoring

Consider using:
- **Sentry** for error tracking
- **New Relic** or **Datadog** for APM
- **UptimeRobot** for uptime monitoring
- **LogDNA** or **Papertrail** for log management

## Security Checklist

Before deploying to production:

- [ ] All environment variables are set
- [ ] Secrets are properly encrypted
- [ ] HTTPS is configured
- [ ] Security headers are enabled
- [ ] Rate limiting is configured
- [ ] CORS settings are correct
- [ ] Database connection is secure
- [ ] API keys are rotated regularly
- [ ] Logging doesn't expose sensitive data
- [ ] Error messages don't leak implementation details

## Performance Optimization

### CDN Configuration

Configure CDN for static assets:
- Images, CSS, JavaScript
- Font files
- SVG icons

### Caching Strategy

Implement caching at multiple levels:
- **Browser cache**: Static assets (1 year)
- **CDN cache**: Pages (5 minutes)
- **Application cache**: API responses (5 minutes)
- **Database cache**: Query results

### Database Optimization

- Enable connection pooling
- Add appropriate indexes
- Optimize slow queries
- Use read replicas for scaling

## Troubleshooting

### Common Issues

#### Application won't start

Check:
- Environment variables are set correctly
- Database is accessible
- Port 3000 is not in use
- Node version is 18+

#### Database connection errors

Verify:
- DATABASE_URL is correct
- Database is running
- Firewall allows connection
- User has proper permissions

#### High memory usage

Solutions:
- Increase instance size
- Optimize large data operations
- Clear cache periodically
- Check for memory leaks

#### Slow API responses

Check:
- Database query performance
- API rate limits
- Network latency
- Cache hit rate

### Rollback Procedure

If deployment fails:

1. **Vercel**: Revert to previous deployment
```bash
vercel rollback
```

2. **PM2**: Restart with previous version
```bash
pm2 stop airdrop-checker
git checkout <previous-commit>
npm install
npm run build
pm2 restart airdrop-checker
```

3. **Docker**: Deploy previous image
```bash
docker stop airdrop-checker
docker rm airdrop-checker
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  --name airdrop-checker \
  airdrop-checker:previous-tag
```

## Post-Deployment

After successful deployment:

1. Verify application is running
2. Test critical user flows
3. Check monitoring dashboards
4. Review error logs
5. Monitor performance metrics
6. Send notification to team

## Continuous Deployment

Set up CI/CD pipeline using GitHub Actions:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Support

For deployment issues:
- Check [Troubleshooting](#troubleshooting) section
- Review application logs
- Contact DevOps team
- Create issue on GitHub

---

**Last Updated**: November 2025
**Version**: 1.0.0

