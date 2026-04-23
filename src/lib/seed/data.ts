import type {
  Agent,
  SellerService,
  WalletStatus,
  IntegrationHealth,
  PolicyCheckResult,
} from '@/types';

export const SEED_AGENT: Agent = {
  id: 'agent_buyer_001',
  name: 'OmniClaw Buyer Agent',
  type: 'buyer',
  objective: 'Acquire market intelligence data via paid API endpoints',
  walletId: 'wallet_local_buyer',
  walletType: 'external',
  network: 'Arc Testnet',
  trustLevel: 'high',
  riskState: 'nominal',
  currentStep: 'awaiting_selection',
  budgetCap: null,
  budgetUsed: 0.0,
  allowedRecipients: ['svc_prime_scan', 'svc_risk_oracle', 'svc_settlement_kit'],
  policyStatus: 'active',
  noRawKeyExposure: true,
};

export const SERVICE_CATALOG: SellerService[] = [
  {
    id: 'svc_prime_scan',
    title: 'Multi Search',
    description:
      'Web search results across public sources for fast retrieval and summarization.',
    price: 0.01,
    currency: 'USDC',
    endpointType: 'x402_paid',
    fulfillmentState: 'available',
    availability: 'online',
    paywallStatus: 'active',
    endpoint: 'https://api.aisa.one/apis/v2/scholar/search/web?query=ai+agents&max_num_results=5',
    requestMethod: 'POST',
    category: 'Search',
  },
  {
    id: 'svc_risk_oracle',
    title: 'Twitter User Info',
    description:
      'Read Twitter profile intelligence for a target username through paid API access.',
    price: 0.01,
    currency: 'USDC',
    endpointType: 'x402_paid',
    fulfillmentState: 'available',
    availability: 'online',
    paywallStatus: 'active',
    endpoint: 'https://api.aisa.one/apis/v2/twitter/user/info?userName=jack',
    requestMethod: 'GET',
    category: 'Social',
  },
  {
    id: 'svc_settlement_kit',
    title: 'YouTube Search',
    description:
      'Search YouTube ranking results for a query including metadata and links.',
    price: 0.02,
    currency: 'USDC',
    endpointType: 'x402_paid',
    fulfillmentState: 'available',
    availability: 'online',
    paywallStatus: 'active',
    endpoint: 'https://api.aisa.one/apis/v2/youtube/search?engine=youtube&q=ai+agents&gl=us&hl=en',
    requestMethod: 'GET',
    category: 'Video',
  },
];

export const SEED_WALLET: WalletStatus = {
  id: 'wallet_local_buyer',
  type: 'external',
  address: '0x0000000000000000000000000000000000000000',
  network: 'Arc Testnet',
  balance: 0.0,
  currency: 'USDC',
  state: 'pending',
  configured: false,
  noRawKeyExposure: true,
};

export const SEED_INTEGRATION_HEALTH: IntegrationHealth = {
  omniclaw: {
    name: 'OmniClaw',
    state: 'partially_configured',
    sdkMode: false,
    serverMode: true,
    serverAuth: 'disabled',
    lastChecked: new Date().toISOString(),
    details: 'Configure OMNICLAW_API_TOKEN and run local OmniClaw server.',
  },
  arc: {
    name: 'Arc Testnet',
    state: 'mock_mode',
    lastChecked: new Date().toISOString(),
    details: 'Set ARC_RPC_URL for live Arc checks.',
  },
  ai: {
    name: 'AI Provider',
    state: 'mock_mode',
    lastChecked: new Date().toISOString(),
    details: 'Set FEATHERLESS_API_KEY for live AI calls.',
  },
  buyerWalletAddress: null,
  gatewayConfigured: false,
  activePaymentRail: 'gateway',
};

export function generatePolicyResult(service: SellerService): PolicyCheckResult {
  const budgetCapLabel = SEED_AGENT.budgetCap === null ? 'N/A' : SEED_AGENT.budgetCap.toFixed(2);
  const budgetRemaining = SEED_AGENT.budgetCap === null ? 0 : SEED_AGENT.budgetCap - service.price;

  return {
    approved: true,
    policyId: 'pol_fpe_001',
    policyName: 'Default Buyer Spend Policy',
    checks: [
      {
        name: 'Budget Cap Check',
        passed: true,
        reason:
          SEED_AGENT.budgetCap === null
            ? `${service.price} USDC requested, budget cap provided by OmniClaw policy at runtime`
            : `${service.price} USDC within ${budgetCapLabel} USDC budget cap`,
        constraint:
          SEED_AGENT.budgetCap === null ? 'Runtime policy cap (OmniClaw wallets endpoint)' : `<= ${budgetCapLabel} USDC per session`,
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
        reason: 'EOA signer with no private key exposure in UI',
        constraint: 'Zero key exposure policy',
      },
    ],
    summary: 'All policy checks passed. Transaction authorized.',
    timestamp: new Date().toISOString(),
    budgetRemaining,
  };
}
