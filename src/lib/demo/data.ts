// ============================================================
// OmniClaw Console - Demo / Mock Data
// ============================================================

import type {
  Agent,
  SellerService,
  WalletStatus,
  IntegrationHealth,
  DemoEvent,
  PolicyCheckResult,
  TransactionReceipt,
} from '@/types';

export const DEMO_AGENT: Agent = {
  id: 'agent_buyer_001',
  name: 'OmniClaw Buyer Agent',
  type: 'buyer',
  objective: 'Acquire market intelligence data via paid API endpoints',
  walletId: 'wallet_circle_0xAcD3...f91E',
  walletType: 'circle_programmable',
  network: 'Arc Testnet',
  trustLevel: 'high',
  riskState: 'nominal',
  currentStep: 'awaiting_selection',
  budgetCap: 10.0,
  budgetUsed: 0.0,
  allowedRecipients: ['vendor_prime_analytics', 'vendor_risk_oracle', 'vendor_settlement_kit'],
  policyStatus: 'active',
  noRawKeyExposure: true,
};

export const DEMO_SERVICES: SellerService[] = [
  {
    id: 'svc_prime_scan',
    title: 'Prime Market Scan',
    description: 'Real-time aggregated market intelligence from 40+ exchanges with sentiment overlay and anomaly detection.',
    price: 0.25,
    currency: 'USDC',
    endpointType: 'x402_paid',
    fulfillmentState: 'available',
    availability: 'online',
    paywallStatus: 'active',
    endpoint: '/api/vendor/prime-scan',
    category: 'Market Data',
  },
  {
    id: 'svc_risk_oracle',
    title: 'Risk Oracle Brief',
    description: 'Counterparty risk assessment with on-chain behavioral scoring and protocol exposure analysis.',
    price: 0.15,
    currency: 'USDC',
    endpointType: 'x402_paid',
    fulfillmentState: 'available',
    availability: 'online',
    paywallStatus: 'active',
    endpoint: '/api/vendor/risk-oracle',
    category: 'Risk Intelligence',
  },
  {
    id: 'svc_settlement_kit',
    title: 'Settlement Receipt Kit',
    description: 'Verifiable settlement proofs with ArcScan integration, cross-chain attestation, and compliance metadata.',
    price: 0.1,
    currency: 'USDC',
    endpointType: 'standard_api',
    fulfillmentState: 'available',
    availability: 'online',
    paywallStatus: 'active',
    endpoint: '/api/vendor/settlement-kit',
    category: 'Settlement',
  },
];

export const DEMO_WALLET: WalletStatus = {
  id: 'wallet_circle_0xAcD3...f91E',
  type: 'circle_programmable',
  address: '0xAcD3e7F4b2C1d8A9E6f0B3c5D7a1F4e2C8b9f91E',
  network: 'Arc Testnet',
  balance: 10.0,
  currency: 'USDC',
  state: 'ready',
  configured: true,
  noRawKeyExposure: true,
};

const circleConfigured = process.env.NEXT_PUBLIC_CIRCLE_CONFIGURED === 'true';

export const DEMO_INTEGRATION_HEALTH: IntegrationHealth = {
  omniclaw: {
    name: 'OmniClaw',
    state: circleConfigured ? 'configured' : 'mock_mode',
    sdkMode: circleConfigured,
    serverMode: false,
    serverAuth: 'not_applicable',
    lastChecked: new Date().toISOString(),
    details: circleConfigured
      ? 'SDK mode active (Circle-backed).'
      : 'Running in demo mode. Set CIRCLE_API_KEY for SDK mode.',
  },
  circle: {
    name: 'Circle Wallets',
    state: circleConfigured ? 'configured' : 'mock_mode',
    lastChecked: new Date().toISOString(),
    details: circleConfigured
      ? 'Connected to Circle API'
      : 'Running in demo mode. Configure CIRCLE_API_KEY to connect.',
  },
  arc: {
    name: 'Arc Testnet',
    state: 'mock_mode',
    lastChecked: new Date().toISOString(),
    details: 'Using simulated settlement. Configure ARC_RPC_URL for live testnet.',
  },
  ai: {
    name: 'AI Provider',
    state: 'mock_mode',
    lastChecked: new Date().toISOString(),
    details: 'No AI provider configured. Set GEMINI_API_KEY, FEATHERLESS_API_KEY, or AIMLAPI_API_KEY.',
  },
  gatewayConfigured: false,
  directTransferConfigured: circleConfigured,
  activePaymentRail: 'demo',
};

export function generateDemoEvents(service: SellerService): DemoEvent[] {
  const now = Date.now();
  const ts = (offset: number) => new Date(now + offset).toISOString();

  return [
    {
      id: 'evt_001',
      timestamp: ts(0),
      source: 'buyer',
      title: 'Buyer Service Selected',
      description: `Buyer agent selected "${service.title}" for acquisition.`,
      state: 'selected',
      metadata: { serviceId: service.id, price: `${service.price} ${service.currency}` },
    },
    {
      id: 'evt_002',
      timestamp: ts(1800),
      source: 'system',
      title: 'OmniClaw Inspection',
      description: 'OmniClaw inspects service requirements, endpoint validity, and paywall status.',
      state: 'inspecting',
      metadata: { endpoint: service.endpoint, paywall: service.paywallStatus },
    },
    {
      id: 'evt_003',
      timestamp: ts(3000),
      source: 'policy',
      title: 'Policy Engine Check',
      description: 'Financial Policy Engine validates spend constraints, recipient allowlist, and budget cap.',
      state: 'policy_checking',
      metadata: { policyEngine: 'OmniClaw FPE v1.0' },
    },
    {
      id: 'evt_004',
      timestamp: ts(4200),
      source: 'policy',
      title: 'Policy Approved',
      description: 'All spend constraints satisfied. Transaction approved by policy engine.',
      state: 'approved',
      metadata: { decision: 'APPROVED', budgetRemaining: '9.75 USDC' },
    },
    {
      id: 'evt_005',
      timestamp: ts(5000),
      source: 'wallet',
      title: 'Buyer Gateway Balance Verified',
      description: 'Buyer Gateway balance verified and spend authorization established for programmable per-action settlement.',
      state: 'wallet_ready',
      metadata: { fundingSource: 'Circle Gateway', keyExposure: 'none' },
    },
    {
      id: 'evt_006',
      timestamp: ts(6000),
      source: 'system',
      title: 'Gateway / Nanopayment Rail Selected',
      description: 'Circle Gateway Rail selected as the primary nanopayment settlement path.',
      state: 'routing',
      metadata: { rail: 'gateway', settlementPath: 'nanopayment' },
    },
    {
      id: 'evt_007',
      timestamp: ts(6900),
      source: 'seller',
      title: 'Seller Payout Route Prepared',
      description: 'Seller payout route prepared through Gateway-side balance flow.',
      state: 'routing',
      metadata: { sellerPath: 'gateway_payout' },
    },
    {
      id: 'evt_008',
      timestamp: ts(7500),
      source: 'settlement',
      title: 'Settlement Submitted on Arc',
      description: 'Settlement submitted to Arc Testnet for confirmation and proof.',
      state: 'settling',
      metadata: { network: 'Arc Testnet', txHash: '0x7a3f...pending' },
    },
    {
      id: 'evt_009',
      timestamp: ts(9500),
      source: 'settlement',
      title: 'Seller Balance Credited',
      description: 'Settlement confirmed and seller Gateway balance updated.',
      state: 'confirmed',
      metadata: {
        txHash: '0x7a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
        blockNumber: '1284573',
      },
    },
    {
      id: 'evt_010',
      timestamp: ts(10500),
      source: 'seller',
      title: 'Fulfillment Unlocked',
      description: `"${service.title}" data payload delivered. Service fulfilled successfully.`,
      state: 'fulfilled',
      metadata: { fulfillmentId: `ful_${service.id}` },
    },
  ];
}

export function generateDemoPolicyResult(service: SellerService): PolicyCheckResult {
  return {
    approved: true,
    policyId: 'pol_fpe_001',
    policyName: 'Default Buyer Spend Policy',
    checks: [
      {
        name: 'Budget Cap Check',
        passed: true,
        reason: `${service.price} USDC within 10.00 USDC budget cap`,
        constraint: '<= 10.00 USDC per session',
      },
      {
        name: 'Recipient Allowlist',
        passed: true,
        reason: `Service "${service.id}" is on the approved vendor list`,
        constraint: 'Allowlisted vendors only',
      },
      {
        name: 'Network Restriction',
        passed: true,
        reason: 'Arc Testnet is an approved settlement network',
        constraint: 'Arc Testnet only',
      },
      {
        name: 'Per-Transaction Limit',
        passed: true,
        reason: `${service.price} USDC below 5.00 USDC per-tx limit`,
        constraint: '<= 5.00 USDC per transaction',
      },
      {
        name: 'No Raw Key Exposure',
        passed: true,
        reason: 'Circle programmable wallet - no private key exposure',
        constraint: 'Zero key exposure policy',
      },
    ],
    summary: 'All 5 policy checks passed. Transaction authorized.',
    timestamp: new Date().toISOString(),
    budgetRemaining: 10.0 - service.price,
  };
}

export function generateDemoReceipt(service: SellerService): TransactionReceipt {
  const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const txHash = `0x${randomHex}`;

  return {
    id: `rcpt_${Date.now()}`,
    txHash,
    serviceId: service.id,
    serviceTitle: service.title,
    recipientEndpoint: service.endpoint,
    amount: service.price,
    currency: 'USDC',
    network: 'Arc Testnet',
    route: 'Circle Gateway Rail',
    status: 'simulated',
    proofLink: null,
    arcScanUrl: null,
    isDemoTx: true,
    timestamp: new Date().toISOString(),
    policyDecisionSummary: 'All 5 policy checks passed. Buyer agent authorized under OmniClaw FPE v1.0.',
    settlementMetadata: {
      paymentRail: 'gateway',
      buyerFundingSource: 'Circle Gateway',
      sellerSettlementDestination: 'Gateway balance / payout route',
      settlementLayer: 'Arc Testnet (Demo)',
      valueLayer: 'USDC',
      legacyDirectTransfer: 'false',
      blockNumber: 'simulated',
      gasUsed: '21000',
      confirmations: 'simulated',
      facilitator: 'Circle Gateway Rail',
      mode: 'demo - fund wallet for real tx',
    },
    blockNumber: 'simulated',
    gasUsed: '21000',
    fromAddress: '0xBuyerDemo00000000000000000000000000000001',
    toAddress: '0xSellerDemo0000000000000000000000000000001',
    senderLabel: 'Buyer Gateway Balance',
    recipientLabel: 'Seller Gateway Balance',
    direction: 'sent',
    liveArchitectureValid: false,
    architectureWarning: 'Demo mode uses simulated wallets. Configure separate buyer and seller wallets for live commerce.',
  };
}
