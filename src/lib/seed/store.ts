import type {
  AppState,
  TransactionState,
  SellerService,
  TimelineEvent,
  PolicyCheckResult,
  TransactionReceipt,
  IntegrationHealth,
} from '@/types';

const DEFAULT_AGENT: AppState['agent'] = {
  id: 'agent_buyer_001',
  name: 'OmniClaw Buyer Agent',
  objective: 'Acquire market intelligence data via paid API endpoints',
  budgetCap: null,
  budgetUsed: 0,
};

const DEFAULT_HEALTH: IntegrationHealth = {
  omniclaw: {
    name: 'OmniClaw',
    state: 'partially_configured',
    sdkMode: false,
    serverMode: true,
    serverAuth: 'disabled',
    lastChecked: new Date().toISOString(),
    details: 'Configure OMNICLAW_API_TOKEN and run local OmniClaw server.',
  },
  ai: {
    name: 'AI Provider',
    state: 'mock_mode',
    lastChecked: new Date().toISOString(),
    details: 'Set FEATHERLESS_API_KEY for live AI calls.',
  },
  buyerWalletAddress: null,
  omniclawConfigured: false,
};

export function createInitialState(existingHealth?: IntegrationHealth): AppState {
  const health = existingHealth ?? { ...DEFAULT_HEALTH };
  return {
    mode: 'integration',
    transactionState: 'idle',
    selectedService: null,
    events: [],
    agent: { ...DEFAULT_AGENT },
    policyResult: null,
    receipt: null,
    integrationHealth: health,
    isRunning: false,
    error: null,
  };
}

export type AppAction =
  | { type: 'SELECT_SERVICE'; service: SellerService }
  | { type: 'ADD_EVENT'; event: TimelineEvent }
  | { type: 'SET_STATE'; state: TransactionState }
  | { type: 'SET_POLICY_RESULT'; result: PolicyCheckResult }
  | { type: 'SET_RECEIPT'; receipt: TransactionReceipt }
  | { type: 'SET_AGENT_BUDGET_CAP'; budgetCap: number | null }
  | { type: 'SET_RUNNING'; running: boolean }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'UPDATE_HEALTH'; health: IntegrationHealth }
  | { type: 'RESET' };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_SERVICE':
      return {
        ...state,
        selectedService: action.service,
        transactionState: 'selected',
        error: null,
      };

    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.event] };

    case 'SET_STATE':
      return {
        ...state,
        transactionState: action.state,
      };

    case 'SET_POLICY_RESULT':
      return { ...state, policyResult: action.result };

    case 'SET_RECEIPT':
      return {
        ...state,
        receipt: action.receipt,
        agent: {
          ...state.agent,
          budgetUsed: state.agent.budgetUsed + (action.receipt.amount || 0),
        },
      };

    case 'SET_AGENT_BUDGET_CAP':
      return {
        ...state,
        agent: {
          ...state.agent,
          budgetCap: action.budgetCap,
        },
      };

    case 'SET_RUNNING':
      return { ...state, isRunning: action.running };

    case 'SET_ERROR':
      return { ...state, transactionState: 'error', error: action.error, isRunning: false };

    case 'UPDATE_HEALTH':
      return {
        ...state,
        integrationHealth: action.health,
        mode: 'integration',
      };

    case 'RESET':
      return createInitialState(state.integrationHealth);

    default:
      return state;
  }
}
