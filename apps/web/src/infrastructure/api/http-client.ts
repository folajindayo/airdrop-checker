/**
 * Generic HTTP Client
 * Infrastructure layer HTTP client with retry and caching
 */

export interface HttpClientConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  timeout?: number;
  cache?: boolean;
}

export class HttpClient {
  private readonly config: HttpClientConfig;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      timeout: 30000,
      retries: 3,
      ...config,
    };
    this.cache = new Map();
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T>(url: string, body: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  async put<T>(url: string, body: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  private async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const fullUrl = this.buildUrl(url, options.params);
    const cacheKey = `${options.method}:${fullUrl}`;

    // Check cache for GET requests
    if (options.method === 'GET' && options.cache !== false) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached as T;
    }

    let lastError: Error | null = null;
    const maxRetries = options.method === 'GET' ? this.config.retries : 1;

    for (let attempt = 0; attempt <= maxRetries!; attempt++) {
      try {
        const response = await this.makeRequest(fullUrl, options);
        const data = await response.json();

        // Cache successful GET requests
        if (options.method === 'GET' && options.cache !== false) {
          this.setInCache(cacheKey, data);
        }

        return data as T;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries!) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  private async makeRequest(url: string, options: RequestOptions): Promise<Response> {
    const controller = new AbortController();
    const timeout = options.timeout || this.config.timeout!;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private buildUrl(url: string, params?: Record<string, string>): string {
    const base = this.config.baseUrl
      ? `${this.config.baseUrl}${url}`
      : url;

    if (!params || Object.keys(params).length === 0) {
      return base;
    }

    const query = new URLSearchParams(params).toString();
    return `${base}?${query}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setInCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearCache(): void {
    this.cache.clear();
  }
}

