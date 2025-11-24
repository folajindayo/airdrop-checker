/**
 * Query builder utilities for database and API queries
 */

/**
 * Build WHERE clause conditions
 */
export function buildWhereClause(
  filters: Record<string, any>
): string {
  const conditions: string[] = [];
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    
    if (Array.isArray(value)) {
      conditions.push(`${key} IN (${value.map(v => `'${v}'`).join(', ')})`);
    } else if (typeof value === 'string') {
      conditions.push(`${key} = '${value}'`);
    } else {
      conditions.push(`${key} = ${value}`);
    }
  });
  
  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
}

/**
 * Build ORDER BY clause
 */
export function buildOrderByClause(
  field: string,
  order: 'asc' | 'desc' = 'desc'
): string {
  return `ORDER BY ${field} ${order.toUpperCase()}`;
}

/**
 * Build LIMIT and OFFSET clause
 */
export function buildLimitClause(
  limit: number,
  offset?: number
): string {
  const parts = [`LIMIT ${limit}`];
  if (offset !== undefined && offset > 0) {
    parts.push(`OFFSET ${offset}`);
  }
  return parts.join(' ');
}

/**
 * Escape SQL string
 */
export function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Build search query for full-text search
 */
export function buildSearchQuery(
  fields: string[],
  searchTerm: string
): string {
  const escaped = escapeSqlString(searchTerm);
  const conditions = fields.map(field => 
    `${field} ILIKE '%${escaped}%'`
  );
  return `(${conditions.join(' OR ')})`;
}

