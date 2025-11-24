/**
 * JSON serialization utilities
 */

export class JSONSerializer {
  static serialize(data: any): string {
    return JSON.stringify(data, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  }
  
  static deserialize<T>(json: string): T | null {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
  
  static safeSerialize(data: any, fallback: any = null): string | null {
    try {
      return this.serialize(data);
    } catch {
      return fallback;
    }
  }
}

