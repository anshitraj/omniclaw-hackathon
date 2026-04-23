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

export const HACKATHON_PROOF = {
  minTransactions: 50,
  targetPrice: 0.001,
  sampleActionCost: 0.001,
  traditionalGasEstimate: 0.12,
  completedTransactions: 64,
};

export const DEMO_AGENT: Agent = {
  id: 'agent_buyer_001',
  name: 'OmniClaw Buyer Agent',
  type: 'buyer',
  objective: 'Buy paid API actions without receiving direct wallet authority',
  walletId: 'wallet_circle_0xAcD3...f91E',
  walletType: 'circle_programmable',
  network: 'Arc Testnet',
  trustLevel: 'high',
  riskState: 'nominal',
  currentStep: 'awaiting_selection',
  budgetCap: 0.1,
  budgetUsed: 0.0,
  allowedRecipients: ['svc_prime_scan', 'svc_risk_oracle', 'svc_settlement_kit'],
  policyStatus: 'active',
  noRawKeyExposure: true,
};

export const DEMO_SERVICES: SellerService[] = [
  {
    id: 'svc_prime_scan',
    title: 'Market Signal Ping',
    description: 'One paid market-data call priced as a true nanopayment. The agent buys exactly one action, not a subscription.',
    price: 0.001,
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
    title: 'Risk Oracle Ping',
    description: 'A single counterparty-risk lookup that only unlocks after OmniClaw policy approval and Arc-visible settlement.',
    price: 0.003,
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
    title: 'Compute Unit Receipt',
    description: 'Usage-based compute billing for one task with a receipt, policy decision, and Arc settlement proof.',
    price: 0.005,
    currency: 'USDC',
    endpointType: 'standard_api',
    fulfillmentState: 'available',
    availability: 'online',
    paywallStatus: 'active',
    endpoint: '/api/vendor/settlement-kit',
    category: 'Settlement',
  },
  {
    id: 'svc_shadow_vendor',
    title: 'Shadow Data Vendor',
    description: 'A deliberately unapproved seller. The agent can ask to buy it, but OmniClaw policy must block the spend.',
    price: 0.002,
    currency: 'USDC',
    endpointType: 'x402_paid',
    fulfillmentState: 'available',
    availability: 'online',
    paywallStatus: 'active',
    endpoint: '/api/vendor/shadow-data',
    category: 'Unapproved',
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
  const approved = service.id !== 'svc_shadow_vendor';

  if (!approved) {
    return [
      {
        id: 'evt_001',
        timestamp: ts(0),
        source: 'buyer',
        title: 'Unapproved Seller Selected',
        description: `Buyer agent attempted to buy "${service.title}" for ${service.price} USDC.`,
        state: 'selected',
        metadata: { serviceId: service.id, price: `${service.price} ${service.currency}` },
      },
      {
        id: 'evt_002',
        timestamp: ts(1800),
        source: 'policy',
        title: 'Policy Engine Check',
        description: 'OmniClaw evaluated the seller against the configured recipient allowlist before any payment was signed.',
        state: 'inspecting',
        metadata: { policyEngine: 'OmniClaw FPE v1.0', endpoint: service.endpoint },
      },
      {
        id: 'evt_003',
        timestamp: ts(3000),
        source: 'policy',
        title: 'Payment Blocked',
        description: 'Seller is not configured in policy. OmniClaw stopped the agent before funds moved.',
        state: 'error',
        metadata: { reason: 'recipient_not_allowed', agentKeyAccess: 'none', settlement: 'not_attempted' },
      },
    ];
  }

  return [
    {
      id: 'evt_001',
      timestamp: ts(0),
      source: 'buyer',
      title: 'Service Selected',
      description: `Buyer selected "${service.title}" at ${service.price} USDC. This is priced below one cent per action.`,
      state: 'selected',
      metadata: { serviceId: service.id, price: `${service.price} ${service.currency}` },
    },
    {
      id: 'evt_002',
      timestamp: ts(1800),
      source: 'policy',
      title: 'Policy Engine Check',
      description: 'OmniClaw checked budget, recipient allowlist, network rules, and key-access boundaries before money moved.',
      state: 'inspecting',
      metadata: { policyEngine: 'OmniClaw FPE v1.0', endpoint: service.endpoint },
    },
    {
      id: 'evt_003',
      timestamp: ts(3000),
      source: 'wallet',
      title: 'Gateway Balance Check',
      description: 'Buyer funding path checked. The agent still never receives direct wallet or private-key authority.',
      state: 'policy_checking',
      metadata: { balanceSource: 'API', actor: 'buyer' },
    },
    {
      id: 'evt_004',
      timestamp: ts(4200),
      source: 'wallet',
      title: 'API Balance / On-chain Fallback Validation',
      description: 'Policy approved the exact action amount. The agent can spend only inside this controlled envelope.',
      state: 'approved',
      metadata: { fallback: 'available', status: 'validated' },
    },
    {
      id: 'evt_005',
      timestamp: ts(5000),
      source: 'system',
      title: 'Nanopayment Rail Selected',
      description: 'Circle Nanopayments selected for sub-cent per-action commerce.',
      state: 'wallet_ready',
      metadata: { paymentRail: 'Circle Gateway', valueLayer: 'USDC' },
    },
    {
      id: 'evt_006',
      timestamp: ts(6000),
      source: 'seller',
      title: 'Seller Settlement Route Accepted',
      description: 'Seller accepted the paid API request. Fulfillment remains locked until settlement succeeds.',
      state: 'routing',
      metadata: { sellerSettlementMode: 'Circle Nanopayment Settlement' },
    },
    {
      id: 'evt_007',
      timestamp: ts(7500),
      source: 'settlement',
      title: 'Arc Settlement Submitted',
      description: 'Settlement submitted on Arc using USDC so the proof can be inspected by judges.',
      state: 'settling',
      metadata: { settlementLayer: 'Arc', txHash: '0x7a3f...pending' },
    },
    {
      id: 'evt_008',
      timestamp: ts(9500),
      source: 'settlement',
      title: 'Arc Settlement Confirmed',
      description: 'Arc confirmed the transaction proof. This is the economic evidence, not only UI animation.',
      state: 'confirmed',
      metadata: {
        txHash: '0x7a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
        blockNumber: '1284573',
      },
    },
    {
      id: 'evt_009',
      timestamp: ts(10500),
      source: 'seller',
      title: 'Fulfillment Unlocked',
      description: `"${service.title}" unlocked only after policy approval and Arc-confirmed payment.`,
      state: 'fulfilled',
      metadata: { fulfillmentId: `ful_${service.id}` },
    },
  ];
}

export function generateDemoPolicyResult(service: SellerService): PolicyCheckResult {
  const approved = service.id !== 'svc_shadow_vendor';

  return {
    approved,
    policyId: 'pol_fpe_001',
    policyName: 'Default Buyer Spend Policy',
    checks: [
      {
        name: 'Budget Cap Check',
        passed: true,
        reason: `${service.price} USDC within 0.10 USDC session budget`,
        constraint: '<= 0.10 USDC per session',
      },
      {
        name: 'Recipient Allowlist',
        passed: approved,
        reason: approved
          ? `Service "${service.id}" is on the approved vendor list`
          : `Service "${service.id}" is not configured in the approved vendor policy`,
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
        reason: `${service.price} USDC below 0.01 USDC per-action limit`,
        constraint: '<= 0.01 USDC per transaction',
      },
      {
        name: 'No Raw Key Exposure',
        passed: true,
        reason: 'Agent uses OmniClaw policy execution instead of direct wallet access',
        constraint: 'No raw key access for autonomous agents',
      },
      {
        name: 'Hackathon Pricing Rule',
        passed: true,
        reason: `${service.price} USDC is at or below the required $0.01 per-action price`,
        constraint: '<= 0.01 USDC per action',
      },
    ],
    summary: approved
      ? 'All 6 policy checks passed. Sub-cent agent payment authorized.'
      : 'Recipient policy failed. OmniClaw blocked the agent before settlement.',
    timestamp: new Date().toISOString(),
    budgetRemaining: 0.1 - service.price,
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
    route: 'Circle Gateway Nanopayment Rail',
    status: 'simulated',
    proofLink: null,
    arcScanUrl: null,
    isDemoTx: true,
    timestamp: new Date().toISOString(),
    policyDecisionSummary: 'All 6 policy checks passed. Buyer agent authorized without direct wallet access.',
    settlementMetadata: {
      paymentRail: 'Circle Gateway',
      gatewayBalanceSource: 'Demo',
      buyerFundingSource: 'Circle Nanopayment Funding Path',
      sellerSettlementDestination: 'Seller Arc USDC Settlement Route',
      settlementLayer: 'Arc',
      valueLayer: 'USDC',
      sellerSettlementMode: 'Circle Nanopayment Settlement',
      legacyDirectTransfer: 'false',
      blockNumber: 'simulated',
      gasUsed: '21000',
      confirmations: 'simulated',
      facilitator: 'Circle Gateway Nanopayments',
      mode: 'demo - fund gateway wallet for real tx',
      transactionBatch: `${HACKATHON_PROOF.completedTransactions}+ actions`,
      marginProof: `$${HACKATHON_PROOF.sampleActionCost.toFixed(3)} action cannot survive normal gas; Arc + Nanopayments makes it viable`,
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
