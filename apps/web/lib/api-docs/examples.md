# API Usage Examples

## JavaScript/TypeScript

```typescript
// Check airdrop eligibility
async function checkEligibility(address: string) {
  const response = await fetch(`/api/airdrop-check/${address}`);
  const data = await response.json();
  
  if (data.success) {
    console.log('Overall Score:', data.data.overallScore);
    console.log('Eligible Airdrops:', data.data.airdrops.length);
  }
}

// Get portfolio
async function getPortfolio(address: string) {
  const response = await fetch(`/api/portfolio/${address}`);
  const data = await response.json();
  
  if (data.success) {
    console.log('Total Value:', data.data.totalValue);
    console.log('Chains:', data.data.chainBreakdown);
  }
}
```

## Python

```python
import requests

def check_eligibility(address):
    response = requests.get(f'/api/airdrop-check/{address}')
    data = response.json()
    
    if data['success']:
        print('Overall Score:', data['data']['overallScore'])
        print('Eligible Airdrops:', len(data['data']['airdrops']))

def get_portfolio(address):
    response = requests.get(f'/api/portfolio/{address}')
    data = response.json()
    
    if data['success']:
        print('Total Value:', data['data']['totalValue'])
```

## cURL

```bash
# Check airdrop eligibility
curl https://airdropfinder.com/api/airdrop-check/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# Get portfolio with custom chains
curl "https://airdropfinder.com/api/portfolio/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?chains=1,8453,42161"

# Get trending airdrops
curl "https://airdropfinder.com/api/airdrops/trending?limit=10"
```

