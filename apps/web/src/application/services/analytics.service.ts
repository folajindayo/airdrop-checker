/**
 * Analytics Service
 */

export class AnalyticsService {
  trackEvent(event: string, properties?: Record<string, any>): void {
    console.log('Analytics event:', event, properties);
    // Implementation would send to analytics platform
  }

  trackPageView(page: string): void {
    this.trackEvent('page_view', { page });
  }

  trackAirdropClaim(airdropId: string, walletAddress: string): void {
    this.trackEvent('airdrop_claimed', { airdropId, walletAddress });
  }

  trackEligibilityCheck(walletAddress: string, result: boolean): void {
    this.trackEvent('eligibility_checked', { walletAddress, eligible: result });
  }
}

export const analyticsService = new AnalyticsService();

