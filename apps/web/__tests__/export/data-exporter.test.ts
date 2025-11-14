/**
 * @fileoverview Tests for data export utilities
 */

import { describe, it, expect, jest } from '@jest/globals';
import {
  DataExporter,
  ExportFormat,
  exportToCSV,
  exportToJSON,
} from '@/lib/export/data-exporter';

describe('DataExporter', () => {
  const sampleData = [
    { id: 1, name: 'Alice', age: 30, email: 'alice@example.com' },
    { id: 2, name: 'Bob', age: 25, email: 'bob@example.com' },
    { id: 3, name: 'Charlie', age: 35, email: 'charlie@example.com' },
  ];

  describe('CSV Export', () => {
    it('should export data to CSV', async () => {
      const result = await DataExporter.export(sampleData, {
        format: ExportFormat.CSV,
      });

      expect(result.mimeType).toBe('text/csv');
      expect(result.data).toContain('id,name,age,email');
      expect(result.data).toContain('Alice');
    });

    it('should include headers by default', async () => {
      const result = await DataExporter.export(sampleData, {
        format: ExportFormat.CSV,
      });

      const lines = result.data.split('\n');
      expect(lines[0]).toBe('id,name,age,email');
    });

    it('should exclude headers when specified', async () => {
      const result = await DataExporter.export(sampleData, {
        format: ExportFormat.CSV,
        includeHeaders: false,
      });

      const lines = result.data.split('\n');
      expect(lines[0]).not.toContain('id,name');
      expect(lines[0]).toContain('1');
    });

    it('should use custom delimiter', async () => {
      const result = await DataExporter.export(sampleData, {
        format: ExportFormat.CSV,
        delimiter: ';',
      });

      expect(result.data).toContain('id;name;age;email');
    });

    it('should escape CSV values with special characters', async () => {
      const dataWithCommas = [
        { id: 1, name: 'Smith, John', notes: 'Has "quotes"' },
      ];

      const result = await DataExporter.export(dataWithCommas, {
        format: ExportFormat.CSV,
      });

      expect(result.data).toContain('"Smith, John"');
      expect(result.data).toContain('"Has ""quotes"""');
    });

    it('should filter fields', async () => {
      const result = await DataExporter.export(sampleData, {
        format: ExportFormat.CSV,
        fields: ['id', 'name'],
      });

      expect(result.data).toContain('id,name');
      expect(result.data).not.toContain('age');
      expect(result.data).not.toContain('email');
    });

    it('should use custom field labels', async () => {
      const result = await DataExporter.export(sampleData, {
        format: ExportFormat.CSV,
        fieldLabels: {
          id: 'User ID',
          name: 'Full Name',
        },
      });

      expect(result.data).toContain('User ID,Full Name');
    });

    it('should handle empty dataset', async () => {
      const result = await DataExporter.export([], {
        format: ExportFormat.CSV,
      });

      expect(result.data).toBe('');
      expect(result.size).toBe(0);
    });
  });

  describe('JSON Export', () => {
    it('should export data to JSON', async () => {
      const result = await DataExporter.export(sampleData, {
        format: ExportFormat.JSON,
      });

      expect(result.mimeType).toBe('application/json');
      expect(result.data).toContain('"name":"Alice"');
    });

    it('should pretty print by default', async () => {
      const result = await DataExporter.export(sampleData, {
        format: ExportFormat.JSON,
      });

      expect(result.data).toContain('  '); // Indentation
      expect(result.data).toContain('\n'); // Line breaks
    });

    it('should support compact JSON', async () => {
      const result = await DataExporter.export(sampleData, {
        format: ExportFormat.JSON,
        prettyPrint: false,
      });

      const parsed = JSON.parse(result.data);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(3);
    });

    it('should filter fields in JSON export', async () => {
      const result = await DataExporter.export(sampleData, {
        format: ExportFormat.JSON,
        fields: ['id', 'name'],
      });

      const parsed = JSON.parse(result.data);
      expect(parsed[0]).toHaveProperty('id');
      expect(parsed[0]).toHaveProperty('name');
      expect(parsed[0]).not.toHaveProperty('age');
      expect(parsed[0]).not.toHaveProperty('email');
    });
  });

  describe('File Naming', () => {
    it('should use custom filename', async () => {
      const result = await DataExporter.export(sampleData, {
        format: ExportFormat.CSV,
        filename: 'custom-export',
      });

      expect(result.filename).toBe('custom-export.csv');
    });

    it('should generate filename with timestamp', async () => {
      const result = await DataExporter.export(sampleData, {
        format: ExportFormat.CSV,
      });

      expect(result.filename).toMatch(/export-\d+\.csv/);
    });

    it('should use correct extension for each format', async () => {
      const csvResult = await DataExporter.export(sampleData, {
        format: ExportFormat.CSV,
      });
      expect(csvResult.filename).toMatch(/\.csv$/);

      const jsonResult = await DataExporter.export(sampleData, {
        format: ExportFormat.JSON,
      });
      expect(jsonResult.filename).toMatch(/\.json$/);
    });
  });

  describe('Value Formatting', () => {
    it('should format dates', async () => {
      const dataWithDates = [
        { id: 1, name: 'Test', createdAt: new Date('2024-01-01') },
      ];

      const result = await DataExporter.export(dataWithDates, {
        format: ExportFormat.CSV,
      });

      expect(result.data).toContain('2024');
    });

    it('should handle null values', async () => {
      const dataWithNulls = [
        { id: 1, name: 'Test', value: null },
      ];

      const result = await DataExporter.export(dataWithNulls, {
        format: ExportFormat.CSV,
      });

      const lines = result.data.split('\n');
      expect(lines[1]).toContain('1,Test,');
    });

    it('should handle undefined values', async () => {
      const dataWithUndefined = [
        { id: 1, name: 'Test', value: undefined },
      ];

      const result = await DataExporter.export(dataWithUndefined, {
        format: ExportFormat.CSV,
      });

      const lines = result.data.split('\n');
      expect(lines[1]).toContain('1,Test,');
    });

    it('should stringify objects', async () => {
      const dataWithObjects = [
        { id: 1, name: 'Test', metadata: { key: 'value' } },
      ];

      const result = await DataExporter.export(dataWithObjects, {
        format: ExportFormat.CSV,
      });

      expect(result.data).toContain('{"key":"value"}');
    });
  });

  describe('Single Object Export', () => {
    it('should export single object', async () => {
      const singleObject = { id: 1, name: 'Alice', age: 30 };

      const result = await DataExporter.export(singleObject, {
        format: ExportFormat.JSON,
      });

      const parsed = JSON.parse(result.data);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toEqual(singleObject);
    });
  });

  describe('Helper Functions', () => {
    it('should export to CSV using helper', async () => {
      const result = await exportToCSV(sampleData);

      expect(result.mimeType).toBe('text/csv');
      expect(result.data).toContain('Alice');
    });

    it('should export to JSON using helper', async () => {
      const result = await exportToJSON(sampleData);

      expect(result.mimeType).toBe('application/json');
      const parsed = JSON.parse(result.data);
      expect(parsed).toHaveLength(3);
    });
  });

  describe('Streaming Export', () => {
    it('should support streaming export', async () => {
      async function* dataGenerator() {
        for (const item of sampleData) {
          yield item;
        }
      }

      const chunks: string[] = [];
      for await (const chunk of DataExporter.streamExport(dataGenerator(), {
        format: ExportFormat.CSV,
      })) {
        chunks.push(chunk);
      }

      const fullData = chunks.join('');
      expect(fullData).toContain('Alice');
      expect(fullData).toContain('Bob');
    });
  });

  describe('Compressed Export', () => {
    it('should compress export data', async () => {
      const result = await DataExporter.exportCompressed(sampleData, {
        format: ExportFormat.JSON,
      });

      expect(result.compressed).toBeDefined();
      expect(result.compressed.length).toBeLessThan(result.size);
    });
  });

  describe('Paginated Export', () => {
    it('should export in pages', async () => {
      const largeData = Array.from({ length: 250 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
      }));

      const results = await DataExporter.exportPaginated(
        largeData,
        { format: ExportFormat.CSV },
        100
      );

      expect(results).toHaveLength(3);
      expect(results[0].filename).toContain('page-1');
      expect(results[1].filename).toContain('page-2');
      expect(results[2].filename).toContain('page-3');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid format', async () => {
      await expect(
        DataExporter.export(sampleData, {
          format: 'invalid' as ExportFormat,
        })
      ).rejects.toThrow();
    });
  });

  describe('File Size Calculation', () => {
    it('should calculate file size correctly', async () => {
      const result = await DataExporter.export(sampleData, {
        format: ExportFormat.JSON,
      });

      expect(result.size).toBeGreaterThan(0);
      expect(result.size).toBe(Buffer.byteLength(result.data, 'utf-8'));
    });
  });
});

