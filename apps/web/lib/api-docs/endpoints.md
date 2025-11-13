# API Endpoints Documentation

## Airdrop Endpoints

### GET /api/airdrop-check/[address]
Check airdrop eligibility for a wallet address.

**Parameters:**
- `address` (path): Ethereum address

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "overallScore": 85,
    "airdrops": [...],
    "timestamp": 1234567890
  }
}
```

### GET /api/airdrops
List all airdrops.

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status

### GET /api/airdrops/trending
Get trending airdrops.

## Portfolio Endpoints

### GET /api/portfolio/[address]
Get portfolio data for an address.

**Parameters:**
- `address` (path): Ethereum address

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "totalValue": 1000.50,
    "chainBreakdown": [...],
    "topTokens": [...]
  }
}
```

## Analytics Endpoints

### GET /api/gas-tracker/[address]
Track gas spending for an address.

### GET /api/risk-analysis/[address]
Analyze security risks for an address.

### GET /api/wallet-health/[address]
Assess wallet health score.

