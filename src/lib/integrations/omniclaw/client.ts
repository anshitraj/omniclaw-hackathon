import type { PolicyCheckResult, SellerService, TransactionReceipt } from '@/types';

const DEFAULT_OMNICLAW_API_URL = 'http://localhost:8080';
const OMNICLAW_API_URL = process.env.OMNICLAW_API_URL || DEFAULT_OMNICLAW_API_URL;
const OMNICLAW_API_TOKEN = process.env.OMNICLAW_API_TOKEN;
const CIRCLE_GATEWAY_API_KEY = process.env.CIRCLE_GATEWAY_API_KEY || process.env.CIRCLE_API_KEY;
const CIRCLE_GATEWAY_BASE_URL =
  process.env.CIRCLE_GATEWAY_BASE_URL || 'https://gateway-api-testnet.circle.com';

export function isOmniClawSdkConfigured(): boolean {
  return false;
}

export function isOmniClawServerConfigured(): boolean {
  return Boolean(OMNICLAW_API_URL);
}

export function isOmniClawServerAuthEnabled(): boolean {
  return Boolean(OMNICLAW_API_TOKEN);
}

export function isOmniClawConfigured(): boolean {
  return isOmniClawServerConfigured() && isOmniClawServerAuthEnabled();
}

export function getOmniClawMode(): 'sdk' | 'server' | 'both' | 'none' {
  return isOmniClawConfigured() ? 'server' : 'none';
}

export function getOmniClawIntegrationDetails() {
  return {
    sdkMode: false,
    serverMode: isOmniClawServerConfigured(),
    serverAuth: isOmniClawServerAuthEnabled(),
    baseUrl: OMNICLAW_API_URL,
    activeMode: getOmniClawMode(),
  };
}

function buildHeaders(): Record<string, string> {
  if (!OMNICLAW_API_TOKEN) {
    throw new Error('OMNICLAW_API_TOKEN is required for OmniClaw execution');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${OMNICLAW_API_TOKEN}`,
  };
}

async function postOmniClaw(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${OMNICLAW_API_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = typeof payload?.detail === 'string' ? payload.detail : JSON.stringify(payload);
    throw new Error(`${path} failed (${res.status}): ${detail}`);
  }
  return payload;
}

async function getOmniClaw(path: string) {
  const res = await fetch(`${OMNICLAW_API_URL}${path}`, {
    method: 'GET',
    headers: buildHeaders(),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = typeof payload?.detail === 'string' ? payload.detail : JSON.stringify(payload);
    throw new Error(`${path} failed (${res.status}): ${detail}`);
  }
  return payload;
}

export type OmniClawInspectResult = {
  valid: boolean;
  buyerReady: boolean;
  requirements: string[];
  estimatedCost: number;
  reason?: string;
};

export async function inspectService(service: SellerService): Promise<OmniClawInspectResult> {
  if (!isOmniClawConfigured()) {
    throw new Error('OmniClaw server mode is not configured (url + token required)');
  }

  const result = await postOmniClaw('/api/v1/x402/inspect', {
    url: service.endpoint,
    method: service.requestMethod,
  });

  const amount = Number(result?.selected_amount_usdc ?? service.price);
  const requiresPayment = Boolean(result?.requires_payment);
  const buyerReady = Boolean(result?.buyer_ready);
  const reason = typeof result?.reason === 'string' ? result.reason : undefined;

  return {
    valid: requiresPayment,
    buyerReady,
    estimatedCost: Number.isFinite(amount) ? amount : service.price,
    reason,
    requirements: [
      requiresPayment ? 'x402 payment required' : 'resource not paywalled',
      result?.selected_route ? `route: ${String(result.selected_route)}` : 'route: unknown',
      result?.selected_network ? `network: ${String(result.selected_network)}` : 'network: unknown',
      reason ? `reason: ${reason}` : 'reason: none',
    ],
  };
}

export type OmniClawBalanceDetail = {
  address: string | null;
  walletId: string | null;
  gatewayBalance: number;
  gatewayOnchainBalance: number;
  status: string;
  warnings: string[];
};

type CircleBalanceRow = {
  domain: number;
  depositor: string;
  balance: string;
};

type CircleDepositRow = {
  depositor: string;
  domain: number;
  transactionHash?: string;
  amount: string;
  status: string;
  blockTimestamp?: string;
};

export type OmniClawGatewayLedger = {
  expectedNetwork: string;
  expectedDomain: number;
  expectedDomainBalance: string | null;
  balancesByDomain: CircleBalanceRow[];
  deposits: CircleDepositRow[];
  pendingDepositsCount: number;
};

export type OmniClawGatewayLedgerSourceStatus = {
  omniclawBalanceDetail: 'ok' | 'error';
  circleBalances: 'ok' | 'error' | 'not_configured';
  circleDeposits: 'ok' | 'error' | 'not_configured';
};

function toFiniteNumber(value: unknown, fallback = 0): number {
  const parsed = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toSafeStatus(payStatus: unknown, hasOnchainTx: boolean): TransactionReceipt['status'] {
  const normalized = String(payStatus || '').trim().toLowerCase();
  if (
    normalized === 'confirmed' ||
    normalized === 'success' ||
    normalized === 'succeeded' ||
    normalized === 'complete' ||
    normalized === 'completed' ||
    normalized === 'paid' ||
    normalized === 'settled' ||
    normalized === 'finalized'
  ) {
    return 'confirmed';
  }
  if (normalized === 'failed' || normalized === 'error') {
    return 'failed';
  }
  return hasOnchainTx ? 'confirmed' : 'pending';
}

function toCaip2Network(value: string | undefined): string {
  if (!value) return 'eip155:5042002';
  if (value.includes(':')) return value;

  const normalized = value.trim().toUpperCase();
  const map: Record<string, string> = {
    'ARC-TESTNET': 'eip155:5042002',
    'ETH-SEPOLIA': 'eip155:11155111',
    ETHEREUM: 'eip155:1',
    BASE: 'eip155:8453',
    'BASE-SEPOLIA': 'eip155:84532',
    POLYGON: 'eip155:137',
    'POLYGON-AMOY': 'eip155:80002',
    OPTIMISM: 'eip155:10',
    ARBITRUM: 'eip155:42161',
    AVALANCHE: 'eip155:43114',
  };
  return map[normalized] || 'eip155:5042002';
}

function toCircleDomain(caip2Network: string): number {
  const map: Record<string, number> = {
    'eip155:1': 0,
    'eip155:11155111': 0,
    'eip155:43114': 1,
    'eip155:43113': 1,
    'eip155:10': 2,
    'eip155:11155420': 2,
    'eip155:42161': 3,
    'eip155:421614': 3,
    'eip155:8453': 6,
    'eip155:84532': 6,
    'eip155:137': 7,
    'eip155:80002': 7,
    'eip155:130': 10,
    'eip155:1301': 10,
    'eip155:146': 13,
    'eip155:14601': 13,
    'eip155:480': 14,
    'eip155:4801': 14,
    'eip155:32': 16,
    'eip155:1328': 16,
    'eip155:9649': 19,
    'eip155:998': 19,
    'eip155:5042002': 26,
  };
  return map[caip2Network] ?? 0;
}

async function postCircleGateway(path: string, body: Record<string, unknown>) {
  if (!CIRCLE_GATEWAY_API_KEY) {
    throw new Error('CIRCLE_GATEWAY_API_KEY is not configured');
  }
  const res = await fetch(`${CIRCLE_GATEWAY_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CIRCLE_GATEWAY_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = typeof payload?.message === 'string' ? payload.message : JSON.stringify(payload);
    throw new Error(`${path} failed (${res.status}): ${detail}`);
  }
  return payload;
}

function parseApiResponsePayload(responseData: unknown): unknown {
  if (typeof responseData !== 'string') {
    return responseData ?? null;
  }
  try {
    return JSON.parse(responseData);
  } catch {
    return { raw: responseData };
  }
}

function looksLikeTxHash(value: unknown): value is string {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{64}$/.test(value);
}

function extractTxHashFromUnknown(input: unknown, depth = 0): string | null {
  if (depth > 6 || input === null || input === undefined) {
    return null;
  }
  if (looksLikeTxHash(input)) {
    return input;
  }
  if (Array.isArray(input)) {
    for (const item of input) {
      const found = extractTxHashFromUnknown(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof input === 'object') {
    const record = input as Record<string, unknown>;
    const preferredKeys = [
      'blockchain_tx',
      'txHash',
      'transactionHash',
      'hash',
      'tx_hash',
      'settlement_tx_hash',
    ];
    for (const key of preferredKeys) {
      const candidate = record[key];
      if (looksLikeTxHash(candidate)) {
        return candidate;
      }
    }
    for (const value of Object.values(record)) {
      const found = extractTxHashFromUnknown(value, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

export async function getBalanceDetail(): Promise<OmniClawBalanceDetail> {
  if (!isOmniClawConfigured()) {
    throw new Error('OmniClaw server mode is not configured (url + token required)');
  }

  const payload = await getOmniClaw('/api/v1/balance-detail');
  const gatewayBalance = toFiniteNumber(payload?.gateway_balance, 0);
  const gatewayOnchainBalance = toFiniteNumber(payload?.gateway_onchain_balance, 0);
  const warnings: string[] = [];
  if (Math.abs(gatewayBalance - gatewayOnchainBalance) > 0.000001) {
    warnings.push('OmniClaw API ledger and on-chain available balance differ.');
  }

  return {
    address: payload?.eoa_address ?? null,
    walletId: payload?.wallet_id ?? null,
    gatewayBalance,
    gatewayOnchainBalance,
    status: 'connected',
    warnings,
  };
}

export async function getPolicyBudgetCap(): Promise<number | null> {
  if (!isOmniClawConfigured()) {
    return null;
  }

  const payload = await getOmniClaw('/api/v1/wallets');
  const wallets = Array.isArray(payload?.wallets) ? payload.wallets : [];
  if (wallets.length === 0) {
    return null;
  }

  const policy = wallets[0]?.policy;
  const alias = wallets[0]?.alias;
  const dailyMax = alias ? policy?.wallets?.[alias]?.limits?.daily_max : null;
  if (dailyMax === undefined || dailyMax === null) {
    return null;
  }

  const parsed = toFiniteNumber(dailyMax, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getGatewayLedgerData(
  detail: OmniClawBalanceDetail
): Promise<{
  gatewayLedger: OmniClawGatewayLedger | null;
  circleLedgerError?: string;
  sourceStatus: OmniClawGatewayLedgerSourceStatus;
}> {
  const sourceStatus: OmniClawGatewayLedgerSourceStatus = {
    omniclawBalanceDetail: detail.address ? 'ok' : 'error',
    circleBalances: CIRCLE_GATEWAY_API_KEY ? 'ok' : 'not_configured',
    circleDeposits: CIRCLE_GATEWAY_API_KEY ? 'ok' : 'not_configured',
  };

  if (!CIRCLE_GATEWAY_API_KEY) {
    return {
      gatewayLedger: null,
      circleLedgerError:
        'Circle Gateway API key is not configured. Set CIRCLE_GATEWAY_API_KEY (or CIRCLE_API_KEY).',
      sourceStatus,
    };
  }

  if (!detail.address) {
    sourceStatus.omniclawBalanceDetail = 'error';
    sourceStatus.circleBalances = 'error';
    sourceStatus.circleDeposits = 'error';
    return {
      gatewayLedger: null,
      circleLedgerError: 'Missing OmniClaw EOA address from /api/v1/balance-detail.',
      sourceStatus,
    };
  }

  const expectedNetwork = toCaip2Network(process.env.OMNICLAW_NETWORK);
  const expectedDomain = toCircleDomain(expectedNetwork);

  try {
    const [balancesPayload, depositsPayload] = await Promise.all([
      postCircleGateway('/v1/balances', {
        token: 'USDC',
        sources: [{ network: expectedNetwork, depositor: detail.address }],
      }),
      postCircleGateway('/v1/deposits', {
        token: 'USDC',
        sources: [{ depositor: detail.address, domain: expectedDomain }],
      }),
    ]);

    const balancesByDomain: CircleBalanceRow[] = Array.isArray(balancesPayload?.balances)
      ? balancesPayload.balances.map((row: unknown) => {
          const record = row as Record<string, unknown>;
          return {
            domain: toFiniteNumber(record?.domain, 0),
            depositor: String(record?.depositor || ''),
            balance: String(record?.balance || '0'),
          };
        })
      : [];

    const deposits: CircleDepositRow[] = Array.isArray(depositsPayload?.deposits)
      ? depositsPayload.deposits.map((row: unknown) => {
          const record = row as Record<string, unknown>;
          return {
            depositor: String(record?.depositor || ''),
            domain: toFiniteNumber(record?.domain, expectedDomain),
            transactionHash:
              typeof record?.transactionHash === 'string' ? record.transactionHash : undefined,
            amount: String(record?.amount || '0'),
            status: String(record?.status || ''),
            blockTimestamp:
              typeof record?.blockTimestamp === 'string' ? record.blockTimestamp : undefined,
          };
        })
      : [];

    const expectedDomainBalance =
      balancesByDomain.find((row) => row.domain === expectedDomain)?.balance ?? null;
    const pendingDepositsCount = deposits.filter(
      (row) => row.status.trim().toLowerCase() === 'pending'
    ).length;

    return {
      gatewayLedger: {
        expectedNetwork,
        expectedDomain,
        expectedDomainBalance,
        balancesByDomain,
        deposits,
        pendingDepositsCount,
      },
      sourceStatus,
    };
  } catch (error) {
    sourceStatus.circleBalances = 'error';
    sourceStatus.circleDeposits = 'error';
    return {
      gatewayLedger: {
        expectedNetwork,
        expectedDomain,
        expectedDomainBalance: null,
        balancesByDomain: [],
        deposits: [],
        pendingDepositsCount: 0,
      },
      circleLedgerError: String(error),
      sourceStatus,
    };
  }
}

export async function executePayment(
  service: SellerService,
  _policyResult: PolicyCheckResult,
  idempotencyKey: string,
  inspectEstimatedCost?: number
): Promise<TransactionReceipt> {
  if (!isOmniClawConfigured()) {
    throw new Error('OmniClaw server mode is not configured (url + token required)');
  }

  const payResult = await postOmniClaw('/api/v1/pay', {
    recipient: service.endpoint,
    method: service.requestMethod,
    body: service.requestBody,
    idempotency_key: idempotencyKey,
  });

  if (!payResult?.success) {
    throw new Error(payResult?.error || 'OmniClaw pay returned unsuccessful response');
  }

  const apiResponse = parseApiResponsePayload(payResult.response_data);
  const detectedTxHash =
    extractTxHashFromUnknown(payResult) || extractTxHashFromUnknown(apiResponse);
  const txHash: string = detectedTxHash || payResult.transaction_id || `pending:${idempotencyKey}`;
  const hasOnchainTx = looksLikeTxHash(detectedTxHash);
  const paymentMethod = String(payResult.method || 'x402');
  const mappedAmount = toFiniteNumber(payResult.amount, Number.NaN);
  const selectedAmount = toFiniteNumber(payResult.selected_amount_usdc, Number.NaN);
  const amount = Number.isFinite(mappedAmount) && mappedAmount > 0
    ? mappedAmount
    : Number.isFinite(selectedAmount)
      ? selectedAmount
      : typeof inspectEstimatedCost === 'number' && Number.isFinite(inspectEstimatedCost)
        ? inspectEstimatedCost
      : service.price;
  const status = toSafeStatus(payResult.status, hasOnchainTx);

  return {
    id: `rcpt_${Date.now()}`,
    txHash,
    serviceId: service.id,
    serviceTitle: service.title,
    recipientEndpoint: service.endpoint,
    amount,
    currency: service.currency,
    network: 'OmniClaw',
    route: 'OmniClaw Buyer x402',
    status,
    timestamp: new Date().toISOString(),
    policyDecisionSummary: 'OmniClaw policy checks passed and payment executed.',
    settlementMetadata: {
      paymentRail: 'OmniClaw x402',
      method: paymentMethod,
      transactionId: String(payResult.transaction_id || ''),
      status: String(payResult.status || ''),
      requiresConfirmation: String(Boolean(payResult.requires_confirmation)),
    },
    apiResponse,
    payEnvelope: payResult,
  };
}
