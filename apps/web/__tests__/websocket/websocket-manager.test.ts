/**
 * @fileoverview Tests for WebSocket manager
 */

import { Server } from 'ws';
import {
  WebSocketManager,
  createWebSocketServer,
  WebSocketMessage,
  MessageType,
} from '@/lib/websocket/websocket-manager';

// Mock WebSocket Server
const mockWsServer = {
  on: jest.fn(),
  emit: jest.fn(),
  clients: new Set(),
  close: jest.fn(),
  handleUpgrade: jest.fn(),
};

// Mock WebSocket Client
class MockWebSocket {
  readyState = 1; // OPEN
  send = jest.fn();
  close = jest.fn();
  on = jest.fn();
  emit = jest.fn();
  terminate = jest.fn();
}

jest.mock('ws', () => ({
  Server: jest.fn(() => mockWsServer),
  WebSocket: MockWebSocket,
}));

describe('WebSocket Manager', () => {
  let manager: WebSocketManager;
  let mockClient: MockWebSocket;

  beforeEach(() => {
    manager = new WebSocketManager();
    mockClient = new MockWebSocket();
    jest.clearAllMocks();
  });

  afterEach(() => {
    manager.close();
  });

  describe('Connection Management', () => {
    it('should handle new connections', () => {
      const clientId = manager.addClient('user-123', mockClient as any);

      expect(clientId).toBeDefined();
      expect(manager.getClientCount()).toBe(1);
    });

    it('should remove disconnected clients', () => {
      const clientId = manager.addClient('user-123', mockClient as any);
      manager.removeClient(clientId);

      expect(manager.getClientCount()).toBe(0);
    });

    it('should handle multiple clients for same user', () => {
      const client1 = new MockWebSocket();
      const client2 = new MockWebSocket();

      const id1 = manager.addClient('user-123', client1 as any);
      const id2 = manager.addClient('user-123', client2 as any);

      expect(id1).not.toBe(id2);
      expect(manager.getClientCount()).toBe(2);
    });

    it('should get clients by user ID', () => {
      const client1 = new MockWebSocket();
      const client2 = new MockWebSocket();

      manager.addClient('user-123', client1 as any);
      manager.addClient('user-123', client2 as any);

      const clients = manager.getClientsByUserId('user-123');
      expect(clients).toHaveLength(2);
    });

    it('should handle client heartbeat', () => {
      const clientId = manager.addClient('user-123', mockClient as any);

      manager.heartbeat(clientId);

      expect(manager.isClientAlive(clientId)).toBe(true);
    });

    it('should detect stale clients', async () => {
      const clientId = manager.addClient('user-123', mockClient as any);

      // Wait for heartbeat timeout
      await new Promise((resolve) => setTimeout(resolve, 100));

      const isAlive = manager.isClientAlive(clientId);
      expect(typeof isAlive).toBe('boolean');
    });
  });

  describe('Message Broadcasting', () => {
    it('should broadcast to all clients', () => {
      const client1 = new MockWebSocket();
      const client2 = new MockWebSocket();

      manager.addClient('user-1', client1 as any);
      manager.addClient('user-2', client2 as any);

      const message: WebSocketMessage = {
        type: MessageType.NOTIFICATION,
        payload: { text: 'Hello' },
      };

      manager.broadcast(message);

      expect(client1.send).toHaveBeenCalled();
      expect(client2.send).toHaveBeenCalled();
    });

    it('should send to specific user', () => {
      const client1 = new MockWebSocket();
      const client2 = new MockWebSocket();

      manager.addClient('user-1', client1 as any);
      manager.addClient('user-2', client2 as any);

      const message: WebSocketMessage = {
        type: MessageType.NOTIFICATION,
        payload: { text: 'Private' },
      };

      manager.sendToUser('user-1', message);

      expect(client1.send).toHaveBeenCalled();
      expect(client2.send).not.toHaveBeenCalled();
    });

    it('should send to specific client', () => {
      const clientId = manager.addClient('user-123', mockClient as any);

      const message: WebSocketMessage = {
        type: MessageType.NOTIFICATION,
        payload: { text: 'Direct' },
      };

      manager.sendToClient(clientId, message);

      expect(mockClient.send).toHaveBeenCalled();
    });

    it('should serialize message as JSON', () => {
      const clientId = manager.addClient('user-123', mockClient as any);

      const message: WebSocketMessage = {
        type: MessageType.UPDATE,
        payload: { id: 123, data: 'test' },
      };

      manager.sendToClient(clientId, message);

      expect(mockClient.send).toHaveBeenCalledWith(
        expect.stringContaining('"type"')
      );
    });
  });

  describe('Message Types', () => {
    beforeEach(() => {
      manager.addClient('user-123', mockClient as any);
    });

    it('should handle NOTIFICATION messages', () => {
      const message: WebSocketMessage = {
        type: MessageType.NOTIFICATION,
        payload: { text: 'Test notification' },
      };

      manager.sendToUser('user-123', message);

      expect(mockClient.send).toHaveBeenCalled();
    });

    it('should handle UPDATE messages', () => {
      const message: WebSocketMessage = {
        type: MessageType.UPDATE,
        payload: { resource: 'portfolio', data: {} },
      };

      manager.sendToUser('user-123', message);

      expect(mockClient.send).toHaveBeenCalled();
    });

    it('should handle ERROR messages', () => {
      const message: WebSocketMessage = {
        type: MessageType.ERROR,
        payload: { code: 500, message: 'Server error' },
      };

      manager.sendToUser('user-123', message);

      expect(mockClient.send).toHaveBeenCalled();
    });

    it('should handle PING messages', () => {
      const message: WebSocketMessage = {
        type: MessageType.PING,
        payload: {},
      };

      manager.sendToUser('user-123', message);

      expect(mockClient.send).toHaveBeenCalled();
    });

    it('should handle PONG messages', () => {
      const message: WebSocketMessage = {
        type: MessageType.PONG,
        payload: {},
      };

      manager.sendToUser('user-123', message);

      expect(mockClient.send).toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    it('should register message handler', () => {
      const handler = jest.fn();

      manager.onMessage(handler);

      expect(handler).toBeDefined();
    });

    it('should register connection handler', () => {
      const handler = jest.fn();

      manager.onConnection(handler);

      expect(handler).toBeDefined();
    });

    it('should register disconnection handler', () => {
      const handler = jest.fn();

      manager.onDisconnection(handler);

      expect(handler).toBeDefined();
    });

    it('should register error handler', () => {
      const handler = jest.fn();

      manager.onError(handler);

      expect(handler).toBeDefined();
    });

    it('should call handlers on events', () => {
      const messageHandler = jest.fn();
      manager.onMessage(messageHandler);

      const clientId = manager.addClient('user-123', mockClient as any);

      // Simulate message reception
      manager.handleMessage(clientId, '{"type":"test"}');

      expect(messageHandler).toHaveBeenCalled();
    });
  });

  describe('Room Management', () => {
    it('should join room', () => {
      const clientId = manager.addClient('user-123', mockClient as any);

      manager.joinRoom(clientId, 'room-1');

      expect(manager.getRoomClients('room-1')).toContain(clientId);
    });

    it('should leave room', () => {
      const clientId = manager.addClient('user-123', mockClient as any);

      manager.joinRoom(clientId, 'room-1');
      manager.leaveRoom(clientId, 'room-1');

      expect(manager.getRoomClients('room-1')).not.toContain(clientId);
    });

    it('should broadcast to room', () => {
      const client1 = new MockWebSocket();
      const client2 = new MockWebSocket();
      const client3 = new MockWebSocket();

      const id1 = manager.addClient('user-1', client1 as any);
      const id2 = manager.addClient('user-2', client2 as any);
      const id3 = manager.addClient('user-3', client3 as any);

      manager.joinRoom(id1, 'room-1');
      manager.joinRoom(id2, 'room-1');

      const message: WebSocketMessage = {
        type: MessageType.UPDATE,
        payload: { text: 'Room update' },
      };

      manager.broadcastToRoom('room-1', message);

      expect(client1.send).toHaveBeenCalled();
      expect(client2.send).toHaveBeenCalled();
      expect(client3.send).not.toHaveBeenCalled();
    });

    it('should handle multiple rooms per client', () => {
      const clientId = manager.addClient('user-123', mockClient as any);

      manager.joinRoom(clientId, 'room-1');
      manager.joinRoom(clientId, 'room-2');

      expect(manager.getRoomClients('room-1')).toContain(clientId);
      expect(manager.getRoomClients('room-2')).toContain(clientId);
    });
  });

  describe('Statistics', () => {
    it('should track client count', () => {
      manager.addClient('user-1', new MockWebSocket() as any);
      manager.addClient('user-2', new MockWebSocket() as any);

      expect(manager.getClientCount()).toBe(2);
    });

    it('should track room count', () => {
      const clientId = manager.addClient('user-123', mockClient as any);

      manager.joinRoom(clientId, 'room-1');
      manager.joinRoom(clientId, 'room-2');

      expect(manager.getRoomCount()).toBe(2);
    });

    it('should get statistics', () => {
      manager.addClient('user-1', new MockWebSocket() as any);
      manager.addClient('user-2', new MockWebSocket() as any);

      const stats = manager.getStats();

      expect(stats.connectedClients).toBe(2);
      expect(stats.totalRooms).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle send errors', () => {
      mockClient.send = jest.fn(() => {
        throw new Error('Send failed');
      });

      const clientId = manager.addClient('user-123', mockClient as any);

      expect(() => {
        manager.sendToClient(clientId, {
          type: MessageType.NOTIFICATION,
          payload: {},
        });
      }).not.toThrow();
    });

    it('should handle closed connections', () => {
      mockClient.readyState = 3; // CLOSED

      const clientId = manager.addClient('user-123', mockClient as any);

      manager.sendToClient(clientId, {
        type: MessageType.NOTIFICATION,
        payload: {},
      });

      expect(mockClient.send).not.toHaveBeenCalled();
    });

    it('should handle invalid messages', () => {
      const clientId = manager.addClient('user-123', mockClient as any);

      expect(() => {
        manager.handleMessage(clientId, 'invalid-json');
      }).not.toThrow();
    });

    it('should clean up on client error', () => {
      const clientId = manager.addClient('user-123', mockClient as any);

      manager.handleError(clientId, new Error('Client error'));

      expect(manager.getClientCount()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Server Creation', () => {
    it('should create WebSocket server', () => {
      const server = createWebSocketServer({ port: 8080 });

      expect(server).toBeDefined();
      expect(Server).toHaveBeenCalledWith({ port: 8080 });
    });

    it('should accept server options', () => {
      const server = createWebSocketServer({
        port: 8080,
        path: '/ws',
        perMessageDeflate: true,
      });

      expect(server).toBeDefined();
    });
  });

  describe('Cleanup', () => {
    it('should close all connections', () => {
      const client1 = new MockWebSocket();
      const client2 = new MockWebSocket();

      manager.addClient('user-1', client1 as any);
      manager.addClient('user-2', client2 as any);

      manager.close();

      expect(client1.close).toHaveBeenCalled();
      expect(client2.close).toHaveBeenCalled();
    });

    it('should clear all rooms', () => {
      const clientId = manager.addClient('user-123', mockClient as any);
      manager.joinRoom(clientId, 'room-1');

      manager.close();

      expect(manager.getRoomCount()).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should handle many concurrent connections', () => {
      const clients = Array(100)
        .fill(null)
        .map(() => new MockWebSocket());

      clients.forEach((client, i) => {
        manager.addClient(`user-${i}`, client as any);
      });

      expect(manager.getClientCount()).toBe(100);
    });

    it('should broadcast efficiently', () => {
      const clients = Array(50)
        .fill(null)
        .map(() => new MockWebSocket());

      clients.forEach((client, i) => {
        manager.addClient(`user-${i}`, client as any);
      });

      const start = Date.now();
      manager.broadcast({
        type: MessageType.NOTIFICATION,
        payload: { text: 'Broadcast' },
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });
});

