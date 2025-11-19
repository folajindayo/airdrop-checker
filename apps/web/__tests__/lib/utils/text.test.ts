import {
  capitalize,
  capitalizeWords,
  slugify,
  truncate,
  truncateMiddle,
  stripHtml,
  escapeHtml,
  unescapeHtml,
  camelCase,
  snakeCase,
  kebabCase,
  pascalCase,
  pluralize,
  wordCount,
  isPalindrome,
  levenshteinDistance,
} from "@/lib/utils/text";

describe("Text Utilities", () => {
  describe("capitalize", () => {
    it("capitalizes first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("WORLD")).toBe("World");
    });
  });

  describe("capitalizeWords", () => {
    it("capitalizes all words", () => {
      expect(capitalizeWords("hello world")).toBe("Hello World");
    });
  });

  describe("slugify", () => {
    it("converts to slug", () => {
      expect(slugify("Hello World!")).toBe("hello-world");
      expect(slugify("  Spaces  ")).toBe("spaces");
    });
  });

  describe("truncate", () => {
    it("truncates long strings", () => {
      expect(truncate("Hello World", 8)).toBe("Hello...");
      expect(truncate("Short", 10)).toBe("Short");
    });
  });

  describe("truncateMiddle", () => {
    it("truncates from middle", () => {
      expect(truncateMiddle("0x1234567890abcdef", 4, 4)).toBe("0x12...cdef");
    });
  });

  describe("stripHtml", () => {
    it("removes HTML tags", () => {
      expect(stripHtml("<p>Hello <strong>World</strong></p>")).toBe("Hello World");
    });
  });

  describe("escapeHtml", () => {
    it("escapes HTML entities", () => {
      expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
      expect(escapeHtml('"test"')).toBe("&quot;test&quot;");
    });
  });

  describe("unescapeHtml", () => {
    it("unescapes HTML entities", () => {
      expect(unescapeHtml("&lt;div&gt;")).toBe("<div>");
    });
  });

  describe("camelCase", () => {
    it("converts to camelCase", () => {
      expect(camelCase("hello world")).toBe("helloWorld");
      expect(camelCase("Hello World")).toBe("helloWorld");
    });
  });

  describe("snakeCase", () => {
    it("converts to snake_case", () => {
      expect(snakeCase("helloWorld")).toBe("hello_world");
      expect(snakeCase("HelloWorld")).toBe("hello_world");
    });
  });

  describe("kebabCase", () => {
    it("converts to kebab-case", () => {
      expect(kebabCase("helloWorld")).toBe("hello-world");
      expect(kebabCase("HelloWorld")).toBe("hello-world");
    });
  });

  describe("pascalCase", () => {
    it("converts to PascalCase", () => {
      expect(pascalCase("hello world")).toBe("HelloWorld");
    });
  });

  describe("pluralize", () => {
    it("pluralizes words", () => {
      expect(pluralize("cat", 1)).toBe("cat");
      expect(pluralize("cat", 2)).toBe("cats");
      expect(pluralize("person", 2, "people")).toBe("people");
    });
  });

  describe("wordCount", () => {
    it("counts words", () => {
      expect(wordCount("Hello world")).toBe(2);
      expect(wordCount("One")).toBe(1);
    });
  });

  describe("isPalindrome", () => {
    it("checks palindromes", () => {
      expect(isPalindrome("racecar")).toBe(true);
      expect(isPalindrome("A man a plan a canal Panama")).toBe(true);
      expect(isPalindrome("hello")).toBe(false);
    });
  });

  describe("levenshteinDistance", () => {
    it("calculates edit distance", () => {
      expect(levenshteinDistance("kitten", "sitting")).toBe(3);
      expect(levenshteinDistance("hello", "hello")).toBe(0);
    });
  });
});

