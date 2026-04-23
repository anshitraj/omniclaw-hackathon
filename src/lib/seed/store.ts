import type {
  AppState,
  TransactionState,
  SellerService,
  TimelineEvent,
  PolicyCheckResult,
  TransactionReceipt,
  IntegrationHealth,
} from '@/types';
import { SEED_AGENT, SEED_WALLET, SEED_INTEGRATION_HEALTH } from '@/lib/seed/data';

export function createInitialState(existingHealth?: IntegrationHealth): AppState {
  const health = existingHealth ?? { ...SEED_INTEGRATION_HEALTH };
  return {
    mode: 'integration',
    transactionState: 'idle',
    selectedService: null,
    events: [],
    agent: { ...SEED_AGENT },
    wallet: { ...SEED_WALLET },
    policyResult: null,
    paymentIntent: null,
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
        agent: { ...state.agent, currentStep: 'service_selected' },
        error: null,
      };

    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.event] };

    case 'SET_STATE':
      return {
        ...state,
        transactionState: action.state,
        agent: { ...state.agent, currentStep: action.state },
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
        wallet: {
          ...state.wallet,
          balance: state.wallet.balance - (action.receipt.amount || 0),
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
