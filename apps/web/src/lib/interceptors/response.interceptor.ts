/**
 * Response interceptors
 */

export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

export class ResponseInterceptorChain {
  private interceptors: ResponseInterceptor[] = [];
  
  use(interceptor: ResponseInterceptor): void {
    this.interceptors.push(interceptor);
  }
  
  async execute(response: Response): Promise<Response> {
    let result = response;
    
    for (const interceptor of this.interceptors) {
      result = await interceptor(result);
    }
    
    return result;
  }
}

export const defaultResponseInterceptors: ResponseInterceptor[] = [
  // Log response time
  async (response) => {
    const requestTime = response.headers.get('X-Request-Time');
    if (requestTime) {
      const duration = Date.now() - parseInt(requestTime, 10);
      console.log(`Request took ${duration}ms`);
    }
    return response;
  },
];

