/**
 * Cross-Chain Arbitrage Finder - Identifies profitable arbitrage opportunities
 * across different blockchains and DEXs with route optimization
 */

interface TokenPrice {
  token: string;
  symbol: string;
  price: number;
  liquidity: number;
  exchange: string;
  chain: string;
  timestamp: number;
}

interface ArbitrageRoute {
  id: string;
  buyExchange: string;
  buyChain: string;
  buyPrice: number;
  sellExchange: string;
  sellChain: string;
  sellPrice: number;
  token: string;
  grossProfit: number;
  grossProfitPercent: number;
  estimatedCosts: {
    buyGas: number;
    bridgeGas: number;
    sellGas: number;
    bridgeFee: number;
    slippage: number;
    total: number;
  };
  netProfit: number;
  netProfitPercent: number;
  executionTime: number; // seconds
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}

interface OptimizedPath {
  steps: Array<{
    action: 'buy' | 'bridge' | 'sell';
    exchange: string;
    chain: string;
    amount: number;
    expectedPrice: number;
    estimatedGas: number;
  }>;
  totalProfit: number;
  totalCost: number;
  totalTime: number;
  roi: number;
}

interface BridgeRoute {
  from: string;
  to: string;
  protocol: string;
  estimatedTime: number; // seconds
  estimatedCost: number;
  reliability: number; // 0-100
}

interface LiquidityPool {
  exchange: string;
  chain: string;
  token0: string;
  token1: string;
  reserve0: number;
  reserve1: number;
  tvl: number;
  volume24h: number;
}

export class CrossChainArbitrageFinder {
  private readonly MIN_PROFIT_PERCENT = 0.5; // 0.5% minimum profit
  private readonly MAX_SLIPPAGE_PERCENT = 1; // 1% max acceptable slippage
  private readonly GAS_PRICES = {
    ethereum: 30,    // gwei
    arbitrum: 0.1,
    optimism: 0.1,
    base: 0.1,
    polygon: 50,
    bsc: 3,
  };
  private readonly ETH_PRICE = 2000; // USD

  /**
   * Find all profitable arbitrage opportunities across chains
   */
  findOpportunities(
    prices: TokenPrice[],
    bridges: BridgeRoute[],
    minProfitUSD: number = 50
  ): ArbitrageRoute[] {
    const opportunities: ArbitrageRoute[] = [];

    // Group prices by token
    const pricesByToken = new Map<string, TokenPrice[]>();
    prices.forEach(price => {
      if (!pricesByToken.has(price.token)) {
        pricesByToken.set(price.token, []);
      }
      pricesByToken.get(price.token)!.push(price);
    });

    // Find arbitrage opportunities for each token
    pricesByToken.forEach((tokenPrices, token) => {
      // Compare all price pairs
      for (let i = 0; i < tokenPrices.length; i++) {
        for (let j = i + 1; j < tokenPrices.length; j++) {
          const price1 = tokenPrices[i];
          const price2 = tokenPrices[j];

          // Check both directions
          const opp1 = this.calculateArbitrage(price1, price2, bridges);
          const opp2 = this.calculateArbitrage(price2, price1, bridges);

          if (opp1 && opp1.netProfit >= minProfitUSD) {
            opportunities.push(opp1);
          }
          if (opp2 && opp2.netProfit >= minProfitUSD) {
            opportunities.push(opp2);
          }
        }
      }
    });

    return opportunities
      .filter(opp => opp.netProfitPercent >= this.MIN_PROFIT_PERCENT)
      .sort((a, b) => b.netProfit - a.netProfit);
  }

  /**
   * Calculate optimal trade size for an arbitrage opportunity
   */
  calculateOptimalSize(
    route: ArbitrageRoute,
    availableCapital: number,
    liquidityPools: LiquidityPool[]
  ): {
    optimalSize: number;
    expectedProfit: number;
    priceImpact: number;
    recommendation: string;
  } {
    // Find liquidity pools for this route
    const buyPool = liquidityPools.find(
      pool => pool.exchange === route.buyExchange && pool.chain === route.buyChain
    );
    const sellPool = liquidityPools.find(
      pool => pool.exchange === route.sellExchange && pool.chain === route.sellChain
    );

    if (!buyPool || !sellPool) {
      return {
        optimalSize: 0,
        expectedProfit: 0,
        priceImpact: 0,
        recommendation: 'Insufficient liquidity data',
      };
    }

    // Calculate maximum trade size based on liquidity
    const maxBuySize = buyPool.tvl * 0.01; // Max 1% of pool TVL
    const maxSellSize = sellPool.tvl * 0.01;
    const maxSize = Math.min(maxBuySize, maxSellSize, availableCapital);

    // Calculate price impact at different sizes
    const sizes = [];
    for (let size = maxSize * 0.1; size <= maxSize; size += maxSize * 0.1) {
      sizes.push(size);
    }

    let optimalSize = 0;
    let maxProfit = 0;

    sizes.forEach(size => {
      const buyImpact = this.calculatePriceImpact(size, buyPool.tvl);
      const sellImpact = this.calculatePriceImpact(size, sellPool.tvl);
      
      const effectiveBuyPrice = route.buyPrice * (1 + buyImpact);
      const effectiveSellPrice = route.sellPrice * (1 - sellImpact);
      
      const grossProfit = (effectiveSellPrice - effectiveBuyPrice) * size;
      const costs = route.estimatedCosts.total;
      const netProfit = grossProfit - costs;

      if (netProfit > maxProfit) {
        maxProfit = netProfit;
        optimalSize = size;
      }
    });

    const finalBuyImpact = this.calculatePriceImpact(optimalSize, buyPool.tvl);
    const finalSellImpact = this.calculatePriceImpact(optimalSize, sellPool.tvl);
    const avgImpact = (finalBuyImpact + finalSellImpact) / 2;

    let recommendation = '';
    if (optimalSize < availableCapital * 0.3) {
      recommendation = 'Limited by liquidity. Consider splitting into multiple trades.';
    } else if (avgImpact > 0.5) {
      recommendation = 'High price impact. Reduce size or find deeper pools.';
    } else {
      recommendation = 'Good opportunity. Execute at suggested size.';
    }

    return {
      optimalSize,
      expectedProfit: maxProfit,
      priceImpact: avgImpact * 100,
      recommendation,
    };
  }

  /**
   * Find multi-hop arbitrage paths (triangular/cyclic arbitrage)
   */
  findMultiHopArbitrage(
    prices: TokenPrice[],
    maxHops: number = 3
  ): Array<{
    path: string[];
    profit: number;
    profitPercent: number;
    complexity: number;
  }> {
    const opportunities: Array<{
      path: string[];
      profit: number;
      profitPercent: number;
      complexity: number;
    }> = [];

    // Build price graph
    const graph = this.buildPriceGraph(prices);

    // Find all cycles up to maxHops
    const cycles = this.findCycles(graph, maxHops);

    cycles.forEach(cycle => {
      const profit = this.calculateCycleProfit(cycle, graph);
      if (profit > 0) {
        opportunities.push({
          path: cycle,
          profit,
          profitPercent: profit * 100,
          complexity: cycle.length,
        });
      }
    });

    return opportunities.sort((a, b) => b.profit - a.profit);
  }

  /**
   * Estimate gas costs for arbitrage execution
   */
  estimateGasCosts(
    chain: string,
    operations: Array<'swap' | 'bridge' | 'approve'>
  ): number {
    const gasPrice = this.GAS_PRICES[chain.toLowerCase() as keyof typeof this.GAS_PRICES] || 20;
    
    const gasUnits = {
      swap: 150000,
      bridge: 200000,
      approve: 50000,
    };

    const totalGas = operations.reduce(
      (sum, op) => sum + gasUnits[op],
      0
    );

    // Convert to USD
    return (gasPrice * totalGas * this.ETH_PRICE) / 1e18;
  }

  /**
   * Calculate execution time for arbitrage route
   */
  calculateExecutionTime(
    route: ArbitrageRoute,
    bridges: BridgeRoute[]
  ): {
    minTime: number;
    maxTime: number;
    averageTime: number;
  } {
    let minTime = 0;
    let maxTime = 0;

    // Add swap times (typically fast)
    minTime += 30; // 30 seconds per swap
    maxTime += 120; // 2 minutes per swap

    // Add bridge time if cross-chain
    if (route.buyChain !== route.sellChain) {
      const bridge = bridges.find(
        b => b.from === route.buyChain && b.to === route.sellChain
      );
      
      if (bridge) {
        minTime += bridge.estimatedTime * 0.8;
        maxTime += bridge.estimatedTime * 1.5;
      } else {
        // Default bridge estimates
        minTime += 180; // 3 minutes
        maxTime += 600; // 10 minutes
      }
    }

    return {
      minTime,
      maxTime,
      averageTime: (minTime + maxTime) / 2,
    };
  }

  /**
   * Assess risk level of an arbitrage opportunity
   */
  assessRisk(
    route: ArbitrageRoute,
    liquidityPools: LiquidityPool[]
  ): {
    overall: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{
      factor: string;
      risk: 'low' | 'medium' | 'high';
      description: string;
    }>;
    score: number; // 0-100, lower is better
  } {
    const factors: Array<{
      factor: string;
      risk: 'low' | 'medium' | 'high';
      description: string;
    }> = [];

    let riskScore = 0;

    // Check liquidity risk
    const buyPool = liquidityPools.find(
      p => p.exchange === route.buyExchange && p.chain === route.buyChain
    );
    const sellPool = liquidityPools.find(
      p => p.exchange === route.sellExchange && p.chain === route.sellChain
    );

    if (buyPool && buyPool.tvl < 100000) {
      factors.push({
        factor: 'Buy Pool Liquidity',
        risk: 'high',
        description: 'Low liquidity on buy side increases price impact risk',
      });
      riskScore += 30;
    }

    if (sellPool && sellPool.tvl < 100000) {
      factors.push({
        factor: 'Sell Pool Liquidity',
        risk: 'high',
        description: 'Low liquidity on sell side increases price impact risk',
      });
      riskScore += 30;
    }

    // Check execution time risk
    if (route.executionTime > 300) {
      factors.push({
        factor: 'Execution Time',
        risk: 'medium',
        description: 'Long execution time increases price movement risk',
      });
      riskScore += 15;
    }

    // Check chain risk
    if (route.buyChain !== route.sellChain) {
      factors.push({
        factor: 'Cross-Chain',
        risk: 'medium',
        description: 'Cross-chain trades have bridge failure risk',
      });
      riskScore += 20;
    }

    // Check profit margin risk
    if (route.netProfitPercent < 2) {
      factors.push({
        factor: 'Profit Margin',
        risk: 'high',
        description: 'Thin margins leave little room for slippage',
      });
      riskScore += 25;
    }

    let overall: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore < 30) overall = 'low';
    else if (riskScore < 50) overall = 'medium';
    else if (riskScore < 80) overall = 'high';
    else overall = 'critical';

    return {
      overall,
      factors,
      score: riskScore,
    };
  }

  /**
   * Monitor arbitrage opportunity for execution timing
   */
  monitorOpportunity(
    route: ArbitrageRoute,
    currentPrices: TokenPrice[]
  ): {
    stillProfitable: boolean;
    currentProfit: number;
    priceChange: number;
    recommendation: 'execute' | 'wait' | 'abandon';
    reason: string;
  } {
    // Find current prices
    const currentBuyPrice = currentPrices.find(
      p => p.exchange === route.buyExchange && 
           p.chain === route.buyChain &&
           p.token === route.token
    );

    const currentSellPrice = currentPrices.find(
      p => p.exchange === route.sellExchange && 
           p.chain === route.sellChain &&
           p.token === route.token
    );

    if (!currentBuyPrice || !currentSellPrice) {
      return {
        stillProfitable: false,
        currentProfit: 0,
        priceChange: 0,
        recommendation: 'abandon',
        reason: 'Price data unavailable',
      };
    }

    const grossProfit = (currentSellPrice.price - currentBuyPrice.price) * 100;
    const currentNetProfit = grossProfit - route.estimatedCosts.total;
    const priceChange = ((currentBuyPrice.price - route.buyPrice) / route.buyPrice) * 100;

    const stillProfitable = currentNetProfit > 0;

    let recommendation: 'execute' | 'wait' | 'abandon';
    let reason = '';

    if (!stillProfitable) {
      recommendation = 'abandon';
      reason = 'Opportunity no longer profitable';
    } else if (currentNetProfit > route.netProfit * 1.1) {
      recommendation = 'execute';
      reason = 'Profit increased, execute now';
    } else if (priceChange > 5) {
      recommendation = 'abandon';
      reason = 'Significant price movement against position';
    } else if (currentNetProfit > route.netProfit * 0.8) {
      recommendation = 'execute';
      reason = 'Still profitable, execute before window closes';
    } else {
      recommendation = 'wait';
      reason = 'Monitor for price improvement';
    }

    return {
      stillProfitable,
      currentProfit: currentNetProfit,
      priceChange,
      recommendation,
      reason,
    };
  }

  // Private helper methods
  private calculateArbitrage(
    buyPrice: TokenPrice,
    sellPrice: TokenPrice,
    bridges: BridgeRoute[]
  ): ArbitrageRoute | null {
    const grossProfit = sellPrice.price - buyPrice.price;
    const grossProfitPercent = (grossProfit / buyPrice.price) * 100;

    // Calculate costs
    const buyGas = this.estimateGasCosts(buyPrice.chain, ['approve', 'swap']);
    const sellGas = this.estimateGasCosts(sellPrice.chain, ['swap']);
    
    let bridgeGas = 0;
    let bridgeFee = 0;
    let executionTime = 60; // 1 minute for same-chain

    if (buyPrice.chain !== sellPrice.chain) {
      const bridge = bridges.find(
        b => b.from === buyPrice.chain && b.to === sellPrice.chain
      );
      
      if (bridge) {
        bridgeGas = bridge.estimatedCost;
        bridgeFee = buyPrice.price * 0.001; // 0.1% bridge fee
        executionTime = bridge.estimatedTime;
      } else {
        return null; // No bridge available
      }
    }

    const slippage = (buyPrice.price + sellPrice.price) * (this.MAX_SLIPPAGE_PERCENT / 100);
    const totalCosts = buyGas + bridgeGas + sellGas + bridgeFee + slippage;

    const netProfit = grossProfit - totalCosts;
    const netProfitPercent = (netProfit / buyPrice.price) * 100;

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (buyPrice.chain === sellPrice.chain && buyPrice.liquidity > 100000) {
      riskLevel = 'low';
    } else if (buyPrice.chain !== sellPrice.chain || buyPrice.liquidity < 50000) {
      riskLevel = 'high';
    } else {
      riskLevel = 'medium';
    }

    // Calculate confidence based on liquidity and price freshness
    const liquidityConfidence = Math.min((buyPrice.liquidity / 1000000) * 100, 100);
    const freshnessConfidence = Date.now() - buyPrice.timestamp < 60000 ? 100 : 70;
    const confidence = (liquidityConfidence + freshnessConfidence) / 2;

    return {
      id: `${buyPrice.exchange}-${sellPrice.exchange}-${buyPrice.token}-${Date.now()}`,
      buyExchange: buyPrice.exchange,
      buyChain: buyPrice.chain,
      buyPrice: buyPrice.price,
      sellExchange: sellPrice.exchange,
      sellChain: sellPrice.chain,
      sellPrice: sellPrice.price,
      token: buyPrice.token,
      grossProfit,
      grossProfitPercent,
      estimatedCosts: {
        buyGas,
        bridgeGas,
        sellGas,
        bridgeFee,
        slippage,
        total: totalCosts,
      },
      netProfit,
      netProfitPercent,
      executionTime,
      riskLevel,
      confidence,
    };
  }

  private calculatePriceImpact(tradeSize: number, poolTVL: number): number {
    // Simplified constant product formula impact
    // Real implementation would use actual pool reserves
    const impactFactor = tradeSize / poolTVL;
    return impactFactor * 0.5; // 50% of the size ratio as impact
  }

  private buildPriceGraph(prices: TokenPrice[]): Map<string, Map<string, number>> {
    const graph = new Map<string, Map<string, number>>();

    prices.forEach(price => {
      const key = `${price.token}-${price.exchange}-${price.chain}`;
      if (!graph.has(key)) {
        graph.set(key, new Map());
      }

      // Connect to all other instances of the same token
      prices
        .filter(p => p.token === price.token && p.exchange !== price.exchange)
        .forEach(other => {
          const otherKey = `${other.token}-${other.exchange}-${other.chain}`;
          const rate = other.price / price.price;
          graph.get(key)!.set(otherKey, rate);
        });
    });

    return graph;
  }

  private findCycles(
    graph: Map<string, Map<string, number>>,
    maxLength: number
  ): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();

    const dfs = (node: string, path: string[], pathSet: Set<string>) => {
      if (path.length > maxLength) return;

      visited.add(node);
      pathSet.add(node);

      const neighbors = graph.get(node);
      if (neighbors) {
        neighbors.forEach((rate, neighbor) => {
          if (neighbor === path[0] && path.length >= 3) {
            // Found a cycle
            cycles.push([...path]);
          } else if (!pathSet.has(neighbor)) {
            dfs(neighbor, [...path, neighbor], new Set(pathSet));
          }
        });
      }

      pathSet.delete(node);
    };

    graph.forEach((_, node) => {
      if (!visited.has(node)) {
        dfs(node, [node], new Set([node]));
      }
    });

    return cycles;
  }

  private calculateCycleProfit(
    cycle: string[],
    graph: Map<string, Map<string, number>>
  ): number {
    let product = 1;

    for (let i = 0; i < cycle.length; i++) {
      const current = cycle[i];
      const next = cycle[(i + 1) % cycle.length];
      const rate = graph.get(current)?.get(next) || 0;
      product *= rate;
    }

    return product - 1; // Profit as decimal (e.g., 0.05 = 5%)
  }
}

// Export singleton instance
export const crossChainArbitrageFinder = new CrossChainArbitrageFinder();

