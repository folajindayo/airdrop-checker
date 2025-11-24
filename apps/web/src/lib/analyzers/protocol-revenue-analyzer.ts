/**
 * Protocol Revenue Analyzer - Analyzes on-chain revenue and tokenomics
 * Evaluates protocol sustainability, token value accrual, and investment potential
 */

interface ProtocolRevenue {
  protocol: string;
  chain: string;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  revenueBreakdown: Array<{
    source: string; // 'trading_fees', 'borrowing', 'liquidations', etc.
    amount: number;
    percentage: number;
  }>;
  costs: {
    development: number;
    security: number;
    marketing: number;
    total: number;
  };
}

interface TokenomicsAnalysis {
  token: string;
  totalSupply: number;
  circulatingSupply: number;
  treasuryBalance: number;
  burnRate: number; // tokens per day
  emissionRate: number; // tokens per day
  distribution: {
    team: number;
    investors: number;
    community: number;
    treasury: number;
  };
  vestingSchedule: Array<{
    date: number;
    amount: number;
    recipient: string;
  }>;
}

interface RevenueAnalysis {
  protocol: string;
  profitability: {
    isProfitable: boolean;
    monthlyProfit: number;
    profitMargin: number;
    breakEvenDate?: number;
  };
  growth: {
    revenueGrowthRate: number; // monthly %
    userGrowthRate: number;
    tvlGrowthRate: number;
    trend: 'accelerating' | 'stable' | 'declining';
  };
  sustainability: {
    score: number; // 0-100
    runwayMonths: number;
    tokenValueAccrual: number; // How much revenue flows to token holders
    factors: string[];
  };
  valuation: {
    marketCap: number;
    fdv: number;
    priceToSales: number;
    priceToEarnings?: number;
    comparison: 'undervalued' | 'fair' | 'overvalued';
  };
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidenceLevel: number;
}

interface CompetitivePosition {
  protocol: string;
  marketShare: number;
  competitors: Array<{
    name: string;
    marketShare: number;
    revenueComparison: number; // % vs target
  }>;
  advantages: string[];
  weaknesses: string[];
  moatScore: number; // 0-100
}

interface FutureProjection {
  timeframe: '30days' | '90days' | '1year' | '3years';
  projectedRevenue: number;
  projectedUsers: number;
  projectedTVL: number;
  projectedTokenPrice: number;
  assumptions: string[];
  confidence: number;
}

export class ProtocolRevenueAnalyzer {
  private readonly MIN_PROFIT_MARGIN = 10; // 10%
  private readonly HEALTHY_RUNWAY = 12; // 12 months
  private readonly TARGET_PE_RATIO = 20;

  /**
   * Comprehensive protocol revenue analysis
   */
  analyzeProtocol(
    revenue: ProtocolRevenue,
    tokenomics: TokenomicsAnalysis,
    userMetrics: {
      activeUsers: number;
      totalUsers: number;
      tvl: number;
      transactions24h: number;
    },
    tokenPrice: number
  ): RevenueAnalysis {
    // Calculate profitability
    const monthlyProfit = revenue.monthlyRevenue - revenue.costs.total;
    const profitMargin = revenue.monthlyRevenue > 0 
      ? (monthlyProfit / revenue.monthlyRevenue) * 100 
      : -100;
    
    const isProfitable = monthlyProfit > 0;
    
    let breakEvenDate: number | undefined;
    if (!isProfitable && revenue.costs.total > 0) {
      const monthsToBreakEven = Math.abs(monthlyProfit) / (revenue.monthlyRevenue * 0.1);
      breakEvenDate = Date.now() + (monthsToBreakEven * 30 * 24 * 3600 * 1000);
    }

    // Calculate growth rates (simplified - would use historical data)
    const revenueGrowthRate = this.estimateGrowthRate(revenue.monthlyRevenue, 'revenue');
    const userGrowthRate = this.estimateGrowthRate(userMetrics.activeUsers, 'users');
    const tvlGrowthRate = this.estimateGrowthRate(userMetrics.tvl, 'tvl');

    let trend: RevenueAnalysis['growth']['trend'];
    if (revenueGrowthRate > 20) trend = 'accelerating';
    else if (revenueGrowthRate > 0) trend = 'stable';
    else trend = 'declining';

    // Calculate sustainability score
    const sustainabilityScore = this.calculateSustainabilityScore(
      revenue,
      tokenomics,
      isProfitable,
      profitMargin
    );

    const runwayMonths = tokenomics.treasuryBalance / revenue.costs.total;

    // Calculate token value accrual
    const tokenValueAccrual = this.calculateTokenValueAccrual(
      revenue,
      tokenomics,
      tokenPrice
    );

    const sustainabilityFactors = this.identifySustainabilityFactors(
      isProfitable,
      profitMargin,
      runwayMonths,
      tokenValueAccrual
    );

    // Calculate valuation metrics
    const marketCap = tokenomics.circulatingSupply * tokenPrice;
    const fdv = tokenomics.totalSupply * tokenPrice;
    const priceToSales = marketCap / (revenue.monthlyRevenue * 12);
    
    let priceToEarnings: number | undefined;
    if (isProfitable && monthlyProfit > 0) {
      priceToEarnings = marketCap / (monthlyProfit * 12);
    }

    let comparison: RevenueAnalysis['valuation']['comparison'];
    if (priceToEarnings && priceToEarnings < this.TARGET_PE_RATIO * 0.8) {
      comparison = 'undervalued';
    } else if (priceToEarnings && priceToEarnings > this.TARGET_PE_RATIO * 1.5) {
      comparison = 'overvalued';
    } else if (priceToSales < 5) {
      comparison = 'undervalued';
    } else if (priceToSales > 15) {
      comparison = 'overvalued';
    } else {
      comparison = 'fair';
    }

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      isProfitable,
      profitMargin,
      revenueGrowthRate,
      sustainabilityScore,
      comparison
    );

    // Calculate confidence level
    const confidenceLevel = this.calculateConfidenceLevel(
      revenue,
      userMetrics,
      isProfitable
    );

    return {
      protocol: revenue.protocol,
      profitability: {
        isProfitable,
        monthlyProfit,
        profitMargin,
        breakEvenDate,
      },
      growth: {
        revenueGrowthRate,
        userGrowthRate,
        tvlGrowthRate,
        trend,
      },
      sustainability: {
        score: sustainabilityScore,
        runwayMonths,
        tokenValueAccrual,
        factors: sustainabilityFactors,
      },
      valuation: {
        marketCap,
        fdv,
        priceToSales,
        priceToEarnings,
        comparison,
      },
      recommendation,
      confidenceLevel,
    };
  }

  /**
   * Analyze competitive position in the market
   */
  analyzeCompetitivePosition(
    protocolRevenue: ProtocolRevenue,
    competitorRevenues: ProtocolRevenue[]
  ): CompetitivePosition {
    const totalMarketRevenue = competitorRevenues.reduce(
      (sum, c) => sum + c.monthlyRevenue,
      protocolRevenue.monthlyRevenue
    );

    const marketShare = (protocolRevenue.monthlyRevenue / totalMarketRevenue) * 100;

    const competitors = competitorRevenues.map(comp => ({
      name: comp.protocol,
      marketShare: (comp.monthlyRevenue / totalMarketRevenue) * 100,
      revenueComparison: ((comp.monthlyRevenue - protocolRevenue.monthlyRevenue) / protocolRevenue.monthlyRevenue) * 100,
    })).sort((a, b) => b.marketShare - a.marketShare);

    // Identify advantages
    const advantages: string[] = [];
    const weaknesses: string[] = [];

    if (marketShare > 20) {
      advantages.push('Market leader position');
    } else if (marketShare < 5) {
      weaknesses.push('Small market share');
    }

    const avgRevenue = totalMarketRevenue / (competitorRevenues.length + 1);
    if (protocolRevenue.monthlyRevenue > avgRevenue * 1.5) {
      advantages.push('Above-average revenue generation');
    } else if (protocolRevenue.monthlyRevenue < avgRevenue * 0.5) {
      weaknesses.push('Below-average revenue');
    }

    // Analyze revenue diversification
    const maxRevenueSource = Math.max(
      ...protocolRevenue.revenueBreakdown.map(r => r.percentage)
    );
    if (maxRevenueSource < 60) {
      advantages.push('Well-diversified revenue streams');
    } else {
      weaknesses.push('Revenue heavily concentrated in one source');
    }

    // Calculate moat score
    let moatScore = 50;
    if (marketShare > 30) moatScore += 20;
    else if (marketShare > 15) moatScore += 10;
    
    if (advantages.length > 2) moatScore += 15;
    if (weaknesses.length > 2) moatScore -= 15;

    moatScore = Math.max(0, Math.min(100, moatScore));

    return {
      protocol: protocolRevenue.protocol,
      marketShare,
      competitors,
      advantages,
      weaknesses,
      moatScore,
    };
  }

  /**
   * Project future protocol performance
   */
  projectFuture(
    currentRevenue: ProtocolRevenue,
    historicalGrowthRate: number,
    marketConditions: {
      bullish: boolean;
      sectorGrowth: number;
    }
  ): FutureProjection[] {
    const projections: FutureProjection[] = [];
    const timeframes: Array<{ period: FutureProjection['timeframe']; months: number }> = [
      { period: '30days', months: 1 },
      { period: '90days', months: 3 },
      { period: '1year', months: 12 },
      { period: '3years', months: 36 },
    ];

    timeframes.forEach(({ period, months }) => {
      // Adjust growth rate based on market conditions and time decay
      let adjustedGrowthRate = historicalGrowthRate;
      
      if (marketConditions.bullish) {
        adjustedGrowthRate *= 1.2;
      } else {
        adjustedGrowthRate *= 0.8;
      }

      // Growth decays over time (law of large numbers)
      const timeDecay = Math.pow(0.95, months / 12);
      adjustedGrowthRate *= timeDecay;

      // Calculate projections
      const growthMultiplier = Math.pow(1 + adjustedGrowthRate / 100, months);
      
      const projectedRevenue = currentRevenue.monthlyRevenue * growthMultiplier;
      const projectedUsers = 100000 * growthMultiplier; // Simplified
      const projectedTVL = 10000000 * growthMultiplier; // Simplified
      const projectedTokenPrice = 10 * growthMultiplier; // Simplified

      const assumptions = [
        `${adjustedGrowthRate.toFixed(1)}% monthly growth rate`,
        marketConditions.bullish ? 'Bullish market conditions' : 'Neutral market conditions',
        `Sector growing at ${marketConditions.sectorGrowth}%`,
        'No major protocol changes or exploits',
      ];

      const confidence = this.calculateProjectionConfidence(months, adjustedGrowthRate);

      projections.push({
        timeframe: period,
        projectedRevenue,
        projectedUsers,
        projectedTVL,
        projectedTokenPrice,
        assumptions,
        confidence,
      });
    });

    return projections;
  }

  /**
   * Calculate protocol efficiency metrics
   */
  calculateEfficiencyMetrics(
    revenue: ProtocolRevenue,
    userMetrics: {
      activeUsers: number;
      tvl: number;
    }
  ): {
    revenuePerUser: number;
    revenuePerTVL: number;
    costPerUser: number;
    efficiency: 'excellent' | 'good' | 'fair' | 'poor';
    benchmarks: {
      revenuePerUser: { protocol: number; industry: number };
      revenuePerTVL: { protocol: number; industry: number };
    };
  } {
    const revenuePerUser = revenue.monthlyRevenue / userMetrics.activeUsers;
    const revenuePerTVL = (revenue.monthlyRevenue * 12) / userMetrics.tvl;
    const costPerUser = revenue.costs.total / userMetrics.activeUsers;

    // Industry benchmarks (simplified)
    const industryRevenuePerUser = 100;
    const industryRevenuePerTVL = 0.05;

    let efficiency: 'excellent' | 'good' | 'fair' | 'poor';
    if (revenuePerUser > industryRevenuePerUser * 1.5 && revenuePerTVL > industryRevenuePerTVL * 1.5) {
      efficiency = 'excellent';
    } else if (revenuePerUser > industryRevenuePerUser && revenuePerTVL > industryRevenuePerTVL) {
      efficiency = 'good';
    } else if (revenuePerUser > industryRevenuePerUser * 0.5 && revenuePerTVL > industryRevenuePerTVL * 0.5) {
      efficiency = 'fair';
    } else {
      efficiency = 'poor';
    }

    return {
      revenuePerUser,
      revenuePerTVL,
      costPerUser,
      efficiency,
      benchmarks: {
        revenuePerUser: {
          protocol: revenuePerUser,
          industry: industryRevenuePerUser,
        },
        revenuePerTVL: {
          protocol: revenuePerTVL,
          industry: industryRevenuePerTVL,
        },
      },
    };
  }

  /**
   * Analyze token economics and value accrual mechanisms
   */
  analyzeTokenEconomics(
    tokenomics: TokenomicsAnalysis,
    revenue: ProtocolRevenue,
    tokenPrice: number
  ): {
    inflationRate: number;
    realYield: number;
    buyPressure: number;
    sellPressure: number;
    netPressure: number;
    tokenUtility: string[];
    valueCaptureScore: number;
  } {
    // Calculate inflation rate
    const netEmission = tokenomics.emissionRate - tokenomics.burnRate;
    const inflationRate = (netEmission * 365 / tokenomics.circulatingSupply) * 100;

    // Calculate real yield (revenue distributed to token holders)
    const annualRevenue = revenue.monthlyRevenue * 12;
    const marketCap = tokenomics.circulatingSupply * tokenPrice;
    const realYield = marketCap > 0 ? (annualRevenue / marketCap) * 100 : 0;

    // Estimate buy and sell pressure
    const buyPressure = tokenomics.burnRate * tokenPrice * 365; // Annual value burned
    const sellPressure = tokenomics.emissionRate * tokenPrice * 365; // Annual value emitted
    const netPressure = buyPressure - sellPressure;

    // Identify token utility
    const tokenUtility: string[] = [];
    if (realYield > 0) tokenUtility.push('Revenue sharing');
    if (tokenomics.burnRate > 0) tokenUtility.push('Deflationary mechanism');
    tokenUtility.push('Governance rights');

    // Calculate value capture score
    let valueCaptureScore = 0;
    if (realYield > 5) valueCaptureScore += 30;
    else if (realYield > 2) valueCaptureScore += 20;
    else if (realYield > 0) valueCaptureScore += 10;

    if (inflationRate < 0) valueCaptureScore += 30; // Deflationary
    else if (inflationRate < 5) valueCaptureScore += 20;
    else if (inflationRate < 10) valueCaptureScore += 10;

    if (netPressure > 0) valueCaptureScore += 20;

    if (tokenUtility.length >= 3) valueCaptureScore += 20;

    valueCaptureScore = Math.min(valueCaptureScore, 100);

    return {
      inflationRate,
      realYield,
      buyPressure,
      sellPressure,
      netPressure,
      tokenUtility,
      valueCaptureScore,
    };
  }

  // Private helper methods
  private estimateGrowthRate(currentValue: number, metric: string): number {
    // Simplified - would use historical data
    // Return estimated monthly growth rate
    if (metric === 'revenue' && currentValue > 1000000) return 15;
    if (metric === 'users' && currentValue > 10000) return 20;
    if (metric === 'tvl' && currentValue > 10000000) return 10;
    return 5;
  }

  private calculateSustainabilityScore(
    revenue: ProtocolRevenue,
    tokenomics: TokenomicsAnalysis,
    isProfitable: boolean,
    profitMargin: number
  ): number {
    let score = 50;

    if (isProfitable) {
      score += 20;
      if (profitMargin > 30) score += 10;
      else if (profitMargin > 20) score += 5;
    } else {
      score -= 20;
    }

    const runwayMonths = tokenomics.treasuryBalance / revenue.costs.total;
    if (runwayMonths > 24) score += 20;
    else if (runwayMonths > 12) score += 10;
    else if (runwayMonths < 6) score -= 20;

    // Revenue diversification
    const maxRevenueSource = Math.max(
      ...revenue.revenueBreakdown.map(r => r.percentage)
    );
    if (maxRevenueSource < 50) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateTokenValueAccrual(
    revenue: ProtocolRevenue,
    tokenomics: TokenomicsAnalysis,
    tokenPrice: number
  ): number {
    // Percentage of revenue that flows to token holders
    // Simplified calculation
    const buybacks = tokenomics.burnRate * tokenPrice * 365;
    const annualRevenue = revenue.monthlyRevenue * 12;

    return annualRevenue > 0 ? (buybacks / annualRevenue) * 100 : 0;
  }

  private identifySustainabilityFactors(
    isProfitable: boolean,
    profitMargin: number,
    runwayMonths: number,
    tokenValueAccrual: number
  ): string[] {
    const factors: string[] = [];

    if (isProfitable) {
      factors.push(`✓ Profitable with ${profitMargin.toFixed(1)}% margin`);
    } else {
      factors.push(`✗ Currently unprofitable`);
    }

    if (runwayMonths > this.HEALTHY_RUNWAY) {
      factors.push(`✓ Healthy ${runwayMonths.toFixed(1)}-month runway`);
    } else {
      factors.push(`⚠ Limited ${runwayMonths.toFixed(1)}-month runway`);
    }

    if (tokenValueAccrual > 10) {
      factors.push(`✓ Strong token value accrual (${tokenValueAccrual.toFixed(1)}%)`);
    } else if (tokenValueAccrual > 0) {
      factors.push(`⚠ Moderate token value accrual (${tokenValueAccrual.toFixed(1)}%)`);
    } else {
      factors.push(`✗ No direct token value accrual`);
    }

    return factors;
  }

  private generateRecommendation(
    isProfitable: boolean,
    profitMargin: number,
    revenueGrowthRate: number,
    sustainabilityScore: number,
    valuation: 'undervalued' | 'fair' | 'overvalued'
  ): RevenueAnalysis['recommendation'] {
    let score = 50;

    if (isProfitable && profitMargin > 20) score += 20;
    else if (isProfitable) score += 10;
    else score -= 20;

    if (revenueGrowthRate > 30) score += 20;
    else if (revenueGrowthRate > 15) score += 10;
    else if (revenueGrowthRate < 0) score -= 20;

    score += (sustainabilityScore - 50) / 2;

    if (valuation === 'undervalued') score += 15;
    else if (valuation === 'overvalued') score -= 15;

    if (score >= 80) return 'strong_buy';
    if (score >= 60) return 'buy';
    if (score >= 40) return 'hold';
    if (score >= 20) return 'sell';
    return 'strong_sell';
  }

  private calculateConfidenceLevel(
    revenue: ProtocolRevenue,
    userMetrics: { activeUsers: number; tvl: number },
    isProfitable: boolean
  ): number {
    let confidence = 50;

    if (revenue.monthlyRevenue > 1000000) confidence += 15;
    else if (revenue.monthlyRevenue > 100000) confidence += 10;

    if (userMetrics.activeUsers > 10000) confidence += 15;
    else if (userMetrics.activeUsers > 1000) confidence += 10;

    if (isProfitable) confidence += 10;

    if (revenue.revenueBreakdown.length >= 3) confidence += 10;

    return Math.min(confidence, 95);
  }

  private calculateProjectionConfidence(
    months: number,
    growthRate: number
  ): number {
    let confidence = 90;

    // Confidence decreases with time
    confidence -= months * 2;

    // Confidence decreases with high growth assumptions
    if (growthRate > 30) confidence -= 20;
    else if (growthRate > 20) confidence -= 10;

    return Math.max(confidence, 20);
  }
}

// Export singleton instance
export const protocolRevenueAnalyzer = new ProtocolRevenueAnalyzer();

