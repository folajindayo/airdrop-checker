/**
 * API Client
 * 
 * Centralized API client for making requests to the backend.
 * Provides a consistent interface with error handling, retries, and caching.
 */

import { retry } from '@/lib/utils/async';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiClientOptions {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  retries?: number;
  timeout?: number;
}

/**
 * API Client Class
 * 
 * Provides methods for making HTTP requests with built-in error handling,
 * retries, and response transformation.
 */
export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private defaultHeaders: Record<string, string>;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL || '';
    this.timeout = options.timeout || 30000;
    this.retries = options.retries || 3;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL || window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Make HTTP request with retries and timeout
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      params,
      retries = this.retries,
      timeout = this.timeout,
      headers,
      ...fetchOptions
    } = options;

    const url = this.buildURL(endpoint, params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const makeRequest = async (): Promise<Response> => {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        signal: controller.signal,
      });

      return response;
    };

    try {
      const response = await retry(makeRequest, retries, 1000);

      clearTimeout(timeoutId);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return { data: await response.text() as any };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP error! status: ${response.status}`,
          message: data.message,
        };
      }

      return { data };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { error: 'Request timeout' };
        }
        return { error: error.message };
      }

      return { error: 'An unknown error occurred' };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Default API client instance
export const apiClient = new ApiClient();

/**
 * Convenience functions using the default client
 */
export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiClient.get<T>(endpoint, options),
  
  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient.post<T>(endpoint, body, options),
  
  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient.put<T>(endpoint, body, options),
  
  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient.patch<T>(endpoint, body, options),
  
  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiClient.delete<T>(endpoint, options),
};

/**
 * API endpoints
 */
export const endpoints = {
  // Airdrop
  airdropCheck: (address: string) => `/api/airdrop-check/${address}`,
  airdrops: '/api/airdrops',
  
  // Portfolio
  portfolio: (address: string) => `/api/portfolio/${address}`,
  
  // Trending
  trending: '/api/trending',
  
  // Gas tracker
  gasTracker: (address: string) => `/api/gas-tracker/${address}`,
  
  // Health
  health: '/api/health',
  
  // Rate limit
  rateLimit: '/api/rate-limit',
} as const;

