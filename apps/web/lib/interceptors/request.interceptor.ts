/**
 * Request interceptors
 */

export type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;

export class RequestInterceptorChain {
  private interceptors: RequestInterceptor[] = [];
  
  use(interceptor: RequestInterceptor): void {
    this.interceptors.push(interceptor);
  }
  
  async execute(config: RequestInit): Promise<RequestInit> {
    let result = config;
    
    for (const interceptor of this.interceptors) {
      result = await interceptor(result);
    }
    
    return result;
  }
}

export const defaultRequestInterceptors: RequestInterceptor[] = [
  // Add timestamp header
  (config) => ({
    ...config,
    headers: {
      ...config.headers,
      'X-Request-Time': Date.now().toString(),
    },
  }),
  
  // Add request ID
  (config) => ({
    ...config,
    headers: {
      ...config.headers,
      'X-Request-Id': crypto.randomUUID(),
    },
  }),
];

