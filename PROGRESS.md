# OmniClaw Console — Full Technical Progress Report

> **Date:** 2026-04-22  
> **Status:** ✅ Circle W3S Live Integration Working  
> **Stack:** Next.js (App Router) · Circle Programmable Wallets · Arc Testnet · USDC  

---

## 1. What Is OmniClaw?

OmniClaw is a **buyer-agent console** — an AI-powered dashboard that lets an autonomous "buyer agent" discover, evaluate, and purchase data services from vendor APIs, settling payments in **USDC on Arc Testnet** via **Circle Programmable Wallets** (developer-controlled).

The core flow:
1. User selects a vendor service (e.g. "Prime Market Scan" — $0.25 USDC)
2. The buyer agent runs a **5-point policy engine** (budget cap, recipient allowlist, network restriction, per-tx limit, no raw key exposure)
3. If approved, a **real on-chain USDC transfer** executes via Circle's REST API
4. The UI shows a live event feed, animated payment rail, and a receipt with a **clickable ArcScan transaction link**

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                │
│                                                      │
│  /console           — Main dashboard (React client)  │
│  /                  — Hero landing page              │
│                                                      │
│  Components:                                         │
│  ├── BuyerPanel.tsx          — Agent card + controls  │
│  ├── SellerPanel.tsx         — Vendor service cards   │
│  ├── EventFeed.tsx           — Live event timeline    │
│  ├── PaymentRail.tsx         — Animated payment flow  │
│  ├── IntegrationStatusPanel  — Circle health status   │
│  └── ReceiptDrawer.tsx       — TX receipt overlay     │
│                                                      │
├──────────────────────────────────────────────────────┤
│                   API ROUTES (Server)                │
│                                                      │
│  POST /api/demo/execute      — Execute transfer      │
│  GET  /api/demo/inspect      — Inspect service       │
│  POST /api/demo/policy-check — Run policy engine     │
│  GET  /api/demo/receipt      — Fetch receipt          │
│  GET  /api/integrations/circle/nav-wallet             │
│       — Navbar wallet badge (address + balance)      │
│  GET  /api/integrations/circle/wallet-status          │
│       — Full wallet status                           │
│  GET  /api/integrations/circle/create-wallet          │
│       — Wallet creation flow                         │
│  GET  /api/integrations/circle/setup-guide            │
│       — Setup instructions                           │
│  GET  /api/integrations/health                        │
│       — System health check                          │
│  GET  /api/services                                   │
│       — List available vendor services               │
│                                                      │
├──────────────────────────────────────────────────────┤
│                   LIB (Shared Logic)                 │
│                                                      │
│  lib/integrations/circle/client.ts                   │
│       — Full Circle REST client (see §4)             │
│  lib/demo/data.ts                                    │
│       — Mock data, demo services, fallback wallet    │
│  lib/demo/store.ts                                   │
│       — useReducer state machine for UI flow         │
│  lib/ai/                                             │
│       — AI provider integration (Gemini, etc.)       │
│  lib/utils.ts                                        │
│       — Shared utilities                             │
└──────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│       CIRCLE W3S REST API            │
│  https://api.circle.com             │
│                                      │
│  • Entity Secret Encryption (RSA)    │
│  • Developer-Controlled Wallets      │
│  • USDC Transfers on Arc Testnet     │
│  • Transaction Polling               │
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│       ARC TESTNET (Blockchain)       │
│  Explorer: testnet.arcscan.app       │
│  USDC Contract:                      │
│    0x360000000000000000000000000000   │
│    0000000000                         │
└──────────────────────────────────────┘
```

---

## 3. What's Done (✅)

### 3.1 Circle Wallet Integration — FULLY WORKING

| Component | Status | Details |
|-----------|--------|---------|
| API Key | ✅ | `TEST_API_KEY:e690...` configured in `.env.local` |
| Entity Secret | ✅ | `85b3ab4ec489...` — 32-byte hex, **registered and validated** |
| Entity Secret Encryption | ✅ | RSA-OAEP SHA-256 via Node.js `crypto.publicEncrypt()` |
| Wallet Set | ✅ | ID: `5f8b288d-c13e-5333-af5c-7247ce268f58` |
| Wallet | ✅ | ID: `b03dc127-2edf-55ec-ab6d-a01a549ac957` |
| Wallet Address | ✅ | `0xba6d9e17e6b854aa8dcc54a40a820f90a5a6d2f3` |
| Blockchain | ✅ | `ARC-TESTNET` |
| USDC Balance | ✅ | Funded via Circle Faucet |
| Live Transfer | ✅ | **Verified** — TX hash returned, confirmed on ArcScan |

**Proof of working transfer:**
```
TX Hash: 0xc569093b904f7f4b093173858cd614c3d468338f2e3f18e47d841fca4c9c1a8f
ArcScan: https://testnet.arcscan.app/tx/0xc569093b904f7f4b093173858cd614c3d468338f2e3f18e47d841fca4c9c1a8f
State:   INITIATED → COMPLETE (in ~3 seconds)
```

### 3.2 Circle REST Client (`lib/integrations/circle/client.ts`)

This is the core integration layer — **432 lines, no SDK dependency** (pure REST + Node.js crypto):

| Function | Purpose |
|----------|---------|
| `isCircleConfigured()` | Checks if API key is present and valid |
| `isEntitySecretConfigured()` | Checks entity secret is 64 hex chars (32 bytes) |
| `authHeaders()` | Returns `Authorization: Bearer ...` headers |
| `encryptEntitySecret()` | RSA-OAEP SHA-256 encryption of entity secret with cached public key |
| `fetchEntityPublicKey()` | Fetches RSA public key from `GET /v1/w3s/config/entity/publicKey` |
| `getEntityConfig()` | Fetches entity config (appId, etc.) |
| `listWalletSets()` | Lists all wallet sets |
| `createWalletSet(name)` | Creates a new wallet set |
| `listWallets(opts)` | Lists wallets with optional filters |
| `createWallet(setId, chains, count)` | Creates new wallets |
| `getWalletBalances(walletId)` | Fetches USDC + native token balances |
| `getWalletStatus(walletId)` | Returns app-formatted wallet status |
| `getCircleConnectionSummary()` | Full health check for the integration panel |
| `withEntityCiphertext(body)` | Wraps any POST body with encrypted entity secret |

**Key technical decisions:**
- **No SDK**: Circle's Node.js SDK had npm symlink conflicts in the monorepo. We bypassed it entirely with raw `fetch()` + `crypto.publicEncrypt()`.
- **Caching**: Entity public key is cached in-memory after first fetch.
- **PEM normalization**: Handles both raw base64 and PEM-formatted keys.

### 3.3 Transaction Execution Flow (`/api/demo/execute`)

The `POST /api/demo/execute` route handles the full lifecycle:

```
Request: { serviceId: "svc_prime_scan" }
         │
         ▼
1. Look up service → price = 0.25 USDC
2. Check if live mode (API key + entity secret + wallet address configured)
         │
    ┌────┴────┐
    │  LIVE   │  (isCircleConfigured && isEntitySecretConfigured)
    ▼         │
3. encryptEntitySecret() → RSA-OAEP ciphertext
4. POST /v1/w3s/developer/transactions/transfer
   Body: {
     idempotencyKey: UUID,
     walletAddress: "0xba6d...",
     blockchain: "ARC-TESTNET",
     destinationAddress: VENDOR_ADDRESS,
     amounts: ["0.25"],         ← IMPORTANT: array of strings, not number
     tokenAddress: "0x360...",  ← Arc Testnet USDC
     entitySecretCiphertext: "...",
     feeLevel: "MEDIUM"        ← top-level field, not nested
   }
5. Poll GET /v1/w3s/transactions/{txId} every 3s (up to 15 attempts / 45s)
6. Return { txHash, blockNumber, gasUsed, realTx: true }
         │
         ▼
7. Build receipt with:
   - proofLink: https://testnet.arcscan.app/tx/{txHash}
   - isDemoTx: false
   - mode: "live"
         │
    ┌────┘
    │  FALLBACK  (if live call throws)
    ▼
8. Return demo receipt with mode: "live_fallback" or "demo"
```

**Critical API field mappings** (learned the hard way):

| What you might expect | What Circle REST API actually wants |
|----------------------|-------------------------------------|
| `amount: "0.25"` | `amounts: ["0.25"]` (plural, array) |
| `fee: { config: { feeLevel } }` | `feeLevel: "MEDIUM"` (top-level string) |
| `walletId: "..."` | `walletAddress + blockchain` pair (preferred) |

### 3.4 Navbar Wallet Badge (`/api/integrations/circle/nav-wallet`)

- Displays wallet address (truncated: `0xba6d…d2f3`) and live USDC balance in the top nav
- Fetches balance from Circle's `GET /v1/w3s/wallets/{id}/balances`
- Falls back gracefully if no wallet configured

### 3.5 Frontend Console (`/console`)

- **BuyerPanel**: Shows buyer agent card with trust level, budget, and policy status
- **SellerPanel**: 3 vendor service cards (Prime Market Scan, Risk Oracle Brief, Settlement Receipt Kit)
- **EventFeed**: Animated event timeline with 10 steps (discovery → fulfillment)
- **PaymentRail**: Animated bar showing payment progress
- **IntegrationStatusPanel**: Live Circle connection health
- **ReceiptDrawer**: Slide-out receipt showing TX hash, ArcScan link, settlement metadata

### 3.6 Policy Engine (5 checks)

| Check | Constraint | Implementation |
|-------|-----------|----------------|
| Budget Cap | ≤ 10.00 USDC total | Client-side tracking |
| Recipient Allowlist | Allowlisted vendors only | Static list in agent config |
| Network Restriction | Arc Testnet only | Hardcoded check |
| Per-Transaction Limit | ≤ 5.00 USDC per tx | Validated before execution |
| No Raw Key Exposure | Circle Programmable Wallet | Architectural guarantee |

### 3.7 Demo Fallback System

When Circle credentials are missing or a live transfer fails, the app gracefully degrades:

| Mode | Trigger | Behavior |
|------|---------|----------|
| `live` | All Circle credentials valid + transfer succeeds | Real on-chain TX, real ArcScan link |
| `live_fallback` | Credentials present but transfer fails | Simulated receipt, no ArcScan link |
| `demo` | No Circle credentials at all | Full simulation mode |

---

## 4. Environment Variables (`.env.local`)

```env
# App mode
NEXT_PUBLIC_APP_ENV=live

# Circle W3S
CIRCLE_API_KEY=TEST_API_KEY:e690...
NEXT_PUBLIC_CIRCLE_CONFIGURED=true
CIRCLE_API_URL=https://api.circle.com
CIRCLE_ENTITY_SECRET=85b3ab4ec48973805a202d620e8736d5182f59a9e8d26bbad9c34f7ee7ed2585
CIRCLE_WALLET_ID=b03dc127-2edf-55ec-ab6d-a01a549ac957
CIRCLE_WALLET_ADDRESS=0xba6d9e17e6b854aa8dcc54a40a820f90a5a6d2f3
CIRCLE_WALLET_BLOCKCHAIN=ARC-TESTNET
CIRCLE_WALLET_SET_ID=5f8b288d-c13e-5333-af5c-7247ce268f58

# Arc Testnet
ARC_RPC_URL=https://rpc.testnet.arc.network
ARC_EXPLORER_URL=https://testnet.arcscan.app

# AI Providers
GEMINI_API_KEY=AIza...
FEATHERLESS_API_KEY=rc_9ed...
FEATHERLESS_API_URL=https://api.featherless.ai/v1/chat/completions
```

---

## 5. Entity Secret — How It Works

This was the main blocker and is now resolved:

```
┌─────────────────────────────────────────────────────────────┐
│ ENTITY SECRET LIFECYCLE                                     │
│                                                             │
│ 1. Generate: crypto.randomBytes(32).toString('hex')         │
│    → 64-char hex string (32 bytes)                          │
│    → Stored in .env.local as CIRCLE_ENTITY_SECRET           │
│                                                             │
│ 2. Register: Done ONCE via Circle Developer Console         │
│    → Encrypt with entity public key (RSA-OAEP SHA-256)      │
│    → Submit ciphertext at console.circle.com/wallets/dev    │
│    → Cannot be changed without the recovery file            │
│                                                             │
│ 3. Use: Every POST request to Circle W3S must include       │
│    entitySecretCiphertext (freshly encrypted each time)     │
│                                                             │
│ 4. Encryption (per-request):                                │
│    a. Fetch RSA public key: GET /v1/w3s/config/entity/      │
│       publicKey                                              │
│    b. Convert hex secret → 32-byte Buffer                   │
│    c. crypto.publicEncrypt({                                │
│         key: PEM,                                           │
│         padding: RSA_PKCS1_OAEP_PADDING,                    │
│         oaepHash: 'sha256'                                  │
│       }, buffer)                                            │
│    d. Result → base64 string → entitySecretCiphertext       │
└─────────────────────────────────────────────────────────────┘
```

**Previous bug:** The old entity secret (`2508c960...`) was never registered with Circle, causing error `156013: "The provided entity secret is invalid"`. Fixed by generating a new secret and registering it in the Circle Console.

---

## 6. File Structure

```
OmniClaw-Frontend/
├── .env.local                          ← All credentials
├── .env.example                        ← Template (no secrets)
├── package.json
├── next.config.ts
├── tsconfig.json
├── scripts/
│   ├── setup-circle-wallet.mjs         ← Full wallet setup script
│   └── test-entity-secret.mjs          ← Entity secret validation test
├── src/
│   ├── app/
│   │   ├── layout.tsx                  ← Root layout + navbar
│   │   ├── page.tsx                    ← Hero landing page
│   │   ├── globals.css                 ← Global styles
│   │   ├── console/
│   │   │   └── page.tsx                ← Main dashboard (331 lines)
│   │   └── api/
│   │       ├── demo/
│   │       │   ├── execute/route.ts    ← TX execution (205 lines) ⭐
│   │       │   ├── inspect/route.ts    ← Service inspection
│   │       │   ├── policy-check/route.ts ← Policy engine
│   │       │   └── receipt/route.ts    ← Receipt fetcher
│   │       ├── integrations/
│   │       │   ├── circle/
│   │       │   │   ├── nav-wallet/route.ts   ← Navbar badge
│   │       │   │   ├── wallet-status/route.ts ← Full status
│   │       │   │   ├── create-wallet/route.ts ← Wallet creation
│   │       │   │   └── setup-guide/route.ts   ← Setup instructions
│   │       │   ├── health/route.ts     ← Health check
│   │       │   └── omniclaw/route.ts   ← OmniClaw metadata
│   │       └── services/route.ts       ← List services
│   ├── components/
│   │   ├── console/
│   │   │   ├── BuyerPanel.tsx          ← Buyer agent card (20KB)
│   │   │   ├── SellerPanel.tsx         ← Vendor service cards
│   │   │   ├── EventFeed.tsx           ← Live event timeline
│   │   │   ├── PaymentRail.tsx         ← Payment animation
│   │   │   └── IntegrationStatusPanel.tsx ← Circle health
│   │   ├── hero/                       ← Landing page components
│   │   └── transaction/
│   │       └── ReceiptDrawer.tsx       ← TX receipt overlay
│   ├── lib/
│   │   ├── integrations/
│   │   │   └── circle/
│   │   │       └── client.ts           ← Circle REST client (432 lines) ⭐
│   │   ├── demo/
│   │   │   ├── data.ts                 ← Mock data + services (304 lines)
│   │   │   └── store.ts               ← State machine
│   │   ├── ai/                         ← AI reasoning
│   │   └── utils.ts                    ← Shared utils
│   └── types/
│       └── index.ts                    ← TypeScript types
└── _archive/                           ← Legacy files (safe to ignore)
```

---

## 7. What's Left / Known Issues

### 7.1 Remaining Tasks

| Priority | Task | Status | Notes |
|----------|------|--------|-------|
| 🔴 HIGH | Verify end-to-end in browser | ⏳ Pending | Click a vendor → see real ArcScan link |
| 🟡 MED | Vendor addresses | ⚠️ Using self-send | All 3 vendors currently send to own wallet (loopback). In production, each vendor would have its own address |
| 🟡 MED | Wallet balance deduction UI | ⚠️ Partial | Nav badge shows live balance, but BuyerPanel budget tracking is client-side only |
| 🟢 LOW | AI reasoning panel | ✅ Basic | Uses Gemini/Featherless for agent reasoning text |
| 🟢 LOW | Duplicate key warnings | ⚠️ Cosmetic | `evt_001` through `evt_010` React key warnings in EventFeed |

### 7.2 Known Quirks

1. **Transfer polling timeout**: The `/api/demo/execute` route polls for up to 45 seconds. If the browser times out before that, the UI may show a fallback receipt even though the on-chain TX succeeded.

2. **Self-send pattern**: For demo/hackathon purposes, all vendor payments are loopback transfers (wallet sends to itself). This is by design to avoid needing multiple funded wallets.

3. **Entity secret is immutable**: Once registered, the entity secret cannot be changed without the recovery file. If the secret in `.env.local` is lost, you'd need to create a new API key or use the recovery flow.

---

## 8. How to Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000/console
```

### Testing Entity Secret Independently

```bash
# Verify entity secret works with Circle API
node --env-file=.env.local scripts/test-entity-secret.mjs
```

### Funding the Wallet

1. Go to https://faucet.circle.com
2. Network: **Arc Testnet**
3. Token: **USDC**
4. Address: `0xba6d9e17e6b854aa8dcc54a40a820f90a5a6d2f3`

---

## 9. Circle API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/v1/w3s/config/entity` | Get entity config (appId) |
| `GET` | `/v1/w3s/config/entity/publicKey` | Get RSA public key for encryption |
| `GET` | `/v1/w3s/wallets` | List wallets |
| `GET` | `/v1/w3s/wallets/{id}/balances` | Get token balances |
| `POST` | `/v1/w3s/developer/transactions/transfer` | Create USDC transfer |
| `GET` | `/v1/w3s/transactions/{id}` | Poll transaction status |
| `GET` | `/v1/w3s/developer/walletSets` | List wallet sets |
| `POST` | `/v1/w3s/developer/walletSets` | Create wallet set |
| `POST` | `/v1/w3s/developer/wallets` | Create wallet |

---

## 10. Security Model

| Aspect | Implementation |
|--------|---------------|
| API Key | Server-side only (`process.env`), never exposed to client |
| Entity Secret | Server-side only, encrypted per-request with RSA-OAEP SHA-256 |
| Wallet Control | Developer-controlled (Circle holds keys, we hold entity secret) |
| Key Exposure | Zero — no private keys in code, env vars, or client bundle |
| Auth Headers | `Authorization: Bearer` on every API call |
| Fallback | Graceful degradation to demo mode if credentials fail |

---

## 11. Transaction Receipt Format

When a live transfer succeeds, the API returns:

```json
{
  "success": true,
  "data": {
    "receipt": {
      "id": "rcpt_1713...",
      "txHash": "0xc569093b904f7f4b...",
      "serviceId": "svc_prime_scan",
      "serviceTitle": "Prime Market Scan",
      "amount": 0.25,
      "currency": "USDC",
      "network": "Arc Testnet",
      "status": "confirmed",
      "proofLink": "https://testnet.arcscan.app/tx/0xc569...",
      "arcScanUrl": "https://testnet.arcscan.app/tx/0xc569...",
      "isDemoTx": false,
      "settlementMetadata": {
        "blockNumber": "12345",
        "gasUsed": "21000",
        "settlementLayer": "Arc Testnet",
        "valueLayer": "USDC",
        "facilitator": "OmniClaw Exact Facilitator",
        "realTransaction": "yes"
      }
    },
    "events": [...],
    "finalState": "fulfilled",
    "mode": "live"
  }
}
```

---

## 12. Troubleshooting Quick Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `156013: entity secret invalid` | Entity secret not registered or wrong | Register at Circle Console or update `.env.local` |
| `409: secret already set` | Tried to register a new secret | Use the existing registered secret |
| `400: amounts` validation error | Using `amount` instead of `amounts` | Use `amounts: ["0.25"]` (array of strings) |
| `404` on walletSets | Wrong endpoint path | Use `/v1/w3s/developer/walletSets` |
| Nav shows "—" balance | Wallet not funded or API timeout | Fund at faucet.circle.com |
| Fallback to demo | Live transfer threw an error | Check server logs for specific error |

---

*Last updated: 2026-04-22 02:55 IST*
