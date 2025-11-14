/**
 * Tests for string utilities
 */

import {
  capitalize,
  titleCase,
  camelCase,
  snakeCase,
  kebabCase,
  pascalCase,
  truncate,
  truncateMiddle,
  slugify,
  stripHtml,
  escapeHtml,
  unescapeHtml,
  padLeft,
  padRight,
  repeat,
  reverse,
  countOccurrences,
  contains,
  startsWithAny,
  endsWithAny,
  replaceAll,
  removeWhitespace,
  normalizeWhitespace,
  extractNumbers,
  extractEmails,
  extractUrls,
  mask,
  randomString,
  similarity,
} from '@/lib/utils/string';

describe('string utils', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('titleCase', () => {
    it('should capitalize all words', () => {
      expect(titleCase('hello world')).toBe('Hello World');
      expect(titleCase('the quick brown fox')).toBe('The Quick Brown Fox');
    });
  });

  describe('camelCase', () => {
    it('should convert to camelCase', () => {
      expect(camelCase('hello world')).toBe('helloWorld');
      expect(camelCase('foo-bar-baz')).toBe('fooBarBaz');
      expect(camelCase('foo_bar_baz')).toBe('fooBarBaz');
    });
  });

  describe('snakeCase', () => {
    it('should convert to snake_case', () => {
      expect(snakeCase('helloWorld')).toBe('hello_world');
      expect(snakeCase('fooBarBaz')).toBe('foo_bar_baz');
      expect(snakeCase('foo-bar-baz')).toBe('foo_bar_baz');
    });
  });

  describe('kebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(kebabCase('helloWorld')).toBe('hello-world');
      expect(kebabCase('fooBarBaz')).toBe('foo-bar-baz');
      expect(kebabCase('foo_bar_baz')).toBe('foo-bar-baz');
    });
  });

  describe('pascalCase', () => {
    it('should convert to PascalCase', () => {
      expect(pascalCase('hello world')).toBe('HelloWorld');
      expect(pascalCase('foo-bar-baz')).toBe('FooBarBaz');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
      expect(truncate('test', 10)).toBe('test');
    });

    it('should use custom suffix', () => {
      expect(truncate('hello world', 8, '…')).toBe('hello w…');
    });
  });

  describe('truncateMiddle', () => {
    it('should truncate in middle', () => {
      expect(truncateMiddle('hello world test', 10)).toBe('hel...test');
    });

    it('should not truncate short strings', () => {
      expect(truncateMiddle('test', 10)).toBe('test');
    });
  });

  describe('slugify', () => {
    it('should create URL-safe slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('  Foo Bar  ')).toBe('foo-bar');
      expect(slugify('Test & Example')).toBe('test-example');
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      expect(stripHtml('<p>Hello</p>')).toBe('Hello');
      expect(stripHtml('<div><span>Test</span></div>')).toBe('Test');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });
  });

  describe('unescapeHtml', () => {
    it('should unescape HTML entities', () => {
      expect(unescapeHtml('&lt;div&gt;')).toBe('<div>');
      expect(unescapeHtml('Tom &amp; Jerry')).toBe('Tom & Jerry');
    });
  });

  describe('padLeft', () => {
    it('should pad on left', () => {
      expect(padLeft('5', 3, '0')).toBe('005');
      expect(padLeft('test', 10)).toBe('      test');
    });
  });

  describe('padRight', () => {
    it('should pad on right', () => {
      expect(padRight('5', 3, '0')).toBe('500');
      expect(padRight('test', 10)).toBe('test      ');
    });
  });

  describe('repeat', () => {
    it('should repeat string', () => {
      expect(repeat('x', 3)).toBe('xxx');
      expect(repeat('ab', 2)).toBe('abab');
    });
  });

  describe('reverse', () => {
    it('should reverse string', () => {
      expect(reverse('hello')).toBe('olleh');
      expect(reverse('12345')).toBe('54321');
    });
  });

  describe('countOccurrences', () => {
    it('should count occurrences', () => {
      expect(countOccurrences('hello world', 'l')).toBe(3);
      expect(countOccurrences('test test test', 'test')).toBe(3);
    });

    it('should handle no matches', () => {
      expect(countOccurrences('hello', 'x')).toBe(0);
    });
  });

  describe('contains', () => {
    it('should check if contains substring', () => {
      expect(contains('hello world', 'world')).toBe(true);
      expect(contains('hello world', 'foo')).toBe(false);
    });

    it('should support case insensitive', () => {
      expect(contains('Hello World', 'WORLD', false)).toBe(true);
    });
  });

  describe('startsWithAny', () => {
    it('should check multiple prefixes', () => {
      expect(startsWithAny('hello world', ['hello', 'hi'])).toBe(true);
      expect(startsWithAny('test', ['foo', 'bar'])).toBe(false);
    });
  });

  describe('endsWithAny', () => {
    it('should check multiple suffixes', () => {
      expect(endsWithAny('hello world', ['world', 'earth'])).toBe(true);
      expect(endsWithAny('test', ['foo', 'bar'])).toBe(false);
    });
  });

  describe('replaceAll', () => {
    it('should replace all occurrences', () => {
      expect(replaceAll('foo bar foo', 'foo', 'baz')).toBe('baz bar baz');
    });
  });

  describe('removeWhitespace', () => {
    it('should remove all whitespace', () => {
      expect(removeWhitespace('hello world')).toBe('helloworld');
      expect(removeWhitespace('  test  ')).toBe('test');
    });
  });

  describe('normalizeWhitespace', () => {
    it('should normalize whitespace', () => {
      expect(normalizeWhitespace('hello   world')).toBe('hello world');
      expect(normalizeWhitespace('  test  ')).toBe('test');
    });
  });

  describe('extractNumbers', () => {
    it('should extract numbers', () => {
      expect(extractNumbers('There are 3 apples and 5 oranges')).toEqual([3, 5]);
      expect(extractNumbers('Price: $19.99')).toEqual([19.99]);
    });
  });

  describe('extractEmails', () => {
    it('should extract emails', () => {
      const text = 'Contact us at test@example.com or support@example.org';
      expect(extractEmails(text)).toEqual(['test@example.com', 'support@example.org']);
    });
  });

  describe('extractUrls', () => {
    it('should extract URLs', () => {
      const text = 'Visit https://example.com or http://test.org';
      expect(extractUrls(text)).toEqual(['https://example.com', 'http://test.org']);
    });
  });

  describe('mask', () => {
    it('should mask string', () => {
      expect(mask('1234567890', 2, 2)).toBe('12******90');
      expect(mask('secret', 0, 0)).toBe('******');
    });

    it('should not mask short strings', () => {
      expect(mask('test', 2, 2)).toBe('test');
    });
  });

  describe('randomString', () => {
    it('should generate random string', () => {
      const str1 = randomString(10);
      const str2 = randomString(10);
      
      expect(str1).toHaveLength(10);
      expect(str2).toHaveLength(10);
      expect(str1).not.toBe(str2);
    });
  });

  describe('similarity', () => {
    it('should calculate similarity', () => {
      expect(similarity('hello', 'hello')).toBe(1);
      expect(similarity('hello', 'hallo')).toBeGreaterThan(0.5);
      expect(similarity('abc', 'xyz')).toBe(0);
    });
  });
});

