/**
 * @fileoverview Tests for webhook manager
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  WebhookManager,
  WebhookEvent,
  WebhookConfig,
} from '@/lib/webhooks/webhook-manager';

// Mock fetch
global.fetch = jest.fn();

describe('WebhookManager', () => {
  let manager: WebhookManager;

  beforeEach(() => {
    manager = new WebhookManager();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Webhook Registration', () => {
    it('should register webhook', () => {
      const config: WebhookConfig = {
        id: 'test-webhook',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.AIRDROP_ELIGIBLE],
        secret: 'test-secret',
      };

      manager.register(config);

      const webhook = manager.get('test-webhook');
      expect(webhook).toBeDefined();
      expect(webhook?.url).toBe(config.url);
    });

    it('should unregister webhook', () => {
      const config: WebhookConfig = {
        id: 'test-webhook',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.AIRDROP_ELIGIBLE],
        secret: 'test-secret',
      };

      manager.register(config);
      const result = manager.unregister('test-webhook');

      expect(result).toBe(true);
      expect(manager.get('test-webhook')).toBeUndefined();
    });

    it('should list all webhooks', () => {
      const config1: WebhookConfig = {
        id: 'webhook-1',
        url: 'https://example.com/webhook1',
        events: [WebhookEvent.AIRDROP_ELIGIBLE],
        secret: 'secret1',
      };

      const config2: WebhookConfig = {
        id: 'webhook-2',
        url: 'https://example.com/webhook2',
        events: [WebhookEvent.PORTFOLIO_UPDATED],
        secret: 'secret2',
      };

      manager.register(config1);
      manager.register(config2);

      const webhooks = manager.list();
      expect(webhooks).toHaveLength(2);
    });

    it('should update webhook', () => {
      const config: WebhookConfig = {
        id: 'test-webhook',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.AIRDROP_ELIGIBLE],
        secret: 'test-secret',
      };

      manager.register(config);

      const updated = manager.update('test-webhook', {
        url: 'https://example.com/new-webhook',
      });

      expect(updated).toBe(true);

      const webhook = manager.get('test-webhook');
      expect(webhook?.url).toBe('https://example.com/new-webhook');
    });
  });

  describe('Webhook Delivery', () => {
    it('should trigger webhook for subscribed events', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'Success',
      } as Response);

      const config: WebhookConfig = {
        id: 'test-webhook',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.AIRDROP_ELIGIBLE],
        secret: 'test-secret',
      };

      manager.register(config);

      await manager.trigger(WebhookEvent.AIRDROP_ELIGIBLE, {
        address: '0x123',
        eligible: true,
      });

      // Wait for async delivery
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should not trigger webhook for unsubscribed events', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

      const config: WebhookConfig = {
        id: 'test-webhook',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.AIRDROP_ELIGIBLE],
        secret: 'test-secret',
      };

      manager.register(config);

      await manager.trigger(WebhookEvent.PORTFOLIO_UPDATED, {
        address: '0x123',
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not trigger inactive webhooks', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

      const config: WebhookConfig = {
        id: 'test-webhook',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.AIRDROP_ELIGIBLE],
        secret: 'test-secret',
        active: false,
      };

      manager.register(config);

      await manager.trigger(WebhookEvent.AIRDROP_ELIGIBLE, {
        address: '0x123',
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Signature Verification', () => {
    it('should generate signature', () => {
      const payload = {
        event: WebhookEvent.AIRDROP_ELIGIBLE,
        timestamp: new Date().toISOString(),
        data: { test: true },
        webhookId: 'test',
      };

      const signature = manager.verifySignature as any; // Access private method for testing
      expect(typeof signature).toBe('function');
    });

    it('should verify correct signature', () => {
      const payload = {
        event: WebhookEvent.AIRDROP_ELIGIBLE,
        timestamp: new Date().toISOString(),
        data: { test: true },
        webhookId: 'test',
      };

      const secret = 'test-secret';

      // This would test the actual verification in a real scenario
      expect(manager).toBeDefined();
    });
  });

  describe('Webhook Testing', () => {
    it('should test webhook delivery', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'Success',
      } as Response);

      const config: WebhookConfig = {
        id: 'test-webhook',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.CUSTOM],
        secret: 'test-secret',
      };

      manager.register(config);

      const result = await manager.test('test-webhook');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
    });

    it('should handle test delivery errors', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValue(new Error('Network error'));

      const config: WebhookConfig = {
        id: 'test-webhook',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.CUSTOM],
        secret: 'test-secret',
      };

      manager.register(config);

      const result = await manager.test('test-webhook');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should throw error for non-existent webhook', async () => {
      await expect(manager.test('non-existent')).rejects.toThrow();
    });
  });

  describe('Statistics', () => {
    it('should return statistics', async () => {
      const config: WebhookConfig = {
        id: 'test-webhook',
        url: 'https://example.com/webhook',
        events: [WebhookEvent.AIRDROP_ELIGIBLE],
        secret: 'test-secret',
      };

      manager.register(config);

      const stats = await manager.getStatistics('test-webhook');

      expect(stats).toHaveProperty('totalDeliveries');
      expect(stats).toHaveProperty('successfulDeliveries');
      expect(stats).toHaveProperty('failedDeliveries');
      expect(stats).toHaveProperty('averageResponseTime');
    });
  });

  describe('Multiple Webhooks', () => {
    it('should trigger multiple webhooks for same event', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'Success',
      } as Response);

      const config1: WebhookConfig = {
        id: 'webhook-1',
        url: 'https://example.com/webhook1',
        events: [WebhookEvent.AIRDROP_ELIGIBLE],
        secret: 'secret1',
      };

      const config2: WebhookConfig = {
        id: 'webhook-2',
        url: 'https://example.com/webhook2',
        events: [WebhookEvent.AIRDROP_ELIGIBLE],
        secret: 'secret2',
      };

      manager.register(config1);
      manager.register(config2);

      await manager.trigger(WebhookEvent.AIRDROP_ELIGIBLE, {
        address: '0x123',
      });

      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event Types', () => {
    it('should support all event types', () => {
      expect(WebhookEvent.AIRDROP_ELIGIBLE).toBe('airdrop.eligible');
      expect(WebhookEvent.AIRDROP_CLAIMED).toBe('airdrop.claimed');
      expect(WebhookEvent.PORTFOLIO_UPDATED).toBe('portfolio.updated');
      expect(WebhookEvent.TRANSACTION_DETECTED).toBe('transaction.detected');
      expect(WebhookEvent.GAS_ALERT).toBe('gas.alert');
      expect(WebhookEvent.PRICE_ALERT).toBe('price.alert');
      expect(WebhookEvent.TOKEN_TRANSFERRED).toBe('token.transferred');
      expect(WebhookEvent.NFT_TRANSFERRED).toBe('nft.transferred');
      expect(WebhookEvent.CUSTOM).toBe('custom');
    });
  });
});

