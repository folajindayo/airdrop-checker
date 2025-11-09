import type {
  EligibilityCriteria,
  CriteriaResult,
  UserActivity,
} from '@airdrop-finder/shared';

/**
 * Check if a specific criterion is met based on user activity
 */
export function checkCriterion(
  criterion: EligibilityCriteria,
  activity: UserActivity
): boolean {
  const check = criterion.check.toLowerCase();

  // Parse the check string (format: "key=value" or "key>=value" or "key>value")
  const operators = ['>=', '<=', '>', '<', '='];
  let operator = '=';
  let parts: string[] = [];

  for (const op of operators) {
    if (check.includes(op)) {
      operator = op;
      parts = check.split(op).map((p) => p.trim());
      break;
    }
  }

  if (parts.length !== 2) {
    console.warn(`Invalid criterion check format: ${criterion.check}`);
    return false;
  }

  const [key, expectedValue] = parts;

  // Check chain-related criteria
  if (key === 'chain') {
    return activity.chains.some(
      (chain) => chain.chainName.toLowerCase() === expectedValue
    );
  }

  // Check transaction count on specific chain
  if (key.includes('_tx')) {
    const chainName = key.replace('_tx', '');
    const chain = activity.chains.find(
      (c) => c.chainName.toLowerCase().includes(chainName)
    );
    
    if (!chain) return false;

    return compareValue(chain.transactionCount, expectedValue, operator);
  }

  // Check protocol interaction
  if (key === 'protocol') {
    return activity.protocols.some(
      (p) => p.protocol.toLowerCase() === expectedValue
    );
  }

  // Check NFT platform
  if (key === 'nft_platform') {
    // Simplified: check if any NFT interactions mention the platform
    return activity.protocols.some(
      (p) => p.protocol.toLowerCase() === expectedValue
    );
  }

  // Check bridge usage
  if (key === 'bridge_to') {
    return activity.bridges.some(
      (b) => b.bridge.toLowerCase().includes(expectedValue)
    );
  }

  // Check bridge count
  if (key === 'bridge_count') {
    const totalBridges = activity.bridges.reduce((sum, b) => sum + b.count, 0);
    return compareValue(totalBridges, expectedValue, operator);
  }

  // Check cross-chain transaction count
  if (key === 'cross_chain_tx') {
    const crossChainCount = activity.bridges.length > 0 ? 1 : 0;
    return compareValue(crossChainCount, expectedValue, operator);
  }

  // Check protocol count on specific chain
  if (key.includes('_protocols')) {
    const chainName = key.replace('_protocols', '');
    const protocolCount = activity.protocols.filter((p) =>
      activity.chains.some(
        (c) =>
          c.chainId === p.chainId &&
          c.chainName.toLowerCase().includes(chainName)
      )
    ).length;
    
    return compareValue(protocolCount, expectedValue, operator);
  }

  // Check if holding balance on chain
  if (key.includes('_balance')) {
    const chainName = key.replace('_balance', '');
    const hasBalance = activity.chains.some(
      (c) =>
        c.chainName.toLowerCase().includes(chainName) &&
        c.transactionCount > 0
    );
    return hasBalance;
  }

  // Default: check if criterion mentions any protocol
  return activity.protocols.some((p) =>
    p.protocol.toLowerCase().includes(expectedValue)
  );
}

/**
 * Compare a numeric value with expected value using operator
 */
function compareValue(
  actual: number,
  expected: string,
  operator: string
): boolean {
  const expectedNum = parseInt(expected, 10);
  
  if (isNaN(expectedNum)) {
    return false;
  }

  switch (operator) {
    case '>=':
      return actual >= expectedNum;
    case '<=':
      return actual <= expectedNum;
    case '>':
      return actual > expectedNum;
    case '<':
      return actual < expectedNum;
    case '=':
      return actual === expectedNum;
    default:
      return false;
  }
}

/**
 * Check all criteria for a project
 */
export function checkAllCriteria(
  criteria: EligibilityCriteria[],
  activity: UserActivity
): CriteriaResult[] {
  return criteria.map((criterion) => ({
    desc: criterion.description,
    met: checkCriterion(criterion, activity),
  }));
}

/**
 * Calculate percentage of criteria met
 */
export function calculateCriteriaPercentage(
  results: CriteriaResult[]
): number {
  if (results.length === 0) return 0;
  
  const metCount = results.filter((r) => r.met).length;
  return (metCount / results.length) * 100;
}

