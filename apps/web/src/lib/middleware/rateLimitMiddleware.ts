import { NextRequest, NextResponse } from "next/server";
import { RateLimiter } from "../rateLimit";

export function withRateLimit(
  rateLimiter: RateLimiter,
  identifier?: (request: NextRequest) => string
) {
  return async function (
    handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
  ) {
    return async function (request: NextRequest, ...args: any[]): Promise<NextResponse> {
      // Get identifier (IP address or custom identifier)
      const id = identifier
        ? identifier(request)
        : request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown";

      const { allowed, remaining, resetTime } = rateLimiter.check(id);

      if (!allowed) {
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            retryAfter,
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": String(rateLimiter["maxRequests"]),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(resetTime),
              "Retry-After": String(retryAfter),
            },
          }
        );
      }

      // Execute handler
      const response = await handler(request, ...args);

      // Add rate limit headers
      response.headers.set("X-RateLimit-Limit", String(rateLimiter["maxRequests"]));
      response.headers.set("X-RateLimit-Remaining", String(remaining));
      response.headers.set("X-RateLimit-Reset", String(resetTime));

      return response;
    };
  };
}

