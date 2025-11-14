# API Documentation

## Overview

This document provides comprehensive documentation for the Airdrop Finder API. All endpoints return JSON responses and support standard HTTP methods.

## Base URL

```
Production: https://airdrop-finder.vercel.app/api
Development: http://localhost:3000/api
```

## Authentication

Currently, the API is public and does not require authentication. Rate limiting is applied per IP address.

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/airdrop-check` | 100 requests/hour |
| `/portfolio` | 100 requests/hour |
| `/airdrops` | 500 requests/hour |
| `/trending` | 500 requests/hour |
| `/gas-tracker` | 100 requests/hour |

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Endpoints

### 1. Check Airdrop Eligibility

Check if a wallet address is eligible for airdrops.

**Endpoint:** `GET /airdrop-check/[address]`

**Parameters:**
- `address` (path, required): Ethereum wallet address

**Example Request:**
```bash
curl https://airdrop-finder.vercel.app/api/airdrop-check/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Example Response:**
```json
{
  "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "overallScore": 85,
  "eligibilityLevel": "high",
  "airdrops": [
    {
      "projectId": "arbitrum",
      "projectName": "Arbitrum",
      "eligibilityScore": 90,
      "criteria": [
        {
          "name": "Transaction Count",
          "met": true,
          "value": 150,
          "threshold": 10
        }
      ],
      "estimatedValue": "$500-$2000",
      "status": "confirmed"
    }
  ],
  "timestamp": "2025-11-13T12:00:00.000Z",
  "cached": false
}
```

**Error Responses:**
- `400 Bad Request`: Invalid address format
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

### 2. Get Portfolio

Retrieve portfolio data for a wallet address across multiple chains.

**Endpoint:** `GET /portfolio/[address]`

**Parameters:**
- `address` (path, required): Ethereum wallet address

**Example Request:**
```bash
curl https://airdrop-finder.vercel.app/api/portfolio/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Example Response:**
```json
{
  "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "totalValue": 15234.56,
  "chains": [
    {
      "chainId": 1,
      "chainName": "Ethereum",
      "value": 10000.00,
      "tokens": [
        {
          "symbol": "ETH",
          "balance": "2.5",
          "valueUSD": 5000.00,
          "contractAddress": "0x0000000000000000000000000000000000000000"
        }
      ]
    }
  ],
  "timestamp": "2025-11-13T12:00:00.000Z",
  "cached": false
}
```

---

### 3. List Airdrops

Get a list of all airdrop projects.

**Endpoint:** `GET /airdrops`

**Query Parameters:**
- `status` (optional): Filter by status (`confirmed`, `rumored`, `speculative`, `expired`)

**Example Request:**
```bash
curl https://airdrop-finder.vercel.app/api/airdrops?status=confirmed
```

**Example Response:**
```json
{
  "projects": [
    {
      "id": "arbitrum",
      "name": "Arbitrum",
      "description": "Layer 2 scaling solution for Ethereum",
      "status": "confirmed",
      "logoUrl": "https://example.com/arbitrum.png",
      "websiteUrl": "https://arbitrum.io",
      "chains": ["ethereum"],
      "criteria": [
        {
          "type": "transaction_count",
          "description": "Minimum 10 transactions",
          "threshold": 10
        }
      ],
      "estimatedValue": "$500-$2000",
      "snapshotDate": "2023-03-01",
      "claimUrl": "https://arbitrum.foundation/claim"
    }
  ],
  "count": 1,
  "cached": false
}
```

---

### 4. Trending Airdrops

Get trending airdrop projects based on activity and interest.

**Endpoint:** `GET /trending`

**Query Parameters:**
- `limit` (optional): Number of results (default: 10, max: 50)
- `status` (optional): Filter by status

**Example Request:**
```bash
curl https://airdrop-finder.vercel.app/api/trending?limit=5
```

**Example Response:**
```json
{
  "trending": [
    {
      "id": "zksync",
      "name": "zkSync",
      "trendingScore": 95,
      "viewCount": 12500,
      "status": "rumored",
      "description": "Zero-knowledge rollup scaling solution"
    }
  ],
  "count": 5,
  "timestamp": "2025-11-13T12:00:00.000Z",
  "cached": false
}
```

---

### 5. Gas Tracker

Track gas spending across chains for a wallet address.

**Endpoint:** `GET /gas-tracker/[address]`

**Parameters:**
- `address` (path, required): Ethereum wallet address

**Example Request:**
```bash
curl https://airdrop-finder.vercel.app/api/gas-tracker/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Example Response:**
```json
{
  "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "totalSpent": 1.25,
  "totalTransactions": 342,
  "averageGasPrice": 25.5,
  "chains": [
    {
      "chainId": 1,
      "chainName": "Ethereum",
      "gasSpent": 1.0,
      "transactionCount": 250,
      "averageGasPrice": 30.2
    }
  ],
  "timestamp": "2025-11-13T12:00:00.000Z",
  "cached": false
}
```

---

### 6. Health Check

Check API health and service status.

**Endpoint:** `GET /health`

**Example Request:**
```bash
curl https://airdrop-finder.vercel.app/api/health
```

**Example Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-13T12:00:00.000Z",
  "uptime": 86400,
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "externalAPIs": "healthy"
  },
  "metrics": {
    "requestCount": 150000,
    "errorRate": 0.01,
    "averageResponseTime": 150
  }
}
```

---

### 7. Rate Limit Info

Get rate limit information for the current client.

**Endpoint:** `GET /rate-limit`

**Query Parameters:**
- `endpoint` (optional): Specific endpoint to check
- `address` (optional): Wallet address for address-specific limits

**Example Request:**
```bash
curl https://airdrop-finder.vercel.app/api/rate-limit?endpoint=/api/airdrop-check
```

**Example Response:**
```json
{
  "endpoint": "/api/airdrop-check",
  "limit": 100,
  "remaining": 95,
  "used": 5,
  "resetAt": "2025-11-13T13:00:00.000Z",
  "window": 3600
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "details": "Additional details about the error",
  "code": "ERROR_CODE",
  "timestamp": "2025-11-13T12:00:00.000Z"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_ADDRESS` | 400 | Invalid Ethereum address format |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## Caching

The API uses intelligent caching to improve performance:

- **Airdrop checks**: 1 hour
- **Portfolio data**: 5 minutes
- **Airdrops list**: 5 minutes
- **Trending data**: 5 minutes
- **Gas tracker**: 1 hour

Cached responses include a `cached: true` field.

---

## Best Practices

1. **Handle Rate Limits**: Check `X-RateLimit-Remaining` header and implement exponential backoff
2. **Cache Responses**: Respect cache headers and store responses locally when appropriate
3. **Validate Input**: Validate addresses client-side before making API calls
4. **Handle Errors**: Implement proper error handling for all possible status codes
5. **Use Appropriate Endpoints**: Choose the right endpoint for your use case

---

## SDK / Libraries

### JavaScript/TypeScript

```typescript
import { AirdropFinderClient } from '@airdrop-finder/sdk';

const client = new AirdropFinderClient({
  baseUrl: 'https://airdrop-finder.vercel.app/api',
});

// Check airdrop eligibility
const eligibility = await client.checkEligibility('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');

// Get portfolio
const portfolio = await client.getPortfolio('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
```

---

## Support

For questions, issues, or feature requests:
- GitHub Issues: [github.com/airdrop-finder/issues](https://github.com/airdrop-finder/issues)
- Discord: [discord.gg/airdrop-finder](https://discord.gg/airdrop-finder)
- Email: support@airdrop-finder.com

---

## Changelog

### v1.0.0 (2025-11-13)
- Initial API release
- Core endpoints for airdrop checking, portfolio, and gas tracking
- Rate limiting implementation
- Comprehensive error handling

