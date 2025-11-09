/**
 * Portfolio Optimizer - Analyzes portfolio allocation and suggests optimal rebalancing
 * Uses Modern Portfolio Theory and risk-adjusted return metrics
 */

interface Asset {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  allocation: number; // percentage
  expectedReturn: number; // annualized %
  volatility: number; // standard deviation
  sharpeRatio: number;
}

interface PortfolioMetrics {
  totalValue: number;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  diversificationRatio: number;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
}

interface RebalancingAction {
  asset: string;
  currentAllocation: number;
  targetAllocation: number;
  action: 'buy' | 'sell' | 'hold';
  amount: number;
  valueChange: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface OptimizationStrategy {
  name: string;
  description: string;
  targetAllocations: Map<string, number>;
  expectedReturn: number;
  expectedVolatility: number;
  sharpeRatio: number;
}

export class PortfolioOptimizer {
  private readonly RISK_FREE_RATE = 4.5; // 4.5% annual risk-free rate
  private readonly REBALANCE_THRESHOLD = 5; // 5% deviation triggers rebalance

  /**
   * Analyze current portfolio and calculate key metrics
   */
  analyzePortfolio(assets: Asset[]): PortfolioMetrics {
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);

    // Calculate portfolio expected return (weighted average)
    const expectedReturn = assets.reduce(
      (sum, a) => sum + (a.expectedReturn * a.allocation) / 100,
      0
    );

    // Calculate portfolio volatility (simplified - assumes no correlation)
    const variance = assets.reduce(
      (sum, a) => sum + Math.pow((a.volatility * a.allocation) / 100, 2),
      0
    );
    const volatility = Math.sqrt(variance);

    // Calculate Sharpe Ratio
    const sharpeRatio = (expectedReturn - this.RISK_FREE_RATE) / volatility;

    // Calculate diversification ratio (effective number of assets)
    const diversificationRatio = this.calculateDiversificationRatio(assets);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(volatility, assets);

    return {
      totalValue,
      expectedReturn,
      volatility,
      sharpeRatio,
      diversificationRatio,
      riskLevel,
    };
  }

  /**
   * Generate optimal portfolio allocation strategies
   */
  generateStrategies(assets: Asset[]): OptimizationStrategy[] {
    const strategies: OptimizationStrategy[] = [];

    // Strategy 1: Maximum Sharpe Ratio (Optimal Risk-Adjusted Returns)
    strategies.push(this.maximizeSharpeRatio(assets));

    // Strategy 2: Minimum Volatility (Conservative)
    strategies.push(this.minimizeVolatility(assets));

    // Strategy 3: Maximum Return (Aggressive)
    strategies.push(this.maximizeReturn(assets));

    // Strategy 4: Equal Weight (Balanced)
    strategies.push(this.equalWeight(assets));

    // Strategy 5: Risk Parity (Risk-Balanced)
    strategies.push(this.riskParity(assets));

    return strategies;
  }

  /**
   * Calculate rebalancing actions needed to reach target allocation
   */
  calculateRebalancing(
    currentAssets: Asset[],
    targetAllocations: Map<string, number>,
    totalValue: number
  ): RebalancingAction[] {
    const actions: RebalancingAction[] = [];

    currentAssets.forEach(asset => {
      const currentAllocation = asset.allocation;
      const targetAllocation = targetAllocations.get(asset.symbol) || 0;
      const difference = targetAllocation - currentAllocation;

      if (Math.abs(difference) >= this.REBALANCE_THRESHOLD) {
        const valueChange = (difference / 100) * totalValue;
        const amount = Math.abs(valueChange / asset.price);

        let action: 'buy' | 'sell' | 'hold' = 'hold';
        let priority: 'high' | 'medium' | 'low' = 'medium';
        let reason = '';

        if (difference > 0) {
          action = 'buy';
          reason = `Increase allocation by ${difference.toFixed(2)}% to improve diversification`;
          priority = difference > 10 ? 'high' : 'medium';
        } else {
          action = 'sell';
          reason = `Reduce allocation by ${Math.abs(difference).toFixed(2)}% to rebalance portfolio`;
          priority = Math.abs(difference) > 10 ? 'high' : 'medium';
        }

        actions.push({
          asset: asset.symbol,
          currentAllocation,
          targetAllocation,
          action,
          amount,
          valueChange,
          reason,
          priority,
        });
      }
    });

    return actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Assess portfolio risk and provide warnings
   */
  assessRisks(assets: Asset[], metrics: PortfolioMetrics): Array<{
    type: 'warning' | 'critical';
    message: string;
    recommendation: string;
  }> {
    const risks: Array<{
      type: 'warning' | 'critical';
      message: string;
      recommendation: string;
    }> = [];

    // Check for over-concentration
    const maxAllocation = Math.max(...assets.map(a => a.allocation));
    if (maxAllocation > 50) {
      risks.push({
        type: 'critical',
        message: `Over-concentrated: ${maxAllocation.toFixed(1)}% in single asset`,
        recommendation: 'Diversify to reduce concentration risk. No single asset should exceed 30-40%',
      });
    }

    // Check for extreme volatility
    if (metrics.volatility > 60) {
      risks.push({
        type: 'critical',
        message: `Extremely high volatility: ${metrics.volatility.toFixed(1)}%`,
        recommendation: 'Add stable assets (stablecoins, blue-chip tokens) to reduce portfolio volatility',
      });
    }

    // Check for negative Sharpe Ratio
    if (metrics.sharpeRatio < 0) {
      risks.push({
        type: 'warning',
        message: 'Negative risk-adjusted returns',
        recommendation: 'Consider reallocating to assets with better risk-adjusted returns',
      });
    }

    // Check for poor diversification
    if (metrics.diversificationRatio < 3 && assets.length > 5) {
      risks.push({
        type: 'warning',
        message: 'Poor diversification despite multiple holdings',
        recommendation: 'Reduce correlated assets and increase allocation to uncorrelated investments',
      });
    }

    // Check for too many small positions
    const smallPositions = assets.filter(a => a.allocation < 2);
    if (smallPositions.length > 5) {
      risks.push({
        type: 'warning',
        message: `${smallPositions.length} positions below 2% allocation`,
        recommendation: 'Consolidate small positions to reduce complexity and transaction costs',
      });
    }

    // Check for high risk level with low expected return
    if (metrics.riskLevel === 'high' && metrics.expectedReturn < 15) {
      risks.push({
        type: 'warning',
        message: 'High risk with insufficient expected returns',
        recommendation: 'Either reduce risk or seek higher-return opportunities to justify the risk',
      });
    }

    return risks;
  }

  /**
   * Calculate optimal position sizing using Kelly Criterion
   */
  calculateOptimalPositionSize(
    winRate: number,
    avgWin: number,
    avgLoss: number,
    currentBankroll: number
  ): {
    kellyPercentage: number;
    recommendedSize: number;
    conservative: number;
    explanation: string;
  } {
    // Kelly Criterion: f* = (p * b - q) / b
    // where p = win probability, q = loss probability, b = win/loss ratio
    const b = avgWin / avgLoss;
    const p = winRate / 100;
    const q = 1 - p;

    let kellyPercentage = (p * b - q) / b;
    kellyPercentage = Math.max(0, Math.min(kellyPercentage, 0.25)); // Cap at 25%

    // Fractional Kelly for safety (use 25-50% of Kelly)
    const conservative = kellyPercentage * 0.5;

    const recommendedSize = currentBankroll * conservative;

    let explanation = '';
    if (kellyPercentage <= 0) {
      explanation = 'Negative edge detected. Do not take this position.';
    } else if (kellyPercentage > 0.2) {
      explanation = 'Strong edge detected but position size capped for risk management.';
    } else {
      explanation = 'Moderate edge. Position size calculated for optimal growth.';
    }

    return {
      kellyPercentage: kellyPercentage * 100,
      recommendedSize,
      conservative: conservative * 100,
      explanation,
    };
  }

  /**
   * Detect arbitrage opportunities across different chains/DEXs
   */
  detectArbitrageOpportunities(
    pricesByExchange: Map<string, Map<string, number>>
  ): Array<{
    asset: string;
    buyExchange: string;
    sellExchange: string;
    buyPrice: number;
    sellPrice: number;
    profit: number;
    profitPercentage: number;
  }> {
    const opportunities: Array<{
      asset: string;
      buyExchange: string;
      sellExchange: string;
      buyPrice: number;
      sellPrice: number;
      profit: number;
      profitPercentage: number;
    }> = [];

    const exchanges = Array.from(pricesByExchange.keys());

    // Compare prices across all exchange pairs
    for (let i = 0; i < exchanges.length; i++) {
      for (let j = i + 1; j < exchanges.length; j++) {
        const exchange1 = exchanges[i];
        const exchange2 = exchanges[j];
        const prices1 = pricesByExchange.get(exchange1)!;
        const prices2 = pricesByExchange.get(exchange2)!;

        // Find common assets
        prices1.forEach((price1, asset) => {
          const price2 = prices2.get(asset);
          if (price2) {
            const priceDiff = Math.abs(price1 - price2);
            const profitPercentage = (priceDiff / Math.min(price1, price2)) * 100;

            // Only consider opportunities > 0.5% profit (to cover fees)
            if (profitPercentage > 0.5) {
              const buyPrice = Math.min(price1, price2);
              const sellPrice = Math.max(price1, price2);
              const buyExchange = price1 < price2 ? exchange1 : exchange2;
              const sellExchange = price1 < price2 ? exchange2 : exchange1;

              opportunities.push({
                asset,
                buyExchange,
                sellExchange,
                buyPrice,
                sellPrice,
                profit: priceDiff,
                profitPercentage,
              });
            }
          }
        });
      }
    }

    return opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
  }

  // Private helper methods
  private calculateDiversificationRatio(assets: Asset[]): number {
    // Calculate effective number of assets using inverse HHI
    const hhi = assets.reduce((sum, a) => {
      return sum + Math.pow(a.allocation / 100, 2);
    }, 0);

    return 1 / hhi;
  }

  private determineRiskLevel(
    volatility: number,
    assets: Asset[]
  ): 'low' | 'medium' | 'high' | 'extreme' {
    const avgVolatility = assets.reduce((sum, a) => sum + a.volatility, 0) / assets.length;

    if (volatility < 20) return 'low';
    if (volatility < 40) return 'medium';
    if (volatility < 60) return 'high';
    return 'extreme';
  }

  private maximizeSharpeRatio(assets: Asset[]): OptimizationStrategy {
    // Simplified optimization: weight by Sharpe ratio
    const totalSharpe = assets.reduce((sum, a) => sum + Math.max(a.sharpeRatio, 0), 0);
    const allocations = new Map<string, number>();

    assets.forEach(asset => {
      const weight = Math.max(asset.sharpeRatio, 0) / totalSharpe;
      allocations.set(asset.symbol, weight * 100);
    });

    const expectedReturn = this.calculateExpectedReturn(assets, allocations);
    const expectedVolatility = this.calculateExpectedVolatility(assets, allocations);
    const sharpeRatio = (expectedReturn - this.RISK_FREE_RATE) / expectedVolatility;

    return {
      name: 'Maximum Sharpe Ratio',
      description: 'Optimizes for best risk-adjusted returns',
      targetAllocations: allocations,
      expectedReturn,
      expectedVolatility,
      sharpeRatio,
    };
  }

  private minimizeVolatility(assets: Asset[]): OptimizationStrategy {
    // Simplified: weight inversely by volatility
    const invVolSum = assets.reduce((sum, a) => sum + 1 / a.volatility, 0);
    const allocations = new Map<string, number>();

    assets.forEach(asset => {
      const weight = (1 / asset.volatility) / invVolSum;
      allocations.set(asset.symbol, weight * 100);
    });

    const expectedReturn = this.calculateExpectedReturn(assets, allocations);
    const expectedVolatility = this.calculateExpectedVolatility(assets, allocations);
    const sharpeRatio = (expectedReturn - this.RISK_FREE_RATE) / expectedVolatility;

    return {
      name: 'Minimum Volatility',
      description: 'Conservative strategy focused on capital preservation',
      targetAllocations: allocations,
      expectedReturn,
      expectedVolatility,
      sharpeRatio,
    };
  }

  private maximizeReturn(assets: Asset[]): OptimizationStrategy {
    // Weight by expected return
    const totalReturn = assets.reduce((sum, a) => sum + a.expectedReturn, 0);
    const allocations = new Map<string, number>();

    assets.forEach(asset => {
      const weight = asset.expectedReturn / totalReturn;
      allocations.set(asset.symbol, weight * 100);
    });

    const expectedReturn = this.calculateExpectedReturn(assets, allocations);
    const expectedVolatility = this.calculateExpectedVolatility(assets, allocations);
    const sharpeRatio = (expectedReturn - this.RISK_FREE_RATE) / expectedVolatility;

    return {
      name: 'Maximum Return',
      description: 'Aggressive strategy prioritizing highest returns',
      targetAllocations: allocations,
      expectedReturn,
      expectedVolatility,
      sharpeRatio,
    };
  }

  private equalWeight(assets: Asset[]): OptimizationStrategy {
    const weight = 100 / assets.length;
    const allocations = new Map<string, number>();

    assets.forEach(asset => {
      allocations.set(asset.symbol, weight);
    });

    const expectedReturn = this.calculateExpectedReturn(assets, allocations);
    const expectedVolatility = this.calculateExpectedVolatility(assets, allocations);
    const sharpeRatio = (expectedReturn - this.RISK_FREE_RATE) / expectedVolatility;

    return {
      name: 'Equal Weight',
      description: 'Balanced approach with equal allocation to all assets',
      targetAllocations: allocations,
      expectedReturn,
      expectedVolatility,
      sharpeRatio,
    };
  }

  private riskParity(assets: Asset[]): OptimizationStrategy {
    // Allocate inversely proportional to volatility (equal risk contribution)
    const invVolSum = assets.reduce((sum, a) => sum + 1 / a.volatility, 0);
    const allocations = new Map<string, number>();

    assets.forEach(asset => {
      const weight = (1 / asset.volatility) / invVolSum;
      allocations.set(asset.symbol, weight * 100);
    });

    const expectedReturn = this.calculateExpectedReturn(assets, allocations);
    const expectedVolatility = this.calculateExpectedVolatility(assets, allocations);
    const sharpeRatio = (expectedReturn - this.RISK_FREE_RATE) / expectedVolatility;

    return {
      name: 'Risk Parity',
      description: 'Equalizes risk contribution from each asset',
      targetAllocations: allocations,
      expectedReturn,
      expectedVolatility,
      sharpeRatio,
    };
  }

  private calculateExpectedReturn(
    assets: Asset[],
    allocations: Map<string, number>
  ): number {
    return assets.reduce((sum, asset) => {
      const weight = allocations.get(asset.symbol) || 0;
      return sum + (asset.expectedReturn * weight) / 100;
    }, 0);
  }

  private calculateExpectedVolatility(
    assets: Asset[],
    allocations: Map<string, number>
  ): number {
    const variance = assets.reduce((sum, asset) => {
      const weight = allocations.get(asset.symbol) || 0;
      return sum + Math.pow((asset.volatility * weight) / 100, 2);
    }, 0);

    return Math.sqrt(variance);
  }
}

// Export singleton instance
export const portfolioOptimizer = new PortfolioOptimizer();

