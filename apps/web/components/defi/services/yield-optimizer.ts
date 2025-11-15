/**
 * Yield Farming Optimizer - Finds and optimizes DeFi yield opportunities
 * Analyzes APY, IL risk, and suggests optimal strategies
 */

interface YieldOpportunity {
  protocol: string;
  pool: string;
  chain: string;
  token0: string;
  token1?: string; // undefined for single-asset staking
  apy: number;
  tvl: number;
  poolType: 'single' | 'lp' | 'vault' | 'lending';
  rewards: string[]; // reward tokens
  lockPeriod?: number; // days, undefined if no lock
  fees: {
    deposit: number;
    withdrawal: number;
    performance: number;
  };
}

interface ImpermanentLossAnalysis {
  currentIL: number; // percentage
  potentialIL: {
    price10Up: number;
    price10Down: number;
    price50Up: number;
    price50Down: number;
  };
  breakEvenAPY: number; // APY needed to offset IL
  recommendation: 'safe' | 'moderate' | 'risky';
}

interface Strategy {
  name: string;
  description: string;
  opportunities: YieldOpportunity[];
  expectedAPY: number;
  riskScore: number;
  allocation: Map<string, number>; // pool -> percentage
  estimatedGasCosts: number;
  netAPY: number; // after gas and fees
  complexity: 'simple' | 'moderate' | 'complex';
}

interface CompoundingSchedule {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  gasCost: number;
  breakEvenPeriod: number; // days
  projectedYield: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

export class YieldOptimizer {
  private readonly GAS_PRICE_GWEI = 20;
  private readonly ETH_PRICE_USD = 2000;
  private readonly MIN_TVL = 100000; // $100k
  private readonly MAX_POSITION_CONCENTRATION = 0.3; // 30%

  /**
   * Find best yield opportunities based on user preferences
   */
  findBestOpportunities(
    opportunities: YieldOpportunity[],
    preferences: {
      riskTolerance: 'low' | 'medium' | 'high';
      preferredChains: string[];
      minAPY: number;
      maxLockPeriod?: number;
      allowIL: boolean;
    }
  ): YieldOpportunity[] {
    let filtered = opportunities.filter(opp => {
      // Filter by chain preference
      if (preferences.preferredChains.length > 0 && 
          !preferences.preferredChains.includes(opp.chain)) {
        return false;
      }

      // Filter by minimum APY
      if (opp.apy < preferences.minAPY) {
        return false;
      }

      // Filter by lock period
      if (preferences.maxLockPeriod !== undefined && 
          opp.lockPeriod !== undefined && 
          opp.lockPeriod > preferences.maxLockPeriod) {
        return false;
      }

      // Filter by impermanent loss risk
      if (!preferences.allowIL && opp.poolType === 'lp') {
        return false;
      }

      // Filter by TVL (safety)
      if (opp.tvl < this.MIN_TVL) {
        return false;
      }

      return true;
    });

    // Sort by risk-adjusted returns
    filtered = filtered.map(opp => ({
      ...opp,
      riskAdjustedAPY: this.calculateRiskAdjustedAPY(opp, preferences.riskTolerance),
    })).sort((a, b) => b.riskAdjustedAPY - a.riskAdjustedAPY);

    return filtered.slice(0, 10);
  }

  /**
   * Calculate impermanent loss for LP positions
   */
  calculateImpermanentLoss(
    token0Price: number,
    token1Price: number,
    initialToken0Price: number,
    initialToken1Price: number
  ): ImpermanentLossAnalysis {
    const priceRatio = (token0Price / token1Price) / (initialToken0Price / initialToken1Price);
    const currentIL = ((2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1) * 100;

    // Calculate potential IL for different price movements
    const calculateILForPriceChange = (priceChange: number): number => {
      const newRatio = priceRatio * (1 + priceChange);
      return ((2 * Math.sqrt(newRatio)) / (1 + newRatio) - 1) * 100;
    };

    const potentialIL = {
      price10Up: calculateILForPriceChange(0.1),
      price10Down: calculateILForPriceChange(-0.1),
      price50Up: calculateILForPriceChange(0.5),
      price50Down: calculateILForPriceChange(-0.5),
    };

    // Calculate break-even APY (APY needed to offset IL)
    const breakEvenAPY = Math.abs(currentIL);

    // Determine recommendation
    let recommendation: 'safe' | 'moderate' | 'risky';
    if (Math.abs(currentIL) < 2) {
      recommendation = 'safe';
    } else if (Math.abs(currentIL) < 5) {
      recommendation = 'moderate';
    } else {
      recommendation = 'risky';
    }

    return {
      currentIL,
      potentialIL,
      breakEvenAPY,
      recommendation,
    };
  }

  /**
   * Generate optimal yield farming strategies
   */
  generateStrategies(
    opportunities: YieldOpportunity[],
    capital: number,
    riskTolerance: 'low' | 'medium' | 'high'
  ): Strategy[] {
    const strategies: Strategy[] = [];

    // Strategy 1: Stablecoin Farming (Low Risk)
    strategies.push(this.createStablecoinStrategy(opportunities, capital));

    // Strategy 2: Blue Chip Farming (Medium Risk)
    strategies.push(this.createBlueChipStrategy(opportunities, capital));

    // Strategy 3: High Yield Farming (High Risk)
    if (riskTolerance === 'high') {
      strategies.push(this.createHighYieldStrategy(opportunities, capital));
    }

    // Strategy 4: Diversified Farming (Balanced)
    strategies.push(this.createDiversifiedStrategy(opportunities, capital));

    // Strategy 5: Auto-Compounding Vaults (Passive)
    strategies.push(this.createVaultStrategy(opportunities, capital));

    return strategies.sort((a, b) => b.netAPY - a.netAPY);
  }

  /**
   * Calculate optimal compounding frequency
   */
  calculateCompoundingSchedule(
    principal: number,
    apy: number,
    gasPerCompound: number
  ): CompoundingSchedule[] {
    const schedules: CompoundingSchedule[] = [];
    const frequencies: Array<{
      name: 'hourly' | 'daily' | 'weekly' | 'monthly';
      compoundsPerYear: number;
    }> = [
      { name: 'hourly', compoundsPerYear: 365 * 24 },
      { name: 'daily', compoundsPerYear: 365 },
      { name: 'weekly', compoundsPerYear: 52 },
      { name: 'monthly', compoundsPerYear: 12 },
    ];

    frequencies.forEach(({ name, compoundsPerYear }) => {
      // Calculate compound interest
      const r = apy / 100;
      const yearlyYield = principal * (Math.pow(1 + r / compoundsPerYear, compoundsPerYear) - 1);
      
      // Calculate gas costs
      const yearlyGasCost = gasPerCompound * compoundsPerYear;
      const netYield = yearlyYield - yearlyGasCost;

      // Break-even: when compound gains exceed gas costs
      const breakEvenPeriod = yearlyGasCost > 0 
        ? (gasPerCompound / (yearlyYield / compoundsPerYear)) * (365 / compoundsPerYear)
        : 0;

      schedules.push({
        frequency: name,
        gasCost: gasPerCompound,
        breakEvenPeriod,
        projectedYield: {
          daily: (netYield / 365),
          weekly: (netYield / 52),
          monthly: (netYield / 12),
          yearly: netYield,
        },
      });
    });

    return schedules.sort((a, b) => b.projectedYield.yearly - a.projectedYield.yearly);
  }

  /**
   * Simulate yield farming returns over time
   */
  simulateYieldFarming(
    principal: number,
    apy: number,
    duration: number, // days
    compoundFrequency: 'daily' | 'weekly' | 'monthly',
    fees: { deposit: number; withdrawal: number; performance: number }
  ): {
    finalBalance: number;
    totalEarned: number;
    effectiveAPY: number;
    breakdown: {
      principalGrowth: number;
      compoundGains: number;
      fees: number;
    };
    dayByDay: Array<{ day: number; balance: number; earned: number }>;
  } {
    const compoundsPerYear = compoundFrequency === 'daily' ? 365 : 
                             compoundFrequency === 'weekly' ? 52 : 12;
    
    const periodsInDuration = (duration / 365) * compoundsPerYear;
    const r = apy / 100;

    // Apply deposit fee
    let balance = principal * (1 - fees.deposit / 100);
    const dayByDay: Array<{ day: number; balance: number; earned: number }> = [];

    // Simulate day by day (simplified - actual compounding happens per period)
    for (let day = 0; day <= duration; day++) {
      const periodsSoFar = (day / 365) * compoundsPerYear;
      const currentBalance = principal * (1 - fees.deposit / 100) * 
                            Math.pow(1 + r / compoundsPerYear, periodsSoFar);
      
      dayByDay.push({
        day,
        balance: currentBalance,
        earned: currentBalance - principal,
      });
    }

    // Final balance with all fees
    let finalBalance = principal * (1 - fees.deposit / 100) * 
                       Math.pow(1 + r / compoundsPerYear, periodsInDuration);
    
    const earningsBeforeFees = finalBalance - balance;
    const performanceFees = earningsBeforeFees * (fees.performance / 100);
    finalBalance -= performanceFees;
    
    const withdrawalFees = finalBalance * (fees.withdrawal / 100);
    finalBalance -= withdrawalFees;

    const totalEarned = finalBalance - principal;
    const effectiveAPY = ((finalBalance / principal) ** (365 / duration) - 1) * 100;

    return {
      finalBalance,
      totalEarned,
      effectiveAPY,
      breakdown: {
        principalGrowth: principal * (Math.pow(1 + r / compoundsPerYear, periodsInDuration) - 1),
        compoundGains: earningsBeforeFees - (principal * (r / (1 + r))),
        fees: (principal * fees.deposit / 100) + performanceFees + withdrawalFees,
      },
      dayByDay,
    };
  }

  /**
   * Compare multiple yield opportunities side by side
   */
  compareOpportunities(opportunities: YieldOpportunity[]): Array<{
    opportunity: YieldOpportunity;
    score: number;
    pros: string[];
    cons: string[];
    recommendation: string;
  }> {
    return opportunities.map(opp => {
      const pros: string[] = [];
      const cons: string[] = [];
      let score = 50; // Base score

      // Analyze APY
      if (opp.apy > 50) {
        pros.push(`High APY: ${opp.apy.toFixed(2)}%`);
        score += 15;
      } else if (opp.apy < 10) {
        cons.push(`Low APY: ${opp.apy.toFixed(2)}%`);
        score -= 10;
      }

      // Analyze TVL
      if (opp.tvl > 10000000) {
        pros.push(`High TVL: $${(opp.tvl / 1000000).toFixed(1)}M`);
        score += 10;
      } else if (opp.tvl < 1000000) {
        cons.push(`Low TVL: $${(opp.tvl / 1000000).toFixed(2)}M`);
        score -= 15;
      }

      // Analyze pool type
      if (opp.poolType === 'single') {
        pros.push('No impermanent loss risk');
        score += 10;
      } else if (opp.poolType === 'lp') {
        cons.push('Impermanent loss risk');
        score -= 5;
      }

      // Analyze lock period
      if (opp.lockPeriod === undefined || opp.lockPeriod === 0) {
        pros.push('No lock period - full liquidity');
        score += 5;
      } else if (opp.lockPeriod > 90) {
        cons.push(`Long lock: ${opp.lockPeriod} days`);
        score -= 10;
      }

      // Analyze fees
      const totalFees = opp.fees.deposit + opp.fees.withdrawal + opp.fees.performance;
      if (totalFees < 2) {
        pros.push('Low fees');
        score += 5;
      } else if (totalFees > 5) {
        cons.push('High fees');
        score -= 10;
      }

      // Generate recommendation
      let recommendation = '';
      if (score >= 70) {
        recommendation = 'Highly Recommended - Great risk-reward ratio';
      } else if (score >= 50) {
        recommendation = 'Good option - Consider for diversification';
      } else if (score >= 30) {
        recommendation = 'Proceed with caution - Higher risk';
      } else {
        recommendation = 'Not recommended - Risk outweighs reward';
      }

      return {
        opportunity: opp,
        score: Math.min(100, Math.max(0, score)),
        pros,
        cons,
        recommendation,
      };
    }).sort((a, b) => b.score - a.score);
  }

  // Private helper methods
  private calculateRiskAdjustedAPY(
    opp: YieldOpportunity,
    riskTolerance: 'low' | 'medium' | 'high'
  ): number {
    let adjustedAPY = opp.apy;

    // Adjust for TVL risk
    if (opp.tvl < 1000000) {
      adjustedAPY *= 0.7; // 30% penalty
    } else if (opp.tvl < 10000000) {
      adjustedAPY *= 0.85; // 15% penalty
    }

    // Adjust for IL risk
    if (opp.poolType === 'lp') {
      adjustedAPY *= riskTolerance === 'low' ? 0.6 : riskTolerance === 'medium' ? 0.8 : 0.9;
    }

    // Adjust for lock period
    if (opp.lockPeriod && opp.lockPeriod > 30) {
      adjustedAPY *= 0.9;
    }

    // Adjust for fees
    const totalFees = opp.fees.deposit + opp.fees.withdrawal + opp.fees.performance;
    adjustedAPY -= totalFees;

    return adjustedAPY;
  }

  private createStablecoinStrategy(
    opportunities: YieldOpportunity[],
    capital: number
  ): Strategy {
    const stableOpps = opportunities.filter(opp => 
      opp.poolType === 'single' || 
      (opp.token0.includes('USD') && opp.token1?.includes('USD'))
    ).sort((a, b) => b.apy - a.apy).slice(0, 3);

    const allocation = new Map<string, number>();
    const split = 100 / stableOpps.length;
    stableOpps.forEach(opp => allocation.set(opp.pool, split));

    const avgAPY = stableOpps.reduce((sum, opp) => sum + opp.apy, 0) / stableOpps.length;
    const estimatedGasCosts = this.estimateGasCosts(stableOpps.length);

    return {
      name: 'Stablecoin Farming',
      description: 'Low-risk strategy focused on stablecoins with predictable returns',
      opportunities: stableOpps,
      expectedAPY: avgAPY,
      riskScore: 20,
      allocation,
      estimatedGasCosts,
      netAPY: avgAPY - (estimatedGasCosts / capital) * 100,
      complexity: 'simple',
    };
  }

  private createBlueChipStrategy(
    opportunities: YieldOpportunity[],
    capital: number
  ): Strategy {
    const blueChipTokens = ['ETH', 'WETH', 'BTC', 'WBTC'];
    const blueChipOpps = opportunities.filter(opp =>
      blueChipTokens.some(token => opp.token0.includes(token))
    ).sort((a, b) => b.apy - a.apy).slice(0, 3);

    const allocation = new Map<string, number>();
    const split = 100 / blueChipOpps.length;
    blueChipOpps.forEach(opp => allocation.set(opp.pool, split));

    const avgAPY = blueChipOpps.reduce((sum, opp) => sum + opp.apy, 0) / blueChipOpps.length;
    const estimatedGasCosts = this.estimateGasCosts(blueChipOpps.length);

    return {
      name: 'Blue Chip Farming',
      description: 'Medium-risk strategy with established tokens',
      opportunities: blueChipOpps,
      expectedAPY: avgAPY,
      riskScore: 40,
      allocation,
      estimatedGasCosts,
      netAPY: avgAPY - (estimatedGasCosts / capital) * 100,
      complexity: 'moderate',
    };
  }

  private createHighYieldStrategy(
    opportunities: YieldOpportunity[],
    capital: number
  ): Strategy {
    const highYieldOpps = opportunities
      .filter(opp => opp.apy > 50)
      .sort((a, b) => b.apy - a.apy)
      .slice(0, 3);

    const allocation = new Map<string, number>();
    const split = 100 / highYieldOpps.length;
    highYieldOpps.forEach(opp => allocation.set(opp.pool, split));

    const avgAPY = highYieldOpps.reduce((sum, opp) => sum + opp.apy, 0) / highYieldOpps.length;
    const estimatedGasCosts = this.estimateGasCosts(highYieldOpps.length);

    return {
      name: 'High Yield Farming',
      description: 'High-risk, high-reward strategy for maximum returns',
      opportunities: highYieldOpps,
      expectedAPY: avgAPY,
      riskScore: 80,
      allocation,
      estimatedGasCosts,
      netAPY: avgAPY - (estimatedGasCosts / capital) * 100,
      complexity: 'complex',
    };
  }

  private createDiversifiedStrategy(
    opportunities: YieldOpportunity[],
    capital: number
  ): Strategy {
    // Select top opportunities across different categories
    const selected = opportunities
      .sort((a, b) => this.calculateRiskAdjustedAPY(b, 'medium') - 
                      this.calculateRiskAdjustedAPY(a, 'medium'))
      .slice(0, 5);

    const allocation = new Map<string, number>();
    const split = 100 / selected.length;
    selected.forEach(opp => allocation.set(opp.pool, split));

    const avgAPY = selected.reduce((sum, opp) => sum + opp.apy, 0) / selected.length;
    const estimatedGasCosts = this.estimateGasCosts(selected.length);

    return {
      name: 'Diversified Farming',
      description: 'Balanced strategy spreading risk across multiple opportunities',
      opportunities: selected,
      expectedAPY: avgAPY,
      riskScore: 50,
      allocation,
      estimatedGasCosts,
      netAPY: avgAPY - (estimatedGasCosts / capital) * 100,
      complexity: 'moderate',
    };
  }

  private createVaultStrategy(
    opportunities: YieldOpportunity[],
    capital: number
  ): Strategy {
    const vaultOpps = opportunities
      .filter(opp => opp.poolType === 'vault')
      .sort((a, b) => b.apy - a.apy)
      .slice(0, 3);

    const allocation = new Map<string, number>();
    const split = 100 / vaultOpps.length;
    vaultOpps.forEach(opp => allocation.set(opp.pool, split));

    const avgAPY = vaultOpps.reduce((sum, opp) => sum + opp.apy, 0) / vaultOpps.length;
    const estimatedGasCosts = this.estimateGasCosts(vaultOpps.length) * 0.5; // Vaults save gas

    return {
      name: 'Auto-Compounding Vaults',
      description: 'Passive strategy with automated compounding',
      opportunities: vaultOpps,
      expectedAPY: avgAPY,
      riskScore: 35,
      allocation,
      estimatedGasCosts,
      netAPY: avgAPY - (estimatedGasCosts / capital) * 100,
      complexity: 'simple',
    };
  }

  private estimateGasCosts(numberOfPools: number): number {
    const gasPriceWei = this.GAS_PRICE_GWEI * 1e9;
    const gasPerTx = 150000; // Average gas for yield farming tx
    const txPerYear = numberOfPools * 12; // Monthly compounding
    
    return (gasPriceWei * gasPerTx * txPerYear * this.ETH_PRICE_USD) / 1e18;
  }
}

// Export singleton instance
export const yieldOptimizer = new YieldOptimizer();

