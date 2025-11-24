/**
 * Feature flags configuration
 * Controls which features are enabled in the application
 */

/**
 * Feature flag definitions
 */
export interface FeatureFlags {
  // Core features
  walletConnect: boolean;
  airdropCheck: boolean;
  portfolioTracker: boolean;
  
  // Analytics features
  gasTracker: boolean;
  protocolInsights: boolean;
  walletHealth: boolean;
  riskAnalysis: boolean;
  
  // Advanced features
  multiWalletSupport: boolean;
  transactionSimulator: boolean;
  farmingStrategy: boolean;
  probabilityPredictor: boolean;
  
  // Social features
  leaderboard: boolean;
  socialSharing: boolean;
  notifications: boolean;
  
  // Export features
  exportData: boolean;
  calendarExport: boolean;
  
  // Premium features
  advancedAnalytics: boolean;
  batchOperations: boolean;
  webhooks: boolean;
  apiAccess: boolean;
  
  // Experimental features
  mlPredictions: boolean;
  realTimeUpdates: boolean;
  customAlerts: boolean;
  
  // UI features
  darkMode: boolean;
  compactMode: boolean;
  advancedFilters: boolean;
}

/**
 * Default feature flags (all enabled)
 */
const DEFAULT_FEATURES: FeatureFlags = {
  // Core features
  walletConnect: true,
  airdropCheck: true,
  portfolioTracker: true,
  
  // Analytics features
  gasTracker: true,
  protocolInsights: true,
  walletHealth: true,
  riskAnalysis: true,
  
  // Advanced features
  multiWalletSupport: true,
  transactionSimulator: true,
  farmingStrategy: true,
  probabilityPredictor: true,
  
  // Social features
  leaderboard: true,
  socialSharing: true,
  notifications: true,
  
  // Export features
  exportData: true,
  calendarExport: true,
  
  // Premium features
  advancedAnalytics: true,
  batchOperations: true,
  webhooks: true,
  apiAccess: true,
  
  // Experimental features
  mlPredictions: true,
  realTimeUpdates: true,
  customAlerts: true,
  
  // UI features
  darkMode: true,
  compactMode: true,
  advancedFilters: true,
};

/**
 * Feature flags cache
 */
let cachedFeatures: FeatureFlags | null = null;

/**
 * Load feature flags from environment or defaults
 */
function loadFeatures(): FeatureFlags {
  // In production, you might load these from a database or config service
  // For now, use environment variables with defaults
  
  const features: FeatureFlags = { ...DEFAULT_FEATURES };
  
  // Override with environment variables if present
  Object.keys(features).forEach((key) => {
    const envKey = `NEXT_PUBLIC_FEATURE_${key.toUpperCase()}`;
    const envValue = process.env[envKey];
    
    if (envValue !== undefined) {
      features[key as keyof FeatureFlags] =
        envValue.toLowerCase() === 'true' || envValue === '1';
    }
  });
  
  return features;
}

/**
 * Get feature flags
 */
export function getFeatures(): FeatureFlags {
  if (!cachedFeatures) {
    cachedFeatures = loadFeatures();
  }
  return cachedFeatures;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return getFeatures()[feature];
}

/**
 * Enable a feature (runtime)
 */
export function enableFeature(feature: keyof FeatureFlags): void {
  const features = getFeatures();
  features[feature] = true;
}

/**
 * Disable a feature (runtime)
 */
export function disableFeature(feature: keyof FeatureFlags): void {
  const features = getFeatures();
  features[feature] = false;
}

/**
 * Reset features to defaults
 */
export function resetFeatures(): void {
  cachedFeatures = loadFeatures();
}

/**
 * Get enabled features list
 */
export function getEnabledFeatures(): Array<keyof FeatureFlags> {
  const features = getFeatures();
  return Object.entries(features)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key as keyof FeatureFlags);
}

/**
 * Get disabled features list
 */
export function getDisabledFeatures(): Array<keyof FeatureFlags> {
  const features = getFeatures();
  return Object.entries(features)
    .filter(([_, enabled]) => !enabled)
    .map(([key]) => key as keyof FeatureFlags);
}

/**
 * Feature groups for easier management
 */
export const FEATURE_GROUPS = {
  CORE: ['walletConnect', 'airdropCheck', 'portfolioTracker'] as const,
  ANALYTICS: ['gasTracker', 'protocolInsights', 'walletHealth', 'riskAnalysis'] as const,
  ADVANCED: ['multiWalletSupport', 'transactionSimulator', 'farmingStrategy', 'probabilityPredictor'] as const,
  SOCIAL: ['leaderboard', 'socialSharing', 'notifications'] as const,
  EXPORT: ['exportData', 'calendarExport'] as const,
  PREMIUM: ['advancedAnalytics', 'batchOperations', 'webhooks', 'apiAccess'] as const,
  EXPERIMENTAL: ['mlPredictions', 'realTimeUpdates', 'customAlerts'] as const,
  UI: ['darkMode', 'compactMode', 'advancedFilters'] as const,
} as const;

/**
 * Check if all features in a group are enabled
 */
export function isGroupEnabled(group: keyof typeof FEATURE_GROUPS): boolean {
  const features = getFeatures();
  const groupFeatures = FEATURE_GROUPS[group];
  return groupFeatures.every((feature) => features[feature]);
}

/**
 * Enable all features in a group
 */
export function enableGroup(group: keyof typeof FEATURE_GROUPS): void {
  const features = getFeatures();
  const groupFeatures = FEATURE_GROUPS[group];
  groupFeatures.forEach((feature) => {
    features[feature] = true;
  });
}

/**
 * Disable all features in a group
 */
export function disableGroup(group: keyof typeof FEATURE_GROUPS): void {
  const features = getFeatures();
  const groupFeatures = FEATURE_GROUPS[group];
  groupFeatures.forEach((feature) => {
    features[feature] = true;
  });
}

/**
 * Get feature status summary
 */
export function getFeatureSummary(): {
  total: number;
  enabled: number;
  disabled: number;
  groups: Record<string, { total: number; enabled: number }>;
} {
  const features = getFeatures();
  const entries = Object.entries(features);
  
  const summary = {
    total: entries.length,
    enabled: entries.filter(([_, enabled]) => enabled).length,
    disabled: entries.filter(([_, enabled]) => !enabled).length,
    groups: {} as Record<string, { total: number; enabled: number }>,
  };
  
  // Calculate group statistics
  Object.entries(FEATURE_GROUPS).forEach(([groupName, groupFeatures]) => {
    const enabled = groupFeatures.filter((feature) => features[feature]).length;
    summary.groups[groupName] = {
      total: groupFeatures.length,
      enabled,
    };
  });
  
  return summary;
}

/**
 * Create feature gate component helper
 */
export function createFeatureGate(feature: keyof FeatureFlags) {
  return {
    isEnabled: () => isFeatureEnabled(feature),
    enable: () => enableFeature(feature),
    disable: () => disableFeature(feature),
  };
}

/**
 * Conditional execution based on feature flag
 */
export function withFeature<T>(
  feature: keyof FeatureFlags,
  enabled: () => T,
  disabled?: () => T
): T | undefined {
  if (isFeatureEnabled(feature)) {
    return enabled();
  } else if (disabled) {
    return disabled();
  }
  return undefined;
}

