# Architecture Documentation

## Overview

Airdrop Finder is a modern full-stack application built with Next.js 15, leveraging the App Router architecture for optimal performance and developer experience. The application follows a monorepo structure using npm workspaces.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                       │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │   React    │  │  Reown SDK │  │   TailwindCSS/UI    │   │
│  │Components  │  │  (Wallet)  │  │    Components       │   │
│  └────────────┘  └────────────┘  └─────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/WebSocket
┌──────────────────────────┴──────────────────────────────────┐
│                    Next.js App Router                         │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐     │
│  │   Pages    │  │ API Routes  │  │   Middleware     │     │
│  │  (RSC/SSR) │  │ (Serverless)│  │  (Rate Limiting) │     │
│  └────────────┘  └─────────────┘  └──────────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                       │
┌───┴────┐          ┌──────┴───────┐      ┌──────┴────────┐
│Database│          │  GoldRush API│      │  Cache Layer  │
│(Prisma)│          │  (Blockchain)│      │  (In-Memory)  │
└────────┘          └──────────────┘      └───────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15.2.4 with App Router
- **UI Library**: React 19
- **Styling**: TailwindCSS 3.4 + NativeWind
- **Components**: Radix UI primitives
- **State Management**: React Context + Server Components
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization

### Backend
- **Runtime**: Next.js API Routes (Edge/Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: In-memory with TTL (upgradeable to Redis)
- **Blockchain Data**: GoldRush API (Covalent)
- **Wallet Connection**: Reown AppKit (WalletConnect v2)

### Development
- **Language**: TypeScript 5 (Strict Mode)
- **Linting**: ESLint with strict rules
- **Formatting**: Prettier with Tailwind plugin
- **Testing**: Jest + React Testing Library
- **Git Hooks**: Husky + lint-staged

## Project Structure

```
airdrop-checker/
├── apps/
│   └── web/                          # Main Next.js application
│       ├── app/                      # App Router directory
│       │   ├── (routes)/            # Page routes
│       │   ├── api/                 # API endpoints
│       │   └── layout.tsx           # Root layout
│       ├── components/              # React components
│       │   ├── common/              # Shared components
│       │   ├── dashboard/           # Dashboard-specific
│       │   ├── features/            # Feature components
│       │   ├── ui/                  # UI primitives
│       │   └── error/               # Error components
│       ├── lib/                     # Business logic
│       │   ├── analyzers/          # Data analyzers
│       │   ├── services/           # Business services
│       │   ├── utils/              # Utility functions
│       │   ├── validations/        # Zod schemas
│       │   ├── errors/             # Error handling
│       │   ├── security/           # Security utilities
│       │   ├── monitoring/         # Logging & metrics
│       │   └── db/                 # Database utilities
│       ├── __tests__/              # Test files
│       │   ├── api/                # API route tests
│       │   ├── components/         # Component tests
│       │   ├── services/           # Service tests
│       │   └── utils/              # Utility tests
│       └── prisma/                 # Database schema
└── packages/
    └── shared/                      # Shared utilities
        ├── constants/              # Shared constants
        ├── types/                  # TypeScript types
        └── utils/                  # Shared utilities
```

## Key Design Patterns

### 1. Server Components First
- Default to Server Components for better performance
- Use Client Components only when needed (interactivity)
- Leverage streaming and suspense boundaries

### 2. Service Layer Pattern
```typescript
// Service handles business logic
export async function checkAirdropEligibility(address: string) {
  // Validation
  // Data fetching
  // Business logic
  // Return formatted result
}

// API route is thin wrapper
export async function GET(request, { params }) {
  const result = await checkAirdropEligibility(params.address);
  return NextResponse.json(result);
}
```

### 3. Error Handling Strategy
```typescript
// Standardized error classes
throw new ValidationError('Invalid address');
throw new RateLimitError('Too many requests');

// Error boundary catches React errors
<ErrorBoundary>
  <Component />
</ErrorBoundary>

// API middleware handles errors consistently
export const GET = withErrorHandler(handler);
```

### 4. Validation with Zod
```typescript
// Define schema once
export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

// Use everywhere
const address = addressSchema.parse(input);
```

### 5. Repository Pattern
```typescript
// Database access through repository
export const projectRepository = {
  findAll: () => prisma.project.findMany(),
  findByStatus: (status) => prisma.project.findMany({ where: { status } }),
  findById: (id) => prisma.project.findUnique({ where: { id } }),
};
```

## Data Flow

### 1. Airdrop Eligibility Check

```
User Input → Validation → Cache Check → GoldRush API → Analysis → Cache → Response
```

**Detailed Flow:**
1. User enters wallet address
2. Client sends request to `/api/airdrop-check/[address]`
3. Server validates address format
4. Check cache for recent result
5. If cache miss, fetch data from GoldRush API
6. Analyze transactions against airdrop criteria
7. Calculate eligibility scores
8. Cache result with TTL
9. Return formatted response

### 2. Portfolio Data

```
Address → Multi-Chain Query → Aggregate → Calculate Values → Response
```

**Detailed Flow:**
1. Fetch balances from all supported chains
2. Aggregate token data
3. Calculate USD values
4. Sort by value
5. Return structured portfolio

## Caching Strategy

### Three-Tier Caching
1. **Browser Cache**: Static assets, CDN
2. **Application Cache**: In-memory with TTL
3. **Database Cache**: Materialized views (future)

### Cache Keys
```typescript
`airdrop-check:${address}` // 1 hour TTL
`portfolio:${address}` // 5 minutes TTL
`airdrops:all` // 5 minutes TTL
`airdrops:status:${status}` // 5 minutes TTL
```

### Cache Invalidation
- Time-based expiration (TTL)
- Manual invalidation via `/api/refresh`
- Rate limited refresh (5 minutes per address)

## Security Architecture

### 1. Input Validation
- All inputs validated with Zod schemas
- Address checksumming
- SQL injection prevention (Prisma ORM)
- XSS prevention (React escaping)

### 2. Rate Limiting
```typescript
// Per-endpoint limits
STANDARD: 100 requests/hour
STRICT: 10 requests/hour
PER_MINUTE: 60 requests/minute
```

### 3. Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security

### 4. Authentication (Future)
- JWT tokens for authenticated endpoints
- API key support for programmatic access
- OAuth integration for third-party services

## Performance Optimizations

### 1. Code Splitting
- Dynamic imports for heavy components
- Route-based code splitting (automatic)
- Lazy loading for non-critical features

### 2. Image Optimization
- Next.js Image component
- Automatic format conversion (WebP/AVIF)
- Responsive images with srcset

### 3. Database Optimization
- Indexes on frequently queried fields
- Composite indexes for complex queries
- Connection pooling
- Query result streaming

### 4. API Optimization
- Response compression (gzip/brotli)
- Partial response support
- Batch endpoints for multiple requests
- GraphQL for flexible queries (future)

## Monitoring & Observability

### Metrics Tracked
- API response times
- Cache hit rates
- Error rates by endpoint
- Database query performance
- External API latency

### Logging Structure
```typescript
{
  level: 'info',
  message: 'API Request',
  timestamp: '2025-11-13T12:00:00Z',
  context: {
    endpoint: '/api/airdrop-check',
    method: 'GET',
    duration: 150,
    statusCode: 200
  }
}
```

## Deployment Architecture

### Vercel Platform
- **Edge Network**: Global CDN
- **Serverless Functions**: API routes
- **Edge Functions**: Middleware
- **Database**: Railway PostgreSQL
- **Environment**: Preview + Production

### CI/CD Pipeline
1. Push to GitHub
2. Automatic preview deployment
3. Run tests
4. Deploy to production (main branch)
5. Invalidate CDN cache

## Scalability Considerations

### Current Scale
- Handles 1000s of requests/day
- Sub-second response times
- 99.9% uptime target

### Future Scaling
1. **Redis**: For distributed caching
2. **Read Replicas**: For database scaling
3. **CDN**: For static content
4. **Rate Limiting**: Per-user quotas
5. **Queue System**: For async processing

## Security Considerations

### Data Protection
- No sensitive data stored
- Wallet addresses are public
- No private keys or signing
- GDPR compliant (no PII required)

### API Security
- Rate limiting per IP/address
- Input validation on all endpoints
- Error messages sanitized
- No stack traces in production

## Testing Strategy

### Test Pyramid
```
     /\
    /E2E\         <- End-to-end tests (critical flows)
   /──────\
  /Integr'n\      <- API integration tests
 /──────────\
/   Unit     \    <- Unit tests (utilities, components)
──────────────
```

### Coverage Targets
- Unit Tests: 80%+ coverage
- Integration Tests: Key API routes
- E2E Tests: Critical user flows

## Future Enhancements

### Phase 1 (Q1 2026)
- [ ] Redis caching layer
- [ ] WebSocket for real-time updates
- [ ] Advanced analytics dashboard
- [ ] User authentication

### Phase 2 (Q2 2026)
- [ ] Mobile app (React Native)
- [ ] GraphQL API
- [ ] Multi-language support
- [ ] Advanced portfolio tracking

### Phase 3 (Q3 2026)
- [ ] DeFi position tracking
- [ ] Automated airdrop farming
- [ ] Social features
- [ ] NFT portfolio integration

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT - See [LICENSE](./LICENSE) for details.
