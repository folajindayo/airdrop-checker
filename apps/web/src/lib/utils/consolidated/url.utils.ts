/**
 * URL Utilities
 */

export function buildQueryString(params: Record<string, any>): string {
  return new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v != null)
  ).toString();
}

export function parseQueryString(query: string): Record<string, string> {
  const params = new URLSearchParams(query);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export function addQueryParams(url: string, params: Record<string, any>): string {
  const query = buildQueryString(params);
  return query ? `${url}?${query}` : url;
}

