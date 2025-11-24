/**
 * Liquidity Mining Optimizer - Maximizes returns from liquidity provision
 * Calculates optimal pool allocation, manages impermanent loss, and auto-compounds rewards
 */

interface LiquidityPool {
  address: string;
  protocol: string;
  token0: string;
  token1: string;
  token0Symbol: string;
  token1Symbol: string;
  fee: number; // basis points
  tvl: number;
  volume24h: number;
  apr: number;
  additionalRewards?: Array<{
    token: string;
    apr: number;
  }>;
  prices: {
    token0: number;
    token1: number;
  };
}

interface PoolAnalysis {
  pool: LiquidityPool;
  dailyFees: number;
  feeAPR: number;
  totalAPR: number;
  impermanentLossRisk: number; // 0-100
  capitalEfficiency: number;
  liquidityUtilization: number;
  recommendation: 'excellent' | 'good' | 'fair' | 'poor' | 'avoid';
  score: number;
}

interface OptimalAllocation {
  pools: Array<{
    pool: LiquidityPool;
    allocation: number; // percentage
    expectedReturn: number;
    risk: number;
  }>;
  totalExpectedReturn: number;
  totalRisk: number;
  sharpeRatio: number;
  diversificationScore: number;
}

interface ImpermanentLossCalculation {
  currentIL: number; // percentage
  potentialIL: Array<{
    priceChange: number; // percentage
    impermanentLoss: number; // percentage
  }>;
  breakEvenTime: number; // days
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
}

interface AutoCompoundStrategy {
  frequency: 'hourly' | 'daily' | 'weekly' | 'optimal';
  expectedAPY: number; // with compounding
  gasCostPerCompound: number;
  netBenefit: number;
  recommendation: string;
  optimalFrequencyHours: number;
}

interface PositionManagement {
  currentPosition: {
    pool: LiquidityPool;
    amount0: number;
    amount1: number;
    totalValue: number;
    feesEarned: number;
    impermanentLoss: number;
  };
  recommendations: Array<{
    action: 'add' | 'remove' | 'rebalance' | 'migrate' | 'hold';
    reason: string;
    expectedImpact: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }>;
  optimalRebalancePrice: { token0: number; token1: number };
}

export class LiquidityMiningOptimizer {
  private readonly GAS_PRICE_GWEI = 30;
  private readonly ETH_PRICE = 2000;
  private readonly MIN_APR = 5; // 5% minimum APR
  private readonly TARGET_SHARPE = 1.5;

  /**
   * Analyze and rank liquidity pools
   */
  analyzePools(pools: LiquidityPool[]): PoolAnalysis[] {
    const analyses: PoolAnalysis[] = [];

    pools.forEach(pool => {
      // Calculate daily fees
      const dailyFees = (pool.volume24h * pool.fee) / 10000;
      const feeAPR = pool.tvl > 0 ? (dailyFees * 365 / pool.tvl) * 100 : 0;

      // Calculate total APR including rewards
      let totalAPR = feeAPR;
      if (pool.additionalRewards) {
        totalAPR += pool.additionalRewards.reduce((sum, reward) => sum + reward.apr, 0);
      }

      // Assess impermanent loss risk based on token volatility correlation
      const ilRisk = this.assessImpermanentLossRisk(pool);

      // Calculate capital efficiency
      const capitalEfficiency = pool.volume24h / pool.tvl;

      // Calculate liquidity utilization
      const liquidityUtilization = Math.min((pool.volume24h / pool.tvl) * 100, 100);

      // Score the pool
      let score = 0;
      score += Math.min(totalAPR / 2, 50); // Max 50 points for APR
      score += Math.max(0, 25 - ilRisk / 2); // Max 25 points (lower IL = higher score)
      score += Math.min(liquidityUtilization / 4, 25); // Max 25 points for utilization

      // Determine recommendation
      let recommendation: PoolAnalysis['recommendation'];
      if (score >= 80) recommendation = 'excellent';
      else if (score >= 60) recommendation = 'good';
      else if (score >= 40) recommendation = 'fair';
      else if (score >= 20) recommendation = 'poor';
      else recommendation = 'avoid';

      analyses.push({
        pool,
        dailyFees,
        feeAPR,
        totalAPR,
        impermanentLossRisk: ilRisk,
        capitalEfficiency,
        liquidityUtilization,
        recommendation,
        score,
      });
    });

    return analyses.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate optimal portfolio allocation across pools
   */
  calculateOptimalAllocation(
    poolAnalyses: PoolAnalysis[],
    totalCapital: number,
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  ): OptimalAllocation {
    // Filter viable pools
    const viable = poolAnalyses.filter(p => p.totalAPR >= this.MIN_APR);

    if (viable.length === 0) {
      return {
        pools: [],
        totalExpectedReturn: 0,
        totalRisk: 0,
        sharpeRatio: 0,
        diversificationScore: 0,
      };
    }

    // Risk tolerance weights
    const riskWeights = {
      conservative: { return: 0.3, risk: 0.7 },
      moderate: { return: 0.5, risk: 0.5 },
      aggressive: { return: 0.7, risk: 0.3 },
    };

    const weights = riskWeights[riskTolerance];

    // Calculate allocation scores
    const scoredPools = viable.map(analysis => {
      const returnScore = analysis.totalAPR * weights.return;
      const riskScore = (100 - analysis.impermanentLossRisk) * weights.risk;
      const allocationScore = returnScore + riskScore;

      return {
        analysis,
        allocationScore,
      };
    });

    // Sort and normalize allocations
    scoredPools.sort((a, b) => b.allocationScore - a.allocationScore);
    const totalScore = scoredPools.reduce((sum, p) => sum + p.allocationScore, 0);

    const allocations = scoredPools.map(({ analysis, allocationScore }) => {
      let allocation = (allocationScore / totalScore) * 100;

      // Apply constraints based on risk tolerance
      if (riskTolerance === 'conservative') {
        allocation = Math.min(allocation, 30); // Max 30% per pool
      } else if (riskTolerance === 'moderate') {
        allocation = Math.min(allocation, 40); // Max 40% per pool
      }
      // Aggressive allows higher concentration

      return {
        pool: analysis.pool,
        allocation,
        expectedReturn: (totalCapital * allocation / 100) * (analysis.totalAPR / 100),
        risk: analysis.impermanentLossRisk,
      };
    });

    // Normalize allocations to 100%
    const totalAllocation = allocations.reduce((sum, a) => sum + a.allocation, 0);
    allocations.forEach(a => {
      a.allocation = (a.allocation / totalAllocation) * 100;
      a.expectedReturn = (totalCapital * a.allocation / 100) * (a.pool.apr / 100);
    });

    // Calculate portfolio metrics
    const totalExpectedReturn = allocations.reduce((sum, a) => sum + a.expectedReturn, 0);
    const totalReturnPercent = (totalExpectedReturn / totalCapital) * 100;
    
    const totalRisk = allocations.reduce((sum, a) => sum + (a.risk * a.allocation / 100), 0);
    
    const sharpeRatio = totalRisk > 0 ? totalReturnPercent / totalRisk : 0;
    
    const diversificationScore = Math.min((allocations.length / 5) * 100, 100);

    return {
      pools: allocations,
      totalExpectedReturn: totalReturnPercent,
      totalRisk,
      sharpeRatio,
      diversificationScore,
    };
  }

  /**
   * Calculate impermanent loss for a position
   */
  calculateImpermanentLoss(
    initialPrice: number,
    currentPrice: number,
    token0Amount: number,
    token1Amount: number
  ): ImpermanentLossCalculation {
    const priceRatio = currentPrice / initialPrice;
    
    // Impermanent loss formula: 2*sqrt(priceRatio) / (1 + priceRatio) - 1
    const currentIL = (2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * 100;

    // Calculate IL at various price changes
    const potentialIL = [
      { priceChange: -50, impermanentLoss: this.calculateILAtPriceChange(-50) },
      { priceChange: -25, impermanentLoss: this.calculateILAtPriceChange(-25) },
      { priceChange: -10, impermanentLoss: this.calculateILAtPriceChange(-10) },
      { priceChange: 10, impermanentLoss: this.calculateILAtPriceChange(10) },
      { priceChange: 25, impermanentLoss: this.calculateILAtPriceChange(25) },
      { priceChange: 50, impermanentLoss: this.calculateILAtPriceChange(50) },
      { priceChange: 100, impermanentLoss: this.calculateILAtPriceChange(100) },
    ];

    // Estimate break-even time (simplified)
    const breakEvenTime = Math.abs(currentIL);

    // Determine risk level
    let riskLevel: ImpermanentLossCalculation['riskLevel'];
    if (Math.abs(currentIL) < 2) riskLevel = 'low';
    else if (Math.abs(currentIL) < 5) riskLevel = 'medium';
    else if (Math.abs(currentIL) < 10) riskLevel = 'high';
    else riskLevel = 'extreme';

    return {
      currentIL,
      potentialIL,
      breakEvenTime,
      riskLevel,
    };
  }

  /**
   * Optimize auto-compounding strategy
   */
  optimizeAutoCompound(
    pool: LiquidityPool,
    positionValue: number,
    currentAPR: number
  ): AutoCompoundStrategy {
    const gasCostPerCompound = this.estimateCompoundGasCost();

    // Calculate APY at different compounding frequencies
    const frequencies = {
      hourly: 24 * 365,
      daily: 365,
      weekly: 52,
    };

    const apyCalculations = Object.entries(frequencies).map(([name, n]) => {
      const apy = ((1 + currentAPR / 100 / n) ** n - 1) * 100;
      const annualGasCost = gasCostPerCompound * n;
      const netBenefit = (positionValue * apy / 100) - annualGasCost;

      return {
        frequency: name as 'hourly' | 'daily' | 'weekly',
        apy,
        annualGasCost,
        netBenefit,
      };
    });

    // Find optimal frequency
    const optimal = apyCalculations.reduce((best, current) =>
      current.netBenefit > best.netBenefit ? current : best
    );

    // Calculate truly optimal frequency using calculus
    // Maximize: APY(n) - GasCost(n)
    // Where APY increases with n, but has diminishing returns
    const optimalFrequencyHours = this.calculateOptimalCompoundFrequency(
      positionValue,
      currentAPR,
      gasCostPerCompound
    );

    let recommendation = '';
    if (optimal.netBenefit > 0) {
      recommendation = `Auto-compound ${optimal.frequency} for optimal returns`;
    } else {
      recommendation = 'Gas costs exceed compounding benefits. Manual claiming recommended.';
    }

    return {
      frequency: optimal.frequency,
      expectedAPY: optimal.apy,
      gasCostPerCompound,
      netBenefit: optimal.netBenefit,
      recommendation,
      optimalFrequencyHours,
    };
  }

  /**
   * Manage existing liquidity position
   */
  managePosition(
    currentPosition: PositionManagement['currentPosition'],
    poolAnalysis: PoolAnalysis,
    marketConditions: {
      volatilityIndex: number; // 0-100
      trendDirection: 'up' | 'down' | 'sideways';
    }
  ): PositionManagement {
    const recommendations: PositionManagement['recommendations'] = [];

    // Check if fees exceed IL
    const netProfit = currentPosition.feesEarned - Math.abs(currentPosition.impermanentLoss);

    if (netProfit < 0 && Math.abs(currentPosition.impermanentLoss) > 5) {
      recommendations.push({
        action: 'remove',
        reason: `Impermanent loss (${currentPosition.impermanentLoss.toFixed(2)}%) exceeds fees earned`,
        expectedImpact: netProfit,
        urgency: 'high',
      });
    }

    // Check if better pools available
    if (poolAnalysis.recommendation === 'poor' || poolAnalysis.recommendation === 'avoid') {
      recommendations.push({
        action: 'migrate',
        reason: 'Pool performance degraded. Better opportunities available.',
        expectedImpact: 20,
        urgency: 'medium',
      });
    }

    // Check if pool utilization is low
    if (poolAnalysis.liquidityUtilization < 20) {
      recommendations.push({
        action: 'migrate',
        reason: `Low liquidity utilization (${poolAnalysis.liquidityUtilization.toFixed(1)}%)`,
        expectedImpact: 15,
        urgency: 'low',
      });
    }

    // Check market conditions
    if (marketConditions.volatilityIndex > 80 && currentPosition.impermanentLoss < -3) {
      recommendations.push({
        action: 'remove',
        reason: 'High market volatility increases IL risk',
        expectedImpact: -10,
        urgency: 'high',
      });
    }

    // Check if position is profitable and stable
    if (netProfit > 10 && Math.abs(currentPosition.impermanentLoss) < 2) {
      recommendations.push({
        action: 'add',
        reason: 'Position profitable with low IL. Good opportunity to increase size.',
        expectedImpact: 15,
        urgency: 'low',
      });
    }

    // Default to hold if no strong signals
    if (recommendations.length === 0) {
      recommendations.push({
        action: 'hold',
        reason: 'Position stable. Continue monitoring.',
        expectedImpact: 0,
        urgency: 'low',
      });
    }

    // Calculate optimal rebalance price
    const currentPrice0 = currentPosition.pool.prices.token0;
    const currentPrice1 = currentPosition.pool.prices.token1;
    
    const optimalRebalancePrice = {
      token0: currentPrice0 * 1.1, // 10% move triggers rebalance
      token1: currentPrice1 * 1.1,
    };

    return {
      currentPosition,
      recommendations: recommendations.sort((a, b) => {
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      }),
      optimalRebalancePrice,
    };
  }

  /**
   * Simulate liquidity mining over time
   */
  simulateLiquidityMining(
    pool: LiquidityPool,
    initialInvestment: number,
    durationDays: number,
    priceScenario: {
      type: 'stable' | 'rising' | 'falling' | 'volatile';
      magnitude: number; // percentage change
    }
  ): {
    finalValue: number;
    totalFeesEarned: number;
    totalRewardsEarned: number;
    impermanentLoss: number;
    netProfit: number;
    roi: number;
    dailyBreakdown: Array<{
      day: number;
      value: number;
      fees: number;
      IL: number;
    }>;
  } {
    const dailyBreakdown: Array<{ day: number; value: number; fees: number; IL: number }> = [];
    
    let currentValue = initialInvestment;
    let totalFees = 0;
    let totalRewards = 0;

    const dailyAPR = pool.apr / 365 / 100;
    const dailyRewardAPR = pool.additionalRewards
      ? pool.additionalRewards.reduce((sum, r) => sum + r.apr, 0) / 365 / 100
      : 0;

    for (let day = 1; day <= durationDays; day++) {
      // Simulate price movement
      const priceChange = this.simulatePriceMovement(priceScenario, day, durationDays);
      
      // Calculate IL
      const il = this.calculateILAtPriceChange(priceChange);
      const ilImpact = initialInvestment * (il / 100);

      // Calculate fees
      const dailyFees = currentValue * dailyAPR;
      totalFees += dailyFees;

      // Calculate rewards
      const dailyRewards = currentValue * dailyRewardAPR;
      totalRewards += dailyRewards;

      // Update current value
      currentValue = initialInvestment + totalFees + totalRewards + ilImpact;

      dailyBreakdown.push({
        day,
        value: currentValue,
        fees: totalFees,
        IL: ilImpact,
      });
    }

    const netProfit = currentValue - initialInvestment;
    const roi = (netProfit / initialInvestment) * 100;

    return {
      finalValue: currentValue,
      totalFeesEarned: totalFees,
      totalRewardsEarned: totalRewards,
      impermanentLoss: dailyBreakdown[dailyBreakdown.length - 1].IL,
      netProfit,
      roi,
      dailyBreakdown,
    };
  }

  // Private helper methods
  private assessImpermanentLossRisk(pool: LiquidityPool): number {
    // Simplified risk assessment based on token characteristics
    let risk = 50; // Base risk

    // Stablecoin pairs have very low IL risk
    const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD'];
    const isStablePair = 
      stablecoins.includes(pool.token0Symbol) && 
      stablecoins.includes(pool.token1Symbol);

    if (isStablePair) {
      risk = 5;
    }
    // One stablecoin reduces risk
    else if (stablecoins.includes(pool.token0Symbol) || stablecoins.includes(pool.token1Symbol)) {
      risk = 30;
    }

    // Higher fee tiers indicate more volatile pairs
    if (pool.fee >= 100) { // 1% fee
      risk += 20;
    }

    return Math.min(risk, 100);
  }

  private calculateILAtPriceChange(priceChangePercent: number): number {
    const ratio = 1 + (priceChangePercent / 100);
    if (ratio <= 0) return -100;
    
    const il = (2 * Math.sqrt(ratio) / (1 + ratio) - 1) * 100;
    return il;
  }

  private estimateCompoundGasCost(): number {
    // Compound operation typically costs ~200k gas
    const gasUnits = 200000;
    const gasCostWei = gasUnits * this.GAS_PRICE_GWEI * 1e9;
    return (gasCostWei * this.ETH_PRICE) / 1e18;
  }

  private calculateOptimalCompoundFrequency(
    positionValue: number,
    apr: number,
    gasCost: number
  ): number {
    // Optimal frequency minimizes: GasCost * n / (APY increase from more frequent compounding)
    // Simplified: when marginal benefit equals marginal cost
    
    const dailyReturn = positionValue * (apr / 100 / 365);
    const compoundsPerYearOptimal = Math.sqrt((apr / 100 * positionValue) / gasCost);
    
    const hoursPerCompound = (365 * 24) / compoundsPerYearOptimal;
    return Math.max(24, Math.min(hoursPerCompound, 168)); // Between 1 day and 1 week
  }

  private simulatePriceMovement(
    scenario: { type: 'stable' | 'rising' | 'falling' | 'volatile'; magnitude: number },
    currentDay: number,
    totalDays: number
  ): number {
    const progress = currentDay / totalDays;

    switch (scenario.type) {
      case 'stable':
        return (Math.random() - 0.5) * 2; // ±2%
      
      case 'rising':
        return scenario.magnitude * progress + (Math.random() - 0.5) * 5;
      
      case 'falling':
        return -scenario.magnitude * progress + (Math.random() - 0.5) * 5;
      
      case 'volatile':
        return Math.sin(progress * Math.PI * 4) * scenario.magnitude + (Math.random() - 0.5) * 10;
      
      default:
        return 0;
    }
  }
}

// Export singleton instance
export const liquidityMiningOptimizer = new LiquidityMiningOptimizer();

