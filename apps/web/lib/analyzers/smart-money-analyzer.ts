/**
 * Smart Money Analyzer - Identifies and analyzes "smart money" behavior
 * Detects patterns from successful wallets and profitable strategies
 */

interface WalletTransaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  timestamp: number;
  protocol?: string;
  type: string;
  success: boolean;
}

interface TokenHolding {
  token: string;
  balance: number;
  avgBuyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
}

interface SmartMoneyProfile {
  address: string;
  profitability: number; // 0-100 score
  winRate: number; // percentage of profitable trades
  avgHoldTime: number; // in days
  diversificationScore: number;
  riskScore: number;
  tradingStyle: 'aggressive' | 'moderate' | 'conservative';
  specialties: string[]; // e.g., ['DeFi', 'NFTs', 'Meme Coins']
  totalPnL: number;
  roi: number;
}

interface SmartMoneySignal {
  type: 'buy' | 'sell' | 'hold';
  token: string;
  confidence: number; // 0-100
  reason: string;
  smartWallets: string[];
  timestamp: number;
}

export class SmartMoneyAnalyzer {
  private readonly MIN_TRANSACTIONS = 50;
  private readonly MIN_WIN_RATE = 60; // 60% win rate to be considered "smart money"
  private readonly SIGNIFICANT_POSITION_SIZE = 10000; // $10k USD

  /**
   * Analyze if a wallet exhibits "smart money" characteristics
   */
  analyzeWallet(
    transactions: WalletTransaction[],
    holdings: TokenHolding[]
  ): SmartMoneyProfile {
    // Calculate profitability
    const profitableTrades = holdings.filter(h => h.pnl > 0);
    const winRate = (profitableTrades.length / holdings.length) * 100;

    // Calculate average hold time
    const holdTimes = this.calculateHoldTimes(transactions);
    const avgHoldTime = holdTimes.reduce((sum, t) => sum + t, 0) / holdTimes.length / (24 * 3600 * 1000);

    // Calculate diversification
    const diversificationScore = this.calculateDiversification(holdings);

    // Calculate risk score based on position sizing and volatility
    const riskScore = this.calculateRiskScore(holdings, transactions);

    // Determine trading style
    const tradingStyle = this.determineTradingStyle(avgHoldTime, riskScore, winRate);

    // Identify specialties
    const specialties = this.identifySpecialties(transactions);

    // Calculate total PnL and ROI
    const totalPnL = holdings.reduce((sum, h) => sum + h.pnl, 0);
    const totalInvested = holdings.reduce((sum, h) => sum + (h.balance * h.avgBuyPrice), 0);
    const roi = (totalPnL / totalInvested) * 100;

    // Overall profitability score
    const profitability = this.calculateProfitabilityScore(winRate, roi, diversificationScore);

    return {
      address: transactions[0]?.from || '',
      profitability,
      winRate,
      avgHoldTime,
      diversificationScore,
      riskScore,
      tradingStyle,
      specialties,
      totalPnL,
      roi,
    };
  }

  /**
   * Identify smart money signals by analyzing multiple wallet behaviors
   */
  detectSmartMoneySignals(
    smartWallets: SmartMoneyProfile[],
    recentTransactions: Map<string, WalletTransaction[]>
  ): SmartMoneySignal[] {
    const signals: SmartMoneySignal[] = [];
    const tokenAccumulation = new Map<string, { buyers: Set<string>; volume: number }>();

    // Track what smart money is buying/selling
    smartWallets.forEach(wallet => {
      const txs = recentTransactions.get(wallet.address) || [];
      
      txs.forEach(tx => {
        if (!tx.protocol) return;

        const key = tx.protocol;
        if (!tokenAccumulation.has(key)) {
          tokenAccumulation.set(key, { buyers: new Set(), volume: 0 });
        }

        const data = tokenAccumulation.get(key)!;
        if (tx.type === 'buy') {
          data.buyers.add(wallet.address);
          data.volume += tx.value;
        }
      });
    });

    // Generate signals when multiple smart wallets accumulate the same token
    tokenAccumulation.forEach((data, token) => {
      const buyerCount = data.buyers.size;
      const totalSmartWallets = smartWallets.length;
      const buyerPercentage = (buyerCount / totalSmartWallets) * 100;

      if (buyerPercentage >= 20 && data.volume > this.SIGNIFICANT_POSITION_SIZE) {
        // At least 20% of smart wallets are buying
        const confidence = Math.min(buyerPercentage * 1.5, 100);

        signals.push({
          type: 'buy',
          token,
          confidence,
          reason: `${buyerCount} smart wallets (${buyerPercentage.toFixed(1)}%) accumulating with $${(data.volume / 1000).toFixed(1)}K volume`,
          smartWallets: Array.from(data.buyers),
          timestamp: Date.now(),
        });
      }
    });

    return signals.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Find wallets that consistently outperform
   */
  findTopPerformers(profiles: SmartMoneyProfile[]): SmartMoneyProfile[] {
    return profiles
      .filter(p => 
        p.profitability >= 70 &&
        p.winRate >= this.MIN_WIN_RATE &&
        p.roi > 100 // At least 100% ROI
      )
      .sort((a, b) => b.profitability - a.profitability)
      .slice(0, 10);
  }

  /**
   * Analyze correlation between wallet behaviors
   */
  analyzeWalletCorrelation(
    wallet1Txs: WalletTransaction[],
    wallet2Txs: WalletTransaction[]
  ): number {
    // Find common protocols/tokens traded around the same time
    const wallet1Protocols = new Set(wallet1Txs.map(tx => tx.protocol).filter(Boolean));
    const wallet2Protocols = new Set(wallet2Txs.map(tx => tx.protocol).filter(Boolean));

    const commonProtocols = new Set(
      [...wallet1Protocols].filter(p => wallet2Protocols.has(p))
    );

    // Check timing correlation (transactions within 24 hours)
    let correlatedActions = 0;
    wallet1Txs.forEach(tx1 => {
      wallet2Txs.forEach(tx2 => {
        if (
          tx1.protocol === tx2.protocol &&
          Math.abs(tx1.timestamp - tx2.timestamp) < 24 * 3600 * 1000
        ) {
          correlatedActions++;
        }
      });
    });

    const protocolCorrelation = (commonProtocols.size / wallet1Protocols.size) * 100;
    const timingCorrelation = (correlatedActions / Math.min(wallet1Txs.length, wallet2Txs.length)) * 100;

    return (protocolCorrelation + timingCorrelation) / 2;
  }

  /**
   * Predict potential airdrop eligibility based on smart money patterns
   */
  predictAirdropEligibility(
    userTransactions: WalletTransaction[],
    smartMoneyTransactions: Map<string, WalletTransaction[]>
  ): Array<{ protocol: string; probability: number; reasoning: string }> {
    const predictions: Array<{ protocol: string; probability: number; reasoning: string }> = [];
    const userProtocols = new Set(userTransactions.map(tx => tx.protocol).filter(Boolean));

    // Analyze which protocols smart money is using
    const smartMoneyProtocolUsage = new Map<string, number>();
    smartMoneyTransactions.forEach(txs => {
      txs.forEach(tx => {
        if (tx.protocol) {
          smartMoneyProtocolUsage.set(
            tx.protocol,
            (smartMoneyProtocolUsage.get(tx.protocol) || 0) + 1
          );
        }
      });
    });

    // Sort by usage frequency
    const sortedProtocols = Array.from(smartMoneyProtocolUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    sortedProtocols.forEach(([protocol, usage]) => {
      const userHasUsed = userProtocols.has(protocol);
      const smartMoneyAdoption = (usage / smartMoneyTransactions.size) * 100;

      if (smartMoneyAdoption >= 30) {
        // If 30%+ of smart wallets use this protocol
        const probability = userHasUsed ? 75 : 40;
        const reasoning = userHasUsed
          ? `You've used ${protocol}. ${smartMoneyAdoption.toFixed(1)}% of smart wallets are active here.`
          : `${smartMoneyAdoption.toFixed(1)}% of smart wallets are using ${protocol}. Consider trying it.`;

        predictions.push({ protocol, probability, reasoning });
      }
    });

    return predictions.sort((a, b) => b.probability - a.probability);
  }

  // Private helper methods
  private calculateHoldTimes(transactions: WalletTransaction[]): number[] {
    const holdTimes: number[] = [];
    const positions = new Map<string, number>();

    transactions
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach(tx => {
        if (tx.type === 'buy') {
          positions.set(tx.protocol || tx.to, tx.timestamp);
        } else if (tx.type === 'sell') {
          const buyTime = positions.get(tx.protocol || tx.to);
          if (buyTime) {
            holdTimes.push(tx.timestamp - buyTime);
            positions.delete(tx.protocol || tx.to);
          }
        }
      });

    return holdTimes.length > 0 ? holdTimes : [0];
  }

  private calculateDiversification(holdings: TokenHolding[]): number {
    if (holdings.length === 0) return 0;

    const totalValue = holdings.reduce((sum, h) => sum + (h.balance * h.currentPrice), 0);
    
    // Calculate Herfindahl-Hirschman Index for diversification
    const hhi = holdings.reduce((sum, h) => {
      const share = (h.balance * h.currentPrice) / totalValue;
      return sum + (share * share);
    }, 0);

    // Convert to 0-100 score (lower HHI = better diversification)
    return Math.max(0, 100 - (hhi * 100));
  }

  private calculateRiskScore(holdings: TokenHolding[], transactions: WalletTransaction[]): number {
    // Higher score = higher risk
    let riskScore = 0;

    // Factor 1: Position concentration (max 40 points)
    const totalValue = holdings.reduce((sum, h) => sum + (h.balance * h.currentPrice), 0);
    const maxPosition = Math.max(...holdings.map(h => (h.balance * h.currentPrice) / totalValue));
    riskScore += maxPosition * 40;

    // Factor 2: Leverage indicators (max 30 points)
    const leverageIndicators = transactions.filter(tx => 
      tx.protocol?.toLowerCase().includes('lever') ||
      tx.protocol?.toLowerCase().includes('margin')
    ).length;
    riskScore += Math.min((leverageIndicators / transactions.length) * 30, 30);

    // Factor 3: High volatility tokens (max 30 points)
    const volatileTokens = holdings.filter(h => Math.abs(h.pnlPercentage) > 50);
    riskScore += (volatileTokens.length / holdings.length) * 30;

    return Math.min(riskScore, 100);
  }

  private determineTradingStyle(
    avgHoldTime: number,
    riskScore: number,
    winRate: number
  ): 'aggressive' | 'moderate' | 'conservative' {
    if (avgHoldTime < 7 && riskScore > 60) {
      return 'aggressive';
    } else if (avgHoldTime > 30 && riskScore < 40 && winRate > 65) {
      return 'conservative';
    } else {
      return 'moderate';
    }
  }

  private identifySpecialties(transactions: WalletTransaction[]): string[] {
    const categories = new Map<string, number>();
    
    transactions.forEach(tx => {
      const protocol = tx.protocol?.toLowerCase() || '';
      
      if (protocol.includes('uni') || protocol.includes('swap') || protocol.includes('curve')) {
        categories.set('DeFi', (categories.get('DeFi') || 0) + 1);
      }
      if (protocol.includes('nft') || protocol.includes('opensea') || protocol.includes('blur')) {
        categories.set('NFTs', (categories.get('NFTs') || 0) + 1);
      }
      if (protocol.includes('bridge') || protocol.includes('layer')) {
        categories.set('Cross-Chain', (categories.get('Cross-Chain') || 0) + 1);
      }
      if (protocol.includes('stake') || protocol.includes('yield')) {
        categories.set('Staking', (categories.get('Staking') || 0) + 1);
      }
    });

    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  private calculateProfitabilityScore(
    winRate: number,
    roi: number,
    diversificationScore: number
  ): number {
    // Weighted average
    const winRateWeight = 0.4;
    const roiWeight = 0.4;
    const diversificationWeight = 0.2;

    const normalizedRoi = Math.min(roi / 5, 100); // Cap at 500% ROI = 100 score

    return (
      winRate * winRateWeight +
      normalizedRoi * roiWeight +
      diversificationScore * diversificationWeight
    );
  }
}

// Export singleton instance
export const smartMoneyAnalyzer = new SmartMoneyAnalyzer();

