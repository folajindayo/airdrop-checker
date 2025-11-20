/**
 * Event Emitter Service
 * Type-safe event emitter for application events
 */

type EventCallback<T = any> = (data: T) => void;

export class EventEmitterService {
  private events: Map<string, EventCallback[]> = new Map();

  /**
   * Subscribe to an event
   */
  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    const callbacks = this.events.get(event) || [];
    callbacks.push(callback);
    this.events.set(event, callbacks);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event (once)
   */
  once<T = any>(event: string, callback: EventCallback<T>): void {
    const onceCallback: EventCallback<T> = (data) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  /**
   * Unsubscribe from an event
   */
  off<T = any>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    const filtered = callbacks.filter((cb) => cb !== callback);
    
    if (filtered.length === 0) {
      this.events.delete(event);
    } else {
      this.events.set(event, filtered);
    }
  }

  /**
   * Emit an event
   */
  emit<T = any>(event: string, data?: T): void {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event callback for "${event}":`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.length || 0;
  }

  /**
   * Get all event names
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}

// Singleton instance
export const eventEmitter = new EventEmitterService();

