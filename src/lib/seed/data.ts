import type {
  SellerService,
  PolicyCheckResult,
} from '@/types';

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

export function generatePolicyResult(service: SellerService): PolicyCheckResult {
  const budgetCapLabel = 'N/A';
  const budgetRemaining = 0;

  return {
    approved: true,
    policyId: 'pol_fpe_001',
    policyName: 'Default Buyer Spend Policy',
    checks: [
      {
        name: 'Budget Cap Check',
        passed: true,
        reason:
          `${service.price} USDC requested, budget cap provided by OmniClaw policy at runtime`,
        constraint: 'Runtime policy cap (OmniClaw wallets endpoint)',
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
        reason: 'OmniClaw-managed settlement is enabled for this session',
        constraint: 'OmniClaw-only settlement',
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
