/**
 * MEV Opportunity Detector - Identifies Maximal Extractable Value opportunities
 * Analyzes mempool, sandwich attacks, arbitrage, and liquidation opportunities
 */

interface PendingTransaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  gasPrice: number;
  maxFeePerGas?: number;
  maxPriorityFeePerGas?: number;
  data: string;
  nonce: number;
  timestamp: number;
}

interface SandwichOpportunity {
  targetTx: PendingTransaction;
  victimSlippage: number;
  frontrunTx: {
    action: 'buy';
    amount: number;
    expectedPrice: number;
    gasPrice: number;
  };
  backrunTx: {
    action: 'sell';
    amount: number;
    expectedPrice: number;
    gasPrice: number;
  };
  estimatedProfit: number;
  riskScore: number;
  confidence: number;
}

interface LiquidationOpportunity {
  protocol: string;
  borrower: string;
  collateralToken: string;
  collateralAmount: number;
  debtToken: string;
  debtAmount: number;
  healthFactor: number;
  liquidationBonus: number;
  estimatedProfit: number;
  gasEstimate: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

interface FlashLoanOpportunity {
  lender: string;
  token: string;
  availableAmount: number;
  fee: number;
  route: Array<{
    step: number;
    action: 'borrow' | 'swap' | 'arbitrage' | 'liquidate' | 'repay';
    protocol: string;
    expectedProfit: number;
  }>;
  totalProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface JITLiquidityOpportunity {
  pool: string;
  token0: string;
  token1: string;
  incomingSwap: {
    amount: number;
    direction: 'token0_to_token1' | 'token1_to_token0';
  };
  optimalLiquidity: {
    amount0: number;
    amount1: number;
    priceRange: { lower: number; upper: number };
  };
  expectedFees: number;
  windowDuration: number; // seconds
}

export class MEVOpportunityDetector {
  private readonly MIN_PROFIT_USD = 100;
  private readonly MAX_GAS_PRICE_GWEI = 500;
  private readonly SANDWICH_SLIPPAGE_THRESHOLD = 1; // 1%

  /**
   * Detect sandwich attack opportunities in pending transactions
   */
  detectSandwichOpportunities(
    pendingTxs: PendingTransaction[],
    currentPrices: Map<string, number>
  ): SandwichOpportunity[] {
    const opportunities: SandwichOpportunity[] = [];

    // Filter for large swaps
    const largSwaps = pendingTxs.filter(tx => 
      this.isSwapTransaction(tx) && 
      tx.value > 10000 // $10k+
    );

    largeSwaps.forEach(targetTx => {
      const sandwichOpp = this.calculateSandwichProfit(targetTx, currentPrices);
      
      if (sandwichOpp && sandwichOpp.estimatedProfit > this.MIN_PROFIT_USD) {
        opportunities.push(sandwichOpp);
      }
    });

    return opportunities.sort((a, b) => b.estimatedProfit - a.estimatedProfit);
  }

  /**
   * Detect liquidation opportunities across lending protocols
   */
  detectLiquidationOpportunities(
    positions: Array<{
      protocol: string;
      borrower: string;
      collateral: { token: string; amount: number; price: number };
      debt: { token: string; amount: number; price: number };
      liquidationThreshold: number;
    }>
  ): LiquidationOpportunity[] {
    const opportunities: LiquidationOpportunity[] = [];

    positions.forEach(position => {
      const healthFactor = this.calculateHealthFactor(
        position.collateral.amount * position.collateral.price,
        position.debt.amount * position.debt.price,
        position.liquidationThreshold
      );

      if (healthFactor < 1) {
        // Position is liquidatable
        const liquidationBonus = this.getLiquidationBonus(position.protocol);
        const collateralValue = position.collateral.amount * position.collateral.price;
        const debtValue = position.debt.amount * position.debt.price;
        
        // Profit = (collateral seized * liquidation bonus) - debt repaid - gas
        const maxSeizableValue = Math.min(collateralValue, debtValue * 1.5);
        const estimatedProfit = (maxSeizableValue * liquidationBonus) - debtValue;
        const gasEstimate = this.estimateLiquidationGas(position.protocol);

        const netProfit = estimatedProfit - gasEstimate;

        if (netProfit > this.MIN_PROFIT_USD) {
          let urgency: 'critical' | 'high' | 'medium' | 'low';
          if (healthFactor < 0.95) urgency = 'critical';
          else if (healthFactor < 0.98) urgency = 'high';
          else if (healthFactor < 0.99) urgency = 'medium';
          else urgency = 'low';

          opportunities.push({
            protocol: position.protocol,
            borrower: position.borrower,
            collateralToken: position.collateral.token,
            collateralAmount: position.collateral.amount,
            debtToken: position.debt.token,
            debtAmount: position.debt.amount,
            healthFactor,
            liquidationBonus,
            estimatedProfit: netProfit,
            gasEstimate,
            urgency,
          });
        }
      }
    });

    return opportunities.sort((a, b) => {
      // Sort by urgency first, then profit
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      }
      return b.estimatedProfit - a.estimatedProfit;
    });
  }

  /**
   * Find flash loan arbitrage opportunities
   */
  findFlashLoanOpportunities(
    prices: Array<{
      token: string;
      exchange: string;
      price: number;
      liquidity: number;
    }>,
    flashLoanProviders: Array<{
      protocol: string;
      token: string;
      available: number;
      fee: number;
    }>
  ): FlashLoanOpportunity[] {
    const opportunities: FlashLoanOpportunity[] = [];

    // Group prices by token
    const pricesByToken = new Map<string, typeof prices>();
    prices.forEach(price => {
      if (!pricesByToken.has(price.token)) {
        pricesByToken.set(price.token, []);
      }
      pricesByToken.get(price.token)!.push(price);
    });

    // Find arbitrage opportunities that can be executed with flash loans
    pricesByToken.forEach((tokenPrices, token) => {
      if (tokenPrices.length < 2) return;

      // Find best buy and sell prices
      const sorted = [...tokenPrices].sort((a, b) => a.price - b.price);
      const buyPrice = sorted[0];
      const sellPrice = sorted[sorted.length - 1];

      const priceDiff = sellPrice.price - buyPrice.price;
      const profitPercent = (priceDiff / buyPrice.price) * 100;

      if (profitPercent > 0.5) {
        // Check if flash loan is available
        const flashLoan = flashLoanProviders.find(
          fl => fl.token === token && fl.available > 0
        );

        if (flashLoan) {
          const loanAmount = Math.min(
            flashLoan.available,
            buyPrice.liquidity * 0.1,
            sellPrice.liquidity * 0.1
          );

          const grossProfit = loanAmount * (priceDiff / buyPrice.price);
          const flashLoanFee = loanAmount * flashLoan.fee;
          const gasEstimate = 300; // $300 for flash loan execution
          const netProfit = grossProfit - flashLoanFee - gasEstimate;

          if (netProfit > this.MIN_PROFIT_USD) {
            opportunities.push({
              lender: flashLoan.protocol,
              token,
              availableAmount: loanAmount,
              fee: flashLoan.fee * 100,
              route: [
                {
                  step: 1,
                  action: 'borrow',
                  protocol: flashLoan.protocol,
                  expectedProfit: 0,
                },
                {
                  step: 2,
                  action: 'swap',
                  protocol: buyPrice.exchange,
                  expectedProfit: 0,
                },
                {
                  step: 3,
                  action: 'swap',
                  protocol: sellPrice.exchange,
                  expectedProfit: grossProfit,
                },
                {
                  step: 4,
                  action: 'repay',
                  protocol: flashLoan.protocol,
                  expectedProfit: -flashLoanFee,
                },
              ],
              totalProfit: netProfit,
              riskLevel: this.assessFlashLoanRisk(profitPercent, buyPrice.liquidity),
            });
          }
        }
      }
    });

    return opportunities.sort((a, b) => b.totalProfit - a.totalProfit);
  }

  /**
   * Detect Just-In-Time (JIT) liquidity opportunities
   */
  detectJITOpportunities(
    pendingSwaps: PendingTransaction[],
    pools: Array<{
      address: string;
      token0: string;
      token1: string;
      liquidity: number;
      fee: number;
    }>
  ): JITLiquidityOpportunity[] {
    const opportunities: JITLiquidityOpportunity[] = [];

    // Find large pending swaps
    const largeSwaps = pendingSwaps.filter(tx => 
      this.isSwapTransaction(tx) && tx.value > 50000 // $50k+
    );

    largeSwaps.forEach(swap => {
      const pool = this.identifyPool(swap, pools);
      
      if (pool) {
        const swapInfo = this.parseSwapData(swap.data);
        
        // Calculate optimal liquidity to capture fees
        const expectedFees = swap.value * (pool.fee / 10000);
        
        // JIT strategy: add liquidity right before, remove right after
        const optimalLiquidity = this.calculateOptimalJITLiquidity(
          swap.value,
          pool.liquidity,
          pool.fee
        );

        if (expectedFees > 100) { // Min $100 in fees
          opportunities.push({
            pool: pool.address,
            token0: pool.token0,
            token1: pool.token1,
            incomingSwap: {
              amount: swap.value,
              direction: swapInfo.direction,
            },
            optimalLiquidity,
            expectedFees,
            windowDuration: 30, // 30 second window
          });
        }
      }
    });

    return opportunities.sort((a, b) => b.expectedFees - a.expectedFees);
  }

  /**
   * Calculate optimal gas price for MEV transactions
   */
  calculateOptimalGasPrice(
    targetTx: PendingTransaction,
    expectedProfit: number,
    strategy: 'frontrun' | 'backrun' | 'sandwich'
  ): {
    optimalGasPrice: number;
    maxGasPrice: number;
    priorityFee: number;
    explanation: string;
  } {
    // For frontrunning, need to be 1 gwei above target
    // For backrunning, can be slightly below
    // For sandwich, need precise positioning

    let optimalGasPrice = targetTx.gasPrice;
    let priorityFee = 0;

    switch (strategy) {
      case 'frontrun':
        optimalGasPrice = targetTx.gasPrice + 1e9; // +1 gwei
        priorityFee = (targetTx.maxPriorityFeePerGas || 0) + 0.5e9;
        break;
      
      case 'backrun':
        optimalGasPrice = targetTx.gasPrice - 0.5e9; // -0.5 gwei
        priorityFee = (targetTx.maxPriorityFeePerGas || 0) - 0.2e9;
        break;
      
      case 'sandwich':
        // Front: higher, Back: lower
        optimalGasPrice = targetTx.gasPrice + 1e9;
        priorityFee = (targetTx.maxPriorityFeePerGas || 0) + 0.5e9;
        break;
    }

    // Calculate max profitable gas price
    const gasLimit = 200000; // Typical for MEV
    const maxGasPrice = (expectedProfit * 1e9) / gasLimit;

    let explanation = '';
    if (optimalGasPrice > maxGasPrice) {
      explanation = 'Warning: Optimal gas price exceeds profitable threshold';
    } else if (optimalGasPrice > this.MAX_GAS_PRICE_GWEI * 1e9) {
      explanation = 'Warning: Gas price very high. Consider waiting for lower fees';
    } else {
      explanation = 'Gas price within profitable range';
    }

    return {
      optimalGasPrice: optimalGasPrice / 1e9, // Convert to gwei
      maxGasPrice: maxGasPrice / 1e9,
      priorityFee: priorityFee / 1e9,
      explanation,
    };
  }

  /**
   * Simulate MEV transaction outcome
   */
  simulateMEVExecution(
    opportunity: SandwichOpportunity | LiquidationOpportunity | FlashLoanOpportunity,
    currentBlockGasUsed: number,
    blockGasLimit: number
  ): {
    willExecute: boolean;
    expectedProfit: number;
    gasUsed: number;
    probabilityOfSuccess: number;
    risks: string[];
  } {
    const risks: string[] = [];
    let probabilityOfSuccess = 90;

    // Check if transaction will fit in block
    const estimatedGas = this.estimateGasForOpportunity(opportunity);
    const willFitInBlock = currentBlockGasUsed + estimatedGas < blockGasLimit;

    if (!willFitInBlock) {
      risks.push('Transaction may not fit in current block');
      probabilityOfSuccess -= 30;
    }

    // Check for competing MEV bots
    const competitionRisk = this.assessCompetitionRisk(opportunity);
    if (competitionRisk > 0.5) {
      risks.push('High competition from other MEV searchers');
      probabilityOfSuccess -= 20;
    }

    // Check for slippage risk
    if ('victimSlippage' in opportunity && opportunity.victimSlippage < 2) {
      risks.push('Low victim slippage may reduce profit');
      probabilityOfSuccess -= 10;
    }

    // Check for price movement risk
    if ('healthFactor' in opportunity && opportunity.healthFactor > 0.99) {
      risks.push('Position may recover before liquidation');
      probabilityOfSuccess -= 15;
    }

    const expectedProfit = this.calculateExpectedProfit(opportunity, probabilityOfSuccess / 100);

    return {
      willExecute: willFitInBlock && probabilityOfSuccess > 50,
      expectedProfit,
      gasUsed: estimatedGas,
      probabilityOfSuccess,
      risks,
    };
  }

  /**
   * Build MEV bundle for atomic execution
   */
  buildMEVBundle(
    transactions: Array<{
      type: 'frontrun' | 'target' | 'backrun';
      tx: PendingTransaction;
      gasPrice: number;
    }>
  ): {
    bundle: PendingTransaction[];
    totalGas: number;
    bundleHash: string;
    minTimestamp: number;
    maxTimestamp: number;
  } {
    // Sort transactions: frontrun -> target -> backrun
    const sorted = [...transactions].sort((a, b) => {
      const order = { frontrun: 1, target: 2, backrun: 3 };
      return order[a.type] - order[b.type];
    });

    const bundle = sorted.map(tx => tx.tx);
    const totalGas = bundle.reduce((sum, tx) => sum + 200000, 0); // Estimate

    // Bundle must execute atomically
    const now = Date.now();
    
    return {
      bundle,
      totalGas,
      bundleHash: this.generateBundleHash(bundle),
      minTimestamp: now,
      maxTimestamp: now + 12000, // Next block (12 seconds)
    };
  }

  // Private helper methods
  private isSwapTransaction(tx: PendingTransaction): boolean {
    // Simplified check - would parse actual function signatures
    return tx.data.startsWith('0x38ed1739') || // swapExactTokensForTokens
           tx.data.startsWith('0x7ff36ab5') || // swapExactETHForTokens
           tx.data.startsWith('0x18cbafe5');   // swapExactTokensForETH
  }

  private calculateSandwichProfit(
    targetTx: PendingTransaction,
    prices: Map<string, number>
  ): SandwichOpportunity | null {
    // Simplified sandwich calculation
    const victimSlippage = this.estimateSlippage(targetTx.value);
    
    if (victimSlippage < this.SANDWICH_SLIPPAGE_THRESHOLD) {
      return null; // Not worth sandwiching
    }

    const frontrunAmount = targetTx.value * 0.5; // Buy 50% of victim's amount
    const victimBuyPrice = 100; // Simplified
    const newPrice = victimBuyPrice * (1 + victimSlippage / 100);
    const backrunSellPrice = newPrice * 0.99; // Small slippage

    const profit = (backrunSellPrice - victimBuyPrice) * frontrunAmount;
    const gasCost = 300; // $300 for sandwich

    const netProfit = profit - gasCost;

    if (netProfit <= 0) return null;

    return {
      targetTx,
      victimSlippage,
      frontrunTx: {
        action: 'buy',
        amount: frontrunAmount,
        expectedPrice: victimBuyPrice,
        gasPrice: targetTx.gasPrice + 1e9,
      },
      backrunTx: {
        action: 'sell',
        amount: frontrunAmount,
        expectedPrice: backrunSellPrice,
        gasPrice: targetTx.gasPrice - 0.5e9,
      },
      estimatedProfit: netProfit,
      riskScore: this.calculateRiskScore(victimSlippage, netProfit),
      confidence: 75,
    };
  }

  private estimateSlippage(tradeSize: number): number {
    // Simplified: larger trades = more slippage
    // Real implementation would use actual pool reserves
    if (tradeSize < 10000) return 0.5;
    if (tradeSize < 50000) return 1.5;
    if (tradeSize < 100000) return 3;
    return 5;
  }

  private calculateHealthFactor(
    collateralValue: number,
    debtValue: number,
    liquidationThreshold: number
  ): number {
    return (collateralValue * liquidationThreshold) / debtValue;
  }

  private getLiquidationBonus(protocol: string): number {
    // Different protocols have different liquidation bonuses
    const bonuses: Record<string, number> = {
      aave: 1.05,     // 5% bonus
      compound: 1.08, // 8% bonus
      maker: 1.13,    // 13% bonus
    };
    return bonuses[protocol.toLowerCase()] || 1.05;
  }

  private estimateLiquidationGas(protocol: string): number {
    // Gas costs vary by protocol
    const gasCosts: Record<string, number> = {
      aave: 400,
      compound: 350,
      maker: 500,
    };
    return gasCosts[protocol.toLowerCase()] || 400;
  }

  private assessFlashLoanRisk(
    profitPercent: number,
    liquidity: number
  ): 'low' | 'medium' | 'high' {
    if (profitPercent > 5 && liquidity > 1000000) return 'low';
    if (profitPercent > 2 && liquidity > 500000) return 'medium';
    return 'high';
  }

  private identifyPool(
    tx: PendingTransaction,
    pools: Array<{ address: string }>
  ): any | null {
    // Simplified - would parse tx data to find pool
    return pools[0] || null;
  }

  private parseSwapData(data: string): {
    direction: 'token0_to_token1' | 'token1_to_token0';
  } {
    // Simplified swap data parsing
    return {
      direction: 'token0_to_token1',
    };
  }

  private calculateOptimalJITLiquidity(
    swapAmount: number,
    poolLiquidity: number,
    fee: number
  ): {
    amount0: number;
    amount1: number;
    priceRange: { lower: number; upper: number };
  } {
    // Optimal: add liquidity to capture max fees with min capital
    const optimalAmount = swapAmount * 0.1; // 10% of swap size

    return {
      amount0: optimalAmount / 2,
      amount1: optimalAmount / 2,
      priceRange: {
        lower: 0.99, // Tight range around current price
        upper: 1.01,
      },
    };
  }

  private calculateRiskScore(slippage: number, profit: number): number {
    // Higher slippage + higher profit = lower risk
    if (slippage > 3 && profit > 1000) return 30;
    if (slippage > 2 && profit > 500) return 50;
    return 70;
  }

  private estimateGasForOpportunity(
    opportunity: SandwichOpportunity | LiquidationOpportunity | FlashLoanOpportunity
  ): number {
    if ('frontrunTx' in opportunity) return 400000; // Sandwich
    if ('protocol' in opportunity) return 350000;   // Liquidation
    return 500000; // Flash loan
  }

  private assessCompetitionRisk(
    opportunity: SandwichOpportunity | LiquidationOpportunity | FlashLoanOpportunity
  ): number {
    // High profit = high competition
    let profit = 0;
    if ('estimatedProfit' in opportunity) profit = opportunity.estimatedProfit;
    else if ('totalProfit' in opportunity) profit = opportunity.totalProfit;

    if (profit > 5000) return 0.8;
    if (profit > 1000) return 0.5;
    return 0.2;
  }

  private calculateExpectedProfit(
    opportunity: any,
    probability: number
  ): number {
    const maxProfit = opportunity.estimatedProfit || opportunity.totalProfit || 0;
    return maxProfit * probability;
  }

  private generateBundleHash(bundle: PendingTransaction[]): string {
    // Simplified hash generation
    return `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  }
}

// Export singleton instance
export const mevOpportunityDetector = new MEVOpportunityDetector();

