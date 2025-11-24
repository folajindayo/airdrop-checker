/**
 * @fileoverview WebSocket manager for real-time communication
 * @module lib/websocket/websocket-manager
 */

import { logger } from '@/lib/monitoring/logger';

/**
 * WebSocket message types
 */
export enum WSMessageType {
  PING = 'ping',
  PONG = 'pong',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  MESSAGE = 'message',
  ERROR = 'error',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

/**
 * WebSocket message structure
 */
export interface WSMessage<T = any> {
  /**
   * Message type
   */
  type: WSMessageType;

  /**
   * Message payload
   */
  payload?: T;

  /**
   * Timestamp
   */
  timestamp: number;

  /**
   * Message ID
   */
  id?: string;

  /**
   * Channel or topic
   */
  channel?: string;
}

/**
 * WebSocket subscription
 */
export interface WSSubscription {
  /**
   * Channel name
   */
  channel: string;

  /**
   * Event handler
   */
  handler: (data: any) => void;

  /**
   * Subscription ID
   */
  id: string;
}

/**
 * WebSocket connection options
 */
export interface WSConnectionOptions {
  /**
   * WebSocket URL
   */
  url?: string;

  /**
   * Reconnect automatically
   */
  autoReconnect?: boolean;

  /**
   * Reconnect interval in ms
   */
  reconnectInterval?: number;

  /**
   * Max reconnect attempts
   */
  maxReconnectAttempts?: number;

  /**
   * Heartbeat interval in ms
   */
  heartbeatInterval?: number;

  /**
   * Connection timeout in ms
   */
  connectionTimeout?: number;

  /**
   * Authentication token
   */
  token?: string;

  /**
   * Custom headers
   */
  headers?: Record<string, string>;
}

/**
 * WebSocket connection state
 */
export enum WSConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * WebSocket manager class
 */
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private options: Required<WSConnectionOptions>;
  private state: WSConnectionState = WSConnectionState.DISCONNECTED;
  private subscriptions: Map<string, WSSubscription[]> = new Map();
  private messageQueue: WSMessage[] = [];
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private connectionTimeoutTimer: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map();

  constructor(options: WSConnectionOptions = {}) {
    this.options = {
      url: options.url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
      autoReconnect: options.autoReconnect ?? true,
      reconnectInterval: options.reconnectInterval || 5000,
      maxReconnectAttempts: options.maxReconnectAttempts || 10,
      heartbeatInterval: options.heartbeatInterval || 30000,
      connectionTimeout: options.connectionTimeout || 10000,
      token: options.token || '',
      headers: options.headers || {},
    };
  }

  /**
   * Connect to WebSocket server
   */
  public async connect(): Promise<void> {
    if (
      this.state === WSConnectionState.CONNECTED ||
      this.state === WSConnectionState.CONNECTING
    ) {
      logger.warn('WebSocket already connected or connecting');
      return;
    }

    this.setState(WSConnectionState.CONNECTING);

    try {
      const url = this.buildURL();
      this.ws = new WebSocket(url);

      this.setupEventHandlers();
      this.startConnectionTimeout();

      await this.waitForConnection();

      this.setState(WSConnectionState.CONNECTED);
      this.reconnectAttempts = 0;

      // Process queued messages
      this.processMessageQueue();

      // Start heartbeat
      this.startHeartbeat();

      logger.info('WebSocket connected', { url });
    } catch (error) {
      logger.error('WebSocket connection failed', { error });
      this.setState(WSConnectionState.ERROR);

      if (this.options.autoReconnect) {
        this.scheduleReconnect();
      }

      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (!this.ws) {
      return;
    }

    this.setState(WSConnectionState.DISCONNECTING);

    this.stopHeartbeat();
    this.clearConnectionTimeout();

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Client disconnect');
    }

    this.ws = null;
    this.setState(WSConnectionState.DISCONNECTED);

    logger.info('WebSocket disconnected');
  }

  /**
   * Send message through WebSocket
   */
  public send<T = any>(
    type: WSMessageType,
    payload?: T,
    channel?: string
  ): void {
    const message: WSMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
      id: this.generateMessageId(),
      channel,
    };

    if (
      this.state !== WSConnectionState.CONNECTED ||
      !this.ws ||
      this.ws.readyState !== WebSocket.OPEN
    ) {
      // Queue message if not connected
      this.messageQueue.push(message);
      logger.debug('Message queued', { type, channel });
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
      logger.debug('Message sent', { type, channel });
    } catch (error) {
      logger.error('Failed to send message', { error, type, channel });
      this.messageQueue.push(message);
    }
  }

  /**
   * Subscribe to a channel
   */
  public subscribe(channel: string, handler: (data: any) => void): string {
    const subscription: WSSubscription = {
      channel,
      handler,
      id: this.generateMessageId(),
    };

    const channelSubscriptions = this.subscriptions.get(channel) || [];
    channelSubscriptions.push(subscription);
    this.subscriptions.set(channel, channelSubscriptions);

    // Send subscribe message to server
    this.send(WSMessageType.SUBSCRIBE, { channel });

    logger.debug('Subscribed to channel', { channel, subscriptionId: subscription.id });

    return subscription.id;
  }

  /**
   * Unsubscribe from a channel
   */
  public unsubscribe(subscriptionId: string): void {
    for (const [channel, subs] of this.subscriptions.entries()) {
      const index = subs.findIndex((sub) => sub.id === subscriptionId);

      if (index !== -1) {
        subs.splice(index, 1);

        if (subs.length === 0) {
          this.subscriptions.delete(channel);
          // Send unsubscribe message to server
          this.send(WSMessageType.UNSUBSCRIBE, { channel });
        }

        logger.debug('Unsubscribed from channel', { channel, subscriptionId });
        return;
      }
    }
  }

  /**
   * Add event listener
   */
  public on(event: string, handler: (data: any) => void): void {
    const handlers = this.eventListeners.get(event) || [];
    handlers.push(handler);
    this.eventListeners.set(event, handlers);
  }

  /**
   * Remove event listener
   */
  public off(event: string, handler?: (data: any) => void): void {
    if (!handler) {
      this.eventListeners.delete(event);
      return;
    }

    const handlers = this.eventListeners.get(event) || [];
    const index = handlers.indexOf(handler);

    if (index !== -1) {
      handlers.splice(index, 1);
      if (handlers.length === 0) {
        this.eventListeners.delete(event);
      } else {
        this.eventListeners.set(event, handlers);
      }
    }
  }

  /**
   * Get current connection state
   */
  public getState(): WSConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.state === WSConnectionState.CONNECTED;
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.clearConnectionTimeout();
      this.emit('open', null);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        logger.error('Failed to parse WebSocket message', { error });
      }
    };

    this.ws.onerror = (error) => {
      logger.error('WebSocket error', { error });
      this.emit('error', error);
    };

    this.ws.onclose = (event) => {
      this.stopHeartbeat();
      this.clearConnectionTimeout();

      logger.info('WebSocket closed', {
        code: event.code,
        reason: event.reason,
      });

      this.emit('close', { code: event.code, reason: event.reason });

      if (
        this.options.autoReconnect &&
        event.code !== 1000 &&
        this.state !== WSConnectionState.DISCONNECTING
      ) {
        this.scheduleReconnect();
      } else {
        this.setState(WSConnectionState.DISCONNECTED);
      }
    };
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: WSMessage): void {
    switch (message.type) {
      case WSMessageType.PONG:
        // Heartbeat response
        break;

      case WSMessageType.MESSAGE:
        if (message.channel) {
          const subscriptions = this.subscriptions.get(message.channel) || [];
          subscriptions.forEach((sub) => {
            try {
              sub.handler(message.payload);
            } catch (error) {
              logger.error('Subscription handler error', { error, channel: message.channel });
            }
          });
        }
        this.emit('message', message);
        break;

      case WSMessageType.ERROR:
        logger.error('Server error', { payload: message.payload });
        this.emit('error', message.payload);
        break;

      default:
        this.emit(message.type, message.payload);
        break;
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventListeners.get(event) || [];
    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        logger.error('Event handler error', { error, event });
      }
    });
  }

  /**
   * Set connection state
   */
  private setState(state: WSConnectionState): void {
    const oldState = this.state;
    this.state = state;

    if (oldState !== state) {
      this.emit('stateChange', { oldState, newState: state });
      logger.debug('WebSocket state changed', { from: oldState, to: state });
    }
  }

  /**
   * Wait for connection to establish
   */
  private waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('WebSocket not initialized'));
        return;
      }

      const checkConnection = () => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          resolve();
        }
      };

      this.ws.addEventListener('open', checkConnection, { once: true });
      this.ws.addEventListener('error', (error) => reject(error), { once: true });
    });
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.state === WSConnectionState.CONNECTED) {
        this.send(WSMessageType.PING);
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Start connection timeout
   */
  private startConnectionTimeout(): void {
    this.clearConnectionTimeout();

    this.connectionTimeoutTimer = setTimeout(() => {
      if (this.state === WSConnectionState.CONNECTING) {
        logger.error('WebSocket connection timeout');
        this.disconnect();
        if (this.options.autoReconnect) {
          this.scheduleReconnect();
        }
      }
    }, this.options.connectionTimeout);
  }

  /**
   * Clear connection timeout
   */
  private clearConnectionTimeout(): void {
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
  }

  /**
   * Schedule reconnect attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      logger.error('Max reconnect attempts reached');
      this.setState(WSConnectionState.ERROR);
      return;
    }

    this.reconnectAttempts++;
    this.setState(WSConnectionState.RECONNECTING);

    const delay =
      this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    logger.info('Scheduling WebSocket reconnect', {
      attempt: this.reconnectAttempts,
      delay,
    });

    setTimeout(() => {
      this.connect().catch((error) => {
        logger.error('Reconnect failed', { error });
      });
    }, delay);
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message.type, message.payload, message.channel);
      }
    }
  }

  /**
   * Build WebSocket URL
   */
  private buildURL(): string {
    let url = this.options.url;

    if (this.options.token) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}token=${encodeURIComponent(this.options.token)}`;
    }

    return url;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Singleton instance
 */
let wsManagerInstance: WebSocketManager | null = null;

/**
 * Get WebSocket manager instance
 */
export function getWSManager(options?: WSConnectionOptions): WebSocketManager {
  if (!wsManagerInstance) {
    wsManagerInstance = new WebSocketManager(options);
  }
  return wsManagerInstance;
}

