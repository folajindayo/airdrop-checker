/**
 * HTTP client utility
 * Provides a consistent interface for API calls with retry, timeout, and error handling
 */

import { retry, type RetryOptions } from '@airdrop-finder/shared';
import type { ApiResponse, ApiError } from '@airdrop-finder/shared';

/**
 * HTTP client options
 */
export interface HttpClientOptions {
  /** Base URL for API calls */
  baseUrl?: string;
  /** Default headers */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Retry configuration */
  retry?: RetryOptions;
  /** Interceptor for requests */
  onRequest?: (config: RequestInit) => RequestInit | Promise<RequestInit>;
  /** Interceptor for responses */
  onResponse?: (response: Response) => Response | Promise<Response>;
  /** Error handler */
  onError?: (error: Error) => void;
}

/**
 * HTTP client class
 */
export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private retryOptions?: RetryOptions;
  private onRequest?: HttpClientOptions['onRequest'];
  private onResponse?: HttpClientOptions['onResponse'];
  private onError?: HttpClientOptions['onError'];
  
  constructor(options: HttpClientOptions = {}) {
    this.baseUrl = options.baseUrl || '';
    this.defaultHeaders = options.headers || {
      'Content-Type': 'application/json',
    };
    this.timeout = options.timeout || 30000;
    this.retryOptions = options.retry;
    this.onRequest = options.onRequest;
    this.onResponse = options.onResponse;
    this.onError = options.onError;
  }
  
  /**
   * Make a GET request
   */
  async get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }
  
  /**
   * Make a POST request
   */
  async post<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  /**
   * Make a PUT request
   */
  async put<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  /**
   * Make a PATCH request
   */
  async patch<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  /**
   * Make a DELETE request
   */
  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
  
  /**
   * Make a request with all features
   */
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const fullUrl = this.buildUrl(url);
    
    // Prepare request config
    let config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(options.headers || {}),
      },
    };
    
    // Apply request interceptor
    if (this.onRequest) {
      config = await this.onRequest(config);
    }
    
    // Create request operation with timeout
    const operation = () =>
      this.requestWithTimeout(fullUrl, config, this.timeout);
    
    // Execute with retry if configured
    try {
      const response = this.retryOptions
        ? await retry(operation, this.retryOptions)
        : await operation();
      
      // Apply response interceptor
      const finalResponse = this.onResponse
        ? await this.onResponse(response)
        : response;
      
      // Parse and return response
      return await this.parseResponse<T>(finalResponse);
    } catch (error) {
      // Handle error
      if (this.onError && error instanceof Error) {
        this.onError(error);
      }
      throw error;
    }
  }
  
  /**
   * Make request with timeout
   */
  private async requestWithTimeout(
    url: string,
    config: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      throw error;
    }
  }
  
  /**
   * Parse response
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    // Check if response is ok
    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
    
    // Get content type
    const contentType = response.headers.get('content-type');
    
    // Parse based on content type
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      
      // Check if it's an ApiResponse
      if (this.isApiResponse(data)) {
        if (!data.success && data.error) {
          throw this.createErrorFromApiError(data.error);
        }
        return data.data as T;
      }
      
      return data as T;
    }
    
    // Return text for other content types
    return (await response.text()) as any;
  }
  
  /**
   * Handle error response
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      try {
        const errorData = await response.json();
        
        if (this.isApiResponse(errorData) && errorData.error) {
          throw this.createErrorFromApiError(errorData.error);
        }
        
        throw new Error(errorData.message || response.statusText);
      } catch (error) {
        if (error instanceof Error && error.message) {
          throw error;
        }
      }
    }
    
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  /**
   * Check if response is ApiResponse
   */
  private isApiResponse(data: any): data is ApiResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      'success' in data
    );
  }
  
  /**
   * Create error from ApiError
   */
  private createErrorFromApiError(apiError: ApiError): Error {
    const error = new Error(apiError.message);
    (error as any).code = apiError.code;
    (error as any).statusCode = apiError.statusCode;
    return error;
  }
  
  /**
   * Build full URL
   */
  private buildUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.baseUrl}${url}`;
  }
}

/**
 * Create a default HTTP client instance
 */
export function createHttpClient(options?: HttpClientOptions): HttpClient {
  return new HttpClient(options);
}

/**
 * Default HTTP client instance
 */
export const httpClient = createHttpClient({
  baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
  timeout: 30000,
  retry: {
    maxAttempts: 3,
    initialDelay: 1000,
    exponentialBackoff: true,
  },
});

