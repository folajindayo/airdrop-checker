/**
 * Cache decorators for methods
 */

import { cache } from '@airdrop-finder/shared';

export function Cacheable(ttl: number, keyFn?: (...args: any[]) => string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyFn ? keyFn(...args) : `${propertyKey}:${JSON.stringify(args)}`;
      const cached = cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, result, ttl);
      
      return result;
    };
    
    return descriptor;
  };
}

export function ClearCache(keyPattern: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      // Clear cache entries matching pattern
      // Implementation depends on cache backend
      return result;
    };
    
    return descriptor;
  };
}

