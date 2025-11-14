/**
 * @fileoverview Event tracking and analytics
 * @module lib/analytics/event-tracker
 */

import { logger } from '@/lib/monitoring/logger';

/**
 * Event categories
 */
export enum EventCategory {
  USER = 'user',
  WALLET = 'wallet',
  AIRDROP = 'airdrop',
  PORTFOLIO = 'portfolio',
  NAVIGATION = 'navigation',
  ERROR = 'error',
  PERFORMANCE = 'performance',
}

/**
 * Event action types
 */
export enum EventAction {
  // User actions
  SIGN_IN = 'sign_in',
  SIGN_OUT = 'sign_out',
  SIGN_UP = 'sign_up',
  
  // Wallet actions
  CONNECT_WALLET = 'connect_wallet',
  DISCONNECT_WALLET = 'disconnect_wallet',
  CHECK_ELIGIBILITY = 'check_eligibility',
  
  // Airdrop actions
  VIEW_AIRDROP = 'view_airdrop',
  CLAIM_AIRDROP = 'claim_airdrop',
  SHARE_AIRDROP = 'share_airdrop',
  
  // Portfolio actions
  VIEW_PORTFOLIO = 'view_portfolio',
  EXPORT_DATA = 'export_data',
  REFRESH_DATA = 'refresh_data',
  
  // Navigation
  PAGE_VIEW = 'page_view',
  CLICK = 'click',
  SCROLL = 'scroll',
  
  // Errors
  API_ERROR = 'api_error',
  UI_ERROR = 'ui_error',
  
  // Performance
  LOAD_TIME = 'load_time',
  API_RESPONSE_TIME = 'api_response_time',
}

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: number;
  sessionId?: string;
  userId?: string;
}

/**
 * Analytics provider interface
 */
export interface AnalyticsProvider {
  name: string;
  initialize: () => void;
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (path: string, title?: string) => void;
  identifyUser: (userId: string, traits?: Record<string, any>) => void;
}

/**
 * Google Analytics provider
 */
class GoogleAnalyticsProvider implements AnalyticsProvider {
  name = 'GoogleAnalytics';

  initialize(): void {
    // Initialize Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      logger.info('Google Analytics initialized');
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata,
      });
    }
  }

  trackPageView(path: string, title?: string): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: path,
        page_title: title,
      });
    }
  }

  identifyUser(userId: string, traits?: Record<string, any>): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('set', { user_id: userId, ...traits });
    }
  }
}

/**
 * Custom analytics provider
 */
class CustomAnalyticsProvider implements AnalyticsProvider {
  name = 'Custom';
  private events: AnalyticsEvent[] = [];

  initialize(): void {
    logger.info('Custom analytics initialized');
  }

  trackEvent(event: AnalyticsEvent): void {
    this.events.push(event);
    
    // Send to custom endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch((error) => {
        logger.error('Failed to send analytics event', { error });
      });
    }
  }

  trackPageView(path: string, title?: string): void {
    this.trackEvent({
      category: EventCategory.NAVIGATION,
      action: EventAction.PAGE_VIEW,
      label: path,
      metadata: { title },
      timestamp: Date.now(),
    });
  }

  identifyUser(userId: string, traits?: Record<string, any>): void {
    logger.info('User identified', { userId, traits });
  }

  getEvents(): AnalyticsEvent[] {
    return this.events;
  }
}

/**
 * Event tracker class
 */
export class EventTracker {
  private providers: AnalyticsProvider[] = [];
  private sessionId: string;
  private userId?: string;
  private enabled = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeProviders();
  }

  /**
   * Initialize analytics providers
   */
  private initializeProviders(): void {
    // Add Google Analytics
    if (process.env.NEXT_PUBLIC_GA_ID) {
      const ga = new GoogleAnalyticsProvider();
      ga.initialize();
      this.providers.push(ga);
    }

    // Add custom analytics
    const custom = new CustomAnalyticsProvider();
    custom.initialize();
    this.providers.push(custom);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track event
   */
  public track(
    category: EventCategory,
    action: EventAction,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ): void {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      metadata,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    // Send to all providers
    this.providers.forEach((provider) => {
      try {
        provider.trackEvent(event);
      } catch (error) {
        logger.error(`Failed to track event with ${provider.name}`, { error });
      }
    });

    logger.debug('Event tracked', event);
  }

  /**
   * Track page view
   */
  public trackPageView(path: string, title?: string): void {
    if (!this.enabled) return;

    this.providers.forEach((provider) => {
      try {
        provider.trackPageView(path, title);
      } catch (error) {
        logger.error(`Failed to track page view with ${provider.name}`, { error });
      }
    });

    this.track(EventCategory.NAVIGATION, EventAction.PAGE_VIEW, path, undefined, { title });
  }

  /**
   * Identify user
   */
  public identifyUser(userId: string, traits?: Record<string, any>): void {
    this.userId = userId;

    this.providers.forEach((provider) => {
      try {
        provider.identifyUser(userId, traits);
      } catch (error) {
        logger.error(`Failed to identify user with ${provider.name}`, { error });
      }
    });

    logger.info('User identified', { userId });
  }

  /**
   * Track wallet connection
   */
  public trackWalletConnection(address: string, chainId: number): void {
    this.track(
      EventCategory.WALLET,
      EventAction.CONNECT_WALLET,
      'wallet_connected',
      undefined,
      { address, chainId }
    );
  }

  /**
   * Track eligibility check
   */
  public trackEligibilityCheck(address: string, eligible: boolean): void {
    this.track(
      EventCategory.AIRDROP,
      EventAction.CHECK_ELIGIBILITY,
      'eligibility_checked',
      eligible ? 1 : 0,
      { address }
    );
  }

  /**
   * Track airdrop claim
   */
  public trackAirdropClaim(airdropId: string, amount: number): void {
    this.track(
      EventCategory.AIRDROP,
      EventAction.CLAIM_AIRDROP,
      airdropId,
      amount
    );
  }

  /**
   * Track portfolio view
   */
  public trackPortfolioView(address: string, totalValue: number): void {
    this.track(
      EventCategory.PORTFOLIO,
      EventAction.VIEW_PORTFOLIO,
      'portfolio_viewed',
      totalValue,
      { address }
    );
  }

  /**
   * Track data export
   */
  public trackDataExport(format: string, recordCount: number): void {
    this.track(
      EventCategory.PORTFOLIO,
      EventAction.EXPORT_DATA,
      format,
      recordCount
    );
  }

  /**
   * Track error
   */
  public trackError(
    errorType: 'api' | 'ui',
    errorMessage: string,
    errorCode?: string
  ): void {
    this.track(
      EventCategory.ERROR,
      errorType === 'api' ? EventAction.API_ERROR : EventAction.UI_ERROR,
      errorMessage,
      undefined,
      { errorCode }
    );
  }

  /**
   * Track performance metric
   */
  public trackPerformance(metric: string, value: number, unit: string): void {
    this.track(
      EventCategory.PERFORMANCE,
      EventAction.LOAD_TIME,
      metric,
      value,
      { unit }
    );
  }

  /**
   * Track API response time
   */
  public trackAPIResponseTime(endpoint: string, duration: number): void {
    this.track(
      EventCategory.PERFORMANCE,
      EventAction.API_RESPONSE_TIME,
      endpoint,
      duration,
      { unit: 'ms' }
    );
  }

  /**
   * Enable tracking
   */
  public enable(): void {
    this.enabled = true;
    logger.info('Analytics tracking enabled');
  }

  /**
   * Disable tracking
   */
  public disable(): void {
    this.enabled = false;
    logger.info('Analytics tracking disabled');
  }

  /**
   * Check if tracking is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get session ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get user ID
   */
  public getUserId(): string | undefined {
    return this.userId;
  }
}

/**
 * Singleton instance
 */
let trackerInstance: EventTracker | null = null;

/**
 * Get event tracker instance
 */
export function getEventTracker(): EventTracker {
  if (!trackerInstance) {
    trackerInstance = new EventTracker();
  }
  return trackerInstance;
}

/**
 * Quick track functions
 */
export const track = (
  category: EventCategory,
  action: EventAction,
  label?: string,
  value?: number,
  metadata?: Record<string, any>
): void => {
  getEventTracker().track(category, action, label, value, metadata);
};

export const trackPageView = (path: string, title?: string): void => {
  getEventTracker().trackPageView(path, title);
};

export const identifyUser = (userId: string, traits?: Record<string, any>): void => {
  getEventTracker().identifyUser(userId, traits);
};

