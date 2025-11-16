/**
 * Centralized API client for v1 endpoints
 * Provides type-safe access to all API routes
 */

export interface APIClientConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

export class APIClient {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;
  private requestInterceptors: Array<(config: RequestInit) => RequestInit> = [];
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];

  constructor(config: APIClientConfig = {}) {
    this.baseUrl = config.baseUrl || '/api/v1';
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: (config: RequestInit) => RequestInit): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(
    interceptor: (response: Response) => Response | Promise<Response>
  ): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Make API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    let config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        ...options.headers,
      },
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    // Make request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      let response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      if (!response.ok) {
        const error = await response.json();
        throw new APIError(error.error?.message || 'Request failed', response.status);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new APIError('Request timeout', 408);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Airdrops API
   */
  airdrops = {
    list: (params?: { status?: string; chain?: string; limit?: number; offset?: number }) =>
      this.request('/airdrops' + (params ? '?' + new URLSearchParams(params as any) : '')),
    
    check: (address: string, projects?: string[]) =>
      this.request('/airdrops/check', {
        method: 'POST',
        body: JSON.stringify({ address, projects }),
      }),
    
    getDetails: (projectId: string) =>
      this.request(`/airdrops/${projectId}`),
  };

  /**
   * Portfolio API
   */
  portfolio = {
    get: (address: string, options?: { includeHistory?: boolean; timeRange?: string }) =>
      this.request(`/portfolio/${address}` + (options ? '?' + new URLSearchParams(options as any) : '')),
    
    compare: (addresses: string[]) =>
      this.request('/portfolio/compare', {
        method: 'POST',
        body: JSON.stringify({ addresses }),
      }),
  };

  /**
   * Transactions API
   */
  transactions = {
    list: (params: { address: string; chain?: string; limit?: number; offset?: number; type?: string }) =>
      this.request('/transactions?' + new URLSearchParams(params as any)),
    
    analyze: (address: string, timeRange?: string) =>
      this.request('/transactions/analyze', {
        method: 'POST',
        body: JSON.stringify({ address, timeRange }),
      }),
  };

  /**
   * On-chain API
   */
  onchain = {
    getFeatures: (chain?: string) =>
      this.request('/onchain' + (chain ? `?chain=${chain}` : '')),
  };

  /**
   * Health check
   */
  health = {
    check: () => this.request('/health'),
  };
}

/**
 * API Error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Default API client instance
 */
export const apiClient = new APIClient();

/**
 * Request interceptors
 */
export function addAuthInterceptor(apiClient: APIClient, getToken: () => string | null): void {
  apiClient.addRequestInterceptor((config) => {
    const token = getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  });
}

export function addLoggingInterceptor(apiClient: APIClient): void {
  apiClient.addRequestInterceptor((config) => {
    console.log('[API Request]', config);
    return config;
  });

  apiClient.addResponseInterceptor((response) => {
    console.log('[API Response]', response.status, response.statusText);
    return response;
  });
}

export function addRetryInterceptor(apiClient: APIClient, maxRetries: number = 3): void {
  apiClient.addResponseInterceptor(async (response) => {
    if (response.status >= 500 && response.status < 600) {
      // Could implement retry logic here
    }
    return response;
  });
}

