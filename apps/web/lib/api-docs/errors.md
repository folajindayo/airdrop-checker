# API Error Codes

## Standard Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "statusCode": 400,
    "timestamp": 1234567890
  }
}
```

## Error Codes

### 4xx Client Errors

- `INVALID_ADDRESS` (400): Invalid Ethereum address format
- `VALIDATION_ERROR` (400): Request validation failed
- `NOT_FOUND` (404): Resource not found
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `RATE_LIMIT_EXCEEDED` (429): Too many requests

### 5xx Server Errors

- `INTERNAL_ERROR` (500): Internal server error
- `DATABASE_ERROR` (500): Database operation failed
- `EXTERNAL_API_ERROR` (502): External API call failed
- `SERVICE_UNAVAILABLE` (503): Service temporarily unavailable

## Rate Limiting

Rate limits are returned in response headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets
- `Retry-After`: Seconds to wait before retrying (on 429 errors)

