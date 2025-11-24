/**
 * Local/Session storage utilities with type safety
 */

/**
 * Storage wrapper with type safety
 */
export class Storage<T = any> {
  constructor(
    private readonly storage: globalThis.Storage,
    private readonly prefix: string = ''
  ) {}
  
  /**
   * Get item from storage
   */
  get(key: string): T | null {
    try {
      const item = this.storage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
  
  /**
   * Set item in storage
   */
  set(key: string, value: T): void {
    try {
      this.storage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  }
  
  /**
   * Remove item from storage
   */
  remove(key: string): void {
    this.storage.removeItem(this.getKey(key));
  }
  
  /**
   * Clear all items with prefix
   */
  clear(): void {
    if (!this.prefix) {
      this.storage.clear();
      return;
    }
    
    const keys = this.keys();
    keys.forEach(key => this.remove(key));
  }
  
  /**
   * Get all keys with prefix
   */
  keys(): string[] {
    const keys: string[] = [];
    const fullPrefix = this.getKey('');
    
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(fullPrefix)) {
        keys.push(key.slice(fullPrefix.length));
      }
    }
    
    return keys;
  }
  
  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.storage.getItem(this.getKey(key)) !== null;
  }
  
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

/**
 * Create localStorage wrapper
 */
export function createLocalStorage<T = any>(prefix: string = ''): Storage<T> {
  if (typeof window === 'undefined') {
    // Return mock storage for SSR
    return new Storage<T>({
      length: 0,
      clear: () => {},
      getItem: () => null,
      key: () => null,
      removeItem: () => {},
      setItem: () => {},
    }, prefix);
  }
  return new Storage<T>(window.localStorage, prefix);
}

/**
 * Create sessionStorage wrapper
 */
export function createSessionStorage<T = any>(prefix: string = ''): Storage<T> {
  if (typeof window === 'undefined') {
    return new Storage<T>({
      length: 0,
      clear: () => {},
      getItem: () => null,
      key: () => null,
      removeItem: () => {},
      setItem: () => {},
    }, prefix);
  }
  return new Storage<T>(window.sessionStorage, prefix);
}

