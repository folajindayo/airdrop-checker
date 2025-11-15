/**
 * @fileoverview Tests for analytics tracker
 */

import {
  analytics,
  initAnalytics,
  EventCategory,
  EventAction,
  type AnalyticsProvider,
} from '@/lib/analytics/tracker';

describe('Analytics Tracker', () => {
  let mockProvider: jest.Mocked<AnalyticsProvider>;

  beforeEach(() => {
    // Create mock provider
    mockProvider = {
      track: jest.fn(),
      identify: jest.fn(),
      page: jest.fn(),
    };

    // Clear any existing providers
    (analytics as any).providers = [];
    (analytics as any).userId = undefined;
  });

  describe('Provider Management', () => {
    it('should add provider', () => {
      analytics.addProvider(mockProvider);
      
      analytics.track({
        category: EventCategory.UI,
        action: EventAction.BUTTON_CLICK,
      });

      expect(mockProvider.track).toHaveBeenCalled();
    });

    it('should remove provider', () => {
      analytics.addProvider(mockProvider);
      analytics.removeProvider(mockProvider);
      
      analytics.track({
        category: EventCategory.UI,
        action: EventAction.BUTTON_CLICK,
      });

      expect(mockProvider.track).not.toHaveBeenCalled();
    });

    it('should support multiple providers', () => {
      const mockProvider2: jest.Mocked<AnalyticsProvider> = {
        track: jest.fn(),
        identify: jest.fn(),
        page: jest.fn(),
      };

      analytics.addProvider(mockProvider);
      analytics.addProvider(mockProvider2);
      
      analytics.track({
        category: EventCategory.UI,
        action: EventAction.BUTTON_CLICK,
      });

      expect(mockProvider.track).toHaveBeenCalled();
      expect(mockProvider2.track).toHaveBeenCalled();
    });
  });

  describe('Event Tracking', () => {
    beforeEach(() => {
      analytics.addProvider(mockProvider);
    });

    it('should track event with required fields', () => {
      analytics.track({
        category: EventCategory.WALLET,
        action: EventAction.WALLET_CONNECT,
      });

      expect(mockProvider.track).toHaveBeenCalledWith(
        expect.objectContaining({
          category: EventCategory.WALLET,
          action: EventAction.WALLET_CONNECT,
        })
      );
    });

    it('should track event with optional fields', () => {
      analytics.track({
        category: EventCategory.AIRDROP,
        action: EventAction.AIRDROP_CHECK,
        label: 'Example Protocol',
        value: 1000,
        properties: { address: '0x123' },
      });

      expect(mockProvider.track).toHaveBeenCalledWith(
        expect.objectContaining({
          category: EventCategory.AIRDROP,
          action: EventAction.AIRDROP_CHECK,
          label: 'Example Protocol',
          value: 1000,
          properties: { address: '0x123' },
        })
      );
    });

    it('should enrich event with session ID', () => {
      analytics.track({
        category: EventCategory.UI,
        action: EventAction.PAGE_VIEW,
      });

      expect(mockProvider.track).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: expect.any(String),
        })
      );
    });

    it('should enrich event with timestamp', () => {
      analytics.track({
        category: EventCategory.UI,
        action: EventAction.PAGE_VIEW,
      });

      expect(mockProvider.track).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
        })
      );
    });

    it('should enrich event with user ID when set', () => {
      analytics.setUserId('user123');
      
      analytics.track({
        category: EventCategory.UI,
        action: EventAction.PAGE_VIEW,
      });

      expect(mockProvider.track).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
        })
      );
    });

    it('should handle provider errors gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockProvider.track.mockImplementation(() => {
        throw new Error('Provider error');
      });

      analytics.track({
        category: EventCategory.UI,
        action: EventAction.BUTTON_CLICK,
      });

      expect(consoleError).toHaveBeenCalledWith('Failed to track event:', expect.any(Error));
      consoleError.mockRestore();
    });
  });

  describe('User Identification', () => {
    beforeEach(() => {
      analytics.addProvider(mockProvider);
    });

    it('should set user ID', () => {
      analytics.setUserId('user123');
      
      expect(mockProvider.identify).toHaveBeenCalledWith('user123');
    });

    it('should include user ID in tracked events', () => {
      analytics.setUserId('user123');
      
      analytics.track({
        category: EventCategory.UI,
        action: EventAction.PAGE_VIEW,
      });

      expect(mockProvider.track).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
        })
      );
    });
  });

  describe('Page Tracking', () => {
    beforeEach(() => {
      analytics.addProvider(mockProvider);
    });

    it('should track page view', () => {
      analytics.page('Home');

      expect(mockProvider.page).toHaveBeenCalledWith('Home', undefined);
    });

    it('should track page view with properties', () => {
      analytics.page('Portfolio', { wallet: '0x123' });

      expect(mockProvider.page).toHaveBeenCalledWith('Portfolio', { wallet: '0x123' });
    });

    it('should also track page view as event', () => {
      analytics.page('Home');

      expect(mockProvider.track).toHaveBeenCalledWith(
        expect.objectContaining({
          category: EventCategory.UI,
          action: EventAction.PAGE_VIEW,
          label: 'Home',
        })
      );
    });

    it('should handle page tracking errors gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockProvider.page.mockImplementation(() => {
        throw new Error('Provider error');
      });

      analytics.page('Home');

      expect(consoleError).toHaveBeenCalledWith('Failed to track page view:', expect.any(Error));
      consoleError.mockRestore();
    });
  });

  describe('Convenience Methods', () => {
    beforeEach(() => {
      analytics.addProvider(mockProvider);
    });

    describe('trackWalletConnect', () => {
      it('should track wallet connection', () => {
        analytics.trackWalletConnect('metamask', '0x123');

        expect(mockProvider.track).toHaveBeenCalledWith(
          expect.objectContaining({
            category: EventCategory.WALLET,
            action: EventAction.WALLET_CONNECT,
            label: 'metamask',
            properties: { address: '0x123' },
          })
        );
      });
    });

    describe('trackWalletDisconnect', () => {
      it('should track wallet disconnection', () => {
        analytics.trackWalletDisconnect();

        expect(mockProvider.track).toHaveBeenCalledWith(
          expect.objectContaining({
            category: EventCategory.WALLET,
            action: EventAction.WALLET_DISCONNECT,
          })
        );
      });
    });

    describe('trackChainSwitch', () => {
      it('should track chain switch', () => {
        analytics.trackChainSwitch(137);

        expect(mockProvider.track).toHaveBeenCalledWith(
          expect.objectContaining({
            category: EventCategory.WALLET,
            action: EventAction.WALLET_SWITCH_CHAIN,
            value: 137,
          })
        );
      });
    });

    describe('trackAirdropCheck', () => {
      it('should track airdrop check without project name', () => {
        analytics.trackAirdropCheck('0x123');

        expect(mockProvider.track).toHaveBeenCalledWith(
          expect.objectContaining({
            category: EventCategory.AIRDROP,
            action: EventAction.AIRDROP_CHECK,
            properties: { address: '0x123' },
          })
        );
      });

      it('should track airdrop check with project name', () => {
        analytics.trackAirdropCheck('0x123', 'Example Protocol');

        expect(mockProvider.track).toHaveBeenCalledWith(
          expect.objectContaining({
            category: EventCategory.AIRDROP,
            action: EventAction.AIRDROP_CHECK,
            label: 'Example Protocol',
            properties: { address: '0x123' },
          })
        );
      });
    });

    describe('trackAirdropClaim', () => {
      it('should track airdrop claim', () => {
        analytics.trackAirdropClaim('Example Protocol', 1000);

        expect(mockProvider.track).toHaveBeenCalledWith(
          expect.objectContaining({
            category: EventCategory.AIRDROP,
            action: EventAction.AIRDROP_CLAIM,
            label: 'Example Protocol',
            value: 1000,
          })
        );
      });
    });

    describe('trackError', () => {
      it('should track error without context', () => {
        const error = new Error('Test error');
        analytics.trackError(error);

        expect(mockProvider.track).toHaveBeenCalledWith(
          expect.objectContaining({
            category: EventCategory.ERROR,
            action: EventAction.ERROR_OCCURRED,
            properties: {
              error: 'Test error',
              stack: error.stack,
            },
          })
        );
      });

      it('should track error with context', () => {
        const error = new Error('Test error');
        analytics.trackError(error, 'wallet-connection');

        expect(mockProvider.track).toHaveBeenCalledWith(
          expect.objectContaining({
            category: EventCategory.ERROR,
            action: EventAction.ERROR_OCCURRED,
            label: 'wallet-connection',
            properties: {
              error: 'Test error',
              stack: error.stack,
            },
          })
        );
      });
    });

    describe('trackClick', () => {
      it('should track button click without location', () => {
        analytics.trackClick('connect-button');

        expect(mockProvider.track).toHaveBeenCalledWith(
          expect.objectContaining({
            category: EventCategory.UI,
            action: EventAction.BUTTON_CLICK,
            label: 'connect-button',
          })
        );
      });

      it('should track button click with location', () => {
        analytics.trackClick('connect-button', 'header');

        expect(mockProvider.track).toHaveBeenCalledWith(
          expect.objectContaining({
            category: EventCategory.UI,
            action: EventAction.BUTTON_CLICK,
            label: 'connect-button',
            properties: { location: 'header' },
          })
        );
      });
    });
  });

  describe('Session Management', () => {
    it('should generate unique session IDs', () => {
      analytics.addProvider(mockProvider);

      analytics.track({
        category: EventCategory.UI,
        action: EventAction.PAGE_VIEW,
      });

      const firstSessionId = mockProvider.track.mock.calls[0][0].sessionId;
      expect(firstSessionId).toBeDefined();
      expect(typeof firstSessionId).toBe('string');
    });

    it('should maintain same session ID across events', () => {
      analytics.addProvider(mockProvider);

      analytics.track({
        category: EventCategory.UI,
        action: EventAction.PAGE_VIEW,
      });

      analytics.track({
        category: EventCategory.UI,
        action: EventAction.BUTTON_CLICK,
      });

      const firstSessionId = mockProvider.track.mock.calls[0][0].sessionId;
      const secondSessionId = mockProvider.track.mock.calls[1][0].sessionId;
      
      expect(firstSessionId).toBe(secondSessionId);
    });
  });

  describe('Initialization', () => {
    it('should initialize with Google Analytics', () => {
      // This is a basic test - full integration would require mocking window.gtag
      expect(() => {
        initAnalytics({ googleAnalyticsId: 'GA-XXXXXXXX' });
      }).not.toThrow();
    });

    it('should initialize with Mixpanel', () => {
      expect(() => {
        initAnalytics({ mixpanelToken: 'test-token' });
      }).not.toThrow();
    });

    it('should initialize with console provider in development', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      initAnalytics({ isDevelopment: true });
      
      analytics.track({
        category: EventCategory.UI,
        action: EventAction.PAGE_VIEW,
      });

      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Track:', expect.any(Object));
      consoleSpy.mockRestore();
    });
  });
});

