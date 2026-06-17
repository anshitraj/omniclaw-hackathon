// ============================================================
// OmniClaw Console — Core Type Definitions
// ============================================================

// --- Transaction State Machine ---
export type TransactionState =
  | 'idle'
  | 'selected'
  | 'inspecting'
  | 'policy_checking'
  | 'wallet_ready'
  | 'paying'
  | 'settling'
  | 'confirmed'
  | 'fulfilled'
  | 'error';

export const TRANSACTION_STATES: TransactionState[] = [
  'idle',
  'selected',
  'policy_checking',
  'wallet_ready',
  'paying',
  'settling',
  'confirmed',
  'fulfilled',
];

export const STATE_LABELS: Record<TransactionState, string> = {
  idle: 'Idle',
  selected: 'Selected',
  inspecting: 'Inspecting',
  policy_checking: 'Policy Check',
  wallet_ready: 'Ready',
  paying: 'Executing Pay',
  settling: 'Settlement',
  confirmed: 'Confirmed',
  fulfilled: 'Fulfilled',
  error: 'Error',
};

// --- Agent ---
export interface Agent {
  id: string;
  name: string;
  objective: string;
  budgetCap: number | null;
  budgetUsed: number;
}

// --- Seller Service ---
export interface SellerService {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  endpointType: 'x402_paid' | 'standard_api' | 'webhook';
  fulfillmentState: 'available' | 'processing' | 'fulfilled' | 'unavailable';
  availability: 'online' | 'degraded' | 'offline';
  paywallStatus: 'active' | 'bypassed' | 'pending';
  endpoint: string;
  requestMethod: 'GET' | 'POST';
  requestBody?: string;
  category: string;
}

// --- Timeline Event ---
export type EventSource = 'system' | 'buyer' | 'seller' | 'policy' | 'settlement' | 'wallet';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  source: EventSource;
  title: string;
  description: string;
  state: TransactionState;
  metadata?: Record<string, string>;
  icon?: string;
}

export type DemoEvent = TimelineEvent;

// --- Policy Check Result ---
export interface PolicyCheckResult {
  approved: boolean;
  policyId: string;
  policyName: string;
  checks: PolicyCheck[];
  summary: string;
  timestamp: string;
  budgetRemaining: number;
}

export interface PolicyCheck {
  name: string;
  passed: boolean;
  reason: string;
  constraint?: string;
}

// --- Transaction Receipt ---
export interface TransactionReceipt {
  id: string;
  txHash: string;
  serviceId: string;
  serviceTitle: string;
  recipientEndpoint: string;
  amount: number;
  currency: string;
  network: string;
  route: string;
  status: 'pending' | 'confirmed' | 'failed' | 'simulated';
  timestamp: string;
  policyDecisionSummary: string;
  settlementMetadata: Record<string, string>;
  apiResponse?: unknown;
  payEnvelope?: Record<string, unknown>;
  blockNumber?: string;
  gasUsed?: string;
}

// --- Integration Health ---
export interface IntegrationHealth {
  omniclaw: OmniClawIntegrationStatus;
  ai: IntegrationStatus;
  buyerWalletAddress?: string | null;
  omniclawConfigured?: boolean;
  warnings?: string[];
}

/** Extended OmniClaw status with SDK/Server mode detail */
export interface OmniClawIntegrationStatus extends IntegrationStatus {
  sdkMode: boolean;
  serverMode: boolean;
  serverAuth: 'enabled' | 'disabled' | 'not_applicable';
}

export interface IntegrationStatus {
  name: string;
  state: 'configured' | 'partially_configured' | 'mock_mode' | 'unavailable';
  endpoint?: string;
  lastChecked: string;
  details?: string;
}

// --- App State ---
export interface AppState {
  mode: 'integration';
  transactionState: TransactionState;
  selectedService: SellerService | null;
  events: TimelineEvent[];
  agent: Agent;
  policyResult: PolicyCheckResult | null;
  receipt: TransactionReceipt | null;
  integrationHealth: IntegrationHealth;
  isRunning: boolean;
  error: string | null;
}

// --- AI Provider ---
export type AIProvider = 'featherless';

export interface AIReasoningResult {
  provider: AIProvider;
  reasoning: string;
  confidence: number;
  recommendation: string;
  timestamp: string;
}

// --- API Response Wrapper ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface WalletSummary {
  configured: boolean;
  connected: boolean;
  walletId: string | null;
  address: string | null;
  usdcBalance: number;
  gatewayBalance?: number;
  gatewayOnchainBalance?: number;
  budgetCap?: number | null;
  warnings?: string[];
  gatewayLedger?: {
    expectedNetwork: string;
    expectedDomain: number;
    expectedDomainBalance: string | null;
    balancesByDomain: Array<{ domain: number; balance: string; depositor: string }>;
    deposits: Array<{
      domain: number;
      status: string;
      amount: string;
      transactionHash?: string;
      blockTimestamp?: string;
      depositor: string;
    }>;
    pendingDepositsCount: number;
  } | null;
  sourceStatus?: {
    omniclawBalanceDetail: 'ok' | 'error';
    circleBalances: 'ok' | 'error' | 'not_configured';
    circleDeposits: 'ok' | 'error' | 'not_configured';
  };
  circleLedgerError?: string;
}

export interface LiveArchitectureHealth {
  buyerConfigured: boolean;
  sellerConfigured: boolean;
  buyerWalletAddress: string | null;
  sellerWalletAddress: string | null;
  buyerWalletId: string | null;
  sellerWalletId: string | null;
  buyerSellerDistinct: boolean;
  liveArchitectureValid: boolean;
  warnings: string[];
}

