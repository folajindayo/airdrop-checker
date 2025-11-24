/**
 * Token Launch Analyzer - Evaluates new token launches for legitimacy and potential
 * Identifies red flags, calculates risk scores, and predicts launch success
 */

interface TokenLaunchData {
  tokenAddress: string;
  name: string;
  symbol: string;
  totalSupply: number;
  initialPrice: number;
  launchTimestamp: number;
  creatorAddress: string;
  liquidityPool?: {
    address: string;
    initialLiquidity: number;
    lockedUntil?: number;
  };
  teamTokens?: {
    amount: number;
    vestingSchedule?: Array<{ timestamp: number; amount: number }>;
  };
}

interface LaunchAnalysis {
  overallScore: number; // 0-100
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'critical';
  legitimacyScore: number;
  potentialScore: number;
  redFlags: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
  }>;
  greenFlags: Array<{
    importance: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid' | 'scam';
  confidenceLevel: number;
}

interface RugPullProbability {
  probability: number; // 0-100
  indicators: string[];
  timeframe: string;
  preventativeMeasures: string[];
}

interface TokenMetrics {
  marketCap: number;
  fullyDilutedValuation: number;
  liquidityRatio: number;
  holderCount: number;
  topHoldersPercentage: number;
  priceVolatility: number;
  volume24h: number;
  transactions24h: number;
}

interface ContractAudit {
  isVerified: boolean;
  hasProxyContract: boolean;
  hasMintFunction: boolean;
  hasBlacklistFunction: boolean;
  hasPauseFunction: boolean;
  hasOwnershipRenounced: boolean;
  maxTransactionLimit: number | null;
  buyTax: number;
  sellTax: number;
  securityScore: number;
  vulnerabilities: string[];
}

interface LaunchPrediction {
  expectedPriceRange: { min: number; max: number };
  timeToATH: number; // hours
  expectedReturn: number; // percentage
  successProbability: number;
  factors: string[];
}

export class TokenLaunchAnalyzer {
  private readonly HONEYPOT_INDICATORS = [
    'cannot_sell',
    'high_tax',
    'blacklist',
    'pause_function',
  ];

  /**
   * Comprehensive analysis of a token launch
   */
  analyzeLaunch(
    launchData: TokenLaunchData,
    contractAudit: ContractAudit,
    metrics: TokenMetrics
  ): LaunchAnalysis {
    const redFlags: LaunchAnalysis['redFlags'] = [];
    const greenFlags: LaunchAnalysis['greenFlags'] = [];

    let legitimacyScore = 100;
    let potentialScore = 50;

    // Check contract security
    if (!contractAudit.isVerified) {
      redFlags.push({
        severity: 'critical',
        description: 'Contract is not verified',
        impact: 'Cannot verify contract legitimacy and safety',
      });
      legitimacyScore -= 30;
    } else {
      greenFlags.push({
        importance: 'high',
        description: 'Contract is verified',
      });
    }

    // Check for dangerous functions
    if (contractAudit.hasMintFunction) {
      redFlags.push({
        severity: 'high',
        description: 'Contract has mint function',
        impact: 'Owner can create unlimited tokens, diluting holders',
      });
      legitimacyScore -= 25;
    }

    if (contractAudit.hasBlacklistFunction) {
      redFlags.push({
        severity: 'high',
        description: 'Contract has blacklist function',
        impact: 'Owner can prevent specific addresses from trading',
      });
      legitimacyScore -= 20;
    }

    if (contractAudit.hasPauseFunction) {
      redFlags.push({
        severity: 'medium',
        description: 'Contract has pause function',
        impact: 'Owner can halt all trading',
      });
      legitimacyScore -= 15;
    }

    if (contractAudit.hasOwnershipRenounced) {
      greenFlags.push({
        importance: 'high',
        description: 'Ownership has been renounced',
      });
      legitimacyScore += 10;
    }

    // Check taxes
    if (contractAudit.buyTax > 10 || contractAudit.sellTax > 10) {
      redFlags.push({
        severity: 'high',
        description: `High taxes: ${contractAudit.buyTax}% buy / ${contractAudit.sellTax}% sell`,
        impact: 'High taxes reduce profit potential and may indicate scam',
      });
      legitimacyScore -= 20;
    }

    if (contractAudit.buyTax === contractAudit.sellTax && contractAudit.buyTax <= 5) {
      greenFlags.push({
        importance: 'medium',
        description: 'Fair and balanced tax structure',
      });
      potentialScore += 5;
    }

    // Check liquidity
    if (launchData.liquidityPool) {
      const liquidityRatio = launchData.liquidityPool.initialLiquidity / 
                            (launchData.totalSupply * launchData.initialPrice);

      if (liquidityRatio < 0.1) {
        redFlags.push({
          severity: 'critical',
          description: 'Very low initial liquidity',
          impact: 'High price volatility and manipulation risk',
        });
        legitimacyScore -= 30;
      } else if (liquidityRatio > 0.3) {
        greenFlags.push({
          importance: 'high',
          description: 'Strong initial liquidity',
        });
        potentialScore += 10;
      }

      if (launchData.liquidityPool.lockedUntil) {
        const lockDuration = (launchData.liquidityPool.lockedUntil - launchData.launchTimestamp) / (24 * 3600 * 1000);
        
        if (lockDuration > 365) {
          greenFlags.push({
            importance: 'high',
            description: `Liquidity locked for ${Math.floor(lockDuration)} days`,
          });
          legitimacyScore += 15;
          potentialScore += 10;
        } else if (lockDuration < 30) {
          redFlags.push({
            severity: 'high',
            description: `Liquidity locked for only ${Math.floor(lockDuration)} days`,
            impact: 'Rug pull risk - liquidity can be removed soon',
          });
          legitimacyScore -= 25;
        }
      } else {
        redFlags.push({
          severity: 'critical',
          description: 'Liquidity is not locked',
          impact: 'Immediate rug pull risk',
        });
        legitimacyScore -= 40;
      }
    }

    // Check holder distribution
    if (metrics.topHoldersPercentage > 50) {
      redFlags.push({
        severity: 'high',
        description: `Top holders own ${metrics.topHoldersPercentage.toFixed(1)}% of supply`,
        impact: 'Centralized ownership increases manipulation risk',
      });
      legitimacyScore -= 20;
    } else if (metrics.topHoldersPercentage < 20) {
      greenFlags.push({
        importance: 'medium',
        description: 'Well-distributed token ownership',
      });
      potentialScore += 10;
    }

    // Check holder count
    if (metrics.holderCount > 1000) {
      greenFlags.push({
        importance: 'high',
        description: `${metrics.holderCount} holders shows strong community`,
      });
      potentialScore += 15;
    } else if (metrics.holderCount < 50) {
      redFlags.push({
        severity: 'medium',
        description: 'Very few holders',
        impact: 'Limited community support',
      });
      potentialScore -= 10;
    }

    // Check team tokens
    if (launchData.teamTokens) {
      const teamPercentage = (launchData.teamTokens.amount / launchData.totalSupply) * 100;
      
      if (teamPercentage > 20) {
        redFlags.push({
          severity: 'high',
          description: `Team holds ${teamPercentage.toFixed(1)}% of supply`,
          impact: 'High sell pressure risk',
        });
        legitimacyScore -= 15;
      }

      if (launchData.teamTokens.vestingSchedule && launchData.teamTokens.vestingSchedule.length > 0) {
        greenFlags.push({
          importance: 'high',
          description: 'Team tokens have vesting schedule',
        });
        legitimacyScore += 10;
      } else if (teamPercentage > 5) {
        redFlags.push({
          severity: 'medium',
          description: 'Team tokens not vested',
          impact: 'Team can dump tokens immediately',
        });
        legitimacyScore -= 10;
      }
    }

    // Calculate overall score
    legitimacyScore = Math.max(0, Math.min(100, legitimacyScore));
    potentialScore = Math.max(0, Math.min(100, potentialScore));
    const overallScore = (legitimacyScore * 0.6) + (potentialScore * 0.4);

    // Determine risk level
    let riskLevel: LaunchAnalysis['riskLevel'];
    if (overallScore >= 80) riskLevel = 'very_low';
    else if (overallScore >= 60) riskLevel = 'low';
    else if (overallScore >= 40) riskLevel = 'medium';
    else if (overallScore >= 20) riskLevel = 'high';
    else riskLevel = 'critical';

    // Determine recommendation
    let recommendation: LaunchAnalysis['recommendation'];
    if (overallScore >= 80 && redFlags.filter(f => f.severity === 'critical').length === 0) {
      recommendation = 'strong_buy';
    } else if (overallScore >= 60 && redFlags.filter(f => f.severity === 'critical').length === 0) {
      recommendation = 'buy';
    } else if (overallScore >= 40) {
      recommendation = 'hold';
    } else if (overallScore >= 20) {
      recommendation = 'avoid';
    } else {
      recommendation = 'scam';
    }

    // Calculate confidence level
    const confidenceLevel = contractAudit.isVerified ? 85 : 50;

    return {
      overallScore,
      riskLevel,
      legitimacyScore,
      potentialScore,
      redFlags,
      greenFlags,
      recommendation,
      confidenceLevel,
    };
  }

  /**
   * Calculate probability of rug pull
   */
  calculateRugPullProbability(
    launchData: TokenLaunchData,
    contractAudit: ContractAudit,
    metrics: TokenMetrics
  ): RugPullProbability {
    let probability = 0;
    const indicators: string[] = [];

    // Critical indicators
    if (!contractAudit.isVerified) {
      probability += 30;
      indicators.push('Unverified contract');
    }

    if (!launchData.liquidityPool?.lockedUntil) {
      probability += 40;
      indicators.push('Unlocked liquidity');
    } else {
      const daysLocked = (launchData.liquidityPool.lockedUntil - Date.now()) / (24 * 3600 * 1000);
      if (daysLocked < 30) {
        probability += 25;
        indicators.push(`Liquidity unlocks in ${Math.floor(daysLocked)} days`);
      }
    }

    if (contractAudit.hasMintFunction) {
      probability += 20;
      indicators.push('Mint function present');
    }

    if (metrics.topHoldersPercentage > 60) {
      probability += 15;
      indicators.push('Heavily concentrated ownership');
    }

    if (contractAudit.buyTax > 15 || contractAudit.sellTax > 15) {
      probability += 20;
      indicators.push('Excessive taxes');
    }

    if (metrics.holderCount < 100) {
      probability += 10;
      indicators.push('Very low holder count');
    }

    // Determine timeframe
    let timeframe = '';
    if (probability > 80) {
      timeframe = 'Immediate - within 24 hours';
    } else if (probability > 60) {
      timeframe = 'Short-term - within 7 days';
    } else if (probability > 40) {
      timeframe = 'Medium-term - within 30 days';
    } else {
      timeframe = 'Low immediate risk';
    }

    const preventativeMeasures = [
      'Only invest what you can afford to lose',
      'Monitor liquidity pool regularly',
      'Set stop-loss orders',
      'Check for contract ownership changes',
      'Join community channels for updates',
    ];

    if (launchData.liquidityPool?.lockedUntil) {
      preventativeMeasures.push('Note liquidity unlock date on calendar');
    }

    return {
      probability: Math.min(probability, 100),
      indicators,
      timeframe,
      preventativeMeasures,
    };
  }

  /**
   * Predict launch success and price movement
   */
  predictLaunchSuccess(
    launchData: TokenLaunchData,
    analysis: LaunchAnalysis,
    metrics: TokenMetrics,
    marketConditions: {
      btcTrend: 'bullish' | 'bearish' | 'neutral';
      sectorSentiment: number; // 0-100
    }
  ): LaunchPrediction {
    let successProbability = 50;
    const factors: string[] = [];

    // Base on analysis score
    successProbability = analysis.overallScore * 0.5;
    factors.push(`Analysis score: ${analysis.overallScore}/100`);

    // Market conditions
    if (marketConditions.btcTrend === 'bullish') {
      successProbability += 15;
      factors.push('Favorable market conditions');
    } else if (marketConditions.btcTrend === 'bearish') {
      successProbability -= 15;
      factors.push('Challenging market conditions');
    }

    if (marketConditions.sectorSentiment > 70) {
      successProbability += 10;
      factors.push('Strong sector sentiment');
    } else if (marketConditions.sectorSentiment < 30) {
      successProbability -= 10;
      factors.push('Weak sector sentiment');
    }

    // Initial metrics
    if (metrics.holderCount > 500) {
      successProbability += 10;
      factors.push('Strong initial community');
    }

    if (metrics.volume24h > metrics.marketCap * 0.5) {
      successProbability += 10;
      factors.push('High trading volume');
    }

    // Liquidity
    if (launchData.liquidityPool && metrics.liquidityRatio > 0.3) {
      successProbability += 10;
      factors.push('Strong liquidity foundation');
    }

    successProbability = Math.max(0, Math.min(100, successProbability));

    // Predict price range
    const currentPrice = launchData.initialPrice;
    let expectedReturn = 0;

    if (successProbability > 80) {
      expectedReturn = 500; // 5x
    } else if (successProbability > 60) {
      expectedReturn = 200; // 2x
    } else if (successProbability > 40) {
      expectedReturn = 50; // 1.5x
    } else {
      expectedReturn = -50; // Loss
    }

    const expectedPriceRange = {
      min: currentPrice * (1 + (expectedReturn * 0.5) / 100),
      max: currentPrice * (1 + (expectedReturn * 1.5) / 100),
    };

    // Time to ATH
    let timeToATH = 72; // Default 3 days
    if (successProbability > 80) {
      timeToATH = 24; // 1 day for high potential
    } else if (successProbability > 60) {
      timeToATH = 48; // 2 days
    } else if (successProbability < 40) {
      timeToATH = 168; // 1 week or never
    }

    return {
      expectedPriceRange,
      timeToATH,
      expectedReturn,
      successProbability,
      factors,
    };
  }

  /**
   * Compare token launch to historical launches
   */
  compareToHistoricalLaunches(
    currentLaunch: LaunchAnalysis,
    historicalData: Array<{
      analysis: LaunchAnalysis;
      actualOutcome: {
        maxGain: number;
        timeToMaxGain: number;
        finalResult: 'success' | 'failure' | 'rug_pull';
      };
    }>
  ): {
    similarLaunches: number;
    averageOutcome: {
      successRate: number;
      averageGain: number;
      averageTime: number;
    };
    ranking: string;
  } {
    // Find similar launches (within 10 points of overall score)
    const similar = historicalData.filter(
      h => Math.abs(h.analysis.overallScore - currentLaunch.overallScore) < 10
    );

    const successes = similar.filter(h => h.actualOutcome.finalResult === 'success').length;
    const successRate = (successes / similar.length) * 100;

    const averageGain = similar.reduce((sum, h) => sum + h.actualOutcome.maxGain, 0) / similar.length;
    const averageTime = similar.reduce((sum, h) => sum + h.actualOutcome.timeToMaxGain, 0) / similar.length;

    // Rank current launch
    const betterThan = historicalData.filter(
      h => h.analysis.overallScore < currentLaunch.overallScore
    ).length;
    const percentile = (betterThan / historicalData.length) * 100;

    let ranking = '';
    if (percentile > 90) ranking = 'Top 10% - Exceptional';
    else if (percentile > 75) ranking = 'Top 25% - Very Good';
    else if (percentile > 50) ranking = 'Above Average';
    else if (percentile > 25) ranking = 'Below Average';
    else ranking = 'Bottom 25% - Poor';

    return {
      similarLaunches: similar.length,
      averageOutcome: {
        successRate,
        averageGain,
        averageTime,
      },
      ranking,
    };
  }

  /**
   * Generate trading strategy for new token
   */
  generateTradingStrategy(
    analysis: LaunchAnalysis,
    prediction: LaunchPrediction,
    investmentAmount: number
  ): {
    entryStrategy: {
      timing: string;
      allocation: number;
      priceTarget: number;
    };
    exitStrategy: {
      takeProfit: Array<{ percentage: number; price: number }>;
      stopLoss: { percentage: number; price: number };
    };
    riskManagement: string[];
  } {
    const currentPrice = 1; // Simplified

    // Entry strategy
    let timing = '';
    let allocation = investmentAmount;

    if (analysis.riskLevel === 'critical' || analysis.riskLevel === 'high') {
      timing = 'AVOID - Too risky';
      allocation = 0;
    } else if (analysis.riskLevel === 'medium') {
      timing = 'Small position only, wait for confirmation';
      allocation = investmentAmount * 0.3;
    } else {
      timing = 'Enter at launch or on first dip';
      allocation = investmentAmount * 0.7;
    }

    // Exit strategy
    const takeProfit: Array<{ percentage: number; price: number }> = [];
    
    if (prediction.expectedReturn > 0) {
      takeProfit.push({
        percentage: 30,
        price: currentPrice * 1.5,
      });
      takeProfit.push({
        percentage: 40,
        price: currentPrice * (1 + prediction.expectedReturn / 200),
      });
      takeProfit.push({
        percentage: 30,
        price: prediction.expectedPriceRange.max,
      });
    }

    const stopLoss = {
      percentage: 100,
      price: currentPrice * 0.7, // 30% stop loss
    };

    // Risk management
    const riskManagement = [
      `Maximum allocation: ${((allocation / investmentAmount) * 100).toFixed(0)}%`,
      'Never invest more than you can afford to lose',
      'Monitor price and liquidity constantly for first 48 hours',
    ];

    if (analysis.redFlags.some(f => f.severity === 'critical')) {
      riskManagement.push('CRITICAL: Multiple red flags detected - extreme caution advised');
    }

    if (!analysis.greenFlags.find(g => g.description.includes('locked'))) {
      riskManagement.push('WARNING: Check liquidity lock status before investing');
    }

    return {
      entryStrategy: {
        timing,
        allocation,
        priceTarget: currentPrice,
      },
      exitStrategy: {
        takeProfit,
        stopLoss,
      },
      riskManagement,
    };
  }

  /**
   * Real-time monitoring alerts for launched token
   */
  generateMonitoringAlerts(
    launchData: TokenLaunchData,
    contractAudit: ContractAudit
  ): Array<{
    type: 'critical' | 'warning' | 'info';
    condition: string;
    action: string;
  }> {
    const alerts: Array<{
      type: 'critical' | 'warning' | 'info';
      condition: string;
      action: string;
    }> = [];

    // Liquidity monitoring
    if (launchData.liquidityPool) {
      if (launchData.liquidityPool.lockedUntil) {
        const daysUntilUnlock = (launchData.liquidityPool.lockedUntil - Date.now()) / (24 * 3600 * 1000);
        
        if (daysUntilUnlock < 7) {
          alerts.push({
            type: 'critical',
            condition: `Liquidity unlocks in ${Math.floor(daysUntilUnlock)} days`,
            action: 'Consider exiting position before unlock date',
          });
        } else if (daysUntilUnlock < 30) {
          alerts.push({
            type: 'warning',
            condition: `Liquidity unlocks in ${Math.floor(daysUntilUnlock)} days`,
            action: 'Monitor closely as unlock date approaches',
          });
        }
      } else {
        alerts.push({
          type: 'critical',
          condition: 'Liquidity is not locked',
          action: 'Exit immediately if liquidity drops significantly',
        });
      }
    }

    // Contract monitoring
    if (contractAudit.hasMintFunction) {
      alerts.push({
        type: 'warning',
        condition: 'Contract can mint new tokens',
        action: 'Monitor total supply for unexpected increases',
      });
    }

    if (contractAudit.hasBlacklistFunction || contractAudit.hasPauseFunction) {
      alerts.push({
        type: 'warning',
        condition: 'Contract has owner control functions',
        action: 'Watch for ownership actions that could affect trading',
      });
    }

    // General monitoring
    alerts.push({
      type: 'info',
      condition: 'Price volatility expected',
      action: 'Set price alerts at key levels',
    });

    alerts.push({
      type: 'info',
      condition: 'Early stage token',
      action: 'Monitor holder count and distribution daily',
    });

    return alerts;
  }
}

// Export singleton instance
export const tokenLaunchAnalyzer = new TokenLaunchAnalyzer();

