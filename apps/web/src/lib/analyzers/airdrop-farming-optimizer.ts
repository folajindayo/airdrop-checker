/**
 * Airdrop Farming Optimizer - Maximizes airdrop eligibility across protocols
 * Analyzes historical patterns and suggests optimal farming strategies
 */

interface ProtocolActivity {
  protocol: string;
  chain: string;
  category: 'dex' | 'lending' | 'bridge' | 'nft' | 'social' | 'gaming' | 'defi';
  userCount: number;
  tvl: number;
  airdropLikelihood: number; // 0-100
  historicalAirdrops: {
    name: string;
    date: number;
    avgReward: number;
    criteria: string[];
  }[];
  currentRequirements: {
    minTransactions: number;
    minVolume: number;
    minTimeActive: number; // days
    additionalCriteria: string[];
  };
}

interface FarmingAction {
  protocol: string;
  action: string;
  category: string;
  estimatedCost: number; // gas + protocol fees
  potentialReward: number; // estimated value
  roi: number; // expected return on investment
  timeRequired: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface FarmingStrategy {
  name: string;
  description: string;
  targetProtocols: string[];
  actions: FarmingAction[];
  totalCost: number;
  expectedReward: number;
  expectedROI: number;
  timeframe: number; // days
  riskLevel: 'low' | 'medium' | 'high';
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

interface EligibilityGap {
  protocol: string;
  currentProgress: number; // 0-100
  missingCriteria: string[];
  actionsNeeded: FarmingAction[];
  estimatedCostToComplete: number;
  potentialReward: number;
}

export class AirdropFarmingOptimizer {
  private readonly MIN_LIKELIHOOD_THRESHOLD = 40; // Only consider protocols with 40%+ likelihood
  private readonly MAX_GAS_BUDGET_PERCENT = 0.3; // Don't spend more than 30% of expected reward on gas

  /**
   * Analyze user's current airdrop farming portfolio
   */
  analyzeCurrentFarming(
    userProtocols: Set<string>,
    allProtocols: ProtocolActivity[]
  ): {
    covered: ProtocolActivity[];
    missed: ProtocolActivity[];
    diversificationScore: number;
    estimatedTotalReward: number;
    recommendations: string[];
  } {
    const covered = allProtocols.filter(p => userProtocols.has(p.protocol));
    const missed = allProtocols
      .filter(p => !userProtocols.has(p.protocol) && 
                   p.airdropLikelihood >= this.MIN_LIKELIHOOD_THRESHOLD)
      .sort((a, b) => b.airdropLikelihood - a.airdropLikelihood);

    // Calculate diversification across categories
    const categories = new Set(covered.map(p => p.category));
    const diversificationScore = (categories.size / 7) * 100; // 7 categories total

    // Estimate total potential rewards
    const estimatedTotalReward = covered.reduce((sum, p) => {
      const avgHistoricalReward = p.historicalAirdrops.length > 0
        ? p.historicalAirdrops.reduce((s, a) => s + a.avgReward, 0) / p.historicalAirdrops.length
        : 500; // Default estimate
      return sum + (avgHistoricalReward * p.airdropLikelihood / 100);
    }, 0);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (diversificationScore < 50) {
      recommendations.push('Increase diversification across different protocol categories');
    }

    if (missed.length > 5) {
      recommendations.push(`You're missing ${missed.length} high-potential protocols`);
    }

    if (covered.length > 0) {
      const avgTransactionsNeeded = covered.reduce((sum, p) => 
        sum + p.currentRequirements.minTransactions, 0) / covered.length;
      
      if (avgTransactionsNeeded > 10) {
        recommendations.push('Focus on completing requirements for protocols you already use');
      }
    }

    return {
      covered,
      missed,
      diversificationScore,
      estimatedTotalReward,
      recommendations,
    };
  }

  /**
   * Generate optimal airdrop farming strategies
   */
  generateStrategies(
    protocols: ProtocolActivity[],
    budget: number,
    timeAvailable: number // hours per week
  ): FarmingStrategy[] {
    const strategies: FarmingStrategy[] = [];

    // Strategy 1: Quick Wins (Low-hanging fruit)
    strategies.push(this.createQuickWinsStrategy(protocols, budget));

    // Strategy 2: High Value (Best ROI)
    strategies.push(this.createHighValueStrategy(protocols, budget));

    // Strategy 3: Diversified (Spread across categories)
    strategies.push(this.createDiversifiedStrategy(protocols, budget));

    // Strategy 4: Layer 2 Focus (Gas-efficient)
    strategies.push(this.createLayer2Strategy(protocols, budget));

    // Strategy 5: Blue Chip Focus (Established protocols)
    strategies.push(this.createBlueChipStrategy(protocols, budget));

    return strategies
      .filter(s => s.totalCost <= budget && 
                   s.actions.reduce((sum, a) => sum + a.timeRequired, 0) <= timeAvailable * 60)
      .sort((a, b) => b.expectedROI - a.expectedROI);
  }

  /**
   * Identify eligibility gaps and suggest completion actions
   */
  identifyEligibilityGaps(
    userActivity: Map<string, {
      transactions: number;
      volume: number;
      daysActive: number;
      completedCriteria: Set<string>;
    }>,
    protocols: ProtocolActivity[]
  ): EligibilityGap[] {
    const gaps: EligibilityGap[] = [];

    protocols.forEach(protocol => {
      const activity = userActivity.get(protocol.protocol);
      
      if (!activity) {
        // Not using this protocol at all
        gaps.push({
          protocol: protocol.protocol,
          currentProgress: 0,
          missingCriteria: [
            `Make ${protocol.currentRequirements.minTransactions} transactions`,
            `Generate $${protocol.currentRequirements.minVolume} volume`,
            `Be active for ${protocol.currentRequirements.minTimeActive} days`,
            ...protocol.currentRequirements.additionalCriteria,
          ],
          actionsNeeded: this.generateActionsForProtocol(protocol),
          estimatedCostToComplete: this.estimateCompletionCost(protocol),
          potentialReward: this.estimatePotentialReward(protocol),
        });
      } else {
        // Using protocol but not meeting all criteria
        const missing: string[] = [];
        const criteria: Set<string> = new Set();

        if (activity.transactions < protocol.currentRequirements.minTransactions) {
          missing.push(`Need ${protocol.currentRequirements.minTransactions - activity.transactions} more transactions`);
          criteria.add('transactions');
        }

        if (activity.volume < protocol.currentRequirements.minVolume) {
          missing.push(`Need $${(protocol.currentRequirements.minVolume - activity.volume).toFixed(2)} more volume`);
          criteria.add('volume');
        }

        if (activity.daysActive < protocol.currentRequirements.minTimeActive) {
          missing.push(`Need ${protocol.currentRequirements.minTimeActive - activity.daysActive} more active days`);
          criteria.add('time');
        }

        protocol.currentRequirements.additionalCriteria.forEach(c => {
          if (!activity.completedCriteria.has(c)) {
            missing.push(c);
            criteria.add(c);
          }
        });

        if (missing.length > 0) {
          const progress = ((protocol.currentRequirements.minTransactions + 
                            protocol.currentRequirements.additionalCriteria.length - 
                            missing.length) / 
                           (protocol.currentRequirements.minTransactions + 
                            protocol.currentRequirements.additionalCriteria.length)) * 100;

          gaps.push({
            protocol: protocol.protocol,
            currentProgress: progress,
            missingCriteria: missing,
            actionsNeeded: this.generateActionsForCriteria(protocol, criteria),
            estimatedCostToComplete: this.estimatePartialCompletionCost(protocol, criteria),
            potentialReward: this.estimatePotentialReward(protocol),
          });
        }
      }
    });

    return gaps.sort((a, b) => {
      // Prioritize protocols close to completion with high rewards
      const aScore = (a.currentProgress * 0.7) + ((a.potentialReward / a.estimatedCostToComplete) * 0.3);
      const bScore = (b.currentProgress * 0.7) + ((b.potentialReward / b.estimatedCostToComplete) * 0.3);
      return bScore - aScore;
    });
  }

  /**
   * Calculate optimal action sequence to maximize eligibility
   */
  optimizeActionSequence(
    actions: FarmingAction[],
    maxBudget: number,
    maxTimeHours: number
  ): {
    sequence: FarmingAction[];
    totalCost: number;
    totalTime: number;
    expectedReward: number;
    efficiency: number;
  } {
    // Sort actions by ROI
    const sorted = [...actions].sort((a, b) => b.roi - a.roi);

    const sequence: FarmingAction[] = [];
    let totalCost = 0;
    let totalTime = 0;
    let expectedReward = 0;

    for (const action of sorted) {
      if (totalCost + action.estimatedCost <= maxBudget &&
          totalTime + action.timeRequired <= maxTimeHours * 60) {
        sequence.push(action);
        totalCost += action.estimatedCost;
        totalTime += action.timeRequired;
        expectedReward += action.potentialReward;
      }
    }

    const efficiency = totalCost > 0 ? (expectedReward / totalCost) * 100 : 0;

    return {
      sequence,
      totalCost,
      totalTime: totalTime / 60, // Convert to hours
      expectedReward,
      efficiency,
    };
  }

  /**
   * Predict future airdrop opportunities based on protocol patterns
   */
  predictFutureAirdrops(
    protocols: ProtocolActivity[]
  ): Array<{
    protocol: string;
    likelihood: number;
    estimatedTimeline: string;
    reasonsing: string[];
    preprationSteps: string[];
  }> {
    const predictions: Array<{
      protocol: string;
      likelihood: number;
      estimatedTimeline: string;
      reasoning: string[];
      preparationSteps: string[];
    }> = [];

    protocols.forEach(protocol => {
      const reasoning: string[] = [];
      const preparationSteps: string[] = [];
      let likelihood = protocol.airdropLikelihood;

      // Analyze indicators
      if (protocol.tvl > 100000000 && protocol.historicalAirdrops.length === 0) {
        reasoning.push('High TVL without token - potential future airdrop');
        likelihood += 15;
      }

      if (protocol.userCount > 50000 && protocol.historicalAirdrops.length === 0) {
        reasoning.push('Large user base without reward distribution');
        likelihood += 10;
      }

      if (protocol.historicalAirdrops.length > 0) {
        const avgTimeBetween = this.calculateAvgTimeBetween(protocol.historicalAirdrops);
        if (avgTimeBetween < 365) {
          reasoning.push('History of regular airdrops');
          likelihood += 20;
        }
      }

      // Determine timeline
      let timeline = 'Unknown';
      if (likelihood > 70) {
        timeline = '3-6 months';
      } else if (likelihood > 50) {
        timeline = '6-12 months';
      } else if (likelihood > 30) {
        timeline = '12+ months';
      }

      // Generate preparation steps
      preparationSteps.push(`Use ${protocol.protocol} regularly (${protocol.currentRequirements.minTransactions}+ transactions)`);
      preparationSteps.push(`Maintain active position for ${protocol.currentRequirements.minTimeActive}+ days`);
      preparationSteps.push(`Generate at least $${protocol.currentRequirements.minVolume} in volume`);
      
      protocol.currentRequirements.additionalCriteria.forEach(c => {
        preparationSteps.push(c);
      });

      if (likelihood >= this.MIN_LIKELIHOOD_THRESHOLD) {
        predictions.push({
          protocol: protocol.protocol,
          likelihood: Math.min(likelihood, 100),
          estimatedTimeline: timeline,
          reasoning,
          preparationSteps,
        });
      }
    });

    return predictions.sort((a, b) => b.likelihood - a.likelihood);
  }

  // Private helper methods
  private createQuickWinsStrategy(
    protocols: ProtocolActivity[],
    budget: number
  ): FarmingStrategy {
    const quickWins = protocols
      .filter(p => p.currentRequirements.minTransactions <= 5 && 
                   p.airdropLikelihood >= 50)
      .sort((a, b) => b.airdropLikelihood - a.airdropLikelihood)
      .slice(0, 5);

    const actions = quickWins.flatMap(p => this.generateActionsForProtocol(p));
    const totalCost = actions.reduce((sum, a) => sum + a.estimatedCost, 0);
    const expectedReward = quickWins.reduce((sum, p) => sum + this.estimatePotentialReward(p), 0);

    return {
      name: 'Quick Wins',
      description: 'Low-effort, high-probability airdrops you can complete quickly',
      targetProtocols: quickWins.map(p => p.protocol),
      actions: actions.slice(0, 15), // Limit to 15 actions
      totalCost,
      expectedReward,
      expectedROI: (expectedReward / totalCost) * 100,
      timeframe: 14, // 2 weeks
      riskLevel: 'low',
      complexity: 'beginner',
    };
  }

  private createHighValueStrategy(
    protocols: ProtocolActivity[],
    budget: number
  ): FarmingStrategy {
    const highValue = protocols
      .filter(p => this.estimatePotentialReward(p) > 1000)
      .sort((a, b) => this.estimatePotentialReward(b) - this.estimatePotentialReward(a))
      .slice(0, 5);

    const actions = highValue.flatMap(p => this.generateActionsForProtocol(p));
    const totalCost = actions.reduce((sum, a) => sum + a.estimatedCost, 0);
    const expectedReward = highValue.reduce((sum, p) => sum + this.estimatePotentialReward(p), 0);

    return {
      name: 'High Value',
      description: 'Focus on protocols with highest potential rewards',
      targetProtocols: highValue.map(p => p.protocol),
      actions,
      totalCost,
      expectedReward,
      expectedROI: (expectedReward / totalCost) * 100,
      timeframe: 60, // 2 months
      riskLevel: 'medium',
      complexity: 'intermediate',
    };
  }

  private createDiversifiedStrategy(
    protocols: ProtocolActivity[],
    budget: number
  ): FarmingStrategy {
    const byCategory = new Map<string, ProtocolActivity[]>();
    
    protocols.forEach(p => {
      if (!byCategory.has(p.category)) {
        byCategory.set(p.category, []);
      }
      byCategory.get(p.category)!.push(p);
    });

    const selected: ProtocolActivity[] = [];
    byCategory.forEach(protos => {
      const best = protos
        .sort((a, b) => b.airdropLikelihood - a.airdropLikelihood)[0];
      if (best) selected.push(best);
    });

    const actions = selected.flatMap(p => this.generateActionsForProtocol(p));
    const totalCost = actions.reduce((sum, a) => sum + a.estimatedCost, 0);
    const expectedReward = selected.reduce((sum, p) => sum + this.estimatePotentialReward(p), 0);

    return {
      name: 'Diversified',
      description: 'Spread across all protocol categories for maximum coverage',
      targetProtocols: selected.map(p => p.protocol),
      actions,
      totalCost,
      expectedReward,
      expectedROI: (expectedReward / totalCost) * 100,
      timeframe: 90, // 3 months
      riskLevel: 'low',
      complexity: 'intermediate',
    };
  }

  private createLayer2Strategy(
    protocols: ProtocolActivity[],
    budget: number
  ): FarmingStrategy {
    const l2Chains = ['arbitrum', 'optimism', 'base', 'zksync', 'linea', 'scroll'];
    const l2Protocols = protocols
      .filter(p => l2Chains.some(chain => p.chain.toLowerCase().includes(chain)))
      .sort((a, b) => b.airdropLikelihood - a.airdropLikelihood)
      .slice(0, 6);

    const actions = l2Protocols.flatMap(p => this.generateActionsForProtocol(p));
    const totalCost = actions.reduce((sum, a) => sum + a.estimatedCost, 0);
    const expectedReward = l2Protocols.reduce((sum, p) => sum + this.estimatePotentialReward(p), 0);

    return {
      name: 'Layer 2 Focus',
      description: 'Gas-efficient strategy focused on L2 networks',
      targetProtocols: l2Protocols.map(p => p.protocol),
      actions,
      totalCost,
      expectedReward,
      expectedROI: (expectedReward / totalCost) * 100,
      timeframe: 45, // 1.5 months
      riskLevel: 'medium',
      complexity: 'beginner',
    };
  }

  private createBlueChipStrategy(
    protocols: ProtocolActivity[],
    budget: number
  ): FarmingStrategy {
    const blueChip = protocols
      .filter(p => p.tvl > 100000000 && p.userCount > 100000)
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 5);

    const actions = blueChip.flatMap(p => this.generateActionsForProtocol(p));
    const totalCost = actions.reduce((sum, a) => sum + a.estimatedCost, 0);
    const expectedReward = blueChip.reduce((sum, p) => sum + this.estimatePotentialReward(p), 0);

    return {
      name: 'Blue Chip',
      description: 'Established protocols with highest likelihood of rewards',
      targetProtocols: blueChip.map(p => p.protocol),
      actions,
      totalCost,
      expectedReward,
      expectedROI: (expectedReward / totalCost) * 100,
      timeframe: 90, // 3 months
      riskLevel: 'low',
      complexity: 'intermediate',
    };
  }

  private generateActionsForProtocol(protocol: ProtocolActivity): FarmingAction[] {
    const actions: FarmingAction[] = [];
    const baseCost = protocol.chain.includes('ethereum') ? 15 : 2; // Gas estimate

    // Basic actions based on category
    if (protocol.category === 'dex') {
      actions.push({
        protocol: protocol.protocol,
        action: 'Make a swap',
        category: 'Trading',
        estimatedCost: baseCost,
        potentialReward: this.estimatePotentialReward(protocol) / protocol.currentRequirements.minTransactions,
        roi: 0,
        timeRequired: 5,
        difficulty: 'easy',
        priority: 'high',
      });
    }

    if (protocol.category === 'lending') {
      actions.push({
        protocol: protocol.protocol,
        action: 'Deposit and borrow',
        category: 'Lending',
        estimatedCost: baseCost * 2,
        potentialReward: this.estimatePotentialReward(protocol) / protocol.currentRequirements.minTransactions,
        roi: 0,
        timeRequired: 10,
        difficulty: 'medium',
        priority: 'high',
      });
    }

    if (protocol.category === 'bridge') {
      actions.push({
        protocol: protocol.protocol,
        action: 'Bridge assets',
        category: 'Bridge',
        estimatedCost: baseCost * 1.5,
        potentialReward: this.estimatePotentialReward(protocol) / protocol.currentRequirements.minTransactions,
        roi: 0,
        timeRequired: 8,
        difficulty: 'easy',
        priority: 'high',
      });
    }

    // Calculate ROI for each action
    actions.forEach(action => {
      action.roi = (action.potentialReward / action.estimatedCost) * 100;
    });

    return actions;
  }

  private generateActionsForCriteria(
    protocol: ProtocolActivity,
    criteria: Set<string>
  ): FarmingAction[] {
    const actions: FarmingAction[] = [];
    const allActions = this.generateActionsForProtocol(protocol);

    criteria.forEach(criterion => {
      const relevantAction = allActions.find(a => 
        criterion.includes(a.category.toLowerCase())
      ) || allActions[0];
      
      if (relevantAction) {
        actions.push(relevantAction);
      }
    });

    return actions;
  }

  private estimatePotentialReward(protocol: ProtocolActivity): number {
    if (protocol.historicalAirdrops.length > 0) {
      const avgReward = protocol.historicalAirdrops.reduce((sum, a) => sum + a.avgReward, 0) / 
                       protocol.historicalAirdrops.length;
      return avgReward * (protocol.airdropLikelihood / 100);
    }

    // Estimate based on TVL and user count
    const baseEstimate = Math.min(protocol.tvl / 1000000, 1000); // $1 per $1M TVL, max $1000
    return baseEstimate * (protocol.airdropLikelihood / 100);
  }

  private estimateCompletionCost(protocol: ProtocolActivity): number {
    const actions = this.generateActionsForProtocol(protocol);
    const actionsNeeded = protocol.currentRequirements.minTransactions;
    return actions.slice(0, actionsNeeded).reduce((sum, a) => sum + a.estimatedCost, 0);
  }

  private estimatePartialCompletionCost(
    protocol: ProtocolActivity,
    missingCriteria: Set<string>
  ): number {
    const actions = this.generateActionsForCriteria(protocol, missingCriteria);
    return actions.reduce((sum, a) => sum + a.estimatedCost, 0);
  }

  private calculateAvgTimeBetween(airdrops: { date: number }[]): number {
    if (airdrops.length < 2) return 365;
    
    const sorted = airdrops.sort((a, b) => a.date - b.date);
    const intervals: number[] = [];
    
    for (let i = 1; i < sorted.length; i++) {
      intervals.push((sorted[i].date - sorted[i - 1].date) / (24 * 3600 * 1000));
    }
    
    return intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
  }
}

// Export singleton instance
export const airdropFarmingOptimizer = new AirdropFarmingOptimizer();

