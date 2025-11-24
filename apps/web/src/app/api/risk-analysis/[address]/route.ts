import { NextRequest, NextResponse } from 'next/server';
import { getTokenBalances } from '@/lib/goldrush/tokens';
import { getTransactions } from '@/lib/goldrush/transactions';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Fetch data from multiple chains
    const chains = [1, 8453, 42161, 10, 137];
    
    // Fetch token balances to analyze approvals
    const balancePromises = chains.map((chainId) =>
      getTokenBalances(address, chainId).catch(() => null)
    );

    // Fetch recent transactions to analyze activity
    const txPromises = chains.map((chainId) =>
      getTransactions(address, chainId).catch(() => null)
    );

    const [balancesResults, txResults] = await Promise.all([
      Promise.all(balancePromises),
      Promise.all(txPromises),
    ]);

    // Analyze token approvals
    const approvals = analyzeApprovals(balancesResults, chains);
    
    // Analyze transaction patterns
    const activityScore = analyzeActivity(txResults);
    
    // Calculate risk scores
    const riskScore = calculateRiskScores(approvals, activityScore);
    
    // Perform security checks
    const securityChecks = performSecurityChecks(approvals, txResults, address);
    
    // Generate recommendations
    const recommendations = generateRecommendations(approvals, securityChecks);

    return NextResponse.json({
      riskScore,
      approvals,
      securityChecks,
      totalApprovals: approvals.length,
      criticalApprovals: approvals.filter((a) => a.riskLevel === 'critical').length,
      recommendations,
    });
  } catch (error) {
    console.error('Risk analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk analysis' },
      { status: 500 }
    );
  }
}

function analyzeApprovals(balancesResults: any[], chains: number[]) {
  const approvals: any[] = [];
  
  // Mock approval data - in production, fetch from blockchain events
  const mockApprovals = [
    {
      spender: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      spenderName: '1inch Router',
      token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      tokenSymbol: 'USDC',
      amount: 'Unlimited',
      isUnlimited: true,
      riskLevel: 'high' as const,
      lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      chainId: 1,
    },
    {
      spender: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      spenderName: 'Uniswap V3 Router',
      token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      tokenSymbol: 'USDT',
      amount: 'Unlimited',
      isUnlimited: true,
      riskLevel: 'medium' as const,
      lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      chainId: 1,
    },
    {
      spender: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
      spenderName: 'Uniswap Universal Router',
      token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      tokenSymbol: 'DAI',
      amount: '1000.00',
      isUnlimited: false,
      riskLevel: 'low' as const,
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      chainId: 1,
    },
    {
      spender: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      spenderName: '0x Exchange',
      token: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      tokenSymbol: 'WETH',
      amount: 'Unlimited',
      isUnlimited: true,
      riskLevel: 'critical' as const,
      lastUsed: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      chainId: 1,
    },
  ];

  return mockApprovals;
}

function analyzeActivity(txResults: any[]): number {
  let totalTxs = 0;
  let recentTxs = 0;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  txResults.forEach((result) => {
    if (!result || !result.items) return;
    
    totalTxs += result.items.length;
    recentTxs += result.items.filter((tx: any) => {
      const txDate = new Date(tx.block_signed_at).getTime();
      return txDate > thirtyDaysAgo;
    }).length;
  });

  // Score based on activity patterns
  if (recentTxs > 50) return 90; // Very active
  if (recentTxs > 20) return 75; // Active
  if (recentTxs > 5) return 60; // Moderate
  if (recentTxs > 0) return 40; // Low activity
  return 20; // Inactive
}

function calculateRiskScores(approvals: any[], activityScore: number) {
  // Calculate approval risk score
  const criticalCount = approvals.filter((a) => a.riskLevel === 'critical').length;
  const highCount = approvals.filter((a) => a.riskLevel === 'high').length;
  const unlimitedCount = approvals.filter((a) => a.isUnlimited).length;

  let approvalsScore = 100;
  approvalsScore -= criticalCount * 30;
  approvalsScore -= highCount * 15;
  approvalsScore -= unlimitedCount * 10;
  approvalsScore = Math.max(0, approvalsScore);

  // Calculate exposure score
  const exposureScore = Math.max(0, 100 - approvals.length * 5);

  // Calculate overall score
  const overall = Math.round(
    (approvalsScore * 0.4 + activityScore * 0.3 + exposureScore * 0.3)
  );

  return {
    overall,
    approvals: approvalsScore,
    activity: activityScore,
    exposure: exposureScore,
  };
}

function performSecurityChecks(approvals: any[], txResults: any[], address: string) {
  const checks: any[] = [];

  // Check for unlimited approvals
  const unlimitedApprovals = approvals.filter((a) => a.isUnlimited);
  checks.push({
    name: 'Unlimited Token Approvals',
    status: unlimitedApprovals.length === 0 ? 'pass' : unlimitedApprovals.length > 3 ? 'fail' : 'warning',
    description: unlimitedApprovals.length === 0
      ? 'No unlimited token approvals found'
      : `Found ${unlimitedApprovals.length} unlimited token approvals`,
    recommendation: unlimitedApprovals.length > 0
      ? 'Consider revoking unused unlimited approvals to reduce risk'
      : undefined,
  });

  // Check for old approvals
  const oldApprovals = approvals.filter((a) => {
    if (!a.lastUsed) return false;
    const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
    return new Date(a.lastUsed).getTime() < sixMonthsAgo;
  });
  checks.push({
    name: 'Stale Approvals',
    status: oldApprovals.length === 0 ? 'pass' : oldApprovals.length > 2 ? 'fail' : 'warning',
    description: oldApprovals.length === 0
      ? 'No stale approvals detected'
      : `Found ${oldApprovals.length} approvals not used in 6+ months`,
    recommendation: oldApprovals.length > 0
      ? 'Revoke approvals that haven\'t been used recently'
      : undefined,
  });

  // Check for critical risk approvals
  const criticalApprovals = approvals.filter((a) => a.riskLevel === 'critical');
  checks.push({
    name: 'High-Risk Approvals',
    status: criticalApprovals.length === 0 ? 'pass' : 'fail',
    description: criticalApprovals.length === 0
      ? 'No critical risk approvals found'
      : `Found ${criticalApprovals.length} critical risk approvals`,
    recommendation: criticalApprovals.length > 0
      ? 'Immediately review and revoke critical risk approvals'
      : undefined,
  });

  // Check wallet activity
  const hasRecentActivity = txResults.some((result) => {
    if (!result || !result.items) return false;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return result.items.some((tx: any) => {
      return new Date(tx.block_signed_at).getTime() > sevenDaysAgo;
    });
  });
  checks.push({
    name: 'Wallet Activity',
    status: hasRecentActivity ? 'pass' : 'warning',
    description: hasRecentActivity
      ? 'Wallet shows recent activity'
      : 'No recent activity detected in the last 7 days',
  });

  return checks;
}

function generateRecommendations(approvals: any[], securityChecks: any[]) {
  const recommendations: string[] = [];

  const failedChecks = securityChecks.filter((c) => c.status === 'fail');
  const warningChecks = securityChecks.filter((c) => c.status === 'warning');

  if (failedChecks.length > 0) {
    recommendations.push('Address critical security issues immediately to protect your assets');
  }

  const unlimitedApprovals = approvals.filter((a) => a.isUnlimited);
  if (unlimitedApprovals.length > 0) {
    recommendations.push(
      `Review and revoke ${unlimitedApprovals.length} unlimited token approvals`
    );
  }

  const criticalApprovals = approvals.filter((a) => a.riskLevel === 'critical');
  if (criticalApprovals.length > 0) {
    recommendations.push('Revoke critical risk approvals to prevent potential exploits');
  }

  if (warningChecks.length > 0) {
    recommendations.push('Review warnings and take preventive action');
  }

  if (approvals.length > 10) {
    recommendations.push('Consider using a fresh wallet for high-value transactions');
  }

  recommendations.push('Regularly audit your token approvals using tools like Revoke.cash');
  recommendations.push('Only approve the minimum amount needed for each transaction');

  return recommendations;
}

