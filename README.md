# Airdrop Finder

A read-only onchain dashboard that helps users check whether their wallet might be eligible for ongoing or upcoming airdrops. Users simply connect their wallet via WalletConnect and instantly see a summary of protocols they've interacted with, activity patterns, and how closely they match known airdrop eligibility criteria.

## Features

### Core Features
- **WalletConnect Integration**: Connect your wallet securely using WalletConnect v2 (Reown SDK)
- **Multi-Chain Support**: Analyze activity across Ethereum, Base, Arbitrum, Optimism, zkSync Era, and Polygon
- **Eligibility Scoring**: Get scored on 10+ confirmed and rumored airdrops
- **Real-time Analysis**: Fetch onchain data using GoldRush API (formerly Covalent)
- **Rate-Limited Refresh**: Update your eligibility with built-in rate limiting
- **Shareable Results**: Generate social sharing cards with your airdrop score
- **Responsive Design**: Beautiful UI built with Next.js 15, React 19, and TailwindCSS

### New Advanced Features ✨
- **📊 Activity Summary**: Comprehensive wallet activity overview with transaction counts, chains used, and protocols interacted with
- **🔍 Filter & Sort**: Advanced filtering by airdrop status, minimum score, and sorting options
- **📥 Export Reports**: Download eligibility reports in JSON, CSV, or TXT formats
- **📅 Activity Timeline**: Visual timeline of wallet transactions, milestones, and achievements
- **⚖️ Wallet Comparison**: Compare up to 5 wallets side-by-side with winner detection
- **🎯 Protocol Insights**: Detailed breakdown of protocols used with airdrop potential ratings
- **📆 Airdrop Calendar**: Track upcoming snapshot dates, claim periods, and announcements
- **🏆 Gamification**: Badges and achievements for multi-chain usage and transaction milestones

## Tech Stack

### Monorepo Structure
- **npm workspaces** for dependency management
- **apps/web**: Next.js 15 application with Prisma ORM
- **packages/shared**: Shared types, utilities, and constants

### Frontend
- Next.js 15.2.4 (App Router)
- React 19
- TypeScript 5
- TailwindCSS 3.4
- Radix UI components
- Recharts for visualizations

### Blockchain Integration
- **WalletConnect**: @reown/appkit v1.3
- **Wagmi v2**: React hooks for Ethereum
- **Viem v2**: TypeScript Ethereum library
- **GoldRush API**: Blockchain data provider

### Backend & Data
- Next.js API Routes (serverless)
- PostgreSQL with Prisma ORM for airdrop project registry
- In-memory caching with TTL
- GoldRush API for blockchain data

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL database

### Environment Variables

Create a `.env.local` file in `apps/web/`:

```env
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
GOLDRUSH_API_KEY=your_goldrush_api_key
DATABASE_URL=your_postgresql_connection_string
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
cd apps/web
npx prisma generate

# Push database schema
npx prisma db push

# Seed the database with airdrop projects
npm run seed

# Start development server
cd ../..
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
airdrop-checker/
├── apps/
│   └── web/                    # Next.js application
│       ├── app/                # App Router pages and API routes
│       │   ├── api/            # API endpoints
│       │   │   ├── airdrop-check/[address]/
│       │   │   ├── airdrops/
│       │   │   ├── og/
│       │   │   └── refresh/
│       │   ├── dashboard/      # Dashboard page
│       │   └── page.tsx        # Landing page
│       ├── components/         # React components
│       │   ├── common/         # Shared components
│       │   ├── dashboard/      # Dashboard components
│       │   ├── landing/        # Landing page components
│       │   ├── providers/      # Context providers
│       │   ├── ui/             # UI components (Radix)
│       │   └── wallet/         # Wallet components
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Library code
│       │   ├── analyzers/      # Activity & criteria analyzers
│       │   ├── db/             # MongoDB client & models
│       │   ├── goldrush/       # GoldRush API integration
│       │   └── wallet/         # Wallet configuration
│       └── scripts/            # Utility scripts
└── packages/
    └── shared/                 # Shared code
        ├── constants/          # Chain definitions, config
        ├── data/               # Airdrop registry
        ├── types/              # TypeScript types
        └── utils/              # Utility functions

```

## API Routes

### GET /api/airdrop-check/[address]
Check airdrop eligibility for a wallet address.

**Response:**
```json
{
  "address": "0x...",
  "overallScore": 72,
  "airdrops": [
    {
      "project": "Zora",
      "projectId": "zora",
      "slug": "zora",
      "status": "confirmed",
      "score": 100,
      "criteria": [
        { "desc": "Minted NFT on Zora", "met": true },
        { "desc": "Used Base network", "met": true }
      ]
    }
  ],
  "timestamp": 1699999999999
}
```

### GET /api/airdrops
Get list of all tracked airdrop projects.

**Query Params:**
- `status` (optional): Filter by status (confirmed, rumored, expired, speculative)

### POST /api/refresh
Force refresh eligibility scan for an address.

**Body:**
```json
{
  "address": "0x..."
}
```

**Rate Limit:** 1 request per 5 minutes per address

### GET /api/og
Generate OpenGraph image for social sharing.

**Query Params:**
- `score`: User's overall score (0-100)
- `address`: Wallet address

## Airdrop Criteria

Airdrops are defined in `packages/shared/data/airdrops.json`. Each project includes:

- **name**: Project name
- **slug**: URL-friendly identifier
- **status**: confirmed | rumored | speculative | expired
- **criteria**: Array of eligibility checks
- **chainIds**: Supported chain IDs
- **tags**: Categorization tags

Example criterion:
```json
{
  "description": "Minted NFT on Zora",
  "check": "nft_platform=zora"
}
```

## Supported Chains

- Ethereum (1)
- Base (8453)
- Arbitrum One (42161)
- Optimism (10)
- zkSync Era (324)
- Polygon (137)

## Caching Strategy

- **Airdrop Check**: 1 hour TTL
- **Airdrops List**: 5 minutes TTL
- **Refresh Cooldown**: 5 minutes per address

## API Endpoints

### Airdrop Eligibility Check
```
GET /api/airdrop-check/[address]
```
Check airdrop eligibility for a specific wallet address.

**Response:**
```json
{
  "address": "0x...",
  "overallScore": 72,
  "airdrops": [
    {
      "project": "Zora",
      "projectId": "zora",
      "status": "confirmed",
      "score": 100,
      "criteria": [...]
    }
  ]
}
```

### List All Airdrops
```
GET /api/airdrops
```
Get list of all tracked airdrop projects.

### Wallet Comparison
```
POST /api/compare
```
Compare multiple wallet addresses (2-5 wallets).

**Request:**
```json
{
  "addresses": ["0x...", "0x..."]
}
```

**Response:**
```json
{
  "wallets": [...],
  "winner": {
    "address": "0x...",
    "metric": "Overall Score",
    "value": 85
  },
  "summary": {...}
}
```

### Airdrop Calendar
```
GET /api/calendar
```
Get upcoming airdrop events (snapshots, claims, announcements).

**Response:**
```json
{
  "events": [...],
  "groupedByMonth": {...},
  "totalEvents": 15
}
```

### Refresh Eligibility
```
POST /api/refresh
```
Trigger a fresh eligibility check (rate-limited to 1 per 5 minutes per address).

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Database commands
cd apps/web
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema to database
npx prisma studio      # Open database GUI
npm run seed           # Seed database with airdrop projects
```

## Contributing

This project follows the monorepo structure with npm workspaces. Key guidelines:

- Files should be 200-400 lines (max 500, never exceed 800-1000)
- Use NativeWind/TailwindCSS, not StyleSheet
- All environment variables must be set via terminal (no hardcoding)
- Single README.md at root only

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, TailwindCSS, and GoldRush API
