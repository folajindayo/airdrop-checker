/**
 * Tests for String Utility Functions
 */

import {
  capitalize,
  capitalizeWords,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  truncate,
  truncateWords,
  slugify,
  removeAccents,
  escapeHtml,
  unescapeHtml,
  stripHtml,
  pad,
  padLeft,
  padRight,
  repeat,
  reverse,
  count,
  replaceAll,
  containsIgnoreCase,
  startsWithIgnoreCase,
  endsWithIgnoreCase,
  extractNumbers,
  extractEmails,
  extractUrls,
  mask,
  formatPhone,
  random,
  toBoolean,
  normalizeWhitespace,
  removeLineBreaks,
  wordWrap,
  naturalCompare,
  levenshteinDistance,
  similarity,
} from '@/lib/utils/string';

describe('String Utilities', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('capitalizeWords', () => {
    it('should capitalize each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
      expect(capitalizeWords('foo bar baz')).toBe('Foo Bar Baz');
    });
  });

  describe('toCamelCase', () => {
    it('should convert to camelCase', () => {
      expect(toCamelCase('hello world')).toBe('helloWorld');
      expect(toCamelCase('foo bar baz')).toBe('fooBarBaz');
    });
  });

  describe('toPascalCase', () => {
    it('should convert to PascalCase', () => {
      expect(toPascalCase('hello world')).toBe('HelloWorld');
      expect(toPascalCase('foo bar baz')).toBe('FooBarBaz');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert to snake_case', () => {
      expect(toSnakeCase('helloWorld')).toBe('hello_world');
      expect(toSnakeCase('FooBarBaz')).toBe('foo_bar_baz');
    });
  });

  describe('toKebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(toKebabCase('helloWorld')).toBe('hello-world');
      expect(toKebabCase('FooBarBaz')).toBe('foo-bar-baz');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
      expect(truncate('test', 10)).toBe('test');
    });

    it('should use custom suffix', () => {
      expect(truncate('hello world', 8, '---')).toBe('hello---');
    });
  });

  describe('truncateWords', () => {
    it('should truncate to word boundary', () => {
      expect(truncateWords('hello world foo bar', 2)).toBe('hello world...');
      expect(truncateWords('one two', 5)).toBe('one two');
    });
  });

  describe('slugify', () => {
    it('should create URL-friendly slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Foo  Bar__Baz')).toBe('foo-bar-baz');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
    });
  });

  describe('removeAccents', () => {
    it('should remove accents', () => {
      expect(removeAccents('café')).toBe('cafe');
      expect(removeAccents('naïve')).toBe('naive');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML characters', () => {
      expect(escapeHtml('<div>test</div>')).toBe('&lt;div&gt;test&lt;/div&gt;');
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });
  });

  describe('unescapeHtml', () => {
    it('should unescape HTML entities', () => {
      expect(unescapeHtml('&lt;div&gt;')).toBe('<div>');
      expect(unescapeHtml('a &amp; b')).toBe('a & b');
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      expect(stripHtml('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
      expect(stripHtml('<div><span>test</span></div>')).toBe('test');
    });
  });

  describe('pad', () => {
    it('should pad string', () => {
      expect(pad('test', 10)).toHaveLength(10);
    });
  });

  describe('padLeft', () => {
    it('should pad from left', () => {
      expect(padLeft('5', 3, '0')).toBe('005');
    });
  });

  describe('padRight', () => {
    it('should pad from right', () => {
      expect(padRight('5', 3, '0')).toBe('500');
    });
  });

  describe('repeat', () => {
    it('should repeat string', () => {
      expect(repeat('a', 3)).toBe('aaa');
      expect(repeat('ab', 2)).toBe('abab');
    });
  });

  describe('reverse', () => {
    it('should reverse string', () => {
      expect(reverse('hello')).toBe('olleh');
      expect(reverse('12345')).toBe('54321');
    });
  });

  describe('count', () => {
    it('should count occurrences', () => {
      expect(count('hello world', 'l')).toBe(3);
      expect(count('foo bar foo', 'foo')).toBe(2);
    });
  });

  describe('replaceAll', () => {
    it('should replace all occurrences', () => {
      expect(replaceAll('hello world', 'l', 'L')).toBe('heLLo worLd');
      expect(replaceAll('foo bar foo', 'foo', 'baz')).toBe('baz bar baz');
    });
  });

  describe('containsIgnoreCase', () => {
    it('should check case-insensitive contains', () => {
      expect(containsIgnoreCase('Hello World', 'WORLD')).toBe(true);
      expect(containsIgnoreCase('test', 'TEST')).toBe(true);
      expect(containsIgnoreCase('foo', 'bar')).toBe(false);
    });
  });

  describe('startsWithIgnoreCase', () => {
    it('should check case-insensitive starts with', () => {
      expect(startsWithIgnoreCase('Hello World', 'HELLO')).toBe(true);
      expect(startsWithIgnoreCase('test', 'TE')).toBe(true);
      expect(startsWithIgnoreCase('foo', 'bar')).toBe(false);
    });
  });

  describe('endsWithIgnoreCase', () => {
    it('should check case-insensitive ends with', () => {
      expect(endsWithIgnoreCase('Hello World', 'WORLD')).toBe(true);
      expect(endsWithIgnoreCase('test', 'ST')).toBe(true);
      expect(endsWithIgnoreCase('foo', 'bar')).toBe(false);
    });
  });

  describe('extractNumbers', () => {
    it('should extract all numbers', () => {
      expect(extractNumbers('I have 2 apples and 3 oranges')).toEqual([2, 3]);
      expect(extractNumbers('abc123def456')).toEqual([123, 456]);
    });
  });

  describe('extractEmails', () => {
    it('should extract email addresses', () => {
      expect(extractEmails('Contact test@example.com or admin@test.org')).toEqual([
        'test@example.com',
        'admin@test.org',
      ]);
    });
  });

  describe('extractUrls', () => {
    it('should extract URLs', () => {
      expect(extractUrls('Visit https://example.com or http://test.org')).toEqual([
        'https://example.com',
        'http://test.org',
      ]);
    });
  });

  describe('mask', () => {
    it('should mask middle of string', () => {
      expect(mask('1234567890', 2, 2)).toBe('12******90');
      expect(mask('secret', 2, 2)).toBe('se**et');
    });

    it('should not mask short strings', () => {
      expect(mask('abc', 2, 2)).toBe('abc');
    });
  });

  describe('formatPhone', () => {
    it('should format phone number', () => {
      expect(formatPhone('1234567890')).toBe('(123) 456-7890');
    });
  });

  describe('random', () => {
    it('should generate random string of specified length', () => {
      const result = random(10);
      expect(result).toHaveLength(10);
    });

    it('should use specified charset', () => {
      const numeric = random(5, 'numeric');
      expect(/^\d+$/.test(numeric)).toBe(true);
    });
  });

  describe('toBoolean', () => {
    it('should convert true values', () => {
      expect(toBoolean('true')).toBe(true);
      expect(toBoolean('1')).toBe(true);
      expect(toBoolean('yes')).toBe(true);
    });

    it('should convert false values', () => {
      expect(toBoolean('false')).toBe(false);
      expect(toBoolean('0')).toBe(false);
      expect(toBoolean('no')).toBe(false);
    });
  });

  describe('normalizeWhitespace', () => {
    it('should normalize whitespace', () => {
      expect(normalizeWhitespace('hello    world')).toBe('hello world');
      expect(normalizeWhitespace('  test  ')).toBe('test');
    });
  });

  describe('removeLineBreaks', () => {
    it('should remove line breaks', () => {
      expect(removeLineBreaks('hello\nworld')).toBe('hello world');
      expect(removeLineBreaks('foo\r\nbar')).toBe('foo bar');
    });
  });

  describe('wordWrap', () => {
    it('should wrap text at max length', () => {
      const result = wordWrap('hello world foo bar', 10);
      expect(result).toEqual(['hello', 'world foo', 'bar']);
    });
  });

  describe('naturalCompare', () => {
    it('should compare naturally', () => {
      expect(naturalCompare('file1', 'file2')).toBeLessThan(0);
      expect(naturalCompare('file10', 'file2')).toBeGreaterThan(0);
    });
  });

  describe('levenshteinDistance', () => {
    it('should calculate edit distance', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
    });
  });

  describe('similarity', () => {
    it('should calculate similarity score', () => {
      expect(similarity('hello', 'hello')).toBe(1);
      expect(similarity('abc', 'xyz')).toBe(0);
      expect(similarity('kitten', 'sitting')).toBeGreaterThan(0);
    });
  });
});


