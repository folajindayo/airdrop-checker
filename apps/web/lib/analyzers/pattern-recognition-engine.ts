/**
 * Pattern Recognition Engine - Identifies trading patterns and behavioral signals
 * Uses statistical analysis to detect anomalies and predict future behavior
 */

interface Transaction {
  hash: string;
  timestamp: number;
  value: number;
  from: string;
  to: string;
  gasPrice: number;
  success: boolean;
  protocol?: string;
  type: string;
}

interface Pattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral' | 'warning';
  confidence: number; // 0-100
  description: string;
  indicators: string[];
  recommendation: string;
  historicalAccuracy?: number;
}

interface BehavioralProfile {
  tradingStyle: 'scalper' | 'day_trader' | 'swing_trader' | 'position_trader' | 'hodler';
  avgHoldTime: number; // days
  transactionFrequency: number; // per day
  preferredTimes: number[]; // hours of day (0-23)
  preferredDays: number[]; // days of week (0-6)
  riskAppetite: 'conservative' | 'moderate' | 'aggressive';
  consistencyScore: number; // 0-100
  patterns: Pattern[];
}

interface AnomalyDetection {
  isAnomaly: boolean;
  type: 'volume_spike' | 'unusual_timing' | 'suspicious_pattern' | 'potential_wash_trade' | 'bot_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  affectedTransactions: string[];
}

interface PredictiveInsight {
  prediction: string;
  likelihood: number; // 0-100
  timeframe: string;
  basis: string[];
  confidence: number;
}

export class PatternRecognitionEngine {
  private readonly MIN_TRANSACTIONS = 20;
  private readonly ANOMALY_THRESHOLD = 2.5; // Standard deviations
  private readonly PATTERN_MIN_OCCURRENCES = 3;

  /**
   * Analyze transaction patterns and build behavioral profile
   */
  analyzeBehavioralPatterns(transactions: Transaction[]): BehavioralProfile {
    if (transactions.length < this.MIN_TRANSACTIONS) {
      throw new Error(`Insufficient data. Need at least ${this.MIN_TRANSACTIONS} transactions.`);
    }

    // Sort by timestamp
    const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);

    // Determine trading style
    const tradingStyle = this.determineTradingStyle(sorted);

    // Calculate average hold time
    const avgHoldTime = this.calculateAvgHoldTime(sorted);

    // Calculate transaction frequency
    const transactionFrequency = this.calculateTransactionFrequency(sorted);

    // Identify preferred trading times
    const preferredTimes = this.identifyPreferredTimes(sorted);

    // Identify preferred trading days
    const preferredDays = this.identifyPreferredDays(sorted);

    // Assess risk appetite
    const riskAppetite = this.assessRiskAppetite(sorted);

    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(sorted);

    // Detect patterns
    const patterns = this.detectPatterns(sorted);

    return {
      tradingStyle,
      avgHoldTime,
      transactionFrequency,
      preferredTimes,
      preferredDays,
      riskAppetite,
      consistencyScore,
      patterns,
    };
  }

  /**
   * Detect anomalies in transaction behavior
   */
  detectAnomalies(transactions: Transaction[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];

    // Check for volume spikes
    const volumeAnomalies = this.detectVolumeSpikeAnomalies(transactions);
    anomalies.push(...volumeAnomalies);

    // Check for unusual timing
    const timingAnomalies = this.detectTimingAnomalies(transactions);
    anomalies.push(...timingAnomalies);

    // Check for suspicious patterns
    const suspiciousPatterns = this.detectSuspiciousPatterns(transactions);
    anomalies.push(...suspiciousPatterns);

    // Check for potential wash trading
    const washTrades = this.detectWashTrading(transactions);
    anomalies.push(...washTrades);

    // Check for bot activity
    const botActivity = this.detectBotActivity(transactions);
    anomalies.push(...botActivity);

    return anomalies.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Generate predictive insights based on historical patterns
   */
  generatePredictiveInsights(
    transactions: Transaction[],
    profile: BehavioralProfile
  ): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];

    // Predict next transaction timing
    insights.push(this.predictNextTransactionTiming(transactions, profile));

    // Predict likely protocols to interact with
    insights.push(this.predictProtocolInteraction(transactions));

    // Predict potential strategy change
    insights.push(this.predictStrategyChange(transactions, profile));

    // Predict risk level adjustment
    insights.push(this.predictRiskAdjustment(transactions, profile));

    return insights.sort((a, b) => b.likelihood - a.likelihood);
  }

  /**
   * Identify market cycle patterns (accumulation, markup, distribution, markdown)
   */
  identifyMarketCyclePhase(
    transactions: Transaction[],
    priceHistory: Array<{ timestamp: number; price: number }>
  ): {
    phase: 'accumulation' | 'markup' | 'distribution' | 'markdown';
    confidence: number;
    indicators: string[];
    recommendation: string;
  } {
    const recentTxs = transactions.slice(-20);
    const recentPrices = priceHistory.slice(-20);

    let accumulationScore = 0;
    let markupScore = 0;
    let distributionScore = 0;
    let markdownScore = 0;
    const indicators: string[] = [];

    // Analyze transaction volume trends
    const volumeTrend = this.calculateTrend(recentTxs.map(tx => tx.value));
    
    // Analyze price trends
    const priceTrend = this.calculateTrend(recentPrices.map(p => p.price));

    // Accumulation: Low volume, sideways price
    if (volumeTrend < 0 && Math.abs(priceTrend) < 0.1) {
      accumulationScore += 40;
      indicators.push('Low volume with stable prices');
    }

    // Markup: Increasing volume, rising prices
    if (volumeTrend > 0.2 && priceTrend > 0.1) {
      markupScore += 40;
      indicators.push('Rising volume and prices');
    }

    // Distribution: High volume, sideways/declining price
    if (volumeTrend > 0.1 && priceTrend < 0.05) {
      distributionScore += 40;
      indicators.push('High volume with weakening prices');
    }

    // Markdown: Decreasing volume, falling prices
    if (volumeTrend < -0.1 && priceTrend < -0.1) {
      markdownScore += 40;
      indicators.push('Declining volume and prices');
    }

    // Determine phase
    const scores = {
      accumulation: accumulationScore,
      markup: markupScore,
      distribution: distributionScore,
      markdown: markdownScore,
    };

    const phase = Object.entries(scores).reduce((a, b) => 
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
    )[0] as 'accumulation' | 'markup' | 'distribution' | 'markdown';

    const maxScore = Math.max(...Object.values(scores));
    const confidence = Math.min(maxScore + 20, 100);

    // Generate recommendation
    let recommendation = '';
    switch (phase) {
      case 'accumulation':
        recommendation = 'Good time to accumulate positions. Market is consolidating.';
        break;
      case 'markup':
        recommendation = 'Trend is strong. Consider holding or adding to positions.';
        break;
      case 'distribution':
        recommendation = 'Warning: Smart money may be distributing. Consider taking profits.';
        break;
      case 'markdown':
        recommendation = 'Market is declining. Avoid new positions, consider exiting.';
        break;
    }

    return { phase, confidence, indicators, recommendation };
  }

  /**
   * Calculate similarity between two wallets (correlation analysis)
   */
  calculateWalletSimilarity(
    wallet1Txs: Transaction[],
    wallet2Txs: Transaction[]
  ): {
    similarityScore: number; // 0-100
    commonProtocols: string[];
    timingCorrelation: number;
    behaviorMatch: string;
    likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  } {
    let similarityScore = 0;

    // Protocol overlap
    const w1Protocols = new Set(wallet1Txs.map(tx => tx.protocol).filter(Boolean));
    const w2Protocols = new Set(wallet2Txs.map(tx => tx.protocol).filter(Boolean));
    const commonProtocols = [...w1Protocols].filter(p => w2Protocols.has(p));
    const protocolSimilarity = (commonProtocols.length / Math.max(w1Protocols.size, w2Protocols.size)) * 100;
    similarityScore += protocolSimilarity * 0.3;

    // Timing correlation
    const timingCorrelation = this.calculateTimingCorrelation(wallet1Txs, wallet2Txs);
    similarityScore += timingCorrelation * 0.3;

    // Transaction pattern similarity
    const patternSimilarity = this.calculatePatternSimilarity(wallet1Txs, wallet2Txs);
    similarityScore += patternSimilarity * 0.4;

    // Determine behavior match
    let behaviorMatch = '';
    if (similarityScore > 80) {
      behaviorMatch = 'Highly similar - possibly controlled by same entity or using same strategy';
    } else if (similarityScore > 60) {
      behaviorMatch = 'Similar trading patterns - likely following similar strategies';
    } else if (similarityScore > 40) {
      behaviorMatch = 'Some similarities - may be influenced by same market signals';
    } else {
      behaviorMatch = 'Different behaviors - independent trading strategies';
    }

    // Determine likelihood category
    let likelihood: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    if (similarityScore < 20) likelihood = 'very_low';
    else if (similarityScore < 40) likelihood = 'low';
    else if (similarityScore < 60) likelihood = 'medium';
    else if (similarityScore < 80) likelihood = 'high';
    else likelihood = 'very_high';

    return {
      similarityScore,
      commonProtocols,
      timingCorrelation,
      behaviorMatch,
      likelihood,
    };
  }

  /**
   * Detect cyclical patterns in transaction behavior
   */
  detectCyclicalPatterns(transactions: Transaction[]): Array<{
    pattern: string;
    period: number; // days
    confidence: number;
    nextOccurrence: number; // timestamp
  }> {
    const patterns: Array<{
      pattern: string;
      period: number;
      confidence: number;
      nextOccurrence: number;
    }> = [];

    // Group transactions by day
    const txByDay = this.groupByDay(transactions);
    const dailyCounts = Array.from(txByDay.values()).map(txs => txs.length);

    // Detect weekly patterns (7-day cycle)
    const weeklyPattern = this.detectPeriodicPattern(dailyCounts, 7);
    if (weeklyPattern.confidence > 60) {
      patterns.push({
        pattern: 'Weekly trading pattern',
        period: 7,
        confidence: weeklyPattern.confidence,
        nextOccurrence: Date.now() + (7 - (Date.now() / (24 * 3600 * 1000) % 7)) * 24 * 3600 * 1000,
      });
    }

    // Detect monthly patterns (30-day cycle)
    const monthlyPattern = this.detectPeriodicPattern(dailyCounts, 30);
    if (monthlyPattern.confidence > 60) {
      patterns.push({
        pattern: 'Monthly trading pattern',
        period: 30,
        confidence: monthlyPattern.confidence,
        nextOccurrence: Date.now() + (30 - (Date.now() / (24 * 3600 * 1000) % 30)) * 24 * 3600 * 1000,
      });
    }

    return patterns;
  }

  // Private helper methods
  private determineTradingStyle(transactions: Transaction[]): BehavioralProfile['tradingStyle'] {
    const avgHoldTime = this.calculateAvgHoldTime(transactions);
    const txPerDay = this.calculateTransactionFrequency(transactions);

    if (avgHoldTime < 1 && txPerDay > 5) return 'scalper';
    if (avgHoldTime < 7 && txPerDay > 2) return 'day_trader';
    if (avgHoldTime < 30 && txPerDay > 0.5) return 'swing_trader';
    if (avgHoldTime < 90) return 'position_trader';
    return 'hodler';
  }

  private calculateAvgHoldTime(transactions: Transaction[]): number {
    // Simplified: calculate time between buy and sell transactions
    const holdTimes: number[] = [];
    const positions = new Map<string, number>();

    transactions.forEach(tx => {
      if (tx.type === 'buy' || tx.type === 'mint') {
        positions.set(tx.to, tx.timestamp);
      } else if (tx.type === 'sell' || tx.type === 'transfer') {
        const buyTime = positions.get(tx.from);
        if (buyTime) {
          holdTimes.push((tx.timestamp - buyTime) / (24 * 3600 * 1000));
        }
      }
    });

    return holdTimes.length > 0 
      ? holdTimes.reduce((sum, t) => sum + t, 0) / holdTimes.length 
      : 30; // Default
  }

  private calculateTransactionFrequency(transactions: Transaction[]): number {
    if (transactions.length < 2) return 0;
    
    const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
    const timespan = (sorted[sorted.length - 1].timestamp - sorted[0].timestamp) / (24 * 3600 * 1000);
    
    return timespan > 0 ? transactions.length / timespan : 0;
  }

  private identifyPreferredTimes(transactions: Transaction[]): number[] {
    const hourCounts = new Array(24).fill(0);
    
    transactions.forEach(tx => {
      const hour = new Date(tx.timestamp).getHours();
      hourCounts[hour]++;
    });

    const avgCount = hourCounts.reduce((sum, c) => sum + c, 0) / 24;
    
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count > avgCount * 1.5)
      .map(h => h.hour);
  }

  private identifyPreferredDays(transactions: Transaction[]): number[] {
    const dayCounts = new Array(7).fill(0);
    
    transactions.forEach(tx => {
      const day = new Date(tx.timestamp).getDay();
      dayCounts[day]++;
    });

    const avgCount = dayCounts.reduce((sum, c) => sum + c, 0) / 7;
    
    return dayCounts
      .map((count, day) => ({ day, count }))
      .filter(d => d.count > avgCount * 1.2)
      .map(d => d.day);
  }

  private assessRiskAppetite(transactions: Transaction[]): 'conservative' | 'moderate' | 'aggressive' {
    const avgValue = transactions.reduce((sum, tx) => sum + tx.value, 0) / transactions.length;
    const maxValue = Math.max(...transactions.map(tx => tx.value));
    const volatility = this.calculateVolatility(transactions.map(tx => tx.value));

    if (maxValue / avgValue > 10 || volatility > 0.5) return 'aggressive';
    if (maxValue / avgValue > 3 || volatility > 0.25) return 'moderate';
    return 'conservative';
  }

  private calculateConsistencyScore(transactions: Transaction[]): number {
    const intervals: number[] = [];
    for (let i = 1; i < transactions.length; i++) {
      intervals.push(transactions[i].timestamp - transactions[i - 1].timestamp);
    }

    if (intervals.length === 0) return 0;

    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avgInterval > 0 ? stdDev / avgInterval : 1;

    return Math.max(0, 100 - (coefficientOfVariation * 100));
  }

  private detectPatterns(transactions: Transaction[]): Pattern[] {
    const patterns: Pattern[] = [];

    // Pattern 1: Accumulation pattern (multiple small buys)
    const recentBuys = transactions.filter(tx => tx.type === 'buy').slice(-10);
    if (recentBuys.length >= 5) {
      const avgBuySize = recentBuys.reduce((sum, tx) => sum + tx.value, 0) / recentBuys.length;
      if (avgBuySize < transactions.reduce((sum, tx) => sum + tx.value, 0) / transactions.length) {
        patterns.push({
          name: 'Accumulation Pattern',
          type: 'bullish',
          confidence: 70,
          description: 'Multiple small purchases detected - systematic accumulation',
          indicators: ['Consistent buy orders', 'Below-average position sizes', 'Regular intervals'],
          recommendation: 'Long-term bullish outlook. Consider following this accumulation strategy.',
        });
      }
    }

    // Pattern 2: Profit-taking pattern
    const recentSells = transactions.filter(tx => tx.type === 'sell').slice(-5);
    if (recentSells.length >= 3) {
      patterns.push({
        name: 'Profit Taking',
        type: 'bearish',
        confidence: 65,
        description: 'Multiple sells detected - taking profits or reducing exposure',
        indicators: ['Recent sell transactions', 'Reducing position size'],
        recommendation: 'Short-term bearish. May indicate local top or risk reduction.',
      });
    }

    // Pattern 3: High activity pattern
    const recentTxs = transactions.slice(-20);
    const txFrequency = recentTxs.length / ((recentTxs[recentTxs.length - 1].timestamp - recentTxs[0].timestamp) / (24 * 3600 * 1000));
    if (txFrequency > 5) {
      patterns.push({
        name: 'High Activity',
        type: 'warning',
        confidence: 80,
        description: 'Unusually high transaction frequency',
        indicators: [`${txFrequency.toFixed(1)} transactions per day`, 'Above normal activity'],
        recommendation: 'Monitor for potential bot activity or aggressive trading strategy.',
      });
    }

    return patterns;
  }

  private detectVolumeSpikeAnomalies(transactions: Transaction[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const values = transactions.map(tx => tx.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    );

    transactions.forEach(tx => {
      const zScore = Math.abs((tx.value - mean) / stdDev);
      if (zScore > this.ANOMALY_THRESHOLD) {
        anomalies.push({
          isAnomaly: true,
          type: 'volume_spike',
          severity: zScore > 4 ? 'critical' : zScore > 3 ? 'high' : 'medium',
          confidence: Math.min(zScore * 20, 100),
          description: `Transaction value ${zScore.toFixed(1)}x above normal`,
          affectedTransactions: [tx.hash],
        });
      }
    });

    return anomalies;
  }

  private detectTimingAnomalies(transactions: Transaction[]): AnomalyDetection[] {
    // Detect unusual transaction timing patterns
    const anomalies: AnomalyDetection[] = [];
    const intervals: number[] = [];

    for (let i = 1; i < transactions.length; i++) {
      intervals.push(transactions[i].timestamp - transactions[i - 1].timestamp);
    }

    if (intervals.length < 3) return anomalies;

    const mean = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const stdDev = Math.sqrt(
      intervals.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) / intervals.length
    );

    // Detect suspiciously regular intervals (bot-like behavior)
    const variance = stdDev / mean;
    if (variance < 0.1 && intervals.length > 5) {
      anomalies.push({
        isAnomaly: true,
        type: 'bot_activity',
        severity: 'medium',
        confidence: 75,
        description: 'Highly regular transaction intervals detected',
        affectedTransactions: transactions.slice(-5).map(tx => tx.hash),
      });
    }

    return anomalies;
  }

  private detectSuspiciousPatterns(transactions: Transaction[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];

    // Check for circular transactions (A -> B -> A)
    const addressFlow = new Map<string, Set<string>>();
    
    transactions.forEach(tx => {
      if (!addressFlow.has(tx.from)) {
        addressFlow.set(tx.from, new Set());
      }
      addressFlow.get(tx.from)!.add(tx.to);
    });

    // Detect circles
    addressFlow.forEach((destinations, source) => {
      destinations.forEach(dest => {
        if (addressFlow.get(dest)?.has(source)) {
          anomalies.push({
            isAnomaly: true,
            type: 'suspicious_pattern',
            severity: 'high',
            confidence: 80,
            description: 'Circular transaction pattern detected',
            affectedTransactions: transactions
              .filter(tx => (tx.from === source && tx.to === dest) || (tx.from === dest && tx.to === source))
              .map(tx => tx.hash),
          });
        }
      });
    });

    return anomalies;
  }

  private detectWashTrading(transactions: Transaction[]): AnomalyDetection[] {
    // Simplified wash trading detection: same amount back and forth
    const anomalies: AnomalyDetection[] = [];
    
    for (let i = 0; i < transactions.length - 1; i++) {
      for (let j = i + 1; j < Math.min(i + 10, transactions.length); j++) {
        const tx1 = transactions[i];
        const tx2 = transactions[j];
        
        if (Math.abs(tx1.value - tx2.value) / tx1.value < 0.05 && 
            tx1.from === tx2.to && tx1.to === tx2.from &&
            tx2.timestamp - tx1.timestamp < 3600000) { // Within 1 hour
          
          anomalies.push({
            isAnomaly: true,
            type: 'potential_wash_trade',
            severity: 'high',
            confidence: 70,
            description: 'Potential wash trading detected - similar amounts traded back',
            affectedTransactions: [tx1.hash, tx2.hash],
          });
        }
      }
    }

    return anomalies;
  }

  private detectBotActivity(transactions: Transaction[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    // Check for very fast consecutive transactions
    let fastTxCount = 0;
    for (let i = 1; i < transactions.length; i++) {
      if (transactions[i].timestamp - transactions[i - 1].timestamp < 60000) { // < 1 minute
        fastTxCount++;
      }
    }

    if (fastTxCount > transactions.length * 0.3) {
      anomalies.push({
        isAnomaly: true,
        type: 'bot_activity',
        severity: 'medium',
        confidence: 65,
        description: 'High frequency of rapid transactions suggests bot activity',
        affectedTransactions: [],
      });
    }

    return anomalies;
  }

  private predictNextTransactionTiming(
    transactions: Transaction[],
    profile: BehavioralProfile
  ): PredictiveInsight {
    const avgInterval = 1 / profile.transactionFrequency; // days
    const lastTx = transactions[transactions.length - 1];
    const daysSinceLastTx = (Date.now() - lastTx.timestamp) / (24 * 3600 * 1000);

    const likelihood = Math.min((daysSinceLastTx / avgInterval) * 100, 100);
    const timeframe = daysSinceLastTx > avgInterval ? 'Soon' : `In ${(avgInterval - daysSinceLastTx).toFixed(1)} days`;

    return {
      prediction: 'Next transaction timing',
      likelihood,
      timeframe,
      basis: [
        `Average frequency: ${profile.transactionFrequency.toFixed(2)} tx/day`,
        `Last transaction: ${daysSinceLastTx.toFixed(1)} days ago`,
      ],
      confidence: profile.consistencyScore,
    };
  }

  private predictProtocolInteraction(transactions: Transaction[]): PredictiveInsight {
    const protocolCounts = new Map<string, number>();
    
    transactions.forEach(tx => {
      if (tx.protocol) {
        protocolCounts.set(tx.protocol, (protocolCounts.get(tx.protocol) || 0) + 1);
      }
    });

    const sorted = Array.from(protocolCounts.entries())
      .sort((a, b) => b[1] - a[1]);

    const topProtocol = sorted[0]?.[0] || 'Unknown';
    const likelihood = sorted[0] ? (sorted[0][1] / transactions.length) * 100 : 50;

    return {
      prediction: `Likely to interact with ${topProtocol}`,
      likelihood,
      timeframe: 'Next transaction',
      basis: [`${sorted[0]?.[1] || 0} previous interactions`, 'Historical preference'],
      confidence: 70,
    };
  }

  private predictStrategyChange(
    transactions: Transaction[],
    profile: BehavioralProfile
  ): PredictiveInsight {
    const recentTxs = transactions.slice(-10);
    const olderTxs = transactions.slice(-30, -10);

    const recentFreq = recentTxs.length / 10;
    const olderFreq = olderTxs.length / 20;

    const frequencyChange = (recentFreq - olderFreq) / olderFreq;

    if (Math.abs(frequencyChange) > 0.3) {
      return {
        prediction: 'Trading strategy is changing',
        likelihood: Math.min(Math.abs(frequencyChange) * 100, 100),
        timeframe: 'Current',
        basis: [
          `Frequency change: ${(frequencyChange * 100).toFixed(1)}%`,
          'Significant deviation from historical behavior',
        ],
        confidence: 75,
      };
    }

    return {
      prediction: 'Strategy remains consistent',
      likelihood: 80,
      timeframe: 'Ongoing',
      basis: ['Stable transaction patterns', 'Consistent behavior'],
      confidence: profile.consistencyScore,
    };
  }

  private predictRiskAdjustment(
    transactions: Transaction[],
    profile: BehavioralProfile
  ): PredictiveInsight {
    const recentValues = transactions.slice(-10).map(tx => tx.value);
    const avgRecentValue = recentValues.reduce((sum, v) => sum + v, 0) / recentValues.length;
    const overallAvgValue = transactions.map(tx => tx.value).reduce((sum, v) => sum + v, 0) / transactions.length;

    const changeRatio = avgRecentValue / overallAvgValue;

    if (changeRatio > 1.5) {
      return {
        prediction: 'Increasing position sizes - higher risk appetite',
        likelihood: 75,
        timeframe: 'Recent trend',
        basis: [`Position sizes up ${((changeRatio - 1) * 100).toFixed(1)}%`],
        confidence: 70,
      };
    } else if (changeRatio < 0.7) {
      return {
        prediction: 'Decreasing position sizes - risk reduction',
        likelihood: 75,
        timeframe: 'Recent trend',
        basis: [`Position sizes down ${((1 - changeRatio) * 100).toFixed(1)}%`],
        confidence: 70,
      };
    }

    return {
      prediction: 'Risk appetite remains stable',
      likelihood: 80,
      timeframe: 'Ongoing',
      basis: ['Consistent position sizing'],
      confidence: 75,
    };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    // Simple linear regression slope
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, v) => sum + v, 0);
    const sumXY = values.reduce((sum, v, i) => sum + (i * v), 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;

    return avgY > 0 ? slope / avgY : 0; // Normalized slope
  }

  private calculateVolatility(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean;
  }

  private groupByDay(transactions: Transaction[]): Map<string, Transaction[]> {
    const groups = new Map<string, Transaction[]>();
    
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp).toISOString().split('T')[0];
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(tx);
    });

    return groups;
  }

  private detectPeriodicPattern(
    data: number[],
    period: number
  ): { confidence: number } {
    if (data.length < period * 3) return { confidence: 0 };

    // Autocorrelation at given period
    let correlation = 0;
    let count = 0;

    for (let i = 0; i < data.length - period; i++) {
      correlation += data[i] * data[i + period];
      count++;
    }

    const confidence = count > 0 ? Math.min((correlation / count) * 10, 100) : 0;
    return { confidence };
  }

  private calculateTimingCorrelation(
    txs1: Transaction[],
    txs2: Transaction[]
  ): number {
    let correlatedCount = 0;
    const timeWindow = 24 * 3600 * 1000; // 24 hours

    txs1.forEach(tx1 => {
      txs2.forEach(tx2 => {
        if (Math.abs(tx1.timestamp - tx2.timestamp) < timeWindow) {
          correlatedCount++;
        }
      });
    });

    return (correlatedCount / Math.min(txs1.length, txs2.length)) * 100;
  }

  private calculatePatternSimilarity(
    txs1: Transaction[],
    txs2: Transaction[]
  ): number {
    const profile1 = this.analyzeBehavioralPatterns(txs1);
    const profile2 = this.analyzeBehavioralPatterns(txs2);

    let similarity = 0;

    // Compare trading styles
    if (profile1.tradingStyle === profile2.tradingStyle) {
      similarity += 30;
    }

    // Compare risk appetite
    if (profile1.riskAppetite === profile2.riskAppetite) {
      similarity += 30;
    }

    // Compare hold times
    const holdTimeDiff = Math.abs(profile1.avgHoldTime - profile2.avgHoldTime) / 
                         Math.max(profile1.avgHoldTime, profile2.avgHoldTime);
    similarity += (1 - holdTimeDiff) * 20;

    // Compare frequencies
    const freqDiff = Math.abs(profile1.transactionFrequency - profile2.transactionFrequency) /
                     Math.max(profile1.transactionFrequency, profile2.transactionFrequency);
    similarity += (1 - freqDiff) * 20;

    return similarity;
  }
}

// Export singleton instance
export const patternRecognitionEngine = new PatternRecognitionEngine();

