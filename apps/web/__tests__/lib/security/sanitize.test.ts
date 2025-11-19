import {
  escapeHtml,
  stripHtmlTags,
  sanitizeUrl,
  sanitizeFileName,
  sanitizeInput,
  sanitizeEmail,
  sanitizeAddress,
} from "@/lib/security/sanitize";

describe("Security Sanitization Utilities", () => {
  describe("escapeHtml", () => {
    it("escapes HTML special characters", () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
      );
    });

    it("escapes ampersands", () => {
      expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
    });

    it("escapes quotes", () => {
      expect(escapeHtml(`He said "Hello"`)).toBe("He said &quot;Hello&quot;");
    });
  });

  describe("stripHtmlTags", () => {
    it("removes all HTML tags", () => {
      expect(stripHtmlTags("<p>Hello <b>World</b></p>")).toBe("Hello World");
    });

    it("handles nested tags", () => {
      expect(stripHtmlTags("<div><span>Test</span></div>")).toBe("Test");
    });
  });

  describe("sanitizeUrl", () => {
    it("accepts valid HTTP URLs", () => {
      expect(sanitizeUrl("http://example.com")).toBe("http://example.com/");
    });

    it("accepts valid HTTPS URLs", () => {
      expect(sanitizeUrl("https://example.com")).toBe("https://example.com/");
    });

    it("rejects javascript URLs", () => {
      expect(sanitizeUrl("javascript:alert('xss')")).toBe("");
    });

    it("rejects data URLs", () => {
      expect(sanitizeUrl("data:text/html,<script>alert('xss')</script>")).toBe("");
    });

    it("rejects invalid URLs", () => {
      expect(sanitizeUrl("not a url")).toBe("");
    });
  });

  describe("sanitizeFileName", () => {
    it("removes dangerous characters", () => {
      expect(sanitizeFileName("../../../etc/passwd")).toBe(".._.._.._.._etc_passwd");
    });

    it("preserves valid characters", () => {
      expect(sanitizeFileName("document-2024.pdf")).toBe("document-2024.pdf");
    });

    it("replaces spaces with underscores", () => {
      expect(sanitizeFileName("my file.txt")).toBe("my_file.txt");
    });
  });

  describe("sanitizeInput", () => {
    it("trims whitespace", () => {
      expect(sanitizeInput("  test  ")).toBe("test");
    });

    it("truncates long input", () => {
      const longString = "a".repeat(2000);
      const result = sanitizeInput(longString, 100);
      expect(result.length).toBeLessThanOrEqual(100);
    });

    it("removes null bytes", () => {
      expect(sanitizeInput("test\0null")).toBe("testnull");
    });

    it("escapes HTML", () => {
      expect(sanitizeInput("<script>alert('xss')</script>")).toContain("&lt;");
    });
  });

  describe("sanitizeEmail", () => {
    it("accepts valid email", () => {
      expect(sanitizeEmail("user@example.com")).toBe("user@example.com");
    });

    it("converts to lowercase", () => {
      expect(sanitizeEmail("User@Example.COM")).toBe("user@example.com");
    });

    it("rejects invalid email", () => {
      expect(sanitizeEmail("not-an-email")).toBe("");
    });

    it("trims whitespace", () => {
      expect(sanitizeEmail("  user@example.com  ")).toBe("user@example.com");
    });
  });

  describe("sanitizeAddress", () => {
    it("formats valid Ethereum address", () => {
      const address = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
      expect(sanitizeAddress(address)).toBe(
        "0x742d35cc6634c0532925a3b844bc9e7595f0beb"
      );
    });

    it("removes non-hex characters", () => {
      expect(sanitizeAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb!!!")).toBe(
        "0x742d35cc6634c0532925a3b844bc9e7595f0beb"
      );
    });

    it("rejects invalid length", () => {
      expect(sanitizeAddress("0x123")).toBe("");
    });

    it("adds 0x prefix if missing", () => {
      const address = "742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
      expect(sanitizeAddress(address)).toBe(
        "0x742d35cc6634c0532925a3b844bc9e7595f0beb"
      );
    });
  });
});

