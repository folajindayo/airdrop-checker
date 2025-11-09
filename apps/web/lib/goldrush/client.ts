import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@airdrop-finder/shared';

if (!process.env.GOLDRUSH_API_KEY) {
  throw new Error('Please define the GOLDRUSH_API_KEY environment variable');
}

/**
 * GoldRush API client configuration
 */
class GoldRushClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOLDRUSH_API_KEY!;
    
    this.client = axios.create({
      baseURL: API_CONFIG.GOLDRUSH_BASE_URL,
      timeout: API_CONFIG.REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.client.interceptors.request.use((config) => {
      config.headers['Authorization'] = `Bearer ${this.apiKey}`;
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error('GoldRush API Error:', {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url,
          });
        } else if (error.request) {
          console.error('GoldRush Network Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request to GoldRush API
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get(endpoint, { params });
    return response.data;
  }

  /**
   * Make a POST request to GoldRush API
   */
  async post<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(endpoint, data, config);
    return response.data;
  }
}

// Singleton instance
export const goldrushClient = new GoldRushClient();

export default goldrushClient;

