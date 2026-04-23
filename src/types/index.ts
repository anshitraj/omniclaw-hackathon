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
  wallet_ready: 'Gateway Ready',
  paying: 'Executing Pay',
  settling: 'Arc Settlement',
  confirmed: 'Confirmed',
  fulfilled: 'Fulfilled',
  error: 'Error',
};

// --- Agent ---
export interface Agent {
  id: string;
  name: string;
  type: 'buyer' | 'seller';
  objective: string;
  walletId: string;
  walletType: 'circle_programmable' | 'circle_developer' | 'external';
  network: string;
  trustLevel: 'high' | 'medium' | 'low';
  riskState: 'nominal' | 'elevated' | 'critical';
  currentStep: string;
  budgetCap: number | null;
  budgetUsed: number;
  allowedRecipients: string[];
  policyStatus: 'active' | 'suspended' | 'unconfigured';
  noRawKeyExposure: boolean;
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

// --- Wallet Status ---
export interface WalletStatus {
  id: string;
  type: 'circle_programmable' | 'circle_developer' | 'external';
  address: string;
  network: string;
  balance: number;
  currency: string;
  state: 'ready' | 'pending' | 'locked' | 'error';
  configured: boolean;
  noRawKeyExposure: boolean;
}

// --- Payment Intent ---
export interface PaymentIntent {
  id: string;
  serviceId: string;
  amount: number;
  currency: string;
  network: string;
  route: 'gateway' | 'x402_exact' | 'vendor_payment' | 'direct' | 'legacy';
  recipientEndpoint: string;
  idempotencyKey: string;
  policyApproved: boolean;
  walletReady: boolean;
  state: TransactionState;
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
  proofLink: string | null;
  arcScanUrl: string | null;
  timestamp: string;
  policyDecisionSummary: string;
  settlementMetadata: Record<string, string>;
  apiResponse?: unknown;
  payEnvelope?: Record<string, unknown>;
  blockNumber?: string;
  gasUsed?: string;
  fromAddress?: string;
  toAddress?: string;
  senderLabel?: string;
  recipientLabel?: string;
  direction?: 'sent' | 'received';
}

// --- Integration Health ---
export interface IntegrationHealth {
  omniclaw: OmniClawIntegrationStatus;
  arc: IntegrationStatus;
  ai: IntegrationStatus;
  buyerWalletAddress?: string | null;
  gatewayConfigured?: boolean;
  activePaymentRail?: 'gateway' | 'direct';
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
  wallet: WalletStatus;
  policyResult: PolicyCheckResult | null;
  paymentIntent: PaymentIntent | null;
  receipt: TransactionReceipt | null;
  integrationHealth: IntegrationHealth;
  isRunning: boolean;
  error: string | null;
}

// --- AI Provider ---
export type AIProvider = 'featherless' | 'mock';

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

export type WalletActor = 'buyer' | 'seller';

export interface WalletBalance {
  symbol: string;
  amount: number;
  rawAmount: string;
  decimals?: number;
}

export interface WalletHistoryItem {
  id: string;
  txHash: string;
  token: string;
  amount: string;
  direction: 'sent' | 'received' | 'unknown';
  status: string;
  timestamp: string;
  explorerUrl: string | null;
}

export interface WalletSummary {
  actor: WalletActor;
  configured: boolean;
  connected: boolean;
  legacyMode: boolean;
  walletId: string | null;
  address: string | null;
  addressShort: string | null;
  blockchain: string;
  status: string;
  balances: Record<string, WalletBalance>;
  apiUsdcBalance?: number;
  onChainUsdcBalance?: number;
  usdcBalance: number;
  gatewayBalance?: number;
  gatewayOnchainBalance?: number;
  gatewayBalanceSource?: 'API' | 'On-chain Fallback' | 'Unavailable';
  gatewayBalanceSyncStatus?: 'in_sync' | 'api_lagging' | 'unavailable';
  recentTxCount: number;
  budgetCap?: number | null;
  lastUpdated: string;
  warnings?: string[];
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

