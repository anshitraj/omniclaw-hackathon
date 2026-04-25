<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Inter&size=30&duration=2500&pause=900&center=true&vCenter=true&width=900&lines=OmniClaw+Console;OmniClaw-Powered+Agentic+Commerce;x402+Payments+%2B+OmniClaw+Execution" alt="Typing headline" />

<p>
  <img src="https://img.shields.io/badge/Payment%20Execution-OmniClaw%20Server-16a34a?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Value-USDC-0ea5e9?style=for-the-badge" />
</p>

<p><b>Autonomous Commerce. Controlled.</b></p>

</div>

---

## What This Is

OmniClaw is a payment control console for AI agents.

When a buyer agent wants to pay for a service:

1. OmniClaw checks rules such as budget, allowlist, and limits
2. Payment is executed through the OmniClaw server x402 flow
3. Seller fulfillment is unlocked after payment confirmation

This is a policy-controlled payment flow for per-action commerce.

---

## Run Locally

```bash
pnpm install
pnpm dev
```

Open: [http://localhost:3000](http://localhost:3000)

---

## Key Endpoints

- `GET /api/integrations/health`
- `GET /api/integrations/omniclaw/balance`
- `POST /api/execute`

---

## Environment Setup

Set these values in `.env.local`:

- `OMNICLAW_API_URL`
- `OMNICLAW_API_TOKEN`
- `FEATHERLESS_API_KEY` if you want live AI reasoning

---

## License

MIT
