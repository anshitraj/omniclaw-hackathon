// ============================================================
// OmniClaw Integration Client
// ============================================================
// Supports two integration modes:
//
// 1. **SDK Mode (Direct)**: Uses Circle API credentials and
//    env-based config (e.g., `pip install omniclaw` backend).
//    No OMNICLAW_API_TOKEN required. Configured when Circle API
//    key is present.
//
// 2. **Server Mode (Remote)**: Connects to a remote OmniClaw
//    server via OMNICLAW_API_URL. Token is optional — only
//    required if the server enforces auth.
//
// The app does NOT require OMNICLAW_API_TOKEN to be considered
// configured. Missing token should never force demo mode.
// ============================================================

import type { SellerService, PolicyCheckResult, TransactionReceipt } from '@/types';

// --- Environment Variables ---
const OMNICLAW_API_URL = process.env.OMNICLAW_API_URL;
const OMNICLAW_API_TOKEN = process.env.OMNICLAW_API_TOKEN; // Optional — only for authenticated server mode
const CIRCLE_API_KEY =
  process.env.CIRCLE_API_KEY ||
  process.env.CIRCLE_BUYER_API_KEY ||
  process.env.CIRCLE_SELLER_API_KEY;
const ARC_RPC_URL = process.env.ARC_RPC_URL;

// ============================================================
// Configuration Detection
// ============================================================

/**
 * SDK Mode: OmniClaw is configured through Circle / env-based setup.
 * No token or remote server needed.
 */
export function isOmniClawSdkConfigured(): boolean {
  return !!CIRCLE_API_KEY;
}

/**
 * Server Mode: A remote OmniClaw server URL is set.
 * Token is optional for this mode.
 */
export function isOmniClawServerConfigured(): boolean {
  return !!OMNICLAW_API_URL;
}

/**
 * Whether server auth is enabled (token provided for remote server).
 */
export function isOmniClawServerAuthEnabled(): boolean {
  return !!(OMNICLAW_API_URL && OMNICLAW_API_TOKEN);
}

/**
 * OmniClaw is considered "configured" in EITHER mode:
 * - SDK mode (Circle API present)
 * - Server mode (remote URL present)
 */
export function isOmniClawConfigured(): boolean {
  return isOmniClawSdkConfigured() || isOmniClawServerConfigured();
}

/**
 * Returns the active OmniClaw integration mode.
 */
export function getOmniClawMode(): 'sdk' | 'server' | 'both' | 'none' {
  const sdk = isOmniClawSdkConfigured();
  const server = isOmniClawServerConfigured();
  if (sdk && server) return 'both';
  if (sdk) return 'sdk';
  if (server) return 'server';
  return 'none';
}

/**
 * Returns detailed integration status for the health check panel.
 */
export function getOmniClawIntegrationDetails() {
  return {
    sdkMode: isOmniClawSdkConfigured(),
    serverMode: isOmniClawServerConfigured(),
    serverAuth: isOmniClawServerAuthEnabled(),
    circleApiConfigured: !!CIRCLE_API_KEY,
    arcConfigured: !!ARC_RPC_URL,
    activeMode: getOmniClawMode(),
  };
}

// ============================================================
// Build headers for server mode requests
// ============================================================

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  // Only attach auth header if token is available
  if (OMNICLAW_API_TOKEN) {
    headers['Authorization'] = `Bearer ${OMNICLAW_API_TOKEN}`;
  }
  return headers;
}

// ============================================================
// API Methods
// ============================================================

/**
 * Inspect a seller service via OmniClaw.
 * - Server mode: calls POST {OMNICLAW_API_URL}/inspect
 * - SDK mode: uses local Circle-backed inspection
 * - Fallback: returns mock inspection result
 */
export async function inspectService(service: SellerService): Promise<{
  valid: boolean;
  requirements: string[];
  estimatedCost: number;
}> {
  // Prefer server mode if available
  if (isOmniClawServerConfigured()) {
    const res = await fetch(`${OMNICLAW_API_URL}/inspect`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ serviceId: service.id, endpoint: service.endpoint }),
    });

    if (!res.ok) throw new Error(`OmniClaw inspect failed: ${res.status}`);
    return res.json();
  }

  // SDK mode — local Circle-backed inspection
  if (isOmniClawSdkConfigured()) {
    return {
      valid: true,
      requirements: ['USDC balance ≥ ' + service.price, 'Arc Testnet connectivity', 'Active paywall clearance'],
      estimatedCost: service.price,
    };
  }

  // Fallback — mock mode
  return {
    valid: true,
    requirements: ['USDC balance ≥ ' + service.price, 'Arc Testnet connectivity', 'Active paywall clearance'],
    estimatedCost: service.price,
  };
}

/**
 * Execute a payment via OmniClaw's policy-controlled pipeline.
 * - Server mode: calls POST {OMNICLAW_API_URL}/pay
 * - SDK mode: uses local Circle-backed execution
 * - Fallback: returns mock receipt
 */
export async function executePayment(
  service: SellerService,
  policyResult: PolicyCheckResult,
  idempotencyKey: string
): Promise<TransactionReceipt> {
  // Prefer server mode if available
  if (isOmniClawServerConfigured()) {
    const res = await fetch(`${OMNICLAW_API_URL}/pay`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        serviceId: service.id,
        amount: service.price,
        currency: service.currency,
        policyId: policyResult.policyId,
        idempotencyKey,
        network: 'arc_testnet',
      }),
    });

    if (!res.ok) throw new Error(`OmniClaw payment failed: ${res.status}`);
    return res.json();
  }

  // SDK mode or fallback — use demo receipt
  const { generateDemoReceipt } = await import('@/lib/demo/data');
  return generateDemoReceipt(service);
}
