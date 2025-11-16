# 🎁 Airdrop Checker

A comprehensive onchain dashboard that helps users check whether their wallet might be eligible for ongoing or upcoming airdrops. Users connect their wallet via **Reown Wallet** (formerly WalletConnect) and instantly see a summary of protocols they've interacted with, activity patterns, and how closely they match known airdrop eligibility criteria. The platform includes 622+ onchain transaction and query features, all powered by Reown Wallet for secure, decentralized access.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🎉 770 Production-Ready Features!

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

<<<<<<< HEAD
Built with ❤️ using Next.js, TailwindCSS, and GoldRush API

### 🔗 On-Chain Features (Powered by Reown Wallet)
All on-chain features require wallet connection via Reown Wallet (formerly WalletConnect) for secure, decentralized access.

**Latest Additions:** Yield farming tracking, MEV protection analysis, gas price prediction, rug pull detection, DeFi risk analysis, activity pattern detection, batch transaction optimization, cross-chain portfolio aggregation, price alerts, and comprehensive token analytics.

371. **Token Balance Checker** - Check token balances across all chains with real-time USD values
372. **NFT Collection Tracker** - Track NFT holdings and collections across multiple chains
373. **Transaction History Analyzer** - Deep dive into transaction patterns, activity by day/hour, and top contracts
374. **Smart Contract Interaction Tracker** - Track all contract calls, function invocations, and interaction counts
375. **Token Transfer History** - Track incoming and outgoing token transfers with detailed breakdowns
376. **Cross-Chain Bridge Tracker** - Track bridge transactions across protocols (Stargate, Hop, Across, etc.)
377. **Token Approval Manager** - Track and manage token approvals with risk scoring for unlimited approvals
378. **ENS/Domain Resolver** - Resolve ENS names, avatars, and reverse records for wallet addresses
379. **Wallet Age Calculator** - Calculate wallet age, activity metrics, and first/last transaction dates
380. **Transaction Signature Analyzer** - Analyze transaction signatures, function calls, and success rates
381. **Contract Verification Checker** - Check if contracts are verified, track verified vs unverified interactions
382. **Token Price Tracker** - Track token prices across chains with 24h changes and market data
383. **Liquidity Pool Position Tracker** - Track LP positions across DEXs (Uniswap, PancakeSwap, SushiSwap, etc.)
384. **Staking Position Tracker** - Track staking positions, rewards, and APY across protocols
385. **Governance Participation Tracker** - Track governance votes, proposals, and participation scores
386. **Airdrop Claim Status Checker** - Check claim status for airdrops, track claimed amounts and transactions
387. **Wallet Risk Score Calculator** - Calculate comprehensive wallet risk score with factor analysis
388. **Token Swap History** - Track swap transactions across DEXs with token pairs and values
389. **Wallet Activity Timeline** - Detailed activity timeline with event types, dates, and summaries
390. **On-Chain Analytics Dashboard** - Comprehensive on-chain analytics combining all features above

#### Additional Onchain Query & Read Features (391-410)
391. **Token Balance Check** - Check native token or ERC20 token balances for any address using Reown Wallet
392. **Transaction History** - Get transaction history and recent activity for wallet addresses
393. **Gas Estimation** - Estimate gas costs for transactions before execution via Reown Wallet
394. **Token Metadata** - Fetch token metadata including name, symbol, decimals, and total supply
395. **NFT Balance Check** - Check NFT balances for specific collections or all NFTs
396. **NFT Transfer** - Transfer NFTs between addresses with safe transfer support using Reown Wallet
397. **NFT Approval** - Approve NFTs for marketplaces (single token or operator approval) via Reown Wallet
398. **LP Position Check** - Check liquidity pool positions and estimated token amounts
399. **Staking Position Check** - Check staking positions and earned rewards
400. **Token Price Fetch** - Get token prices from DEX reserves and price oracles
401. **Contract Read** - Read any contract function with custom ABI and parameters
402. **Event Listening** - Listen to and filter contract events by name and parameters
403. **Token Allowance Check** - Check token allowances between owner and spender
404. **Nonce Management** - Get current and pending nonces for transaction management
405. **Gas Price Fetch** - Get current gas prices and fee estimates across chains
406. **Block Number** - Get latest block number and block information
407. **Transaction Status** - Check transaction status (pending, success, failed, not found)
408. **Contract Verification** - Verify contract existence and fetch basic contract info
409. **Token List** - Get curated token lists for major chains with metadata
410. **Chain State** - Get comprehensive chain state including block number, gas prices, and network info

#### Advanced Onchain Analytics Features (411-430)
411. **Token Vesting Schedule Checker** - Check on-chain token vesting schedules and unlock timelines for blockchain vesting analysis
412. **Airdrop Claim Eligibility Verifier** - Verify on-chain airdrop claim eligibility and claimable amounts for blockchain claim status
413. **Token Unlock Schedule Tracker** - Track on-chain token unlock schedules and linear/cliff unlock mechanisms for blockchain token releases
414. **Smart Contract Code Analyzer** - Analyze on-chain smart contract bytecode and code patterns for blockchain bytecode inspection
415. **Token Holder Distribution Analyzer** - Analyze on-chain token holder distribution and concentration metrics for blockchain concentration analysis
416. **Flash Loan Detection** - Detect on-chain flash loan usage and transaction patterns for blockchain transaction analysis
417. **Token Burn Tracker** - Track on-chain token burn events and supply reduction for blockchain supply reduction monitoring
418. **Token Minting Tracker** - Track on-chain token minting events and supply increases for blockchain supply increase monitoring
419. **Contract Upgrade Detector** - Detect on-chain contract upgrade mechanisms and proxy patterns for blockchain proxy pattern analysis
420. **Token Liquidity Lock Checker** - Check on-chain token liquidity lock status and unlock schedules for blockchain lock monitoring
421. **Token Vesting Contract Reader** - Read comprehensive on-chain token vesting contract data for blockchain vesting analysis
422. **Token Distribution Analyzer** - Analyze on-chain token distribution patterns and concentration metrics for blockchain concentration analysis
423. **Contract Proxy Detector** - Detect on-chain contract proxy patterns and implementation addresses for blockchain proxy analysis
424. **Token Supply Tracker** - Track on-chain token supply metrics including circulating and total supply for blockchain supply monitoring
425. **Token Holder Snapshot Generator** - Generate on-chain token holder snapshots at specific blocks for blockchain snapshot creation
426. **Smart Contract Security Scanner** - Scan on-chain smart contracts for security patterns and vulnerabilities for blockchain vulnerability detection
427. **Token Metadata Updater** - Get on-chain token metadata and check for update capabilities for blockchain metadata tracking
428. **Token Vesting Unlock Calculator** - Calculate on-chain token vesting unlock amounts and schedules for blockchain vesting calculations
429. **Token Airdrop Claim Status Checker** - Get on-chain airdrop claim status and eligibility information for blockchain claim tracking
430. **Onchain Feature Suite Complete** - Comprehensive on-chain analytics combining all advanced features above

#### Additional Onchain Blockchain Features (431-450)
431. **Token Vesting Schedule Analyzer** - Analyze on-chain token vesting schedules for blockchain vesting tracking
432. **Airdrop Eligibility Checker** - Verify on-chain airdrop claim eligibility for blockchain claim verification
433. **Token Lock Analyzer** - Analyze on-chain token locks and unlock schedules for blockchain lock monitoring
434. **Contract Deployment Tracker** - Track on-chain contract deployments and creation data for blockchain deployment analysis
435. **Token Transfer Analyzer** - Analyze on-chain token transfer patterns for blockchain transfer monitoring
436. **Token Approval Analyzer** - Analyze on-chain token approvals and risk levels for blockchain approval monitoring
437. **NFT Ownership Tracker** - Track on-chain NFT ownership and balances for blockchain NFT monitoring
438. **Gas Usage Analyzer** - Analyze on-chain gas usage and transaction costs for blockchain gas monitoring
439. **Contract Events Tracker** - Track on-chain contract events and logs for blockchain event monitoring
440. **Token Price History Tracker** - Track on-chain token price history over time for blockchain price monitoring
441. **Wallet Activity Score Calculator** - Calculate on-chain wallet activity scores for blockchain activity analysis
442. **Token Holder Count Estimator** - Estimate on-chain token holder counts for blockchain holder analysis
443. **Contract Interaction Counter** - Count on-chain contract interactions for blockchain interaction tracking
444. **Token Capitalization Calculator** - Calculate on-chain token market capitalization for blockchain market analysis
445. **Block Transaction Counter** - Count on-chain block transactions for blockchain block analysis
446. **Token Age Calculator** - Calculate on-chain token age and deployment data for blockchain token analysis
447. **Contract Storage Reader** - Read on-chain contract storage slots for blockchain storage analysis
448. **Token Whale Tracker** - Track on-chain token whale holdings for blockchain whale monitoring
449. **Transaction Fee Calculator** - Calculate on-chain transaction fees and costs for blockchain fee analysis
450. **Contract Creation Transaction Finder** - Find on-chain contract creation transactions for blockchain deployment tracking

#### Advanced Onchain Features (451-460)
451. **Yield Farming Position Tracker** - Track yield farming positions across DeFi protocols with Reown Wallet integration
452. **MEV Protection Analyzer** - Analyze MEV protection status and transaction security patterns
453. **Gas Price Predictor** - Predict future gas prices based on historical patterns with Reown optimization
454. **Token Rug Pull Detector** - Detect potential rug pull risks for token contracts using on-chain analysis
455. **DeFi Protocol Risk Analyzer** - Analyze DeFi protocol risks for wallet interactions with comprehensive assessment
456. **Wallet Activity Pattern Detector** - Detect patterns in wallet activity and behavior using Reown transaction data
457. **Transaction Batch Optimizer** - Optimize batch transactions for gas efficiency with Reown wallet support
458. **Cross-Chain Portfolio Aggregator** - Aggregate portfolio value across all supported chains using Reown multi-chain access
459. **Token Price Alerts System** - Create and manage price alerts for tokens with Reown wallet integration
460. **Token Holder Analytics** - Comprehensive analytics for token holders with distribution and concentration metrics

#### Additional Onchain Analytics (461-470)
461. **Token Transfer Flow Analyzer** - Analyze token transfer flows and patterns tracking incoming and outgoing transfers
462. **Advanced Holder Distribution Analysis** - Calculate Gini coefficient and Herfindahl index for token distribution metrics
463. **Smart Contract Event Monitor** - Monitor and track smart contract events in real-time with Reown integration
464. **Enhanced Token Unlock Tracker** - Advanced tracking of token unlock schedules and vesting mechanisms
465. **Token Liquidity Analyzer** - Analyze token liquidity across DEX pools with comprehensive metrics
466. **Wallet Reputation System** - Calculate wallet reputation score based on on-chain activity patterns
467. **Token Volatility Calculator** - Calculate token price volatility metrics for risk assessment
468. **Smart Money Tracker** - Track smart money wallets and identify profitable trading patterns
469. **Token Momentum Indicator** - Calculate token price momentum with RSI and trend analysis
470. **Contract Audit Status Checker** - Check contract audit status and security verification

#### Advanced Onchain Tools (471-505)
471. **Token Holder Growth Tracker** - Track token holder growth over time with adoption trends
472. **Transaction Cost Analyzer** - Analyze transaction costs and gas spending patterns
473. **Token Sentiment Analyzer** - Analyze token sentiment based on holder behavior patterns
474. **Wallet Clustering Detection** - Detect wallet clusters and related addresses
475. **Token Arbitrage Opportunities** - Find arbitrage opportunities across DEXs
476. **Token Whale Alerts** - Monitor whale movements for a token
477. **Token Lock Detector** - Detect token locks and vesting schedules
478. **Token Tax Analyzer** - Analyze token tax structure and fees
479. **Wallet Age Verification** - Verify wallet age and first transaction date
480. **Token Pair Analyzer** - Analyze token trading pairs across DEXs
481. **Contract Interaction Graph** - Build interaction graph for wallet or contract
482. **Token Holder Migration** - Track holder migration patterns and retention
483. **Token Ownership Concentration** - Calculate ownership concentration metrics
484. **Token Trading Volume** - Analyze token trading volume patterns
485. **Wallet Transaction Pattern** - Analyze wallet transaction patterns and strategies
486. **Token Price Impact** - Calculate price impact for token trades
487. **Token Concentration Risk** - Assess concentration risk for token
488. **Token Deflation Tracker** - Track token deflation mechanisms
489. **Token Inflation Monitor** - Track token inflation and minting
490. **Token Mint Rate** - Calculate token minting rate
491. **Wallet Balance History** - Track wallet balance history over time
492. **Token Dilution Tracker** - Track token dilution from new mints
493. **Token Market Cap** - Calculate token market capitalization
494. **Token Holder Retention** - Calculate holder retention rate
495. **Token Price Correlation** - Calculate price correlation with other assets
496. **Wallet Gas Optimization** - Analyze wallet gas usage and provide optimization tips
497. **Token Holder Activity** - Analyze holder activity levels
498. **Token Liquidity Depth** - Measure liquidity depth across price levels
499. **Token Holder Distribution Score** - Calculate distribution score for token
500. **Token Holder Turnover** - Calculate holder turnover rate
501. **Token Holder Value Distribution** - Analyze value distribution among holders
502. **Token Holder Geographic** - Analyze geographic distribution of holders
503. **Gas Optimization Advisor** - Get recommendations for optimizing gas usage
504. **Portfolio Risk Assessor** - Comprehensive portfolio risk assessment across chains
505. **Complete Onchain Analytics Suite** - Comprehensive on-chain analytics combining all advanced features above

#### Advanced Token Analytics Features (476-505)
476. **Token Slippage Calculator** - Calculate token slippage for swaps using Reown Wallet integration
477. **Token Liquidity Depth Analyzer** - Analyze token liquidity depth across DEX pools
478. **Token Trading Volume Tracker** - Track token trading volume over time periods
479. **Token Holder Activity Tracker** - Track activity patterns of token holders
480. **Token Burn Rate Calculator** - Calculate token burn rate and supply reduction
481. **Token Mint Rate Calculator** - Calculate token minting rate and supply increase
482. **Token Inflation Calculator** - Calculate token inflation rate over time
483. **Token Deflation Calculator** - Calculate token deflation rate from burns
484. **Token Holder Retention Analyzer** - Analyze token holder retention rates
485. **Token Transfer Velocity Tracker** - Track token transfer velocity and circulation speed
486. **Token Concentration Risk Analyzer** - Analyze token concentration risk and whale holdings
487. **Token Market Depth Analyzer** - Analyze market depth for token trading pairs
488. **Token Order Book** - Get order book data for token trading pairs
489. **Token Swap Aggregator** - Find best swap routes across multiple DEXs using Reown Wallet
490. **Token Yield Optimizer** - Find optimal yield farming strategies for tokens
491. **Token Rebalancer** - Calculate optimal rebalancing strategy for token portfolio
492. **Token Portfolio Optimizer** - Optimize token portfolio allocation for maximum returns
493. **Token Risk Calculator** - Calculate comprehensive risk metrics for tokens
494. **Token Correlation Analyzer** - Calculate correlation between multiple tokens
495. **Token Performance Tracker** - Track token performance metrics over time
496. **Token Trend Analyzer** - Analyze token price and volume trends
497. **Token Support/Resistance Finder** - Identify support and resistance levels for tokens
498. **Token Volume Profile Analyzer** - Analyze volume profile at different price levels
499. **Token Market Maker Tracker** - Track market maker activity and liquidity provision
500. **Token Arbitrage Finder** - Find arbitrage opportunities across DEXs
501. **Token Flash Swap Detector** - Detect and analyze flash swap opportunities
502. **Token Impermanent Loss Calculator** - Calculate impermanent loss for LP positions
503. **Token APR/APY Calculator** - Calculate APR and APY for staking and yield farming
504. **Token Reward Tracker** - Track staking and farming rewards for wallet
505. **Token Governance Proposal Tracker** - Track governance proposals and voting power for tokens

#### Latest Onchain Features (506-535)
506. **Token Liquidity Router** - Intelligent DEX routing for optimal liquidity and gas efficiency
507. **Cross-Chain Gas Comparison** - Real-time gas price comparison across multiple blockchains
508. **Token Correlation Analyzer** - Advanced correlation analysis between token pairs
509. **MEV Opportunity Detector** - Detect MEV opportunities and sandwich attacks
510. **Impermanent Loss Calculator** - Calculate IL for liquidity provider positions
511. **Token Value-at-Risk** - VaR calculation for token holdings
512. **Smart Contract Gas Profiler** - Function-level gas usage profiling
513. **Token Supply Verifier** - Verify circulating supply and token distribution
514. **Wallet Diversity Score** - Portfolio diversification metrics using Reown Wallet
515. **Token Momentum Indicator** - RSI and MACD momentum indicators
516. **Lending Rate Aggregator** - Best lending rates across DeFi protocols
517. **Pool Health Monitor** - Real-time liquidity pool health metrics
518. **Supply Shock Detector** - Detect sudden supply changes and anomalies
519. **Cross-Chain Arbitrage Finder** - Multi-DEX arbitrage opportunities
520. **Transaction Privacy Scorer** - Privacy analysis for transactions
521. **Token Unlock Calendar** - Comprehensive vesting unlock schedules
522. **Wallet Transaction Optimizer** - Gas optimization recommendations
523. **Token Social Metrics** - Social media sentiment and engagement
524. **Contract Complexity Analyzer** - Code complexity and risk assessment
525. **Token Economics Validator** - Tokenomics sustainability analysis
526. **Wallet Behavioral Fingerprint** - Unique wallet behavior identification
527. **Market Maker Detection** - Identify MM activity and manipulation
528. **Cross-Chain Message Tracker** - Track messages across chains
529. **Vesting Cliff Detector** - Identify vesting cliff periods
530. **Wallet PnL Calculator** - Comprehensive P&L tracking
531. **Order Flow Analyzer** - Real-time order book flow analysis
532. **Gas Optimization Engine** - Batch transaction optimization
533. **Token Pair Correlation Matrix** - Multi-token correlation heatmap
534. **Wallet Interaction Network** - Graph-based interaction mapping
535. **Smart Routing Engine** - AI-powered swap route optimization

#### Advanced Analytics Features (536-565)
536. **Contract Function Frequency Analyzer** - Track function call frequency and patterns
537. **Token Transfer Velocity Calculator** - Calculate token transfer velocity and circulation speed
538. **Wallet Batch Transaction Analyzer** - Analyze batch transaction patterns and gas optimization
539. **Token Concentration Risk Scorer** - Calculate concentration risk and whale impact
540. **Contract Upgrade History Tracker** - Track contract upgrade history and frequency
541. **Token Liquidity Depth Analyzer** - Analyze liquidity depth across price levels
542. **Cross-Chain Bridge Volume Tracker** - Track bridge transaction volumes
543. **Token Holder Migration Tracker** - Monitor holder migration patterns
544. **Contract Event Frequency Analyzer** - Analyze contract event emission patterns
545. **Token Price Impact Calculator** - Calculate price impact for large trades
546. **Wallet Gas Spending Pattern Analyzer** - Analyze gas spending patterns and optimization
547. **Token Holder Retention Calculator** - Calculate holder retention rates and loyalty
548. **Contract Storage Slot Reader** - Read and decode contract storage slots
549. **Token Volume Profile Generator** - Generate volume profiles by price level
550. **Wallet Interaction Frequency Tracker** - Track wallet interaction frequency
551. **Token Holder Geographic Distribution** - Analyze geographic distribution of holders
552. **Contract Complexity Score Calculator** - Calculate contract complexity metrics
553. **Token Holder Network Builder** - Build network graphs of holder relationships
554. **Token Supply Shock Detector** - Detect sudden supply changes and anomalies
555. **Wallet PnL Calculator** - Calculate profit and loss for wallet positions
556. **Token Holder Diversity Index** - Calculate holder diversity and distribution metrics
557. **Contract Gas Profile Analyzer** - Profile gas usage by function
558. **Token Holder Value Distribution Analyzer** - Analyze value distribution among holders
559. **Cross-Chain Message Tracker** - Track cross-chain message transactions
560. **Token Holder Activity Heatmap Generator** - Generate activity heatmaps by time
561. **Contract Interaction Graph Builder** - Build interaction graphs between contracts
562. **Token Holder Turnover Rate Calculator** - Calculate holder turnover and churn rates
563. **Wallet Fingerprint Generator** - Generate unique wallet behavioral fingerprints
564. **Token Burn Rate Calculator** - Calculate token burn rate over time
565. **Token Mint Rate Tracker** - Track token minting rate and patterns

#### DeFi & Governance Analytics Features (566-592)
566. **Token Treasury Tracker** - Track token treasury balances and movements
567. **Token Reserve Tracker** - Track token reserves and backing assets
568. **Token Backing Calculator** - Calculate token backing value and collateralization
569. **Token Collateral Ratio** - Calculate collateral ratio for lending protocols
570. **Token Liquidation Threshold** - Calculate liquidation threshold for positions
571. **Token Health Factor** - Calculate health factor for lending positions
572. **Token Borrow Rate** - Get current borrow rates for lending protocols
573. **Token Supply Rate** - Get supply rates for lending protocols
574. **Token Utilization Rate** - Calculate pool utilization rate
575. **Token Protocol Revenue** - Track protocol revenue over time
576. **Token Protocol Fees** - Track protocol fees collected
577. **Token Governance Treasury** - Track governance treasury balances
578. **Token Proposal Voting** - Track voting activity on proposals
579. **Token Quorum Tracker** - Track quorum requirements for proposals
580. **Token Voting Period** - Track voting period status for proposals
581. **Token Execution Tracker** - Track proposal execution status
582. **Token Timelock Tracker** - Track timelock delays for proposals
583. **Token Multisig Tracker** - Track multisig wallet status and signatures
584. **Token Proxy Admin** - Track proxy admin addresses for upgradeable contracts
585. **Token Implementation** - Track implementation addresses for proxy contracts
586. **Token Storage Slot** - Read contract storage slots
587. **Token Event Parser** - Parse and decode contract events
588. **Token Transaction Decoder** - Decode transaction data and function calls
589. **Token ABI Generator** - Generate ABI from contract bytecode
590. **Token Interface Detector** - Detect ERC interfaces implemented by contract
591. **Token Standard Detector** - Detect token standard (ERC20, ERC721, ERC1155)
592. **Token Compatibility** - Check token compatibility with protocols

#### Security & Risk Analysis Features (593-622)
593. **Token Liquidation Price** - Calculate liquidation price for positions
594. **Token Safety Score** - Calculate comprehensive safety score for tokens
595. **Token Whitelist Checker** - Check if address is whitelisted for token
596. **Token Blacklist Checker** - Check if address is blacklisted
597. **Token Freeze Detector** - Detect if token has freeze functionality
598. **Token Pause Detector** - Detect if token is paused
599. **Token Tax Analyzer** - Analyze token tax structure
600. **Token Reflection Tracker** - Track reflection rewards distribution
601. **Token Auto LP Tracker** - Track automatic liquidity provision
602. **Token Honeypot Detector** - Detect honeypot tokens
603. **Token Sniper Protection** - Check sniper protection mechanisms
604. **Token Anti-Bot Analyzer** - Analyze anti-bot mechanisms
605. **Token Max Wallet Checker** - Check max wallet restrictions
606. **Token Max Transaction Checker** - Check max transaction limits
607. **Token Cooldown Tracker** - Track cooldown periods for transactions
608. **Token Reward Distribution** - Track reward distribution mechanisms
609. **Token Staking Rewards** - Track staking rewards for wallet
610. **Token Farming Rewards** - Track farming rewards for wallet
611. **Token Vesting Schedule** - Get vesting schedule for wallet
612. **Token Lock Schedule** - Get token lock schedule
613. **Token Claimable Amount** - Get claimable token amount for wallet
614. **Token Airdrop Eligibility** - Check airdrop eligibility for wallet
615. **Token Snapshot Generator** - Generate token holder snapshot
616. **Token Merkle Proof** - Generate merkle proof for airdrop claims
617. **Token Delegation Tracker** - Track token delegation status
618. **Token Voting Power** - Calculate voting power for wallet
619. **Token Proposal Creator** - Get proposals created by wallet
620. **Token Transfer Rate Calculator** - Calculate token transfer rate and velocity
594. **Token Concentration Analyzer** - Analyze token concentration and distribution with Reown
595. **Token Volatility Tracker** - Track token price volatility over time
596. **Token Liquidity Router** - Find optimal liquidity routing paths with Reown wallet support
597. **Token Holding Period Analyzer** - Analyze average holding periods
598. **Token Flow Analyzer** - Analyze token flow patterns
599. **Token Market Share Calculator** - Calculate token market share in category with Reown
600. **Token Whale Alert** - Monitor whale wallet movements
601. **Token Adoption Rate Tracker** - Track token adoption rate with Reown wallet
602. **Token Turnover Rate Calculator** - Calculate token turnover rate
603. **Token Burn Rate Tracker** - Track token burn rate and deflation
604. **Token Mint Rate Tracker** - Track token minting rate and inflation with Reown support
605. **Token Trading Intensity Analyzer** - Measure trading intensity and frequency
606. **Token Liquidity Quality Assessor** - Assess liquidity quality metrics with Reown wallet
607. **Token Sentiment Score Calculator** - Calculate token sentiment based on onchain metrics
608. **Token Price Efficiency Analyzer** - Measure price discovery efficiency
609. **Token Holder Loyalty Analyzer** - Measure holder loyalty and retention with Reown wallet
610. **Token Volume Profile Analyzer** - Analyze volume distribution patterns
611. **Token Transaction Pattern Analyzer** - Analyze transaction patterns and behaviors with Reown support
612. **Token Holder Growth Rate Tracker** - Track holder growth rate over time
613. **Token Price Stability Analyzer** - Measure price stability and consistency with Reown wallet
614. **Token Utility Score Calculator** - Calculate token utility and usage score
615. **Token Holder Distribution Quality Assessor** - Assess quality of holder distribution with Reown
616. **Token Trading Velocity Tracker** - Measure trading velocity and circulation speed
617. **Token Market Depth Analyzer** - Analyze market depth across price levels with Reown wallet support
618. **Token Holder Diversity Index Calculator** - Calculate holder diversity index
619. **Token Trend Analyzer** - Analyze token price and volume trends with Reown wallet
620. **Token Liquidity Efficiency Analyzer** - Measure liquidity efficiency metrics
621. **Token Price Correlation Calculator** - Calculate price correlation with market with Reown support
622. **Token Market Health Assessor** - Assess overall market health score
623. **Token Liquidity Score Calculator** - Calculate comprehensive liquidity score
624. **Token Holder Migration Tracker** - Track holder migration patterns with Reown
625. **Token Spread Analyzer** - Analyze bid-ask spread metrics
626. **Token Market Cap Efficiency Analyzer** - Measure market cap efficiency metrics
627. **Token Holder Retention Analyzer** - Measure holder retention metrics with Reown
628. **Token Trade Size Distribution Analyzer** - Analyze trade size distribution patterns
629. **Token Price Anomaly Detector** - Detect price anomalies and manipulation with Reown wallet
630. **Token Liquidity Risk Assessor** - Assess liquidity risk factors
631. **Token Holder Balance Distribution Analyzer** - Analyze holder balance distribution with Reown
632. **Token Trading Activity Score Calculator** - Calculate comprehensive trading activity score
633. **Token Market Maker Activity Detector** - Detect market maker activity patterns with Reown wallet
634. **Token Liquidity Pool Analyzer** - Analyze liquidity pools across DEXes
635. **Token Price Impact Calculator** - Calculate price impact for different trade sizes with Reown support
636. **Token Holder Engagement Analyzer** - Measure holder engagement metrics
637. **Token Market Cap Dominance Calculator** - Calculate market cap dominance in category with Reown
638. **Token Holder Churn Rate Tracker** - Measure holder churn rate
639. **Token Liquidity Stability Analyzer** - Measure liquidity stability over time with Reown wallet
640. **Token Trading Volume Trend Analyzer** - Analyze trading volume trends
641. **Token Holder Value Score Calculator** - Calculate holder value distribution score with Reown
642. **Token Market Momentum Analyzer** - Measure market momentum indicators
643. **Token Liquidity Depth Analyzer** - Analyze liquidity depth at different price levels with Reown wallet
644. **Token Exchange Distribution Analyzer** - Analyze token distribution across exchanges
645. **Token Price Discovery Quality Assessor** - Assess price discovery quality metrics with Reown
646. **Token Holder Lifecycle Analyzer** - Analyze holder lifecycle stages
647. **Token Holder Engagement Analyzer** - Measure holder engagement and interaction patterns
648. **Token Market Cap Efficiency Calculator** - Calculate market capitalization efficiency with Reown support
649. **Token Trading Intensity Score Calculator** - Measure trading intensity scores
650. **Token Liquidity Quality Score Calculator** - Calculate comprehensive liquidity quality score
651. **Token Flash Loan Detector** - Detect flash loan usage patterns in token transactions
652. **Token MEV Bot Detector** - Detect MEV bot activity patterns and scoring
653. **Token Sandwich Attack Detector** - Detect sandwich attack patterns in token swaps
654. **Token Front-Running Detector** - Detect front-running patterns in transactions
655. **Token Back-Running Detector** - Detect back-running patterns in transactions
656. **Token Liquidity Sniping Detector** - Detect liquidity sniping patterns in token launches
657. **Token Pump and Dump Detector** - Detect pump and dump schemes in token trading
658. **Token Wash Trading Detector** - Detect wash trading patterns in token transactions
659. **Token Circular Trading Detector** - Detect circular trading patterns between addresses
660. **Token Price Manipulation Detector** - Detect price manipulation patterns with scoring system
661. **Token Order Flow Analyzer** - Analyze order flow patterns in token transactions
662. **Token Dark Pool Detector** - Detect dark pool trading patterns with large transactions
663. **Token Insider Trading Detector** - Detect potential insider trading patterns with timing analysis
664. **Token Coordinated Trading Detector** - Detect coordinated trading patterns across multiple addresses
665. **Token Bot Cluster Detector** - Detect bot cluster patterns in trading activity with scoring
666. **Token Sybil Attack Detector** - Detect Sybil attack patterns with multiple related addresses
667. **Token Airdrop Farming Detector** - Detect airdrop farming patterns and eligibility gaming with protocol analysis
668. **Token Sniping Bot Detector** - Detect sniping bot activity in token launches
669. **Token Gas War Detector** - Detect gas war patterns in competitive transactions
670. **Token Priority Fee Analyzer** - Analyze priority fee patterns with statistical metrics
671. **Token EIP-1559 Fee Analyzer** - Analyze EIP-1559 fee structure and base fee trends
672. **Token Layer 2 Bridge Analyzer** - Analyze Layer 2 bridge activity patterns with Reown
673. **Token Cross-Chain Arbitrage Detector** - Detect cross-chain arbitrage opportunities
674. **Token Bridge Risk Analyzer** - Analyze bridge transaction risks with security scoring
675. **Token Bridge Volume Tracker** - Track bridge transaction volumes across chains and protocols
676. **Token Bridge Fee Calculator** - Calculate bridge fees and compare across protocols
677. **Token Bridge Time Estimator** - Estimate bridge transaction completion times for planning
678. **Token Bridge Security Checker** - Check bridge security status and audit compliance
679. **Token Bridge Liquidity Checker** - Check bridge liquidity availability across routes
680. **Token Bridge Status Monitor** - Monitor bridge status and health metrics with Reown
681. **Token DEX Aggregator** - Aggregate DEX prices and liquidity across multiple exchanges
682. **Token Lending Position** - Track lending positions across DeFi protocols
683. **Token Borrow Position** - Track borrowing positions and debt across protocols
684. **Token Collateral Tracker** - Track collateral positions and ratios
685. **Token Liquidation Monitor** - Monitor liquidation risk and thresholds
686. **Token Yield Aggregator** - Aggregate yield opportunities across DeFi protocols
687. **Token Vault Tracker** - Track vault positions and strategies
688. **Token Governance Proposal Tracker** - Track governance proposals and voting activity
689. **Token Delegation Analyzer** - Analyze token delegation patterns and voting power
690. **Token NFT Floor Price** - Track NFT collection floor prices and trends
691. **Token NFT Royalty Tracker** - Track NFT royalty earnings and payments
692. **Token Options Position** - Track options positions and Greeks
693. **Token Perpetual Position** - Track perpetual futures positions and funding rates
694. **Token Liquidity Mining** - Track liquidity mining rewards and APY
695. **Token Stablecoin Peg** - Monitor stablecoin peg stability and deviations
696. **Token Rebase Tracker** - Track rebase token supply adjustments
697. **Token Validator Rewards** - Track validator staking rewards and performance
698. **Token Slashing Detector** - Detect slashing events for validators
699. **Token Validator Exit** - Track validator exit queue and withdrawal status
700. **Token MEV Rewards** - Track MEV rewards and block builder payments
701. **Token Relayer Fees** - Track relayer fees and meta-transaction costs
702. **Token Gas Refund Tracker** - Track gas refunds from failed transactions
703. **Token Transaction Batching** - Analyze transaction batching patterns and gas savings
704. **Token Multisig Approval** - Track multisig approval requirements and status
705. **Token Timelock Queue** - Track timelock queue and execution delays
706. **Token Proxy Upgrade** - Track proxy contract upgrades and implementation changes
707. **Token Account Abstraction** - Track account abstraction usage and smart contract wallets
708. **Token Smart Contract Wallet Tracker** - Track smart contract wallet usage and patterns with Reown integration
709. **Token Layer 2 Activity Analyzer** - Analyze Layer 2 activity patterns and bridge interactions
710. **Token Cross-Chain Token Tracker** - Track token movements across multiple blockchain networks
711. **Token DeFi Protocol Integration Analyzer** - Analyze DeFi protocol integration and interaction patterns
712. **Token Governance Participation Score** - Calculate governance participation scores and voting activity
713. **Token Liquidity Migration Tracker** - Track liquidity migration patterns across DEX platforms
714. **Token Tokenomics Validator** - Validate tokenomics structure and sustainability metrics
715. **Token Security Audit Tracker** - Track security audit status and compliance verification
716. **Token Community Engagement Analyzer** - Analyze community engagement through on-chain activity patterns
717. **Token Developer Activity Tracker** - Track developer activity and contract deployment patterns
718. **Token Protocol Upgrade Monitor** - Monitor protocol upgrade events and version changes
719. **Token Risk Assessment Engine** - Comprehensive risk assessment engine for token investments
720. **Token Yield Strategy Optimizer** - Optimize yield farming strategies across DeFi protocols
721. **Token Portfolio Rebalancer** - Automated portfolio rebalancing recommendations
722. **Token Gas Fee Optimizer** - Optimize gas fees through transaction timing and batching
723. **Token Transaction Privacy Analyzer** - Analyze transaction privacy and anonymity levels
724. **Token Wallet Clustering Analyzer** - Cluster related wallets and identify address relationships
725. **Token Smart Contract Interaction Profiler** - Profile smart contract interactions and call patterns
726. **Token DeFi Position Aggregator** - Aggregate DeFi positions across multiple protocols
727. **Token Cross-Chain Bridge Analyzer** - Analyze cross-chain bridge usage and efficiency
728. **Token MEV Protection Score** - Calculate MEV protection score and transaction security
729. **Token Liquidity Provider Analytics** - Comprehensive analytics for liquidity providers
730. **Token Staking Rewards Optimizer** - Optimize staking rewards across multiple protocols
731. **Token Governance Proposal Analyzer** - Analyze governance proposals and voting patterns
732. **Token Token Distribution Validator** - Validate token distribution fairness and transparency
733. **Token On-Chain Metrics Dashboard** - Comprehensive on-chain metrics dashboard
734. **Token Wallet Behavior Profiler** - Profile wallet behavior patterns and strategies
735. **Token DeFi Risk Calculator** - Calculate DeFi protocol risks and exposure levels
736. **Token Cross-Chain Portfolio Optimizer** - Optimize cross-chain portfolio allocation
737. **Token Complete Analytics Suite** - Complete on-chain analytics suite combining all features
738. **Token Smart Contract Security Scanner** - Scan smart contracts for security vulnerabilities and risks
739. **Token Token Holder Snapshot Generator** - Generate token holder snapshots at specific block heights
740. **Token Liquidity Pool Health Monitor** - Monitor liquidity pool health and impermanent loss risks
741. **Token Yield Farming Position Tracker** - Track yield farming positions across multiple protocols
742. **Token Cross-Chain Arbitrage Finder** - Find arbitrage opportunities across different blockchain networks
743. **Token Flash Loan Usage Detector** - Detect and analyze flash loan usage in transactions
744. **Token Token Burn Event Tracker** - Track token burn events and supply reduction mechanisms
745. **Token Vesting Schedule Calculator** - Calculate vesting schedules and unlock timelines
746. **Token Airdrop Eligibility Checker** - Check airdrop eligibility based on on-chain activity
747. **Token Smart Contract Upgrade Tracker** - Track smart contract upgrades and version changes

**Access:** All on-chain features are available via API endpoints and require wallet connection via Reown Wallet.

## Onchain API Endpoints

All onchain API endpoints are prefixed with `/api/onchain/` and require Reown Wallet connection for transaction execution.

### Query Endpoints (GET)
- `GET /api/onchain/token-balance` - Check token balances
- `GET /api/onchain/transaction-history` - Get transaction history
- `GET /api/onchain/token-metadata` - Fetch token metadata
- `GET /api/onchain/nft-balance` - Check NFT balances
- `GET /api/onchain/lp-position` - Check LP positions
- `GET /api/onchain/staking-position` - Check staking positions
- `GET /api/onchain/token-price` - Get token prices
- `GET /api/onchain/token-allowance` - Check token allowances
- `GET /api/onchain/nonce` - Get nonce information
- `GET /api/onchain/gas-price` - Get gas prices
- `GET /api/onchain/block-number` - Get block information
- `GET /api/onchain/transaction-status` - Check transaction status
- `GET /api/onchain/contract-verification` - Verify contracts
- `GET /api/onchain/token-list` - Get token lists
- `GET /api/onchain/chain-state` - Get chain state
- `GET /api/onchain/token-vesting-schedule/[address]` - Check token vesting schedules
- `GET /api/onchain/airdrop-claim-eligibility/[address]` - Verify airdrop claim eligibility
- `GET /api/onchain/token-unlock-schedule/[address]` - Track token unlock schedules
- `GET /api/onchain/contract-code-analyzer/[address]` - Analyze contract bytecode
- `GET /api/onchain/token-holder-distribution/[address]` - Analyze holder distribution
- `GET /api/onchain/flash-loan-detection/[address]` - Detect flash loan usage
- `GET /api/onchain/token-burn-tracker/[address]` - Track token burn events
- `GET /api/onchain/token-minting-tracker/[address]` - Track token minting events
- `GET /api/onchain/contract-upgrade-detector/[address]` - Detect contract upgrades
- `GET /api/onchain/token-liquidity-lock/[address]` - Check liquidity locks
- `GET /api/onchain/token-vesting-reader/[address]` - Read vesting contract data
- `GET /api/onchain/token-distribution-analyzer/[address]` - Analyze token distribution
- `GET /api/onchain/contract-proxy-detector/[address]` - Detect proxy patterns
- `GET /api/onchain/token-supply-tracker/[address]` - Track token supply metrics
- `GET /api/onchain/token-holder-snapshot/[address]` - Generate holder snapshots
- `GET /api/onchain/contract-security-scanner/[address]` - Scan contract security
- `GET /api/onchain/token-metadata-updater/[address]` - Get token metadata
- `GET /api/onchain/vesting-unlock-calculator/[address]` - Calculate vesting unlocks
- `GET /api/onchain/airdrop-claim-status/[address]` - Get claim status
- `GET /api/onchain/token-vesting-schedule/[address]` - Check vesting schedules
- `GET /api/onchain/airdrop-claim-eligibility/[address]` - Verify claim eligibility
- `GET /api/onchain/token-lock-analyzer/[address]` - Analyze token locks
- `GET /api/onchain/contract-deployment-tracker/[address]` - Track deployments
- `GET /api/onchain/token-transfer-analyzer/[address]` - Analyze transfers
- `GET /api/onchain/token-approval-analyzer/[address]` - Analyze approvals
- `GET /api/onchain/nft-ownership-tracker/[address]` - Track NFT ownership
- `GET /api/onchain/gas-usage-analyzer/[address]` - Analyze gas usage
- `GET /api/onchain/contract-events-tracker/[address]` - Track events
- `GET /api/onchain/token-price-history/[address]` - Get price history
- `GET /api/onchain/wallet-activity-score/[address]` - Calculate activity score
- `GET /api/onchain/token-holder-count/[address]` - Estimate holder count
- `GET /api/onchain/contract-interaction-count/[address]` - Count interactions
- `GET /api/onchain/token-capitalization/[address]` - Calculate market cap
- `GET /api/onchain/block-transaction-count` - Count block transactions
- `GET /api/onchain/token-age-calculator/[address]` - Calculate token age
- `GET /api/onchain/contract-storage-reader/[address]` - Read storage
- `GET /api/onchain/token-whale-tracker/[address]` - Track whales
- `GET /api/onchain/transaction-fee-calculator` - Calculate fees
- `GET /api/onchain/contract-creation-tx/[address]` - Find creation tx
- `GET /api/onchain/yield-farming/[address]` - Track yield farming positions
- `GET /api/onchain/mev-protection/[address]` - Analyze MEV protection
- `GET /api/onchain/gas-price-predictor` - Predict future gas prices
- `GET /api/onchain/rug-pull-detector/[address]` - Detect rug pull risks
- `GET /api/onchain/defi-risk-analyzer/[address]` - Analyze DeFi protocol risks
- `GET /api/onchain/activity-patterns/[address]` - Detect wallet activity patterns
- `GET /api/onchain/cross-chain-portfolio/[address]` - Aggregate cross-chain portfolio
- `GET /api/onchain/token-holder-analytics/[address]` - Comprehensive holder analytics
- `GET /api/onchain/token-transfer-flow/[address]` - Analyze transfer flows
- `GET /api/onchain/price-alerts` - Get active price alerts
- `GET /api/onchain/token-liquidity-analyzer/[address]` - Analyze token liquidity
- `GET /api/onchain/wallet-reputation/[address]` - Calculate wallet reputation
- `GET /api/onchain/token-volatility/[address]` - Calculate token volatility
- `GET /api/onchain/smart-money-tracker/[address]` - Track smart money wallets
- `GET /api/onchain/token-momentum/[address]` - Calculate token momentum
- `GET /api/onchain/contract-audit-status/[address]` - Check audit status
- `GET /api/onchain/token-holder-growth/[address]` - Track holder growth
- `GET /api/onchain/transaction-cost-analyzer/[address]` - Analyze transaction costs
- `GET /api/onchain/token-sentiment/[address]` - Analyze token sentiment
- `GET /api/onchain/wallet-clustering/[address]` - Detect wallet clusters
- `GET /api/onchain/token-arbitrage-opportunities/[address]` - Find arbitrage opportunities
- `GET /api/onchain/token-whale-alerts/[address]` - Monitor whale movements
- `GET /api/onchain/token-lock-detector/[address]` - Detect token locks
- `GET /api/onchain/token-tax-analyzer/[address]` - Analyze token taxes
- `GET /api/onchain/wallet-age-verification/[address]` - Verify wallet age
- `GET /api/onchain/token-pair-analyzer/[address]` - Analyze trading pairs
- `GET /api/onchain/contract-interaction-graph/[address]` - Build interaction graph
- `GET /api/onchain/token-holder-migration/[address]` - Track holder migration
- `GET /api/onchain/token-ownership-concentration/[address]` - Calculate concentration
- `GET /api/onchain/token-trading-volume/[address]` - Analyze trading volume
- `GET /api/onchain/wallet-transaction-pattern/[address]` - Analyze transaction patterns
- `GET /api/onchain/token-price-impact/[address]` - Calculate price impact
- `GET /api/onchain/token-concentration-risk/[address]` - Assess concentration risk
- `GET /api/onchain/token-deflation/[address]` - Track deflation
- `GET /api/onchain/token-inflation/[address]` - Track inflation
- `GET /api/onchain/token-mint-rate/[address]` - Calculate mint rate
- `GET /api/onchain/wallet-balance-history/[address]` - Track balance history
- `GET /api/onchain/token-dilution-tracker/[address]` - Track dilution
- `GET /api/onchain/token-market-cap/[address]` - Calculate market cap
- `GET /api/onchain/token-holder-retention/[address]` - Calculate retention
- `GET /api/onchain/token-price-correlation/[address]` - Calculate correlation
- `GET /api/onchain/wallet-gas-optimization/[address]` - Analyze gas usage
- `GET /api/onchain/token-holder-activity/[address]` - Analyze holder activity
- `GET /api/onchain/token-liquidity-depth/[address]` - Measure liquidity depth
- `GET /api/onchain/token-holder-distribution-score/[address]` - Calculate distribution score
- `GET /api/onchain/token-holder-turnover/[address]` - Calculate turnover rate
- `GET /api/onchain/token-holder-value-distribution/[address]` - Analyze value distribution
- `GET /api/onchain/token-holder-geographic/[address]` - Analyze geographic distribution
- `GET /api/onchain/token-slippage/[address]` - Calculate token slippage for swaps
- `GET /api/onchain/token-liquidity-depth/[address]` - Analyze token liquidity depth
- `GET /api/onchain/token-trading-volume/[address]` - Track token trading volume
- `GET /api/onchain/token-holder-activity/[address]` - Track holder activity patterns
- `GET /api/onchain/token-burn-rate/[address]` - Calculate token burn rate
- `GET /api/onchain/token-mint-rate/[address]` - Calculate token mint rate
- `GET /api/onchain/token-inflation/[address]` - Calculate token inflation rate
- `GET /api/onchain/token-deflation/[address]` - Calculate token deflation rate
- `GET /api/onchain/token-holder-retention/[address]` - Analyze holder retention
- `GET /api/onchain/token-transfer-velocity/[address]` - Track transfer velocity
- `GET /api/onchain/token-concentration-risk/[address]` - Analyze concentration risk
- `GET /api/onchain/token-market-depth/[address]` - Analyze market depth
- `GET /api/onchain/token-order-book/[address]` - Get order book data
- `GET /api/onchain/token-yield-optimizer/[address]` - Find optimal yield strategies
- `GET /api/onchain/token-portfolio-optimizer/[address]` - Optimize portfolio allocation
- `GET /api/onchain/token-risk-calculator/[address]` - Calculate risk metrics
- `GET /api/onchain/token-performance/[address]` - Track performance metrics
- `GET /api/onchain/token-trend-analyzer/[address]` - Analyze price trends
- `GET /api/onchain/token-support-resistance/[address]` - Find support/resistance levels
- `GET /api/onchain/token-volume-profile/[address]` - Analyze volume profile
- `GET /api/onchain/token-market-maker/[address]` - Track market maker activity
- `GET /api/onchain/token-arbitrage/[address]` - Find arbitrage opportunities
- `GET /api/onchain/token-flash-swap/[address]` - Detect flash swap opportunities
- `GET /api/onchain/token-impermanent-loss/[address]` - Calculate impermanent loss
- `GET /api/onchain/token-apr-apy/[address]` - Calculate APR and APY
- `GET /api/onchain/token-reward-tracker/[address]` - Track staking rewards
- `GET /api/onchain/token-governance-proposal/[address]` - Track governance proposals
- `GET /api/onchain/token-treasury-tracker/[address]` - Track treasury balances
- `GET /api/onchain/token-reserve-tracker/[address]` - Track reserves and backing
- `GET /api/onchain/token-backing-calculator/[address]` - Calculate backing value
- `GET /api/onchain/token-collateral-ratio/[address]` - Calculate collateral ratio
- `GET /api/onchain/token-liquidation-threshold/[address]` - Calculate liquidation threshold
- `GET /api/onchain/token-health-factor/[address]` - Calculate health factor
- `GET /api/onchain/token-borrow-rate/[address]` - Get borrow rates
- `GET /api/onchain/token-supply-rate/[address]` - Get supply rates
- `GET /api/onchain/token-utilization-rate/[address]` - Calculate utilization rate
- `GET /api/onchain/token-protocol-revenue/[address]` - Track protocol revenue
- `GET /api/onchain/token-protocol-fees/[address]` - Track protocol fees
- `GET /api/onchain/token-governance-treasury/[address]` - Track governance treasury
- `GET /api/onchain/token-proposal-voting/[address]` - Track proposal voting
- `GET /api/onchain/token-quorum-tracker/[address]` - Track quorum requirements
- `GET /api/onchain/token-voting-period/[address]` - Track voting period
- `GET /api/onchain/token-execution-tracker/[address]` - Track execution status
- `GET /api/onchain/token-timelock-tracker/[address]` - Track timelock delays
- `GET /api/onchain/token-multisig-tracker/[address]` - Track multisig status
- `GET /api/onchain/token-proxy-admin/[address]` - Track proxy admin
- `GET /api/onchain/token-implementation/[address]` - Track implementation address
- `GET /api/onchain/token-storage-slot/[address]` - Read storage slots
- `GET /api/onchain/token-event-parser/[address]` - Parse contract events
- `GET /api/onchain/token-tx-decoder/[address]` - Decode transactions
- `GET /api/onchain/token-abi-generator/[address]` - Generate ABI
- `GET /api/onchain/token-interface-detector/[address]` - Detect interfaces
- `GET /api/onchain/token-standard-detector/[address]` - Detect token standard
- `GET /api/onchain/token-compatibility/[address]` - Check compatibility
- `GET /api/onchain/token-liquidation-price/[address]` - Calculate liquidation price
- `GET /api/onchain/token-safety-score/[address]` - Calculate safety score
- `GET /api/onchain/token-whitelist-checker/[address]` - Check whitelist status
- `GET /api/onchain/token-blacklist-checker/[address]` - Check blacklist status
- `GET /api/onchain/token-freeze-detector/[address]` - Detect freeze functionality
- `GET /api/onchain/token-pause-detector/[address]` - Detect pause status
- `GET /api/onchain/token-reflection-tracker/[address]` - Track reflection rewards
- `GET /api/onchain/token-auto-lp-tracker/[address]` - Track auto LP
- `GET /api/onchain/token-honeypot-detector/[address]` - Detect honeypot tokens
- `GET /api/onchain/token-sniper-protection/[address]` - Check sniper protection
- `GET /api/onchain/token-anti-bot-analyzer/[address]` - Analyze anti-bot mechanisms
- `GET /api/onchain/token-max-wallet-checker/[address]` - Check max wallet limits
- `GET /api/onchain/token-max-transaction-checker/[address]` - Check max transaction limits
- `GET /api/onchain/token-cooldown-tracker/[address]` - Track cooldown periods
- `GET /api/onchain/token-reward-distribution/[address]` - Track reward distribution
- `GET /api/onchain/token-staking-rewards/[address]` - Track staking rewards
- `GET /api/onchain/token-farming-rewards/[address]` - Track farming rewards
- `GET /api/onchain/token-lock-schedule/[address]` - Get lock schedule
- `GET /api/onchain/token-claimable-amount/[address]` - Get claimable amount
- `GET /api/onchain/token-airdrop-eligibility/[address]` - Check airdrop eligibility
- `GET /api/onchain/token-snapshot-generator/[address]` - Generate holder snapshot
- `GET /api/onchain/token-merkle-proof/[address]` - Generate merkle proof
- `GET /api/onchain/token-delegation-tracker/[address]` - Track delegation
- `GET /api/onchain/token-voting-power/[address]` - Calculate voting power
- `GET /api/onchain/token-proposal-creator/[address]` - Get created proposals
- `GET /api/onchain/token-burn-rate/[address]` - Calculate token burn rate
- `GET /api/onchain/token-mint-rate/[address]` - Track token minting rate
- `GET /api/onchain/contract-function-frequency/[address]` - Analyze function call frequency
- `GET /api/onchain/token-transfer-velocity/[address]` - Calculate transfer velocity
- `GET /api/onchain/wallet-batch-analyzer/[address]` - Analyze batch transactions
- `GET /api/onchain/token-concentration-risk/[address]` - Assess concentration risk
- `GET /api/onchain/contract-upgrade-history/[address]` - Track upgrade history
- `GET /api/onchain/token-liquidity-depth/[address]` - Analyze liquidity depth
- `GET /api/onchain/cross-chain-bridge-volume/[address]` - Track bridge volume
- `GET /api/onchain/token-holder-migration/[address]` - Monitor holder migration
- `GET /api/onchain/contract-event-frequency/[address]` - Analyze event frequency
- `GET /api/onchain/token-price-impact-calculator/[address]` - Calculate price impact
- `GET /api/onchain/wallet-gas-spending-pattern/[address]` - Analyze gas spending
- `GET /api/onchain/token-holder-retention/[address]` - Calculate retention rate
- `GET /api/onchain/contract-storage-slot/[address]` - Read storage slots
- `GET /api/onchain/token-volume-profile/[address]` - Generate volume profile
- `GET /api/onchain/wallet-interaction-frequency/[address]` - Track interaction frequency
- `GET /api/onchain/token-holder-geographic/[address]` - Analyze geographic distribution
- `GET /api/onchain/contract-complexity-score/[address]` - Calculate complexity score
- `GET /api/onchain/token-holder-network/[address]` - Build holder network graph
- `GET /api/onchain/token-supply-shock/[address]` - Detect supply shocks
- `GET /api/onchain/wallet-pnl-calculator/[address]` - Calculate PnL
- `GET /api/onchain/token-holder-diversity/[address]` - Calculate diversity index
- `GET /api/onchain/contract-gas-profile/[address]` - Profile gas usage
- `GET /api/onchain/token-holder-value-distribution/[address]` - Analyze value distribution
- `GET /api/onchain/cross-chain-message-tracker/[address]` - Track cross-chain messages
- `GET /api/onchain/token-holder-activity-heatmap/[address]` - Generate activity heatmap
- `GET /api/onchain/contract-interaction-graph/[address]` - Build interaction graph
- `GET /api/onchain/token-holder-turnover-rate/[address]` - Calculate turnover rate
- `GET /api/onchain/wallet-fingerprint/[address]` - Generate wallet fingerprint
- `GET /api/onchain/token-transfer-rate/[address]` - Calculate transfer rate
- `GET /api/onchain/token-concentration/[address]` - Analyze concentration
- `GET /api/onchain/token-volatility-tracker/[address]` - Track volatility
- `GET /api/onchain/token-liquidity-router/[address]` - Find liquidity routes
- `GET /api/onchain/token-holding-period/[address]` - Analyze holding period
- `GET /api/onchain/token-flow-analyzer/[address]` - Analyze token flow
- `GET /api/onchain/token-market-share/[address]` - Calculate market share
- `GET /api/onchain/token-whale-alert/[address]` - Monitor whale movements
- `GET /api/onchain/token-adoption-rate/[address]` - Track adoption rate
- `GET /api/onchain/token-turnover-rate/[address]` - Calculate turnover rate
- `GET /api/onchain/token-burn-rate/[address]` - Track burn rate
- `GET /api/onchain/token-mint-rate/[address]` - Track mint rate
- `GET /api/onchain/token-trading-intensity/[address]` - Measure trading intensity
- `GET /api/onchain/token-liquidity-quality/[address]` - Assess liquidity quality
- `GET /api/onchain/token-sentiment-score/[address]` - Calculate sentiment score
- `GET /api/onchain/token-price-efficiency/[address]` - Measure price efficiency
- `GET /api/onchain/token-holder-loyalty/[address]` - Measure holder loyalty
- `GET /api/onchain/token-volume-profile/[address]` - Analyze volume profile
- `GET /api/onchain/token-transaction-pattern/[address]` - Analyze transaction patterns
- `GET /api/onchain/token-holder-growth-rate/[address]` - Track holder growth
- `GET /api/onchain/token-price-stability/[address]` - Measure price stability
- `GET /api/onchain/token-utility-score/[address]` - Calculate utility score
- `GET /api/onchain/token-holder-distribution-quality/[address]` - Assess distribution quality
- `GET /api/onchain/token-trading-velocity/[address]` - Measure trading velocity
- `GET /api/onchain/token-market-depth/[address]` - Analyze market depth
- `GET /api/onchain/token-holder-diversity-index/[address]` - Calculate diversity index
- `GET /api/onchain/token-trend-analyzer/[address]` - Analyze trends
- `GET /api/onchain/token-liquidity-efficiency/[address]` - Measure liquidity efficiency
- `GET /api/onchain/token-price-correlation/[address]` - Calculate price correlation
- `GET /api/onchain/token-market-health/[address]` - Assess market health
- `GET /api/onchain/token-liquidity-score/[address]` - Calculate liquidity score
- `GET /api/onchain/token-holder-migration/[address]` - Track holder migration
- `GET /api/onchain/token-spread-analyzer/[address]` - Analyze spread
- `GET /api/onchain/token-market-cap-efficiency/[address]` - Measure market cap efficiency
- `GET /api/onchain/token-holder-retention/[address]` - Measure holder retention
- `GET /api/onchain/token-trade-size-distribution/[address]` - Analyze trade size distribution
- `GET /api/onchain/token-price-anomaly-detector/[address]` - Detect price anomalies
- `GET /api/onchain/token-liquidity-risk/[address]` - Assess liquidity risk
- `GET /api/onchain/token-holder-balance-distribution/[address]` - Analyze balance distribution
- `GET /api/onchain/token-trading-activity-score/[address]` - Calculate trading activity score
- `GET /api/onchain/token-market-maker-activity/[address]` - Detect market maker activity
- `GET /api/onchain/token-liquidity-pool-analyzer/[address]` - Analyze liquidity pools
- `GET /api/onchain/token-price-impact-calculator/[address]` - Calculate price impact
- `GET /api/onchain/token-holder-engagement/[address]` - Measure holder engagement
- `GET /api/onchain/token-market-cap-dominance/[address]` - Calculate market cap dominance
- `GET /api/onchain/token-holder-churn/[address]` - Measure holder churn
- `GET /api/onchain/token-liquidity-stability/[address]` - Measure liquidity stability
- `GET /api/onchain/token-trading-volume-trend/[address]` - Analyze volume trend
- `GET /api/onchain/token-holder-value-score/[address]` - Calculate holder value score
- `GET /api/onchain/token-market-momentum/[address]` - Measure market momentum
- `GET /api/onchain/token-liquidity-depth-analyzer/[address]` - Analyze liquidity depth
- `GET /api/onchain/token-exchange-distribution/[address]` - Analyze exchange distribution
- `GET /api/onchain/token-price-discovery-quality/[address]` - Assess price discovery quality
- `GET /api/onchain/token-holder-lifecycle/[address]` - Analyze holder lifecycle
- `GET /api/onchain/token-holder-engagement/[address]` - Measure holder engagement
- `GET /api/onchain/token-market-cap-efficiency/[address]` - Calculate market cap efficiency
- `GET /api/onchain/token-trading-intensity-score/[address]` - Measure trading intensity score
- `GET /api/onchain/token-liquidity-quality-score/[address]` - Calculate liquidity quality score
- `GET /api/onchain/token-flash-loan-detector/[address]` - Detect flash loan usage patterns
- `GET /api/onchain/token-mev-bot-detector/[address]` - Detect MEV bot activity patterns
- `GET /api/onchain/token-sandwich-attack-detector/[address]` - Detect sandwich attack patterns
- `GET /api/onchain/token-front-running-detector/[address]` - Detect front-running patterns
- `GET /api/onchain/token-back-running-detector/[address]` - Detect back-running patterns
- `GET /api/onchain/token-liquidity-sniping-detector/[address]` - Detect liquidity sniping patterns
- `GET /api/onchain/token-pump-dump-detector/[address]` - Detect pump and dump schemes
- `GET /api/onchain/token-wash-trading-detector/[address]` - Detect wash trading patterns
- `GET /api/onchain/token-circular-trading-detector/[address]` - Detect circular trading patterns
- `GET /api/onchain/token-price-manipulation-detector/[address]` - Detect price manipulation patterns
- `GET /api/onchain/token-order-flow-analyzer/[address]` - Analyze order flow patterns
- `GET /api/onchain/token-dark-pool-detector/[address]` - Detect dark pool trading patterns
- `GET /api/onchain/token-insider-trading-detector/[address]` - Detect insider trading patterns
- `GET /api/onchain/token-coordinated-trading-detector/[address]` - Detect coordinated trading patterns
- `GET /api/onchain/token-bot-cluster-detector/[address]` - Detect bot cluster patterns
- `GET /api/onchain/token-sybil-attack-detector/[address]` - Detect Sybil attack patterns
- `GET /api/onchain/token-airdrop-farming-detector/[address]` - Detect airdrop farming patterns
- `GET /api/onchain/token-sniping-bot-detector/[address]` - Detect sniping bot activity
- `GET /api/onchain/token-gas-war-detector/[address]` - Detect gas war patterns
- `GET /api/onchain/token-priority-fee-analyzer/[address]` - Analyze priority fee patterns
- `GET /api/onchain/token-eip1559-fee-analyzer/[address]` - Analyze EIP-1559 fee structure
- `GET /api/onchain/token-layer2-bridge-analyzer/[address]` - Analyze Layer 2 bridge activity
- `GET /api/onchain/token-cross-chain-arbitrage/[address]` - Detect cross-chain arbitrage
- `GET /api/onchain/token-bridge-risk-analyzer/[address]` - Analyze bridge transaction risks
- `GET /api/onchain/token-bridge-volume-tracker/[address]` - Track bridge transaction volumes
- `GET /api/onchain/token-bridge-fee-calculator/[address]` - Calculate bridge fees
- `GET /api/onchain/token-bridge-time-estimator/[address]` - Estimate bridge transaction times
- `GET /api/onchain/token-bridge-security-checker/[address]` - Check bridge security status
- `GET /api/onchain/token-bridge-liquidity-checker/[address]` - Check bridge liquidity availability
- `GET /api/onchain/token-bridge-status-monitor/[address]` - Monitor bridge status and health
- `GET /api/onchain/token-dex-aggregator/[address]` - Aggregate DEX prices across exchanges
- `GET /api/onchain/token-lending-position/[address]` - Track lending positions
- `GET /api/onchain/token-borrow-position/[address]` - Track borrowing positions
- `GET /api/onchain/token-collateral-tracker/[address]` - Track collateral positions
- `GET /api/onchain/token-liquidation-monitor/[address]` - Monitor liquidation risk
- `GET /api/onchain/token-yield-aggregator/[address]` - Aggregate yield opportunities
- `GET /api/onchain/token-vault-tracker/[address]` - Track vault positions
- `GET /api/onchain/token-governance-proposal-tracker/[address]` - Track governance proposals
- `GET /api/onchain/token-delegation-analyzer/[address]` - Analyze delegation patterns
- `GET /api/onchain/token-nft-floor-price/[address]` - Track NFT floor prices
- `GET /api/onchain/token-nft-royalty-tracker/[address]` - Track NFT royalties
- `GET /api/onchain/token-options-position/[address]` - Track options positions
- `GET /api/onchain/token-perpetual-position/[address]` - Track perpetual positions
- `GET /api/onchain/token-liquidity-mining/[address]` - Track liquidity mining rewards
- `GET /api/onchain/token-stablecoin-peg/[address]` - Monitor stablecoin peg
- `GET /api/onchain/token-rebase-tracker/[address]` - Track rebase events
- `GET /api/onchain/token-validator-rewards/[address]` - Track validator rewards
- `GET /api/onchain/token-slashing-detector/[address]` - Detect slashing events
- `GET /api/onchain/token-validator-exit/[address]` - Track validator exit queue
- `GET /api/onchain/token-mev-rewards/[address]` - Track MEV rewards
- `GET /api/onchain/token-relayer-fees/[address]` - Track relayer fees
- `GET /api/onchain/token-gas-refund-tracker/[address]` - Track gas refunds
- `GET /api/onchain/token-transaction-batching/[address]` - Analyze transaction batching
- `GET /api/onchain/token-multisig-approval/[address]` - Track multisig approvals
- `GET /api/onchain/token-timelock-queue/[address]` - Track timelock queue
- `GET /api/onchain/token-proxy-upgrade/[address]` - Track proxy upgrades
- `GET /api/onchain/token-account-abstraction/[address]` - Track account abstraction
- `GET /api/onchain/token-smart-contract-wallet-tracker/[address]` - Track smart contract wallet usage
- `GET /api/onchain/token-layer2-activity-analyzer/[address]` - Analyze Layer 2 activity patterns
- `GET /api/onchain/token-cross-chain-token-tracker/[address]` - Track token movements across chains
- `GET /api/onchain/token-defi-protocol-integration-analyzer/[address]` - Analyze DeFi protocol integration
- `GET /api/onchain/token-governance-participation-score/[address]` - Calculate governance participation score
- `GET /api/onchain/token-liquidity-migration-tracker/[address]` - Track liquidity migration patterns
- `GET /api/onchain/token-tokenomics-validator/[address]` - Validate tokenomics structure
- `GET /api/onchain/token-security-audit-tracker/[address]` - Track security audit status
- `GET /api/onchain/token-community-engagement-analyzer/[address]` - Analyze community engagement
- `GET /api/onchain/token-developer-activity-tracker/[address]` - Track developer activity
- `GET /api/onchain/token-protocol-upgrade-monitor/[address]` - Monitor protocol upgrades
- `GET /api/onchain/token-risk-assessment-engine/[address]` - Comprehensive risk assessment
- `GET /api/onchain/token-yield-strategy-optimizer/[address]` - Optimize yield strategies
- `GET /api/onchain/token-portfolio-rebalancer/[address]` - Portfolio rebalancing recommendations
- `GET /api/onchain/token-gas-fee-optimizer/[address]` - Optimize gas fees
- `GET /api/onchain/token-transaction-privacy-analyzer/[address]` - Analyze transaction privacy
- `GET /api/onchain/token-wallet-clustering-analyzer/[address]` - Cluster related wallets
- `GET /api/onchain/token-smart-contract-interaction-profiler/[address]` - Profile contract interactions
- `GET /api/onchain/token-defi-position-aggregator/[address]` - Aggregate DeFi positions
- `GET /api/onchain/token-cross-chain-bridge-analyzer/[address]` - Analyze cross-chain bridges
- `GET /api/onchain/token-mev-protection-score/[address]` - Calculate MEV protection score
- `GET /api/onchain/token-liquidity-provider-analytics/[address]` - Liquidity provider analytics
- `GET /api/onchain/token-staking-rewards-optimizer/[address]` - Optimize staking rewards
- `GET /api/onchain/token-governance-proposal-analyzer/[address]` - Analyze governance proposals
- `GET /api/onchain/token-token-distribution-validator/[address]` - Validate token distribution
- `GET /api/onchain/token-onchain-metrics-dashboard/[address]` - Comprehensive metrics dashboard
- `GET /api/onchain/token-wallet-behavior-profiler/[address]` - Profile wallet behavior
- `GET /api/onchain/token-defi-risk-calculator/[address]` - Calculate DeFi risks
- `GET /api/onchain/token-cross-chain-portfolio-optimizer/[address]` - Optimize cross-chain portfolio
- `GET /api/onchain/token-complete-analytics-suite/[address]` - Complete analytics suite

### Transaction Endpoints (POST)
- `POST /api/onchain/token-transfer` - Transfer tokens
- `POST /api/onchain/token-approval` - Approve tokens
- `POST /api/onchain/nft-mint` - Mint NFTs
- `POST /api/onchain/stake` - Stake tokens
- `POST /api/onchain/unstake` - Unstake tokens
- `POST /api/onchain/bridge` - Bridge tokens
- `POST /api/onchain/swap` - Swap tokens
- `POST /api/onchain/add-liquidity` - Add liquidity
- `POST /api/onchain/remove-liquidity` - Remove liquidity
- `POST /api/onchain/claim-rewards` - Claim rewards
- `POST /api/onchain/vote` - Vote on proposals
- `POST /api/onchain/delegate` - Delegate voting power
- `POST /api/onchain/wrap-unwrap` - Wrap/unwrap tokens
- `POST /api/onchain/set-ens` - Set ENS name
- `POST /api/onchain/batch-transaction` - Batch transactions
- `POST /api/onchain/cancel-transaction` - Cancel transactions
- `POST /api/onchain/speed-up-transaction` - Speed up transactions
- `POST /api/onchain/sign-message` - Sign messages
- `POST /api/onchain/sign-typed-data` - Sign typed data
- `POST /api/onchain/multisig` - Multisig operations
- `POST /api/onchain/gas-estimation` - Estimate gas
- `POST /api/onchain/contract-read` - Read contracts
- `POST /api/onchain/event-listening` - Listen to events
- `POST /api/onchain/nft-transfer` - Transfer NFTs
- `POST /api/onchain/nft-approval` - Approve NFTs
- `POST /api/onchain/batch-optimizer` - Optimize batch transactions
- `POST /api/onchain/price-alerts` - Create price alerts
- `POST /api/onchain/token-swap-aggregator` - Find best swap routes
- `POST /api/onchain/token-rebalancer` - Calculate rebalancing strategy
- `POST /api/onchain/token-correlation` - Calculate token correlations

All transaction endpoints return a prepared transaction object that can be executed via Reown Wallet using the `useOnchainTransaction` hook.

**Built with ❤️ by the Airdrop Checker Team**
