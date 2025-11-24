/**
 * Data aggregation utilities
 */

export function aggregateByKey<T>(
  items: T[],
  keyFn: (item: T) => string,
  aggregateFn: (items: T[]) => any
): Record<string, any> {
  const groups = items.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
  
  return Object.fromEntries(
    Object.entries(groups).map(([key, items]) => [key, aggregateFn(items)])
  );
}

export function sumBy<T>(items: T[], field: keyof T): number {
  return items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
}

export function avgBy<T>(items: T[], field: keyof T): number {
  if (items.length === 0) return 0;
  return sumBy(items, field) / items.length;
}

export function maxBy<T>(items: T[], field: keyof T): T | undefined {
  if (items.length === 0) return undefined;
  return items.reduce((max, item) =>
    (item[field] > max[field] ? item : max)
  );
}

export function minBy<T>(items: T[], field: keyof T): T | undefined {
  if (items.length === 0) return undefined;
  return items.reduce((min, item) =>
    (item[field] < min[field] ? item : min)
  );
}

