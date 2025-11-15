/**
 * @fileoverview Analytics tracking system
 * 
 * Comprehensive analytics tracking for user interactions and events
 */

/**
 * Event categories
 */
export enum EventCategory {
  WALLET = 'wallet',
  AIRDROP = 'airdrop',
  TRANSACTION = 'transaction',
  PORTFOLIO = 'portfolio',
  UI = 'ui',
  ERROR = 'error',
}

/**
 * Event action types
 */
export enum EventAction {
  // Wallet actions
  WALLET_CONNECT = 'wallet_connect',
  WALLET_DISCONNECT = 'wallet_disconnect',
  WALLET_SWITCH_CHAIN = 'wallet_switch_chain',
  
  // Airdrop actions
  AIRDROP_CHECK = 'airdrop_check',
  AIRDROP_CLAIM = 'airdrop_claim',
  AIRDROP_VIEW = 'airdrop_view',
  
  // Transaction actions
  TRANSACTION_SEND = 'transaction_send',
  TRANSACTION_VIEW = 'transaction_view',
  
  // Portfolio actions
  PORTFOLIO_VIEW = 'portfolio_view',
  PORTFOLIO_REFRESH = 'portfolio_refresh',
  
  // UI actions
  PAGE_VIEW = 'page_view',
  BUTTON_CLICK = 'button_click',
  MODAL_OPEN = 'modal_open',
  MODAL_CLOSE = 'modal_close',
  
  // Error actions
  ERROR_OCCURRED = 'error_occurred',
}

/**
 * Event data interface
 */
export interface EventData {
  /** Event category */
  category: EventCategory;
  /** Event action */
  action: EventAction;
  /** Event label */
  label?: string;
  /** Event value */
  value?: number;
  /** Additional properties */
  properties?: Record<string, any>;
  /** User ID */
  userId?: string;
  /** Session ID */
  sessionId?: string;
  /** Timestamp */
  timestamp?: number;
}

/**
 * Analytics provider interface
 */
export interface AnalyticsProvider {
  /** Track event */
  track(event: EventData): void | Promise<void>;
  /** Identify user */
  identify(userId: string, traits?: Record<string, any>): void | Promise<void>;
  /** Page view */
  page(name: string, properties?: Record<string, any>): void | Promise<void>;
}

/**
 * Google Analytics provider
 */
class GoogleAnalyticsProvider implements AnalyticsProvider {
  private initialized = false;

  constructor(private measurementId: string) {
    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined') return;

    if (!(window as any).gtag) {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      script.async = true;
      document.head.appendChild(script);

      // Initialize gtag
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).gtag = function() {
        (window as any).dataLayer.push(arguments);
      };
      (window as any).gtag('js', new Date());
      (window as any).gtag('config', this.measurementId);
    }

    this.initialized = true;
  }

  track(event: EventData): void {
    if (!this.initialized || typeof window === 'undefined') return;

    const gtag = (window as any).gtag;
    if (!gtag) return;

    gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.properties,
    });
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.initialized || typeof window === 'undefined') return;

    const gtag = (window as any).gtag;
    if (!gtag) return;

    gtag('set', { user_id: userId, ...traits });
  }

  page(name: string, properties?: Record<string, any>): void {
    if (!this.initialized || typeof window === 'undefined') return;

    const gtag = (window as any).gtag;
    if (!gtag) return;

    gtag('event', 'page_view', {
      page_title: name,
      ...properties,
    });
  }
}

/**
 * Mixpanel provider
 */
class MixpanelProvider implements AnalyticsProvider {
  private initialized = false;

  constructor(private token: string) {
    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined') return;

    if (!(window as any).mixpanel) {
      // Note: In a real implementation, you would load the Mixpanel library
      console.warn('Mixpanel library not loaded');
      return;
    }

    const mixpanel = (window as any).mixpanel;
    mixpanel.init(this.token);
    this.initialized = true;
  }

  track(event: EventData): void {
    if (!this.initialized || typeof window === 'undefined') return;

    const mixpanel = (window as any).mixpanel;
    if (!mixpanel) return;

    mixpanel.track(event.action, {
      category: event.category,
      label: event.label,
      value: event.value,
      ...event.properties,
    });
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.initialized || typeof window === 'undefined') return;

    const mixpanel = (window as any).mixpanel;
    if (!mixpanel) return;

    mixpanel.identify(userId);
    if (traits) {
      mixpanel.people.set(traits);
    }
  }

  page(name: string, properties?: Record<string, any>): void {
    if (!this.initialized || typeof window === 'undefined') return;

    const mixpanel = (window as any).mixpanel;
    if (!mixpanel) return;

    mixpanel.track('Page View', {
      page: name,
      ...properties,
    });
  }
}

/**
 * Console provider (for development)
 */
class ConsoleProvider implements AnalyticsProvider {
  track(event: EventData): void {
    console.log('[Analytics] Track:', event);
  }

  identify(userId: string, traits?: Record<string, any>): void {
    console.log('[Analytics] Identify:', userId, traits);
  }

  page(name: string, properties?: Record<string, any>): void {
    console.log('[Analytics] Page:', name, properties);
  }
}

/**
 * Analytics tracker class
 */
class AnalyticsTracker {
  private providers: AnalyticsProvider[] = [];
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add provider
   */
  addProvider(provider: AnalyticsProvider): void {
    this.providers.push(provider);
  }

  /**
   * Remove provider
   */
  removeProvider(provider: AnalyticsProvider): void {
    const index = this.providers.indexOf(provider);
    if (index > -1) {
      this.providers.splice(index, 1);
    }
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
    this.providers.forEach((provider) => provider.identify(userId));
  }

  /**
   * Track event
   */
  track(event: Omit<EventData, 'userId' | 'sessionId' | 'timestamp'>): void {
    const enrichedEvent: EventData = {
      ...event,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };

    this.providers.forEach((provider) => {
      try {
        provider.track(enrichedEvent);
      } catch (error) {
        console.error('Failed to track event:', error);
      }
    });
  }

  /**
   * Track page view
   */
  page(name: string, properties?: Record<string, any>): void {
    this.providers.forEach((provider) => {
      try {
        provider.page(name, properties);
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    });

    // Also track as event
    this.track({
      category: EventCategory.UI,
      action: EventAction.PAGE_VIEW,
      label: name,
      properties,
    });
  }

  /**
   * Track wallet connection
   */
  trackWalletConnect(walletType: string, address: string): void {
    this.track({
      category: EventCategory.WALLET,
      action: EventAction.WALLET_CONNECT,
      label: walletType,
      properties: { address },
    });
  }

  /**
   * Track wallet disconnection
   */
  trackWalletDisconnect(): void {
    this.track({
      category: EventCategory.WALLET,
      action: EventAction.WALLET_DISCONNECT,
    });
  }

  /**
   * Track chain switch
   */
  trackChainSwitch(chainId: number): void {
    this.track({
      category: EventCategory.WALLET,
      action: EventAction.WALLET_SWITCH_CHAIN,
      value: chainId,
    });
  }

  /**
   * Track airdrop check
   */
  trackAirdropCheck(address: string, projectName?: string): void {
    this.track({
      category: EventCategory.AIRDROP,
      action: EventAction.AIRDROP_CHECK,
      label: projectName,
      properties: { address },
    });
  }

  /**
   * Track airdrop claim
   */
  trackAirdropClaim(projectName: string, amount: number): void {
    this.track({
      category: EventCategory.AIRDROP,
      action: EventAction.AIRDROP_CLAIM,
      label: projectName,
      value: amount,
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: string): void {
    this.track({
      category: EventCategory.ERROR,
      action: EventAction.ERROR_OCCURRED,
      label: context,
      properties: {
        error: error.message,
        stack: error.stack,
      },
    });
  }

  /**
   * Track button click
   */
  trackClick(buttonName: string, location?: string): void {
    this.track({
      category: EventCategory.UI,
      action: EventAction.BUTTON_CLICK,
      label: buttonName,
      properties: { location },
    });
  }
}

/**
 * Create and export singleton instance
 */
export const analytics = new AnalyticsTracker();

/**
 * Initialize analytics with providers
 */
export function initAnalytics(config: {
  googleAnalyticsId?: string;
  mixpanelToken?: string;
  isDevelopment?: boolean;
}) {
  if (config.googleAnalyticsId) {
    analytics.addProvider(new GoogleAnalyticsProvider(config.googleAnalyticsId));
  }

  if (config.mixpanelToken) {
    analytics.addProvider(new MixpanelProvider(config.mixpanelToken));
  }

  if (config.isDevelopment) {
    analytics.addProvider(new ConsoleProvider());
  }
}

/**
 * Example usage:
 * 
 * // Initialize
 * initAnalytics({
 *   googleAnalyticsId: 'GA-XXXXXXXX',
 *   isDevelopment: process.env.NODE_ENV === 'development',
 * });
 * 
 * // Track events
 * analytics.trackWalletConnect('metamask', '0x...');
 * analytics.trackAirdropCheck('0x...', 'Example Protocol');
 * analytics.trackClick('connect-wallet-button', 'header');
 * 
 * // Track page views
 * analytics.page('Portfolio', { wallet: '0x...' });
 */

