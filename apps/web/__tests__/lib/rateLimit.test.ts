import { RateLimiter } from "@/lib/rateLimit";

describe("RateLimiter", () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter(3, 1000); // 3 requests per second for tests
  });

  describe("check", () => {
    it("allows requests within limit", () => {
      const result1 = rateLimiter.check("user1");
      const result2 = rateLimiter.check("user1");
      const result3 = rateLimiter.check("user1");

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result3.allowed).toBe(true);
    });

    it("blocks requests exceeding limit", () => {
      rateLimiter.check("user1");
      rateLimiter.check("user1");
      rateLimiter.check("user1");

      const result = rateLimiter.check("user1");

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("tracks different identifiers separately", () => {
      rateLimiter.check("user1");
      rateLimiter.check("user1");
      rateLimiter.check("user1");

      const resultUser2 = rateLimiter.check("user2");

      expect(resultUser2.allowed).toBe(true);
    });

    it("resets after time window", async () => {
      rateLimiter.check("user1");
      rateLimiter.check("user1");
      rateLimiter.check("user1");

      expect(rateLimiter.check("user1").allowed).toBe(false);

      // Wait for window to reset
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const result = rateLimiter.check("user1");
      expect(result.allowed).toBe(true);
    });
  });

  describe("reset", () => {
    it("resets limit for specific identifier", () => {
      rateLimiter.check("user1");
      rateLimiter.check("user1");
      rateLimiter.check("user1");

      expect(rateLimiter.check("user1").allowed).toBe(false);

      rateLimiter.reset("user1");

      const result = rateLimiter.check("user1");
      expect(result.allowed).toBe(true);
    });
  });

  describe("resetAll", () => {
    it("resets all limits", () => {
      rateLimiter.check("user1");
      rateLimiter.check("user1");
      rateLimiter.check("user1");
      rateLimiter.check("user2");
      rateLimiter.check("user2");
      rateLimiter.check("user2");

      rateLimiter.resetAll();

      expect(rateLimiter.check("user1").allowed).toBe(true);
      expect(rateLimiter.check("user2").allowed).toBe(true);
    });
  });
});

