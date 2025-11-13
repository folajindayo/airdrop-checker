# Architecture Documentation

## Overview

Airdrop Finder is built with a modern monorepo architecture using Next.js 15, React 19, and TypeScript 5.

## Directory Structure

```
airdrop-checker/
├── apps/
│   └── web/              # Next.js application
│       ├── app/          # App Router pages and API routes
│       ├── components/   # React components
│       └── lib/          # Application logic
│           ├── services/     # Business logic services
│           ├── utils/        # Utility functions
│           ├── config/       # Configuration
│           ├── middleware/   # Route middleware
│           ├── validators/   # Input validation
│           ├── mappers/      # Data transformation
│           ├── helpers/      # Helper functions
│           └── cache/        # Cache strategies
└── packages/
    └── shared/           # Shared code
        ├── types/        # TypeScript types
        ├── constants/    # Constants and config
        └── utils/        # Shared utilities
```

## Architectural Patterns

### Service Layer
Business logic is separated from API routes into dedicated service modules (`lib/services/`). This provides:
- Reusability across multiple endpoints
- Easier testing and maintenance
- Clear separation of concerns

### Middleware
Common functionality like validation, caching, and error handling is implemented as reusable middleware (`lib/middleware/`).

### Type Safety
Comprehensive TypeScript types ensure type safety across the entire application (`packages/shared/types/`).

### Configuration
All configuration is centralized in `lib/config/` with environment variable validation.

### Caching
Multi-level caching strategy with in-memory cache and configurable TTLs.

## Data Flow

1. **Request** → API Route Handler
2. **Validation** → Middleware validates input
3. **Cache Check** → Check if data is cached
4. **Service Layer** → Business logic execution
5. **External APIs** → Fetch from GoldRush/blockchain
6. **Data Mapping** → Transform external data
7. **Cache Update** → Store results
8. **Response** → Standardized API response

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, TailwindCSS, Radix UI
- **Language**: TypeScript 5
- **Database**: MongoDB with Prisma ORM
- **Blockchain**: GoldRush API, WalletConnect v2
- **State**: React hooks, Wagmi v2
- **Deployment**: Vercel (recommended)

