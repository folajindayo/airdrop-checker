/**
 * @fileoverview Tests for analytics service
 */

import {
  AnalyticsService,
  EventCategory,
  EventAction,
} from '@/lib/services/analytics-service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    service = new AnalyticsService();
  });

  describe('Event Tracking', () => {
    it('should track events', () => {
      service.track(EventCategory.USER, EventAction.SIGN_IN, {
        label: 'test-user',
        value: 1,
      });

      const events = service.getEvents();

      expect(events.length).toBe(1);
      expect(events[0].category).toBe(EventCategory.USER);
      expect(events[0].action).toBe(EventAction.SIGN_IN);
      expect(events[0].label).toBe('test-user');
    });

    it('should assign unique IDs to events', () => {
      service.track(EventCategory.USER, EventAction.SIGN_IN);
      service.track(EventCategory.USER, EventAction.SIGN_OUT);

      const events = service.getEvents();

      expect(events[0].id).not.toBe(events[1].id);
    });

    it('should include timestamp in events', () => {
      const before = Date.now();
      service.track(EventCategory.USER, EventAction.SIGN_IN);
      const after = Date.now();

      const events = service.getEvents();

      expect(events[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(events[0].timestamp).toBeLessThanOrEqual(after);
    });

    it('should include session ID in events', () => {
      service.track(EventCategory.USER, EventAction.SIGN_IN);

      const events = service.getEvents();

      expect(events[0].sessionId).toBeTruthy();
    });

    it('should store custom properties', () => {
      const properties = { custom: 'value', nested: { data: 123 } };

      service.track(EventCategory.USER, EventAction.SIGN_IN, {
        properties,
      });

      const events = service.getEvents();

      expect(events[0].properties).toEqual(properties);
    });
  });

  describe('Page View Tracking', () => {
    it('should track page views', () => {
      service.trackPageView('https://example.com/page', 'Test Page');

      const events = service.getEvents({
        category: EventCategory.UI,
        action: EventAction.VIEW,
      });

      expect(events.length).toBeGreaterThanOrEqual(1);
    });

    it('should include page title', () => {
      service.trackPageView('https://example.com/page', 'Test Page');

      const events = service.getEvents({
        category: EventCategory.UI,
        action: EventAction.VIEW,
      });

      expect(events[0].label).toBe('Test Page');
    });

    it('should store URL in properties', () => {
      service.trackPageView('https://example.com/page', 'Test Page');

      const events = service.getEvents({
        category: EventCategory.UI,
        action: EventAction.VIEW,
      });

      expect(events[0].properties?.url).toBe('https://example.com/page');
    });
  });

  describe('Specialized Tracking', () => {
    it('should track user actions', () => {
      service.trackUserAction(EventAction.REGISTER, 'new-user');

      const events = service.getEvents({ category: EventCategory.USER });

      expect(events.length).toBe(1);
      expect(events[0].action).toBe(EventAction.REGISTER);
    });

    it('should track airdrop interactions', () => {
      service.trackAirdropInteraction(
        EventAction.CHECK_ELIGIBILITY,
        'TestAirdrop',
        { amount: '1000' }
      );

      const events = service.getEvents({ category: EventCategory.AIRDROP });

      expect(events.length).toBe(1);
      expect(events[0].label).toBe('TestAirdrop');
      expect(events[0].properties?.amount).toBe('1000');
    });

    it('should track wallet interactions', () => {
      service.trackWalletInteraction(EventAction.CONNECT_WALLET, 'MetaMask');

      const events = service.getEvents({ category: EventCategory.WALLET });

      expect(events.length).toBe(1);
      expect(events[0].label).toBe('MetaMask');
    });

    it('should track errors', () => {
      const error = new Error('Test error');

      service.trackError(error, { page: '/test' });

      const events = service.getEvents({ category: EventCategory.ERROR });

      expect(events.length).toBe(1);
      expect(events[0].label).toBe('Test error');
      expect(events[0].properties?.page).toBe('/test');
    });

    it('should track performance metrics', () => {
      service.trackPerformance('api-call', 150, 'ms');

      const events = service.getEvents({
        category: EventCategory.PERFORMANCE,
      });

      expect(events.length).toBe(1);
      expect(events[0].value).toBe(150);
      expect(events[0].properties?.unit).toBe('ms');
    });
  });

  describe('Event Filtering', () => {
    beforeEach(() => {
      service.track(EventCategory.USER, EventAction.SIGN_IN);
      service.track(EventCategory.USER, EventAction.SIGN_OUT);
      service.track(EventCategory.AIRDROP, EventAction.CHECK_ELIGIBILITY);
    });

    it('should filter by category', () => {
      const userEvents = service.getEvents({ category: EventCategory.USER });

      expect(userEvents.length).toBe(2);
      expect(userEvents.every((e) => e.category === EventCategory.USER)).toBe(
        true
      );
    });

    it('should filter by action', () => {
      const signInEvents = service.getEvents({ action: EventAction.SIGN_IN });

      expect(signInEvents.length).toBe(1);
      expect(signInEvents[0].action).toBe(EventAction.SIGN_IN);
    });

    it('should filter by user ID', () => {
      service.track(EventCategory.USER, EventAction.SIGN_IN, {
        userId: 'user123',
      });

      const userEvents = service.getEvents({ userId: 'user123' });

      expect(userEvents.every((e) => e.userId === 'user123')).toBe(true);
    });

    it('should filter by date range', () => {
      const startDate = new Date(Date.now() - 1000);
      const endDate = new Date(Date.now() + 1000);

      const events = service.getEvents({ startDate, endDate });

      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('Metrics', () => {
    beforeEach(() => {
      service.track(EventCategory.USER, EventAction.SIGN_IN);
      service.track(EventCategory.USER, EventAction.SIGN_OUT);
      service.track(EventCategory.AIRDROP, EventAction.CHECK_ELIGIBILITY);
      service.trackPageView('/page1', 'Page 1');
      service.trackPageView('/page2', 'Page 2');
    });

    it('should calculate total events', () => {
      const metrics = service.getMetrics();

      expect(metrics.totalEvents).toBeGreaterThanOrEqual(3);
    });

    it('should calculate total page views', () => {
      const metrics = service.getMetrics();

      expect(metrics.totalPageViews).toBeGreaterThanOrEqual(2);
    });

    it('should calculate events by category', () => {
      const metrics = service.getMetrics();

      expect(metrics.eventsByCategory[EventCategory.USER]).toBeGreaterThanOrEqual(
        2
      );
      expect(
        metrics.eventsByCategory[EventCategory.AIRDROP]
      ).toBeGreaterThanOrEqual(1);
    });

    it('should calculate events by action', () => {
      const metrics = service.getMetrics();

      expect(metrics.eventsByAction[EventAction.SIGN_IN]).toBeGreaterThanOrEqual(
        1
      );
    });

    it('should calculate top pages', () => {
      const metrics = service.getMetrics();

      expect(metrics.topPages.length).toBeGreaterThan(0);
    });

    it('should calculate metrics for date range', () => {
      const startDate = new Date(Date.now() - 10000);
      const endDate = new Date();

      const metrics = service.getMetrics({ startDate, endDate });

      expect(metrics.totalEvents).toBeGreaterThan(0);
    });

    it('should calculate bounce rate', () => {
      const metrics = service.getMetrics();

      expect(typeof metrics.bounceRate).toBe('number');
      expect(metrics.bounceRate).toBeGreaterThanOrEqual(0);
      expect(metrics.bounceRate).toBeLessThanOrEqual(100);
    });

    it('should calculate average session duration', () => {
      const metrics = service.getMetrics();

      expect(typeof metrics.avgSessionDuration).toBe('number');
      expect(metrics.avgSessionDuration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Session Management', () => {
    it('should create session on initialization', () => {
      const metrics = service.getMetrics();

      expect(metrics.totalSessions).toBeGreaterThanOrEqual(1);
    });

    it('should end current session', () => {
      const metricsBefore = service.getMetrics();
      const sessionsBefore = metricsBefore.totalSessions;

      service.endSession();

      const metricsAfter = service.getMetrics();
      const sessionsAfter = metricsAfter.totalSessions;

      expect(sessionsAfter).toBeGreaterThan(sessionsBefore);
    });

    it('should update session on events', () => {
      service.track(EventCategory.USER, EventAction.SIGN_IN);

      const metrics = service.getMetrics();

      expect(metrics.totalEvents).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Data Cleanup', () => {
    it('should clear old events', () => {
      service.track(EventCategory.USER, EventAction.SIGN_IN);

      const count = service.clearOldEvents(0); // Clear all

      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should respect age threshold', () => {
      service.track(EventCategory.USER, EventAction.SIGN_IN);

      // Don't clear recent events (1 day = 86400000 ms)
      const count = service.clearOldEvents(86400000);

      const events = service.getEvents();
      expect(events.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle tracking without optional parameters', () => {
      service.track(EventCategory.USER, EventAction.SIGN_IN);

      const events = service.getEvents();

      expect(events.length).toBe(1);
      expect(events[0].label).toBeUndefined();
      expect(events[0].value).toBeUndefined();
    });

    it('should handle empty filters', () => {
      service.track(EventCategory.USER, EventAction.SIGN_IN);

      const events = service.getEvents({});

      expect(events.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle getting metrics with no data', () => {
      const freshService = new AnalyticsService();
      const metrics = freshService.getMetrics();

      expect(metrics.totalEvents).toBeGreaterThanOrEqual(0);
      expect(metrics.totalPageViews).toBeGreaterThanOrEqual(0);
    });

    it('should handle errors without stack trace', () => {
      const error = new Error('Test');
      delete error.stack;

      service.trackError(error);

      const events = service.getEvents({ category: EventCategory.ERROR });

      expect(events.length).toBe(1);
    });
  });

  describe('Concurrent Events', () => {
    it('should handle multiple events in quick succession', () => {
      for (let i = 0; i < 100; i++) {
        service.track(EventCategory.USER, EventAction.SIGN_IN);
      }

      const events = service.getEvents();

      expect(events.length).toBeGreaterThanOrEqual(100);
    });

    it('should maintain unique IDs for concurrent events', () => {
      const ids = new Set();

      for (let i = 0; i < 50; i++) {
        service.track(EventCategory.USER, EventAction.SIGN_IN);
      }

      const events = service.getEvents();

      events.forEach((event) => {
        ids.add(event.id);
      });

      expect(ids.size).toBe(events.length);
    });
  });
});

