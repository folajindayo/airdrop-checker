# API Authentication

## Overview

Most endpoints are public and don't require authentication. Premium features require an API key.

## API Key Authentication

For endpoints requiring authentication, include your API key in the request header:

```http
GET /api/premium-feature
X-API-Key: your_api_key_here
```

Or as a query parameter:

```http
GET /api/premium-feature?api_key=your_api_key_here
```

## Rate Limits

### Public Endpoints
- 100 requests per minute per IP
- 1000 requests per hour per IP

### Authenticated Endpoints
- 1000 requests per minute
- 10,000 requests per hour

## Obtaining an API Key

API keys are currently not publicly available. Contact support for access.

