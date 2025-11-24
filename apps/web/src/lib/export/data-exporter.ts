/**
 * @fileoverview Data export utilities for CSV, JSON, and other formats
 * @module lib/export/data-exporter
 */

import { logger } from '@/lib/monitoring/logger';

/**
 * Export format types
 */
export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  XLSX = 'xlsx',
  PDF = 'pdf',
}

/**
 * Export options
 */
export interface ExportOptions {
  /**
   * Export format
   */
  format: ExportFormat;

  /**
   * File name (without extension)
   */
  filename?: string;

  /**
   * Include headers in CSV export
   */
  includeHeaders?: boolean;

  /**
   * CSV delimiter
   */
  delimiter?: string;

  /**
   * Date format
   */
  dateFormat?: string;

  /**
   * Number format locale
   */
  numberLocale?: string;

  /**
   * Pretty print JSON
   */
  prettyPrint?: boolean;

  /**
   * Fields to include (if not all)
   */
  fields?: string[];

  /**
   * Custom field labels
   */
  fieldLabels?: Record<string, string>;
}

/**
 * Export result
 */
export interface ExportResult {
  /**
   * Export data (string or Buffer)
   */
  data: string | Buffer;

  /**
   * MIME type
   */
  mimeType: string;

  /**
   * Filename with extension
   */
  filename: string;

  /**
   * File size in bytes
   */
  size: number;
}

/**
 * Data exporter class
 */
export class DataExporter {
  /**
   * Export data to specified format
   */
  public static async export(
    data: Record<string, unknown>[] | Record<string, unknown>,
    options: ExportOptions
  ): Promise<ExportResult> {
    const dataArray = Array.isArray(data) ? data : [data];

    switch (options.format) {
      case ExportFormat.CSV:
        return this.exportCSV(dataArray, options);
      case ExportFormat.JSON:
        return this.exportJSON(dataArray, options);
      case ExportFormat.XLSX:
        return this.exportXLSX(dataArray, options);
      case ExportFormat.PDF:
        return this.exportPDF(dataArray, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export to CSV format
   */
  private static exportCSV(
    data: Record<string, unknown>[],
    options: ExportOptions
  ): ExportResult {
    const {
      includeHeaders = true,
      delimiter = ',',
      fields,
      fieldLabels = {},
    } = options;

    if (data.length === 0) {
      return {
        data: '',
        mimeType: 'text/csv',
        filename: this.getFilename(options, 'csv'),
        size: 0,
      };
    }

    // Determine fields to export
    const exportFields = fields || Object.keys(data[0]);

    // Build CSV content
    const lines: string[] = [];

    // Add headers
    if (includeHeaders) {
      const headers = exportFields.map(
        (field) => fieldLabels[field] || field
      );
      lines.push(this.escapeCSVRow(headers, delimiter));
    }

    // Add data rows
    for (const row of data) {
      const values = exportFields.map((field) => {
        const value = row[field];
        return this.formatValue(value, options);
      });
      lines.push(this.escapeCSVRow(values, delimiter));
    }

    const csv = lines.join('\n');

    logger.info('Data exported to CSV', {
      rows: data.length,
      fields: exportFields.length,
      size: csv.length,
    });

    return {
      data: csv,
      mimeType: 'text/csv',
      filename: this.getFilename(options, 'csv'),
      size: Buffer.byteLength(csv, 'utf-8'),
    };
  }

  /**
   * Export to JSON format
   */
  private static exportJSON(
    data: Record<string, unknown>[],
    options: ExportOptions
  ): ExportResult {
    const { prettyPrint = true, fields } = options;

    // Filter fields if specified
    let exportData = data;
    if (fields) {
      exportData = data.map((row) => {
        const filtered: Record<string, unknown> = {};
        for (const field of fields) {
          if (field in row) {
            filtered[field] = row[field];
          }
        }
        return filtered;
      });
    }

    const json = JSON.stringify(
      exportData,
      null,
      prettyPrint ? 2 : undefined
    );

    logger.info('Data exported to JSON', {
      rows: data.length,
      size: json.length,
    });

    return {
      data: json,
      mimeType: 'application/json',
      filename: this.getFilename(options, 'json'),
      size: Buffer.byteLength(json, 'utf-8'),
    };
  }

  /**
   * Export to XLSX format (Excel)
   * Note: This is a placeholder. In production, use a library like 'xlsx'
   */
  private static exportXLSX(
    data: Record<string, unknown>[],
    options: ExportOptions
  ): ExportResult {
    // For now, fallback to CSV
    // In production, implement proper XLSX generation using libraries
    logger.warn('XLSX export not fully implemented, falling back to CSV');

    const csv = this.exportCSV(data, options);

    return {
      ...csv,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: this.getFilename(options, 'xlsx'),
    };
  }

  /**
   * Export to PDF format
   * Note: This is a placeholder. In production, use a library like 'pdfkit' or 'jsPDF'
   */
  private static exportPDF(
    data: Record<string, unknown>[],
    options: ExportOptions
  ): ExportResult {
    // For now, return JSON as fallback
    // In production, implement proper PDF generation
    logger.warn('PDF export not fully implemented, falling back to JSON');

    const json = this.exportJSON(data, options);

    return {
      ...json,
      mimeType: 'application/pdf',
      filename: this.getFilename(options, 'pdf'),
    };
  }

  /**
   * Escape CSV row
   */
  private static escapeCSVRow(values: string[], delimiter: string): string {
    return values
      .map((value) => {
        const str = String(value);

        // Escape if contains delimiter, quotes, or newlines
        if (
          str.includes(delimiter) ||
          str.includes('"') ||
          str.includes('\n') ||
          str.includes('\r')
        ) {
          return `"${str.replace(/"/g, '""')}"`;
        }

        return str;
      })
      .join(delimiter);
  }

  /**
   * Format value for export
   */
  private static formatValue(
    value: unknown,
    options: ExportOptions
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return this.formatDate(value, options.dateFormat);
    }

    if (typeof value === 'number') {
      return this.formatNumber(value, options.numberLocale);
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Format date
   */
  private static formatDate(date: Date, format?: string): string {
    if (format) {
      // Basic format support
      return format
        .replace('YYYY', String(date.getFullYear()))
        .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
        .replace('DD', String(date.getDate()).padStart(2, '0'))
        .replace('HH', String(date.getHours()).padStart(2, '0'))
        .replace('mm', String(date.getMinutes()).padStart(2, '0'))
        .replace('ss', String(date.getSeconds()).padStart(2, '0'));
    }

    return date.toISOString();
  }

  /**
   * Format number
   */
  private static formatNumber(num: number, locale?: string): string {
    if (locale) {
      return num.toLocaleString(locale);
    }

    return String(num);
  }

  /**
   * Get filename with extension
   */
  private static getFilename(options: ExportOptions, extension: string): string {
    const base = options.filename || `export-${Date.now()}`;
    return `${base}.${extension}`;
  }

  /**
   * Stream large dataset export
   */
  public static async *streamExport(
    dataGenerator: AsyncGenerator<Record<string, unknown>>,
    options: ExportOptions
  ): AsyncGenerator<string> {
    const {
      includeHeaders = true,
      delimiter = ',',
      fields,
      fieldLabels = {},
    } = options;

    let isFirstChunk = true;
    let exportFields: string[] = [];

    for await (const row of dataGenerator) {
      if (isFirstChunk) {
        exportFields = fields || Object.keys(row);

        // Yield headers
        if (includeHeaders) {
          const headers = exportFields.map(
            (field) => fieldLabels[field] || field
          );
          yield this.escapeCSVRow(headers, delimiter) + '\n';
        }

        isFirstChunk = false;
      }

      // Yield data row
      const values = exportFields.map((field) => {
        const value = row[field];
        return this.formatValue(value, options);
      });

      yield this.escapeCSVRow(values, delimiter) + '\n';
    }
  }

  /**
   * Export with compression
   */
  public static async exportCompressed(
    data: Record<string, unknown>[] | Record<string, unknown>,
    options: ExportOptions
  ): Promise<ExportResult & { compressed: Buffer }> {
    const { gzipSync } = await import('zlib');
    const result = await this.export(data, options);

    const compressed = gzipSync(Buffer.from(result.data));

    logger.info('Data compressed for export', {
      originalSize: result.size,
      compressedSize: compressed.length,
      compressionRatio: `${((1 - compressed.length / result.size) * 100).toFixed(2)}%`,
    });

    return {
      ...result,
      compressed,
    };
  }

  /**
   * Export with pagination
   */
  public static async exportPaginated(
    data: Record<string, unknown>[],
    options: ExportOptions,
    pageSize = 1000
  ): Promise<ExportResult[]> {
    const results: ExportResult[] = [];
    const totalPages = Math.ceil(data.length / pageSize);

    for (let page = 0; page < totalPages; page++) {
      const start = page * pageSize;
      const end = Math.min(start + pageSize, data.length);
      const pageData = data.slice(start, end);

      const result = await this.export(pageData, {
        ...options,
        filename: `${options.filename || 'export'}-page-${page + 1}`,
      });

      results.push(result);
    }

    logger.info('Paginated export completed', {
      totalPages,
      totalRecords: data.length,
    });

    return results;
  }
}

/**
 * Quick export functions
 */

export async function exportToCSV(
  data: Record<string, unknown>[] | Record<string, unknown>,
  filename?: string
): Promise<ExportResult> {
  return DataExporter.export(data, {
    format: ExportFormat.CSV,
    filename,
  });
}

export async function exportToJSON(
  data: Record<string, unknown>[] | Record<string, unknown>,
  filename?: string
): Promise<ExportResult> {
  return DataExporter.export(data, {
    format: ExportFormat.JSON,
    filename,
  });
}

export async function exportToXLSX(
  data: Record<string, unknown>[] | Record<string, unknown>,
  filename?: string
): Promise<ExportResult> {
  return DataExporter.export(data, {
    format: ExportFormat.XLSX,
    filename,
  });
}

