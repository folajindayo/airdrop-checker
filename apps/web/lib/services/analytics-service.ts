/**
 * @fileoverview Analytics service for tracking user behavior and application metrics
 * Provides event tracking, user analytics, and performance monitoring
 */

import { logger } from '../monitoring/logger';

/**
 * Event category enum
 */
export enum EventCategory {
  USER = 'user',
  AIRDROP = 'airdrop',
  TRANSACTION = 'transaction',
  WALLET = 'wallet',
  UI = 'ui',
  PERFORMANCE = 'performance',
  ERROR = 'error',
}

/**
 * Event action enum
 */
export enum EventAction {
  // User actions
  SIGN_IN = 'sign_in',
  SIGN_OUT = 'sign_out',
  REGISTER = 'register',
  
  // Airdrop actions
  CHECK_ELIGIBILITY = 'check_eligibility',
  VIEW_AIRDROP = 'view_airdrop',
  CLAIM_AIRDROP = 'claim_airdrop',
  SHARE_AIRDROP = 'share_airdrop',
  
  // Wallet actions
  CONNECT_WALLET = 'connect_wallet',
  DISCONNECT_WALLET = 'disconnect_wallet',
  SWITCH_NETWORK = 'switch_network',
  
  // UI actions
  CLICK = 'click',
  VIEW = 'view',
  SCROLL = 'scroll',
  SEARCH = 'search',
  FILTER = 'filter',
  SORT = 'sort',
  
  // Performance
  PAGE_LOAD = 'page_load',
  API_CALL = 'api_call',
  
  // Error
  ERROR_OCCURRED = 'error_occurred',
  ERROR_HANDLED = 'error_handled',
}

/**
 * Analytics event interface
 */
export interface AnalyticsEvent {
  /** Event ID */
  id: string;
  /** Event category */
  category: EventCategory;
  /** Event action */
  action: EventAction;
  /** Event label (optional description) */
  label?: string;
  /** Event value (numeric) */
  value?: number;
  /** User ID (if authenticated) */
  userId?: string;
  /** Session ID */
  sessionId: string;
  /** Timestamp */
  timestamp: number;
  /** Page URL */
  pageUrl: string;
  /** Referrer URL */
  referrer?: string;
  /** User agent */
  userAgent?: string;
  /** Screen resolution */
  screenResolution?: string;
  /** Custom properties */
  properties?: Record<string, any>;
}

/**
 * Page view interface
 */
export interface PageView {
  /** Page view ID */
  id: string;
  /** Page URL */
  url: string;
  /** Page title */
  title: string;
  /** Referrer URL */
  referrer?: string;
  /** User ID */
  userId?: string;
  /** Session ID */
  sessionId: string;
  /** Timestamp */
  timestamp: number;
  /** Time spent on page (seconds) */
  timeSpent?: number;
  /** Bounce (user left without interaction) */
  bounce?: boolean;
}

/**
 * User session interface
 */
export interface UserSession {
  /** Session ID */
  id: string;
  /** User ID */
  userId?: string;
  /** Session start time */
  startTime: number;
  /** Session end time */
  endTime?: number;
  /** Page views in session */
  pageViews: number;
  /** Events in session */
  events: number;
  /** Entry page */
  entryPage: string;
  /** Exit page */
  exitPage?: string;
  /** Device type */
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  /** Browser */
  browser?: string;
  /** Operating system */
  os?: string;
  /** Country */
  country?: string;
}

/**
 * Analytics metrics interface
 */
export interface AnalyticsMetrics {
  /** Total events */
  totalEvents: number;
  /** Total page views */
  totalPageViews: number;
  /** Unique users */
  uniqueUsers: number;
  /** Total sessions */
  totalSessions: number;
  /** Average session duration */
  avgSessionDuration: number;
  /** Bounce rate */
  bounceRate: number;
  /** Events by category */
  eventsByCategory: Record<string, number>;
  /** Events by action */
  eventsByAction: Record<string, number>;
  /** Top pages */
  topPages: Array<{ url: string; views: number }>;
  /** Top referrers */
  topReferrers: Array<{ referrer: string; count: number }>;
}

/**
 * Analytics service class
 */
export class AnalyticsService {
  private events: Map<string, AnalyticsEvent>;
  private pageViews: Map<string, PageView>;
  private sessions: Map<string, UserSession>;
  private currentSessionId: string;

  constructor() {
    this.events = new Map();
    this.pageViews = new Map();
    this.sessions = new Map();
    this.currentSessionId = this.generateSessionId();

    // Initialize session
    this.startSession();
  }

  /**
   * Track an event
   */
  track(
    category: EventCategory,
    action: EventAction,
    options?: {
      label?: string;
      value?: number;
      userId?: string;
      properties?: Record<string, any>;
    }
  ): void {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      category,
      action,
      label: options?.label,
      value: options?.value,
      userId: options?.userId,
      sessionId: this.currentSessionId,
      timestamp: Date.now(),
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      screenResolution:
        typeof window !== 'undefined'
          ? `${window.screen.width}x${window.screen.height}`
          : undefined,
      properties: options?.properties,
    };

    this.events.set(event.id, event);

    // Update session
    this.updateSession();

    logger.debug('Event tracked', {
      category,
      action,
      label: options?.label,
    });

    // Send to external analytics service (Google Analytics, Mixpanel, etc.)
    this.sendToAnalyticsProvider(event);
  }

  /**
   * Track page view
   */
  trackPageView(
    url: string,
    title: string,
    options?: {
      userId?: string;
      referrer?: string;
    }
  ): void {
    const pageView: PageView = {
      id: this.generatePageViewId(),
      url,
      title,
      referrer: options?.referrer,
      userId: options?.userId,
      sessionId: this.currentSessionId,
      timestamp: Date.now(),
    };

    this.pageViews.set(pageView.id, pageView);

    // Update session
    this.updateSession();

    logger.debug('Page view tracked', { url, title });

    // Track as event
    this.track(EventCategory.UI, EventAction.VIEW, {
      label: title,
      userId: options?.userId,
      properties: { url },
    });
  }

  /**
   * Track user action
   */
  trackUserAction(
    action: EventAction,
    label?: string,
    value?: number
  ): void {
    this.track(EventCategory.USER, action, { label, value });
  }

  /**
   * Track airdrop interaction
   */
  trackAirdropInteraction(
    action: EventAction,
    airdropName: string,
    properties?: Record<string, any>
  ): void {
    this.track(EventCategory.AIRDROP, action, {
      label: airdropName,
      properties,
    });
  }

  /**
   * Track wallet interaction
   */
  trackWalletInteraction(
    action: EventAction,
    walletType?: string
  ): void {
    this.track(EventCategory.WALLET, action, {
      label: walletType,
    });
  }

  /**
   * Track error
   */
  trackError(
    error: Error,
    context?: Record<string, any>
  ): void {
    this.track(EventCategory.ERROR, EventAction.ERROR_OCCURRED, {
      label: error.message,
      properties: {
        stack: error.stack,
        ...context,
      },
    });

    logger.error('Error tracked in analytics', { error, context });
  }

  /**
   * Track performance metric
   */
  trackPerformance(
    metric: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' = 'ms'
  ): void {
    this.track(EventCategory.PERFORMANCE, EventAction.API_CALL, {
      label: metric,
      value,
      properties: { unit },
    });
  }

  /**
   * Start a new session
   */
  private startSession(): void {
    const session: UserSession = {
      id: this.currentSessionId,
      startTime: Date.now(),
      pageViews: 0,
      events: 0,
      entryPage: typeof window !== 'undefined' ? window.location.href : '',
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
    };

    this.sessions.set(session.id, session);

    logger.debug('Session started', { sessionId: session.id });
  }

  /**
   * Update current session
   */
  private updateSession(): void {
    const session = this.sessions.get(this.currentSessionId);

    if (!session) return;

    session.events = this.getEventsBySession(this.currentSessionId).length;
    session.pageViews = this.getPageViewsBySession(this.currentSessionId).length;
    session.exitPage = typeof window !== 'undefined' ? window.location.href : '';

    this.sessions.set(session.id, session);
  }

  /**
   * End current session
   */
  endSession(): void {
    const session = this.sessions.get(this.currentSessionId);

    if (!session) return;

    session.endTime = Date.now();

    this.sessions.set(session.id, session);

    logger.debug('Session ended', {
      sessionId: session.id,
      duration: session.endTime - session.startTime,
    });

    // Start a new session
    this.currentSessionId = this.generateSessionId();
    this.startSession();
  }

  /**
   * Get events by session
   */
  private getEventsBySession(sessionId: string): AnalyticsEvent[] {
    return Array.from(this.events.values()).filter(
      (e) => e.sessionId === sessionId
    );
  }

  /**
   * Get page views by session
   */
  private getPageViewsBySession(sessionId: string): PageView[] {
    return Array.from(this.pageViews.values()).filter(
      (pv) => pv.sessionId === sessionId
    );
  }

  /**
   * Get all events
   */
  getEvents(options?: {
    category?: EventCategory;
    action?: EventAction;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): AnalyticsEvent[] {
    let events = Array.from(this.events.values());

    if (options?.category) {
      events = events.filter((e) => e.category === options.category);
    }

    if (options?.action) {
      events = events.filter((e) => e.action === options.action);
    }

    if (options?.userId) {
      events = events.filter((e) => e.userId === options.userId);
    }

    if (options?.startDate) {
      events = events.filter((e) => e.timestamp >= options.startDate!.getTime());
    }

    if (options?.endDate) {
      events = events.filter((e) => e.timestamp <= options.endDate!.getTime());
    }

    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get analytics metrics
   */
  getMetrics(options?: {
    startDate?: Date;
    endDate?: Date;
  }): AnalyticsMetrics {
    const events = this.getEvents(options);
    const pageViews = Array.from(this.pageViews.values()).filter((pv) => {
      if (options?.startDate && pv.timestamp < options.startDate.getTime()) {
        return false;
      }
      if (options?.endDate && pv.timestamp > options.endDate.getTime()) {
        return false;
      }
      return true;
    });

    const sessions = Array.from(this.sessions.values()).filter((s) => {
      if (options?.startDate && s.startTime < options.startDate.getTime()) {
        return false;
      }
      if (options?.endDate && s.startTime > options.endDate.getTime()) {
        return false;
      }
      return true;
    });

    const uniqueUsers = new Set(
      events.filter((e) => e.userId).map((e) => e.userId)
    ).size;

    const eventsByCategory: Record<string, number> = {};
    events.forEach((event) => {
      eventsByCategory[event.category] =
        (eventsByCategory[event.category] || 0) + 1;
    });

    const eventsByAction: Record<string, number> = {};
    events.forEach((event) => {
      eventsByAction[event.action] = (eventsByAction[event.action] || 0) + 1;
    });

    const pageViewCounts: Record<string, number> = {};
    pageViews.forEach((pv) => {
      pageViewCounts[pv.url] = (pageViewCounts[pv.url] || 0) + 1;
    });

    const topPages = Object.entries(pageViewCounts)
      .map(([url, views]) => ({ url, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const referrerCounts: Record<string, number> = {};
    pageViews.forEach((pv) => {
      if (pv.referrer) {
        referrerCounts[pv.referrer] = (referrerCounts[pv.referrer] || 0) + 1;
      }
    });

    const topReferrers = Object.entries(referrerCounts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const avgSessionDuration =
      sessions.reduce((acc, s) => {
        const duration = s.endTime ? s.endTime - s.startTime : 0;
        return acc + duration;
      }, 0) / (sessions.length || 1);

    const bounces = sessions.filter((s) => s.pageViews === 1 && s.events === 1).length;
    const bounceRate = (bounces / (sessions.length || 1)) * 100;

    return {
      totalEvents: events.length,
      totalPageViews: pageViews.length,
      uniqueUsers,
      totalSessions: sessions.length,
      avgSessionDuration,
      bounceRate,
      eventsByCategory,
      eventsByAction,
      topPages,
      topReferrers,
    };
  }

  /**
   * Send event to external analytics provider
   */
  private sendToAnalyticsProvider(event: AnalyticsEvent): void {
    // In production, integrate with analytics providers:
    // - Google Analytics (gtag.js)
    // - Mixpanel
    // - Amplitude
    // - Segment
    // etc.

    // Example for Google Analytics:
    // if (typeof gtag !== 'undefined') {
    //   gtag('event', event.action, {
    //     event_category: event.category,
    //     event_label: event.label,
    //     value: event.value,
    //   });
    // }
  }

  /**
   * Get device type
   */
  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' | undefined {
    if (typeof navigator === 'undefined') return undefined;

    const ua = navigator.userAgent;

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }

    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }

    return 'desktop';
  }

  /**
   * Get browser name
   */
  private getBrowser(): string | undefined {
    if (typeof navigator === 'undefined') return undefined;

    const ua = navigator.userAgent;

    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';

    return 'Unknown';
  }

  /**
   * Get operating system
   */
  private getOS(): string | undefined {
    if (typeof navigator === 'undefined') return undefined;

    const ua = navigator.userAgent;

    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';

    return 'Unknown';
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate page view ID
   */
  private generatePageViewId(): string {
    return `pv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear old events (for memory management)
   */
  clearOldEvents(olderThan: number = 7 * 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - olderThan;
    let count = 0;

    this.events.forEach((event, id) => {
      if (event.timestamp < cutoff) {
        this.events.delete(id);
        count++;
      }
    });

    this.pageViews.forEach((pv, id) => {
      if (pv.timestamp < cutoff) {
        this.pageViews.delete(id);
        count++;
      }
    });

    this.sessions.forEach((session, id) => {
      if (session.startTime < cutoff) {
        this.sessions.delete(id);
        count++;
      }
    });

    logger.info('Cleared old analytics data', { count });

    return count;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

