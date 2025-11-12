# Onchain Features Documentation

This document describes all 40 onchain features implemented in the airdrop-checker project. All features use **Reown Wallet** (formerly WalletConnect) for secure wallet connections and transaction signing.

## Features Overview

### Transaction Execution Features (1-20)
These features prepare and execute blockchain transactions using Reown Wallet.

1. **Token Transfer** - `/api/onchain/token-transfer`
2. **Token Approval** - `/api/onchain/token-approval`
3. **NFT Minting** - `/api/onchain/nft-mint`
4. **Staking** - `/api/onchain/stake`
5. **Unstaking** - `/api/onchain/unstake`
6. **Bridge Tokens** - `/api/onchain/bridge`
7. **Swap Tokens** - `/api/onchain/swap`
8. **Add Liquidity** - `/api/onchain/add-liquidity`
9. **Remove Liquidity** - `/api/onchain/remove-liquidity`
10. **Claim Rewards** - `/api/onchain/claim-rewards`
11. **Vote on Proposals** - `/api/onchain/vote`
12. **Delegate Voting Power** - `/api/onchain/delegate`
13. **Wrap/Unwrap Tokens** - `/api/onchain/wrap-unwrap`
14. **Set ENS Name** - `/api/onchain/set-ens`
15. **Batch Transactions** - `/api/onchain/batch-transaction`
16. **Cancel Pending Transaction** - `/api/onchain/cancel-transaction`
17. **Speed Up Transaction** - `/api/onchain/speed-up-transaction`
18. **Sign Message** - `/api/onchain/sign-message`
19. **Sign Typed Data** - `/api/onchain/sign-typed-data`
20. **Multi-Sig Operations** - `/api/onchain/multisig`

### Query & Read Features (21-40)
These features read blockchain data without requiring transactions.

21. **Token Balance Check** - `/api/onchain/token-balance`
22. **Transaction History** - `/api/onchain/transaction-history`
23. **Gas Estimation** - `/api/onchain/gas-estimation`
24. **Token Metadata** - `/api/onchain/token-metadata`
25. **NFT Balance Check** - `/api/onchain/nft-balance`
26. **NFT Transfer** - `/api/onchain/nft-transfer`
27. **NFT Approval** - `/api/onchain/nft-approval`
28. **LP Position Check** - `/api/onchain/lp-position`
29. **Staking Position Check** - `/api/onchain/staking-position`
30. **Token Price Fetch** - `/api/onchain/token-price`
31. **Contract Read** - `/api/onchain/contract-read`
32. **Event Listening** - `/api/onchain/event-listening`
33. **Token Allowance Check** - `/api/onchain/token-allowance`
34. **Nonce Management** - `/api/onchain/nonce`
35. **Gas Price Fetch** - `/api/onchain/gas-price`
36. **Block Number** - `/api/onchain/block-number`
37. **Transaction Status** - `/api/onchain/transaction-status`
38. **Contract Verification** - `/api/onchain/contract-verification`
39. **Token List** - `/api/onchain/token-list`
40. **Chain State** - `/api/onchain/chain-state`

## Reown Wallet Integration

All transaction features require Reown Wallet connection. The integration is handled through:

- `@reown/appkit` - Wallet connection UI
- `wagmi` - Ethereum React hooks
- `viem` - TypeScript Ethereum library

### Usage Example

```typescript
import { useOnchainTransaction } from '@/hooks/use-onchain-transaction';

function MyComponent() {
  const { executeTransaction, isConnected, connect } = useOnchainTransaction();

  const handleTransfer = async () => {
    if (!isConnected) {
      connect(); // Opens Reown Wallet modal
      return;
    }

    const result = await executeTransaction('token-transfer', {
      to: '0x...',
      amount: '1.0',
      tokenAddress: '0x...',
    });
  };
}
```

## Supported Chains

- Ethereum (1)
- Base (8453)
- Arbitrum (42161)
- Optimism (10)
- Polygon (137)
- zkSync Era (324)

