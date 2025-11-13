/**
 * Risk analysis service  
 * Business logic for security and risk assessment
 */

export interface RiskAnalysisData {
  riskScore: RiskScores;
  approvals: TokenApproval[];
  securityChecks: SecurityCheck[];
  totalApprovals: number;
  criticalApprovals: number;
  recommendations: string[];
}

export interface RiskScores {
  overall: number;
  approvals: number;
  activity: number;
  exposure: number;
}

export interface TokenApproval {
  spender: string;
  spenderName: string;
  token: string;
  tokenSymbol: string;
  amount: string;
  isUnlimited: boolean;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  lastUsed: string;
  chainId: number;
}

export interface SecurityCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  description: string;
  recommendation?: string;
}

/**
 * Analyze risk for an address
 */
export async function analyzeRisk(address: string): Promise<RiskAnalysisData> {
  // Mock data - in production, fetch from blockchain events
  const approvals = getMockApprovals();
  const activityScore = 75; // Mock activity score
  const riskScore = calculateRiskScores(approvals, activityScore);
  const securityChecks = performSecurityChecks(approvals, activityScore);
  const recommendations = generateRecommendations(approvals, securityChecks);
  
  return {
    riskScore,
    approvals,
    securityChecks,
    totalApprovals: approvals.length,
    criticalApprovals: approvals.filter((a) => a.riskLevel === 'critical').length,
    recommendations,
  };
}

function getMockApprovals(): TokenApproval[] {
  return [
    {
      spender: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      spenderName: '1inch Router',
      token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      tokenSymbol: 'USDC',
      amount: 'Unlimited',
      isUnlimited: true,
      riskLevel: 'high',
      lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      chainId: 1,
    },
  ];
}

function calculateRiskScores(approvals: TokenApproval[], activityScore: number): RiskScores {
  const criticalCount = approvals.filter((a) => a.riskLevel === 'critical').length;
  const highCount = approvals.filter((a) => a.riskLevel === 'high').length;
  const unlimitedCount = approvals.filter((a) => a.isUnlimited).length;
  
  let approvalsScore = 100;
  approvalsScore -= criticalCount * 30;
  approvalsScore -= highCount * 15;
  approvalsScore -= unlimitedCount * 10;
  approvalsScore = Math.max(0, approvalsScore);
  
  const exposureScore = Math.max(0, 100 - approvals.length * 5);
  const overall = Math.round((approvalsScore * 0.4 + activityScore * 0.3 + exposureScore * 0.3));
  
  return { overall, approvals: approvalsScore, activity: activityScore, exposure: exposureScore };
}

function performSecurityChecks(
  approvals: TokenApproval[],
  activityScore: number
): SecurityCheck[] {
  return [
    {
      name: 'Unlimited Token Approvals',
      status: approvals.filter((a) => a.isUnlimited).length === 0 ? 'pass' : 'warning',
      description: `Found ${approvals.filter((a) => a.isUnlimited).length} unlimited approvals`,
      recommendation: approvals.length > 0 ? 'Consider revoking unused unlimited approvals' : undefined,
    },
  ];
}

function generateRecommendations(
  approvals: TokenApproval[],
  securityChecks: SecurityCheck[]
): string[] {
  const recommendations: string[] = [];
  
  if (securityChecks.some((c) => c.status === 'fail')) {
    recommendations.push('Address critical security issues immediately');
  }
  
  const unlimitedApprovals = approvals.filter((a) => a.isUnlimited);
  if (unlimitedApprovals.length > 0) {
    recommendations.push(`Review and revoke ${unlimitedApprovals.length} unlimited token approvals`);
  }
  
  recommendations.push('Regularly audit your token approvals using tools like Revoke.cash');
  
  return recommendations;
}

