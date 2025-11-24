/**
 * Data sorting utilities
 */

export function sortByField<T>(
  items: T[],
  field: keyof T,
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal > bVal ? 1 : -1;
    return order === 'asc' ? comparison : -comparison;
  });
}

export function sortByMultipleFields<T>(
  items: T[],
  fields: Array<{ field: keyof T; order: 'asc' | 'desc' }>
): T[] {
  return [...items].sort((a, b) => {
    for (const { field, order } of fields) {
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal !== bVal) {
        const comparison = aVal > bVal ? 1 : -1;
        return order === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
}

