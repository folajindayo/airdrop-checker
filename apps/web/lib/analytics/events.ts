/**
 * Analytics Events
 */

export const ANALYTICS_EVENTS = {
  WALLET_CONNECTED: 'wallet_connected',
  PORTFOLIO_VIEWED: 'portfolio_viewed',
  AIRDROP_CHECKED: 'airdrop_checked',
  TOKEN_SEARCHED: 'token_searched',
  CHAIN_SWITCHED: 'chain_switched',
} as const;

export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  console.log('Analytics Event:', event, properties);
  
  // Integration with analytics providers would go here
  // e.g., gtag, mixpanel, amplitude, etc.
}

