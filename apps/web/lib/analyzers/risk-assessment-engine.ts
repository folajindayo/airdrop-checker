/**
 * Risk Assessment Engine - Evaluates smart contracts and protocols for security risks
 * Analyzes code patterns, audit status, and historical vulnerabilities
 */

interface ContractAnalysis {
  address: string;
  name: string;
  verified: boolean;
  auditStatus: 'audited' | 'unaudited' | 'partially_audited';
  auditors: string[];
  lastAuditDate?: number;
  deploymentAge: number; // days since deployment
  transactionCount: number;
  uniqueUsers: number;
}

interface SecurityFlag {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  recommendation: string;
  impact: number; // 0-100 scale
}

interface RiskScore {
  overall: number; // 0-100 (0 = safest, 100 = most risky)
  breakdown: {
    contractRisk: number;
    auditRisk: number;
    marketRisk: number;
    liquidityRisk: number;
    centraliz ationRisk: number;
  };
  flags: SecurityFlag[];
  riskLevel: 'minimal' | 'low' | 'moderate' | 'high' | 'critical';
  trustScore: number; // 0-100 (100 = most trustworthy)
}

interface ProtocolMetrics {
  tvl: number; // Total Value Locked
  volume24h: number;
  userCount: number;
  timeInMarket: number; // days
  hasGovernanceToken: boolean;
  hasTimelocks: boolean;
  isUpgradeable: boolean;
  adminKeysType: 'multisig' | 'single' | 'timelock' | 'immutable';
}

interface VulnerabilityPattern {
  pattern: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  examples: string[];
}

export class RiskAssessmentEngine {
  private readonly CRITICAL_TVL_THRESHOLD = 1000000; // $1M
  private readonly MIN_AUDIT_AGE_DAYS = 30;
  private readonly MIN_DEPLOYMENT_AGE_DAYS = 90;

  private readonly VULNERABILITY_PATTERNS: VulnerabilityPattern[] = [
    {
      pattern: 'reentrancy',
      severity: 'critical',
      description: 'Potential reentrancy vulnerability',
      examples: ['external call before state update', 'missing reentrancy guard'],
    },
    {
      pattern: 'integer_overflow',
      severity: 'high',
      description: 'Arithmetic operations without SafeMath',
      examples: ['unchecked addition', 'unchecked multiplication'],
    },
    {
      pattern: 'access_control',
      severity: 'high',
      description: 'Weak access control mechanisms',
      examples: ['missing onlyOwner', 'public admin functions'],
    },
    {
      pattern: 'front_running',
      severity: 'medium',
      description: 'Susceptible to front-running attacks',
      examples: ['predictable randomness', 'unprotected price oracles'],
    },
    {
      pattern: 'dos',
      severity: 'medium',
      description: 'Denial of Service vulnerabilities',
      examples: ['unbounded loops', 'external call failures blocking execution'],
    },
  ];

  /**
   * Comprehensive risk assessment for a smart contract
   */
  assessContract(
    contract: ContractAnalysis,
    metrics: ProtocolMetrics
  ): RiskScore {
    const flags: SecurityFlag[] = [];

    // Analyze contract-level risks
    const contractRisk = this.analyzeContractRisk(contract, flags);

    // Analyze audit status
    const auditRisk = this.analyzeAuditRisk(contract, flags);

    // Analyze market risks
    const marketRisk = this.analyzeMarketRisk(metrics, flags);

    // Analyze liquidity risks
    const liquidityRisk = this.analyzeLiquidityRisk(metrics, flags);

    // Analyze centralization risks
    const centralizationRisk = this.analyzeCentralizationRisk(metrics, flags);

    // Calculate overall risk score (weighted average)
    const overall = this.calculateOverallRisk({
      contractRisk,
      auditRisk,
      marketRisk,
      liquidityRisk,
      centralizationRisk,
    });

    // Determine risk level
    const riskLevel = this.determineRiskLevel(overall);

    // Calculate trust score (inverse of risk)
    const trustScore = 100 - overall;

    return {
      overall,
      breakdown: {
        contractRisk,
        auditRisk,
        marketRisk,
        liquidityRisk,
        centralizationRisk,
      },
      flags: flags.sort((a, b) => this.getSeverityValue(b.severity) - this.getSeverityValue(a.severity)),
      riskLevel,
      trustScore,
    };
  }

  /**
   * Compare two protocols and identify the safer option
   */
  compareProtocols(
    protocol1: { contract: ContractAnalysis; metrics: ProtocolMetrics },
    protocol2: { contract: ContractAnalysis; metrics: ProtocolMetrics }
  ): {
    safer: 'protocol1' | 'protocol2';
    difference: number;
    reasons: string[];
  } {
    const risk1 = this.assessContract(protocol1.contract, protocol1.metrics);
    const risk2 = this.assessContract(protocol2.contract, protocol2.metrics);

    const safer = risk1.overall < risk2.overall ? 'protocol1' : 'protocol2';
    const difference = Math.abs(risk1.overall - risk2.overall);
    const reasons: string[] = [];

    // Compare each risk category
    if (Math.abs(risk1.breakdown.contractRisk - risk2.breakdown.contractRisk) > 10) {
      const better = risk1.breakdown.contractRisk < risk2.breakdown.contractRisk ? 'Protocol 1' : 'Protocol 2';
      reasons.push(`${better} has better contract security`);
    }

    if (Math.abs(risk1.breakdown.auditRisk - risk2.breakdown.auditRisk) > 10) {
      const better = risk1.breakdown.auditRisk < risk2.breakdown.auditRisk ? 'Protocol 1' : 'Protocol 2';
      reasons.push(`${better} has more thorough audits`);
    }

    if (Math.abs(risk1.breakdown.centralizationRisk - risk2.breakdown.centralizationRisk) > 10) {
      const better = risk1.breakdown.centralizationRisk < risk2.breakdown.centralizationRisk ? 'Protocol 1' : 'Protocol 2';
      reasons.push(`${better} is more decentralized`);
    }

    return { safer, difference, reasons };
  }

  /**
   * Generate security recommendations based on risk assessment
   */
  generateRecommendations(risk: RiskScore): Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    rationale: string;
  }> {
    const recommendations: Array<{
      priority: 'critical' | 'high' | 'medium' | 'low';
      action: string;
      rationale: string;
    }> = [];

    // Critical flags
    const criticalFlags = risk.flags.filter(f => f.severity === 'critical');
    if (criticalFlags.length > 0) {
      recommendations.push({
        priority: 'critical',
        action: 'Avoid interacting with this protocol',
        rationale: `${criticalFlags.length} critical security issues detected that could result in loss of funds`,
      });
    }

    // High contract risk
    if (risk.breakdown.contractRisk > 70) {
      recommendations.push({
        priority: 'high',
        action: 'Wait for independent audits before using',
        rationale: 'Contract has not been properly audited or verified',
      });
    }

    // High centralization risk
    if (risk.breakdown.centralizationRisk > 70) {
      recommendations.push({
        priority: 'high',
        action: 'Limit exposure to this protocol',
        rationale: 'High centralization risk means admin could potentially rug pull or change contract behavior',
      });
    }

    // Moderate overall risk
    if (risk.overall > 50 && risk.overall <= 70) {
      recommendations.push({
        priority: 'medium',
        action: 'Use with caution and smaller amounts',
        rationale: 'Moderate risk detected. Only invest what you can afford to lose',
      });
    }

    // Low risk protocols
    if (risk.overall < 30) {
      recommendations.push({
        priority: 'low',
        action: 'Suitable for regular use',
        rationale: 'Protocol shows good security practices and low risk indicators',
      });
    }

    // Liquidity risks
    if (risk.breakdown.liquidityRisk > 60) {
      recommendations.push({
        priority: 'medium',
        action: 'Be prepared for slippage and potential inability to exit',
        rationale: 'Low liquidity could make it difficult to exit positions',
      });
    }

    return recommendations;
  }

  /**
   * Calculate insurance premium for protocol interaction
   */
  calculateInsurancePremium(
    riskScore: RiskScore,
    coverageAmount: number,
    coverageDuration: number // days
  ): {
    premium: number;
    premiumRate: number; // percentage
    explanation: string;
  } {
    // Base rate starts at 1% for minimal risk
    let baseRate = 0.01;

    // Adjust based on overall risk
    if (riskScore.overall < 20) {
      baseRate = 0.01; // 1%
    } else if (riskScore.overall < 40) {
      baseRate = 0.03; // 3%
    } else if (riskScore.overall < 60) {
      baseRate = 0.05; // 5%
    } else if (riskScore.overall < 80) {
      baseRate = 0.10; // 10%
    } else {
      baseRate = 0.20; // 20%
    }

    // Adjust for duration
    const durationMultiplier = coverageDuration / 365;

    // Calculate premium
    const premiumRate = baseRate * (1 + durationMultiplier);
    const premium = coverageAmount * premiumRate;

    let explanation = '';
    if (riskScore.overall < 30) {
      explanation = 'Low risk protocol. Premium reflects minimal expected loss ratio.';
    } else if (riskScore.overall < 60) {
      explanation = 'Moderate risk. Premium includes buffer for potential security incidents.';
    } else {
      explanation = 'High risk protocol. Premium reflects significant probability of adverse events.';
    }

    return {
      premium,
      premiumRate: premiumRate * 100,
      explanation,
    };
  }

  /**
   * Detect honeypot characteristics
   */
  detectHoneypot(
    contract: ContractAnalysis,
    tradingMetrics: {
      canSell: boolean;
      canBuy: boolean;
      maxTxAmount?: number;
      sellTax: number;
      buyTax: number;
      liquidityLocked: boolean;
      ownershipRenounced: boolean;
    }
  ): {
    isHoneypot: boolean;
    confidence: number;
    indicators: string[];
  } {
    const indicators: string[] = [];
    let suspicionScore = 0;

    // Check if selling is disabled
    if (!tradingMetrics.canSell && tradingMetrics.canBuy) {
      indicators.push('CRITICAL: Selling is disabled - classic honeypot');
      suspicionScore += 50;
    }

    // Check for excessive taxes
    if (tradingMetrics.sellTax > 20) {
      indicators.push(`High sell tax (${tradingMetrics.sellTax}%) - potential trap`);
      suspicionScore += 20;
    }

    if (tradingMetrics.buyTax > 20) {
      indicators.push(`High buy tax (${tradingMetrics.buyTax}%) - suspicious`);
      suspicionScore += 10;
    }

    // Check for unverified contract
    if (!contract.verified) {
      indicators.push('Contract not verified - cannot assess code');
      suspicionScore += 15;
    }

    // Check liquidity and ownership
    if (!tradingMetrics.liquidityLocked) {
      indicators.push('Liquidity not locked - rug pull risk');
      suspicionScore += 15;
    }

    if (!tradingMetrics.ownershipRenounced && contract.name !== 'known_protocol') {
      indicators.push('Ownership not renounced - admin control risk');
      suspicionScore += 10;
    }

    // Check deployment age
    if (contract.deploymentAge < 7) {
      indicators.push('Very new contract - proceed with extreme caution');
      suspicionScore += 10;
    }

    const isHoneypot = suspicionScore >= 50;
    const confidence = Math.min(suspicionScore, 100);

    return {
      isHoneypot,
      confidence,
      indicators,
    };
  }

  // Private helper methods
  private analyzeContractRisk(contract: ContractAnalysis, flags: SecurityFlag[]): number {
    let risk = 0;

    // Unverified contract - very high risk
    if (!contract.verified) {
      risk += 40;
      flags.push({
        severity: 'critical',
        category: 'Contract Verification',
        description: 'Contract source code is not verified',
        recommendation: 'Never interact with unverified contracts. They could contain malicious code.',
        impact: 40,
      });
    }

    // New contract - higher risk
    if (contract.deploymentAge < this.MIN_DEPLOYMENT_AGE_DAYS) {
      const ageRisk = Math.max(0, 20 - (contract.deploymentAge / this.MIN_DEPLOYMENT_AGE_DAYS) * 20);
      risk += ageRisk;
      
      if (ageRisk > 10) {
        flags.push({
          severity: 'high',
          category: 'Contract Age',
          description: `Contract deployed only ${contract.deploymentAge} days ago`,
          recommendation: 'Wait for contract to prove itself over time (90+ days recommended).',
          impact: ageRisk,
        });
      }
    }

    // Low usage - higher risk
    if (contract.transactionCount < 100) {
      risk += 15;
      flags.push({
        severity: 'medium',
        category: 'Usage',
        description: `Low transaction count (${contract.transactionCount})`,
        recommendation: 'Limited battle-testing. Consider waiting for more usage.',
        impact: 15,
      });
    }

    return Math.min(risk, 100);
  }

  private analyzeAuditRisk(contract: ContractAnalysis, flags: SecurityFlag[]): number {
    let risk = 0;

    if (contract.auditStatus === 'unaudited') {
      risk += 50;
      flags.push({
        severity: 'critical',
        category: 'Audit Status',
        description: 'Contract has not been audited',
        recommendation: 'Avoid protocols without professional security audits.',
        impact: 50,
      });
    } else if (contract.auditStatus === 'partially_audited') {
      risk += 25;
      flags.push({
        severity: 'medium',
        category: 'Audit Coverage',
        description: 'Contract is only partially audited',
        recommendation: 'Ensure critical components have been audited.',
        impact: 25,
      });
    } else {
      // Check audit recency
      if (contract.lastAuditDate) {
        const daysSinceAudit = (Date.now() - contract.lastAuditDate) / (24 * 3600 * 1000);
        if (daysSinceAudit > 365) {
          risk += 20;
          flags.push({
            severity: 'medium',
            category: 'Audit Freshness',
            description: 'Audit is over 1 year old',
            recommendation: 'Check if contract has been updated since last audit.',
            impact: 20,
          });
        }
      }

      // Check auditor reputation (simplified)
      const reputableAuditors = ['CertiK', 'Trail of Bits', 'OpenZeppelin', 'ConsenSys'];
      const hasReputableAuditor = contract.auditors.some(a => 
        reputableAuditors.some(r => a.includes(r))
      );

      if (!hasReputableAuditor) {
        risk += 10;
        flags.push({
          severity: 'low',
          category: 'Auditor Reputation',
          description: 'Audited by less known auditors',
          recommendation: 'Verify auditor credentials and past track record.',
          impact: 10,
        });
      }
    }

    return Math.min(risk, 100);
  }

  private analyzeMarketRisk(metrics: ProtocolMetrics, flags: SecurityFlag[]): number {
    let risk = 0;

    // Low TVL = higher risk
    if (metrics.tvl < 100000) {
      risk += 30;
      flags.push({
        severity: 'high',
        category: 'Market Adoption',
        description: `Very low TVL ($${(metrics.tvl / 1000).toFixed(1)}K)`,
        recommendation: 'Low TVL indicates limited market confidence.',
        impact: 30,
      });
    } else if (metrics.tvl < 1000000) {
      risk += 15;
      flags.push({
        severity: 'medium',
        category: 'Market Adoption',
        description: `Low TVL ($${(metrics.tvl / 1000000).toFixed(2)}M)`,
        recommendation: 'Limited market validation. Use caution.',
        impact: 15,
      });
    }

    // Low user count = higher risk
    if (metrics.userCount < 100) {
      risk += 20;
      flags.push({
        severity: 'medium',
        category: 'User Base',
        description: `Very few users (${metrics.userCount})`,
        recommendation: 'Limited network effects and community support.',
        impact: 20,
      });
    }

    // New protocol = higher risk
    if (metrics.timeInMarket < 90) {
      risk += 15;
    }

    return Math.min(risk, 100);
  }

  private analyzeLiquidityRisk(metrics: ProtocolMetrics, flags: SecurityFlag[]): number {
    let risk = 0;

    // Check volume to TVL ratio
    const volumeToTVL = metrics.tvl > 0 ? metrics.volume24h / metrics.tvl : 0;

    if (volumeToTVL < 0.01) {
      risk += 30;
      flags.push({
        severity: 'high',
        category: 'Liquidity',
        description: 'Very low trading volume relative to TVL',
        recommendation: 'May face significant slippage when exiting positions.',
        impact: 30,
      });
    } else if (volumeToTVL < 0.05) {
      risk += 15;
      flags.push({
        severity: 'medium',
        category: 'Liquidity',
        description: 'Low trading volume',
        recommendation: 'Be cautious with large positions.',
        impact: 15,
      });
    }

    return Math.min(risk, 100);
  }

  private analyzeCentralizationRisk(metrics: ProtocolMetrics, flags: SecurityFlag[]): number {
    let risk = 0;

    // Check admin key structure
    if (metrics.adminKeysType === 'single') {
      risk += 40;
      flags.push({
        severity: 'critical',
        category: 'Centralization',
        description: 'Single admin key controls protocol',
        recommendation: 'Extreme rug pull risk. Avoid this protocol.',
        impact: 40,
      });
    } else if (metrics.adminKeysType === 'multisig') {
      risk += 15;
      flags.push({
        severity: 'low',
        category: 'Centralization',
        description: 'Multisig admin control',
        recommendation: 'Better than single key but still centralized.',
        impact: 15,
      });
    } else if (metrics.adminKeysType === 'timelock') {
      risk += 5;
    }

    // Upgradeable contracts add risk
    if (metrics.isUpgradeable && !metrics.hasTimelocks) {
      risk += 25;
      flags.push({
        severity: 'high',
        category: 'Upgradeability',
        description: 'Contract is upgradeable without timelock',
        recommendation: 'Admin could change contract behavior without warning.',
        impact: 25,
      });
    }

    // No governance token = more centralized
    if (!metrics.hasGovernanceToken && metrics.adminKeysType !== 'immutable') {
      risk += 10;
    }

    return Math.min(risk, 100);
  }

  private calculateOverallRisk(breakdown: {
    contractRisk: number;
    auditRisk: number;
    marketRisk: number;
    liquidityRisk: number;
    centralizationRisk: number;
  }): number {
    // Weighted average
    return (
      breakdown.contractRisk * 0.25 +
      breakdown.auditRisk * 0.25 +
      breakdown.marketRisk * 0.15 +
      breakdown.liquidityRisk * 0.15 +
      breakdown.centralizationRisk * 0.20
    );
  }

  private determineRiskLevel(overall: number): 'minimal' | 'low' | 'moderate' | 'high' | 'critical' {
    if (overall < 20) return 'minimal';
    if (overall < 40) return 'low';
    if (overall < 60) return 'moderate';
    if (overall < 80) return 'high';
    return 'critical';
  }

  private getSeverityValue(severity: string): number {
    const values = { critical: 4, high: 3, medium: 2, low: 1 };
    return values[severity as keyof typeof values] || 0;
  }
}

// Export singleton instance
export const riskAssessmentEngine = new RiskAssessmentEngine();

