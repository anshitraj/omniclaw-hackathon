import { Agent, DemoEvent, PolicyCheck, SellerService, TimelineStep, TransactionState } from '../types';

export const initialBuyerAgent: Agent = {
  id: 'agent-nexus-7',
  name: 'Nexus-7',
  status: 'idle',
  objective: 'Market Intelligence Gathering',
  spendCap: 2.50,
  walletBalance: 5.00,
  network: 'Arc Testnet',
  policyState: 'enforced',
  currentAction: 'Awaiting instruction'
};

export const initialSellerServices: SellerService[] = [
  {
    id: 'svc-prime-scan',
    name: 'Prime Market Scan',
    description: 'Deep liquidity analysis and price discovery across 5 top dexes.',
    price: 0.25,
    currency: 'USDC',
    endpoint: 'prime.oracle.arc/scan',
    status: 'available'
  },
  {
    id: 'svc-risk-brief',
    name: 'Risk Oracle Brief',
    description: 'Real-time smart contract vulnerability assessment.',
    price: 0.15,
    currency: 'USDC',
    endpoint: 'risk.oracle.arc/brief',
    status: 'available'
  },
  {
    id: 'svc-settlement-kit',
    name: 'Settlement Receipt Kit',
    description: 'Cryptographic proof generation for cross-chain actions.',
    price: 0.10,
    currency: 'USDC',
    endpoint: 'settle.oracle.arc/kit',
    status: 'available'
  }
];

export const initialEvents: DemoEvent[] = [];

export const initialTimelineSteps: TimelineStep[] = [
  { id: 'step-1', label: 'Intent Created', status: 'pending' },
  { id: 'step-2', label: 'Policy Checked', status: 'pending' },
  { id: 'step-3', label: 'Recipient Verified', status: 'pending' },
  { id: 'step-4', label: 'Payment Route Selected', status: 'pending' },
  { id: 'step-5', label: 'Arc Settlement Submitted', status: 'pending' },
  { id: 'step-6', label: 'Confirmed', status: 'pending' },
  { id: 'step-7', label: 'Fulfilled', status: 'pending' }
];

export const initialPolicyChecks: PolicyCheck[] = [
  { id: 'check-1', label: 'Spend Cap Limit', status: 'pending' },
  { id: 'check-2', label: 'Recipient Whitelist', status: 'pending' },
  { id: 'check-3', label: 'Network Constraint', status: 'pending' },
  { id: 'check-4', label: 'Rate Limit Window', status: 'pending' }
];

export const initialTransactionState: TransactionState = {
  hash: null,
  recipient: 'prime.oracle.arc/scan',
  amount: 0.25,
  network: 'Arc Testnet',
  rail: 'x402 Exact',
  status: 'pending',
  policyOutcome: 'Pending checks',
  metadata: {}
};
