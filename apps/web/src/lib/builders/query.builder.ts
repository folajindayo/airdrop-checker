/**
 * Query builder for complex queries
 */

export class QueryBuilder {
  private filters: Array<(item: any) => boolean> = [];
  private sorters: Array<{ field: string; order: 'asc' | 'desc' }> = [];
  private limitValue?: number;
  private offsetValue: number = 0;
  
  where(predicate: (item: any) => boolean): this {
    this.filters.push(predicate);
    return this;
  }
  
  orderBy(field: string, order: 'asc' | 'desc' = 'asc'): this {
    this.sorters.push({ field, order });
    return this;
  }
  
  limit(value: number): this {
    this.limitValue = value;
    return this;
  }
  
  offset(value: number): this {
    this.offsetValue = value;
    return this;
  }
  
  execute<T>(data: T[]): T[] {
    let result = [...data];
    
    // Apply filters
    this.filters.forEach(filter => {
      result = result.filter(filter);
    });
    
    // Apply sorting
    if (this.sorters.length > 0) {
      result.sort((a, b) => {
        for (const { field, order } of this.sorters) {
          const aVal = (a as any)[field];
          const bVal = (b as any)[field];
          
          if (aVal !== bVal) {
            const comparison = aVal > bVal ? 1 : -1;
            return order === 'asc' ? comparison : -comparison;
          }
        }
        return 0;
      });
    }
    
    // Apply pagination
    if (this.offsetValue > 0) {
      result = result.slice(this.offsetValue);
    }
    
    if (this.limitValue) {
      result = result.slice(0, this.limitValue);
    }
    
    return result;
  }
}

