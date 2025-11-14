/**
 * @fileoverview Webhook management system with delivery tracking
 * @module lib/webhooks/webhook-manager
 */

import { logger } from '@/lib/monitoring/logger';
import { createHMAC } from '@/lib/utils/crypto';

/**
 * Webhook event types
 */
export enum WebhookEvent {
  AIRDROP_ELIGIBLE = 'airdrop.eligible',
  AIRDROP_CLAIMED = 'airdrop.claimed',
  PORTFOLIO_UPDATED = 'portfolio.updated',
  TRANSACTION_DETECTED = 'transaction.detected',
  GAS_ALERT = 'gas.alert',
  PRICE_ALERT = 'price.alert',
  TOKEN_TRANSFERRED = 'token.transferred',
  NFT_TRANSFERRED = 'nft.transferred',
  CUSTOM = 'custom',
}

/**
 * Webhook payload structure
 */
export interface WebhookPayload {
  /**
   * Event type
   */
  event: WebhookEvent;

  /**
   * Event timestamp
   */
  timestamp: string;

  /**
   * Event data
   */
  data: Record<string, unknown>;

  /**
   * Webhook ID
   */
  webhookId: string;

  /**
   * Delivery attempt number
   */
  attempt?: number;
}

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  /**
   * Webhook ID
   */
  id: string;

  /**
   * Target URL
   */
  url: string;

  /**
   * Events to subscribe to
   */
  events: WebhookEvent[];

  /**
   * Secret for HMAC signature
   */
  secret: string;

  /**
   * Active status
   */
  active?: boolean;

  /**
   * Custom headers
   */
  headers?: Record<string, string>;

  /**
   * Timeout in milliseconds
   */
  timeout?: number;

  /**
   * Retry configuration
   */
  retry?: {
    maxAttempts: number;
    backoffMultiplier: number;
  };
}

/**
 * Webhook delivery result
 */
export interface WebhookDeliveryResult {
  /**
   * Success status
   */
  success: boolean;

  /**
   * HTTP status code
   */
  statusCode?: number;

  /**
   * Response body
   */
  response?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Delivery attempt number
   */
  attempt: number;

  /**
   * Delivery timestamp
   */
  timestamp: string;

  /**
   * Response time in milliseconds
   */
  responseTime?: number;
}

/**
 * Webhook manager class
 */
export class WebhookManager {
  private webhooks: Map<string, WebhookConfig> = new Map();
  private deliveryQueue: Array<{
    config: WebhookConfig;
    payload: WebhookPayload;
  }> = [];
  private isProcessing = false;

  /**
   * Register a webhook
   */
  public register(config: WebhookConfig): void {
    this.webhooks.set(config.id, {
      ...config,
      active: config.active !== false,
      timeout: config.timeout || 10000,
      retry: config.retry || {
        maxAttempts: 3,
        backoffMultiplier: 2,
      },
    });

    logger.info('Webhook registered', {
      id: config.id,
      url: config.url,
      events: config.events,
    });
  }

  /**
   * Unregister a webhook
   */
  public unregister(id: string): boolean {
    const existed = this.webhooks.delete(id);

    if (existed) {
      logger.info('Webhook unregistered', { id });
    }

    return existed;
  }

  /**
   * Get webhook by ID
   */
  public get(id: string): WebhookConfig | undefined {
    return this.webhooks.get(id);
  }

  /**
   * List all webhooks
   */
  public list(): WebhookConfig[] {
    return Array.from(this.webhooks.values());
  }

  /**
   * Update webhook configuration
   */
  public update(id: string, updates: Partial<WebhookConfig>): boolean {
    const webhook = this.webhooks.get(id);

    if (!webhook) {
      return false;
    }

    this.webhooks.set(id, { ...webhook, ...updates });

    logger.info('Webhook updated', { id, updates });

    return true;
  }

  /**
   * Trigger webhook event
   */
  public async trigger(
    event: WebhookEvent,
    data: Record<string, unknown>
  ): Promise<void> {
    const subscribers = Array.from(this.webhooks.values()).filter(
      (webhook) => webhook.active && webhook.events.includes(event)
    );

    if (subscribers.length === 0) {
      return;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      webhookId: '',
    };

    // Queue deliveries
    for (const webhook of subscribers) {
      this.deliveryQueue.push({
        config: webhook,
        payload: { ...payload, webhookId: webhook.id },
      });
    }

    // Process queue
    this.processQueue();
  }

  /**
   * Process delivery queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.deliveryQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.deliveryQueue.length > 0) {
      const item = this.deliveryQueue.shift();
      if (!item) continue;

      try {
        await this.deliver(item.config, item.payload);
      } catch (error) {
        logger.error('Webhook delivery failed', {
          webhookId: item.config.id,
          error,
        });
      }
    }

    this.isProcessing = false;
  }

  /**
   * Deliver webhook payload
   */
  private async deliver(
    config: WebhookConfig,
    payload: WebhookPayload,
    attempt = 1
  ): Promise<WebhookDeliveryResult> {
    const startTime = Date.now();

    try {
      // Generate signature
      const signature = this.generateSignature(payload, config.secret);

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Airdrop-Checker-Webhooks/1.0',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Delivery-Id': `${payload.webhookId}-${Date.now()}`,
        'X-Webhook-Attempt': String(attempt),
        ...config.headers,
      };

      // Send request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(config.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...payload, attempt }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const responseText = await response.text();

      const result: WebhookDeliveryResult = {
        success: response.ok,
        statusCode: response.status,
        response: responseText,
        attempt,
        timestamp: new Date().toISOString(),
        responseTime,
      };

      if (response.ok) {
        logger.info('Webhook delivered successfully', {
          webhookId: config.id,
          event: payload.event,
          statusCode: response.status,
          responseTime,
          attempt,
        });
      } else {
        logger.warn('Webhook delivery failed', {
          webhookId: config.id,
          event: payload.event,
          statusCode: response.status,
          attempt,
        });

        // Retry if configured
        if (
          config.retry &&
          attempt < config.retry.maxAttempts &&
          response.status >= 500
        ) {
          const delay = this.calculateBackoff(attempt, config.retry.backoffMultiplier);
          await this.scheduleRetry(config, payload, attempt + 1, delay);
        }
      }

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      logger.error('Webhook delivery error', {
        webhookId: config.id,
        event: payload.event,
        attempt,
        error,
      });

      const result: WebhookDeliveryResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        attempt,
        timestamp: new Date().toISOString(),
        responseTime,
      };

      // Retry if configured
      if (config.retry && attempt < config.retry.maxAttempts) {
        const delay = this.calculateBackoff(attempt, config.retry.backoffMultiplier);
        await this.scheduleRetry(config, payload, attempt + 1, delay);
      }

      return result;
    }
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    const payloadStr = JSON.stringify(payload);
    return createHMAC(payloadStr, secret);
  }

  /**
   * Verify webhook signature
   */
  public verifySignature(
    payload: WebhookPayload,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return signature === expectedSignature;
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(attempt: number, multiplier: number): number {
    return Math.min(1000 * Math.pow(multiplier, attempt - 1), 30000);
  }

  /**
   * Schedule retry delivery
   */
  private async scheduleRetry(
    config: WebhookConfig,
    payload: WebhookPayload,
    attempt: number,
    delay: number
  ): Promise<void> {
    logger.info('Scheduling webhook retry', {
      webhookId: config.id,
      attempt,
      delay,
    });

    setTimeout(() => {
      this.deliveryQueue.push({ config, payload });
      this.processQueue();
    }, delay);
  }

  /**
   * Test webhook delivery
   */
  public async test(id: string): Promise<WebhookDeliveryResult> {
    const webhook = this.webhooks.get(id);

    if (!webhook) {
      throw new Error(`Webhook ${id} not found`);
    }

    const testPayload: WebhookPayload = {
      event: WebhookEvent.CUSTOM,
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        message: 'This is a test webhook delivery',
      },
      webhookId: id,
      attempt: 1,
    };

    return await this.deliver(webhook, testPayload);
  }

  /**
   * Get delivery statistics
   */
  public async getStatistics(id: string): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    averageResponseTime: number;
  }> {
    // This would typically fetch from database
    // For now, return mock data
    return {
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      averageResponseTime: 0,
    };
  }
}

/**
 * Singleton instance
 */
let webhookManagerInstance: WebhookManager | null = null;

/**
 * Get webhook manager instance
 */
export function getWebhookManager(): WebhookManager {
  if (!webhookManagerInstance) {
    webhookManagerInstance = new WebhookManager();
  }
  return webhookManagerInstance;
}

