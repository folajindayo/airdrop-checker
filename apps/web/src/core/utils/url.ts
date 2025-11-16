/**
 * URL utility functions
 * @module core/utils/url
 */

/**
 * Build URL with query parameters
 */
export function buildUrl(base: string, params: Record<string, any>): string {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

/**
 * Parse query string to object
 */
export function parseQueryString(query: string): Record<string, string> {
  const params = new URLSearchParams(query);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Get domain from URL
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * Get path from URL
 */
export function getPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return '';
  }
}

/**
 * Join URL paths
 */
export function joinPaths(...paths: string[]): string {
  return paths
    .map((path, index) => {
      if (index === 0) {
        return path.replace(/\/$/, '');
      }
      return path.replace(/^\/|\/$/g, '');
    })
    .filter(Boolean)
    .join('/');
}

/**
 * Add query parameters to existing URL
 */
export function addQueryParams(url: string, params: Record<string, any>): string {
  try {
    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.set(key, String(value));
      }
    });
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Remove query parameters from URL
 */
export function removeQueryParams(url: string, keys: string[]): string {
  try {
    const urlObj = new URL(url);
    keys.forEach((key) => urlObj.searchParams.delete(key));
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Get query parameter value
 */
export function getQueryParam(url: string, key: string): string | null {
  try {
    return new URL(url).searchParams.get(key);
  } catch {
    return null;
  }
}

/**
 * Check if URL is absolute
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * Normalize URL (remove trailing slash, lowercase domain)
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.hostname = urlObj.hostname.toLowerCase();
    let normalized = urlObj.toString();
    if (normalized.endsWith('/') && urlObj.pathname === '/') {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return url;
  }
}

