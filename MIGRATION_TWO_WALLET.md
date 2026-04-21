# Migration Guide: Single Wallet -> Buyer/Seller Wallets

## Why this migration

The previous architecture could run with one wallet and loopback transfers. That is no longer valid for real commerce.

## Required target state

- Buyer and seller are separate wallet actors.
- Buyer sends funds.
- Seller receives funds.
- Buyer and seller wallet IDs differ.
- Buyer and seller addresses differ.

## Step-by-step

1. Configure buyer envs (`CIRCLE_BUYER_*`).
2. Configure seller envs (`CIRCLE_SELLER_*`).
3. Keep blockchain aligned (`ARC-TESTNET`) unless intentionally changed.
4. Start app and open console.
5. Open integration status panel and verify:
   - buyer configured
   - seller configured
   - distinct wallets = yes
   - live architecture valid = yes
6. Execute payment and validate receipt from/to addresses.

## Legacy fallback behavior

- Legacy single-wallet env vars are still accepted so development can continue.
- Legacy mode is flagged as non-production architecture.
- If buyer and seller resolve to same wallet, UI shows invalid architecture warning.

## Verification endpoints

- `/api/integrations/circle/wallet-overview`
- `/api/integrations/circle/buyer-wallet`
- `/api/integrations/circle/seller-wallet`
- `/api/integrations/circle/buyer-history`
- `/api/integrations/circle/seller-history`
- `/api/integrations/health`
