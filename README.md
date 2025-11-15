# 🎁 Airdrop Checker

A comprehensive, production-ready platform for tracking and managing cryptocurrency airdrops across multiple blockchain networks.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## ✨ Features

### Core Functionality
- 🔍 **Airdrop Eligibility Checking**: Check eligibility for multiple airdrop campaigns
- 💼 **Portfolio Tracking**: Real-time portfolio tracking across multiple chains
- 📊 **Transaction History**: Comprehensive transaction history with filtering and sorting
- 🌐 **Multi-Chain Support**: Ethereum, Polygon, BSC, Avalanche, Arbitrum, Optimism, and more
- 🔗 **Wallet Integration**: Support for MetaMask, WalletConnect, Coinbase Wallet, and more

### Advanced Features
- 📈 **Analytics Dashboard**: Track portfolio performance and trends
- 🔔 **Notifications**: Real-time notifications for new airdrops
- 🎯 **Eligibility Scoring**: Advanced scoring system for airdrop eligibility
- 📱 **Mobile Responsive**: Fully responsive design for all devices
- 🌙 **Dark Mode**: Beautiful dark mode support
- ⚡ **Fast & Optimized**: Cached responses and optimized queries

### Developer Features
- 🧪 **Comprehensive Tests**: 80+ test files with 1000+ test cases
- 📝 **Type Safety**: Full TypeScript with strict mode
- 🔒 **Security**: Rate limiting, encryption, secure sessions
- 📊 **Monitoring**: Structured logging, performance tracking, health checks
- 🚀 **Performance**: Code splitting, lazy loading, bundle optimization
- ♿ **Accessibility**: WCAG 2.1 AA compliant

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/airdrop-checker.git
cd airdrop-checker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Set up database**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
airdrop-checker/
├── apps/
│   └── web/                    # Next.js application
│       ├── app/                # App router pages
│       ├── components/         # React components
│       │   ├── ui/            # UI components
│       │   ├── features/      # Feature components
│       │   └── common/        # Common components
│       ├── lib/               # Utility libraries
│       │   ├── hooks/         # Custom React hooks
│       │   ├── utils/         # Utility functions
│       │   ├── services/      # Service layer
│       │   ├── validation/    # Validation schemas
│       │   └── cache/         # Caching utilities
│       ├── __tests__/         # Test files
│       └── prisma/            # Database schema
├── packages/
│   └── shared/                # Shared code
├── docs/                      # Documentation
├── ARCHITECTURE.md            # Architecture documentation
├── API.md                     # API documentation
├── CONTRIBUTING.md            # Contribution guidelines
├── DEPLOYMENT.md              # Deployment guide
└── SECURITY.md                # Security policy
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: TailwindCSS 3.4
- **UI Components**: Radix UI
- **Charts**: Recharts
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (optional) + In-memory
- **Authentication**: JWT-based sessions

### Development
- **Language**: TypeScript 5 (strict mode)
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint with strict rules
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged

### Infrastructure
- **Deployment**: Vercel (recommended) / AWS / Docker
- **Database**: PostgreSQL
- **Caching**: Redis
- **Monitoring**: Sentry, New Relic
- **Analytics**: Google Analytics, Mixpanel

## 📚 Documentation

- [Architecture Overview](ARCHITECTURE.md)
- [API Documentation](API.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Security Policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 🔒 Security

Security is a top priority. We implement:

- Rate limiting to prevent abuse
- Input validation and sanitization
- Encrypted sensitive data
- Secure session management
- Security headers
- CSRF protection
- XSS protection

See [SECURITY.md](SECURITY.md) for our security policy.

## 🌟 Key Components

### UI Components
- **Badge**: Status indicators with multiple variants
- **Button**: Comprehensive button system with loading states
- **Card**: Flexible card component for content display
- **Input**: Form inputs with validation
- **Modal**: Dialog and modal system
- **Toast**: Notification system
- **Tabs**: Tabbed interface with keyboard navigation
- **Accordion**: Expandable sections

### Feature Components
- **WalletConnection**: Multi-wallet connection management
- **NetworkSwitcher**: Chain switching interface
- **TokenBalanceCard**: Token balance display
- **TransactionHistory**: Transaction list with filtering
- **AirdropEligibilityCard**: Airdrop eligibility display
- **PortfolioSummary**: Portfolio overview with charts

### Custom Hooks
- **useWallet**: Wallet connection management
- **useFetch**: Data fetching with state management
- **useForm**: Form state and validation
- **useDebounce**: Value debouncing
- **useLocalStorage**: Persistent local storage
- **useToast**: Toast notifications

## 🚀 Performance

The application is optimized for performance:

- **Bundle Size**: < 250KB (gzipped)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: > 90

Performance optimizations include:
- Code splitting and lazy loading
- Image optimization
- Response caching
- Database query optimization
- CDN for static assets

## ♿ Accessibility

The application follows WCAG 2.1 AA guidelines:

- Keyboard navigation support
- Screen reader friendly
- ARIA labels and descriptions
- Focus management
- Color contrast compliance
- Responsive text sizing

## 🌍 Supported Chains

- Ethereum Mainnet
- Polygon (Matic)
- Binance Smart Chain
- Avalanche C-Chain
- Arbitrum One
- Optimism
- Fantom
- And more...

## 📊 API Endpoints

### Airdrop Routes
- `GET /api/airdrops` - List all airdrops
- `GET /api/airdrop-check/[address]` - Check eligibility

### Portfolio Routes
- `GET /api/portfolio/[address]` - Get portfolio data

### Transaction Routes
- `GET /api/transactions/[address]` - Get transaction history

### Utility Routes
- `GET /api/health` - Health check
- `GET /api/trending` - Trending airdrops
- `GET /api/gas-tracker` - Gas price tracker

See [API.md](API.md) for complete API documentation.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for hosting
- [Prisma](https://www.prisma.io/) for the excellent ORM
- [TailwindCSS](https://tailwindcss.com/) for utility-first CSS
- [Radix UI](https://www.radix-ui.com/) for accessible components
- GoldRush API for blockchain data

## 📧 Contact

- **Email**: support@airdrop-checker.com
- **Twitter**: [@airdrop_checker](https://twitter.com/airdrop_checker)
- **Discord**: [Join our community](https://discord.gg/airdrop-checker)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Advanced filtering and sorting
- [ ] Social features (share findings)
- [ ] Historical airdrop data
- [ ] AI-powered eligibility prediction
- [ ] Multi-language support
- [ ] Email notifications
- [ ] API for developers

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

**Built with ❤️ by the Airdrop Checker Team**
