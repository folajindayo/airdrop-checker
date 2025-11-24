/**
 * Service Registry
 * 
 * Dependency injection and service management
 */

type ServiceFactory<T> = () => T;
type ServiceInstance<T> = T;

class ServiceRegistry {
  private services = new Map<string, ServiceInstance<any>>();
  private factories = new Map<string, ServiceFactory<any>>();

  /**
   * Register a service factory
   */
  register<T>(name: string, factory: ServiceFactory<T>): void {
    this.factories.set(name, factory);
  }

  /**
   * Get service instance (singleton pattern)
   */
  get<T>(name: string): T {
    if (this.services.has(name)) {
      return this.services.get(name) as T;
    }

    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Service "${name}" not registered`);
    }

    const instance = factory();
    this.services.set(name, instance);
    return instance;
  }

  /**
   * Check if service is registered
   */
  has(name: string): boolean {
    return this.factories.has(name) || this.services.has(name);
  }

  /**
   * Clear service instance (for testing)
   */
  clear(name: string): void {
    this.services.delete(name);
  }

  /**
   * Clear all services (for testing)
   */
  clearAll(): void {
    this.services.clear();
  }
}

export const serviceRegistry = new ServiceRegistry();

/**
 * Service decorator for dependency injection
 */
export function Injectable(name: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    serviceRegistry.register(name, () => new constructor());
    return constructor;
  };
}

/**
 * Get service from registry
 */
export function getService<T>(name: string): T {
  return serviceRegistry.get<T>(name);
}

