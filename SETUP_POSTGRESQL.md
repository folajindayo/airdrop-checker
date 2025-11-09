# PostgreSQL Setup Instructions

The application has been migrated from MongoDB to PostgreSQL with Prisma ORM.

## Quick Setup

Run these commands in your terminal:

```bash
# Navigate to the project root
cd /Users/mac/airdrop-checker

# Install all dependencies (monorepo)
npm install

# Navigate to the web app directory
cd apps/web

# Generate Prisma client
npx prisma generate

# Push the schema to PostgreSQL database
npx prisma db push

# Seed the database with airdrop projects
npm run seed

# Start the development server
cd ../..
npm run dev
```

## Your PostgreSQL Connection

The database URL has been set in `.env.local`:
```
DATABASE_URL=postgresql://postgres:jZEokyUlaozzpRNrtFuYSneJKYDVSwYw@nozomi.proxy.rlwy.net:39734/railway
```

## What Changed

- ✅ Switched from MongoDB to PostgreSQL
- ✅ Using Prisma ORM for type-safe database access
- ✅ Same data model and API structure
- ✅ All airdrop projects will be stored in PostgreSQL

## Troubleshooting

### If you encounter dependency issues:
```bash
# Clear caches and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### To view your database:
```bash
cd apps/web
npx prisma studio
```

This will open a web UI at http://localhost:5555 where you can view and edit your data.

### Database Commands

- **Generate Prisma Client**: `npx prisma generate`
- **Push Schema**: `npx prisma db push`
- **View Database**: `npx prisma studio`
- **Seed Data**: `npm run seed`

