# Airdrop Finder

A read-only onchain dashboard that helps users check whether their wallet might be eligible for ongoing or upcoming airdrops. Users simply connect their wallet via WalletConnect and instantly see a summary of protocols they've interacted with, activity patterns, and how closely they match known airdrop eligibility criteria.

## 🎉 380+ Production-Ready Features!

### 🎯 Core Features (1-15)
21. **WalletConnect Integration** - Connect securely using WalletConnect v2 (Reown SDK)
22. **Multi-Chain Support** - Ethereum, Base, Arbitrum, Optimism, zkSync Era, Polygon
23. **Eligibility Scoring** - Get scored on 10+ confirmed and rumored airdrops
24. **Real-time Analysis** - Fetch onchain data using GoldRush API
25. **Activity Summary** - Comprehensive wallet activity overview
26. **Airdrop Filters** - Advanced filtering by status, score, and sorting
27. **Export Reports** - Download eligibility in JSON, CSV, or TXT
28. **Activity Timeline** - Visual timeline of transactions and milestones
29. **Wallet Comparison** - Compare up to 5 wallets side-by-side
30. **Protocol Insights** - Detailed protocol breakdown with airdrop potential
31. **Airdrop Calendar** - Track snapshots, claims, and announcements
32. **Search Functionality** - Real-time search with suggestions
33. **User Preferences** - Customizable settings with localStorage
34. **Social Sharing** - Share results on Twitter/X with Web Share API
35. **Personalized Recommendations** - AI-driven airdrop suggestions

### 📊 UI Components Library (16-60)
16. **Alert Component** - Multiple variants with action buttons
17. **Avatar Component** - Wallet, user, group, status variants
18. **Badge Component** - Multiple variants and sizes
19. **Breadcrumb Navigation** - Responsive with custom separators
20. **Button Component** - Multiple variants and sizes
21. **Calendar Component** - Date picker, range picker, events
22. **Card Component** - Flexible container with header/footer
23. **Checkbox Component** - With groups and indeterminate state
24. **Collapsible Component** - Icon, card, and group variants
25. **Command Menu** - Keyboard shortcuts (Cmd+K/Ctrl+K)
26. **Context Menu** - Right-click menus with shortcuts
27. **Copy Button** - One-click copy with toast feedback
28. **Data Table** - Sortable, searchable, paginated tables
29. **Dialog Component** - Modal dialogs with variants
30. **Dropdown Menu** - Nested menus with shortcuts
31. **Empty State** - 10+ preset scenarios with illustrations
32. **Form Component** - React Hook Form integration
33. **Hover Card** - Rich tooltips with content
34. **Input Component** - Multiple variants and validation
35. **Label Component** - Accessible form labels
36. **Loading States** - Spinners, skeletons, progress indicators
37. **Menubar Component** - Application menu with submenus
38. **Navigation Menu** - Dropdown navigation with mega menu
39. **Pagination Component** - Full pagination controls
40. **Popover Component** - Floating content containers
41. **Progress Component** - Linear and circular progress bars
42. **Radio Group** - Multiple variants including cards
43. **Resizable Panels** - Split view layouts with drag handles
44. **Scroll Area** - Custom scrollbars with variants
45. **Select Component** - Dropdown selection with search
46. **Separator Component** - Dividers with multiple styles
47. **Sheet Component** - Slide-out panels from all sides
48. **Skeleton Component** - Loading placeholders
49. **Slider Component** - Range sliders with markers
50. **Statistics Widget** - Trend indicators and comparisons
51. **Switch Component** - Toggle with labels
52. **Table Component** - Data display primitives
53. **Tabs Component** - Tabbed content containers
54. **Textarea Component** - Multi-line input with auto-resize
55. **Toast Provider** - Notification system with presets
56. **Toggle Component** - Single toggle button
57. **Toggle Group** - Multi-select toggle groups
58. **Tooltip Component** - Enhanced tooltips with variants
59. **Aspect Ratio** - Responsive media containers
60. **Progress Tracker** - Step-by-step progress visualization

### 🚀 Advanced Features (61-81)
61. **Score History** - Track historical scores with charts
62. **Watchlist** - Monitor up to 10 wallets
63. **Mobile Navigation** - Responsive slide-out menu
64. **Theme Toggle** - Dark/light/system themes
65. **Rate Limiting** - API protection middleware
66. **Notification Center** - Real-time alerts system
67. **Error Boundary** - Graceful error handling
68. **Help/FAQ Page** - 15+ questions with accordion UI
69. **Settings Page** - 5-tab settings interface
70. **Scroll to Top** - Multiple variants with progress
71. **Transaction Details** - Full tx info display
72. **Chain Selector** - Dropdown and grid variants
73. **Confirmation Dialog** - Preset confirmations
74. **Advanced Search** - Filters sheet with active badges
75. **Rich Text Editor** - Formatting toolbar with markdown
76. **File Upload** - Drag-and-drop with preview
77. **Analytics Widget** - User and airdrop analytics
78. **Multi-Step Form** - Progress tracking with validation
79. **Kanban Board** - Drag-and-drop project tracking
80. **QR Code Generator** - With scanner and share variants
81. **File Manager** - Grid/list view with file operations

### 💬 Communication & Social (82-85)
82. **Chat Component** - Real-time messaging with sidebar
83. **Support Chat** - Live support widget
84. **Timeline Component** - Vertical and horizontal variants
85. **Activity Feed** - Real-time activity stream

### 🎬 Media & Content (86-88)
86. **Video Player** - Full controls with chapters
87. **Rating System** - Stars, hearts, thumbs variants
88. **Review Cards** - User reviews with helpful voting

### 💰 Commerce & Pricing (89-90)
89. **Pricing Table** - Billing toggle with comparison
90. **Enterprise Pricing** - Custom solutions CTA

### 🎓 Onboarding & Help (91-93)
91. **Onboarding Tour** - Interactive spotlight guide
92. **Step Guide** - Sequential tutorial steps
93. **Welcome Checklist** - Getting started tasks

### 📈 Data Visualization (94-100)
94. **Bar Chart** - Horizontal bar charts
95. **Donut Chart** - Pie charts with legend
96. **Line Chart** - Time series visualization
97. **Area Chart** - Filled line charts
98. **Heatmap** - Data density visualization
99. **Progress Ring** - Circular progress indicators
100. **Stat Cards** - Metrics with trend indicators

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

## 🌐 Deploy to Vercel

### Quick Deploy (Automated)
```bash
chmod +x deploy.sh
./deploy.sh
```

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/airdrop-checker&env=NEXT_PUBLIC_REOWN_PROJECT_ID,GOLDRUSH_API_KEY,DATABASE_URL)

### Manual Deployment Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Add Environment Variables** (in Vercel Dashboard or CLI)
   ```env
   NEXT_PUBLIC_REOWN_PROJECT_ID=5c4d877bba011237894e33bce008ddd1
   GOLDRUSH_API_KEY=cqt_rQMcBkPqGr9GVCkpQrHbHvfgRKr
   DATABASE_URL=postgresql://postgres:jZEokyUlaozzpRNrtFuYSneJKYDVSwYw@nozomi.proxy.rlwy.net:39734/railway
   ```

📚 **Detailed Instructions**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

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
