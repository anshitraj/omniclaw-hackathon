// ============================================================
// Demo State Store — Client-side state machine
// ============================================================

import type {
  DemoState,
  TransactionState,
  SellerService,
  DemoEvent,
  PolicyCheckResult,
  TransactionReceipt,
  IntegrationHealth,
} from '@/types';
import {
  DEMO_AGENT,
  DEMO_WALLET,
  DEMO_INTEGRATION_HEALTH,
  generateDemoEvents,
  generateDemoPolicyResult,
  generateDemoReceipt,
} from '@/lib/demo/data';

/**
 * Determine mode from integration health.
 * Mode is 'integration' if ANY real integration is configured.
 * Mode is 'demo' only when nothing is configured at all.
 */
function resolveMode(health: IntegrationHealth): 'demo' | 'integration' {
  const statuses = [health.omniclaw, health.circle, health.arc, health.ai];
  const anyConfigured = statuses.some(
    (s) => s.state === 'configured' || s.state === 'partially_configured'
  );
  return anyConfigured ? 'integration' : 'demo';
}

export function createInitialState(existingHealth?: IntegrationHealth): DemoState {
  const health = existingHealth ?? { ...DEMO_INTEGRATION_HEALTH };
  return {
    mode: resolveMode(health),
    transactionState: 'idle',
    selectedService: null,
    events: [],
    agent: { ...DEMO_AGENT },
    wallet: { ...DEMO_WALLET },
    policyResult: null,
    paymentIntent: null,
    receipt: null,
    integrationHealth: health,
    isRunning: false,
    error: null,
  };
}

export type DemoAction =
  | { type: 'SELECT_SERVICE'; service: SellerService }
  | { type: 'ADD_EVENT'; event: DemoEvent }
  | { type: 'SET_STATE'; state: TransactionState }
  | { type: 'SET_POLICY_RESULT'; result: PolicyCheckResult }
  | { type: 'SET_RECEIPT'; receipt: TransactionReceipt }
  | { type: 'SET_RUNNING'; running: boolean }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'UPDATE_HEALTH'; health: IntegrationHealth }
  | { type: 'RESET' };

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
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
      return {
        ...state,
        events: [...state.events, action.event],
      };

    case 'SET_STATE':
      return {
        ...state,
        transactionState: action.state,
        agent: { ...state.agent, currentStep: action.state },
      };

    case 'SET_POLICY_RESULT':
      return {
        ...state,
        policyResult: action.result,
      };

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

    case 'SET_RUNNING':
      return { ...state, isRunning: action.running };

    case 'SET_ERROR':
      return { ...state, transactionState: 'error', error: action.error, isRunning: false };

    case 'UPDATE_HEALTH':
      return {
        ...state,
        integrationHealth: action.health,
        mode: resolveMode(action.health),
      };

    case 'RESET':
      // Preserve the live integrationHealth so mode badge doesn't flicker back to DEMO
      return createInitialState(state.integrationHealth);

    default:
      return state;
  }
}

/**
 * Run the full demo sequence with staged events.
 * This powers the animated walkthrough.
 */
export async function runDemoSequence(
  service: SellerService,
  dispatch: (action: DemoAction) => void,
  delayMs: number = 1200
): Promise<void> {
  const events = generateDemoEvents(service);
  const policyResult = generateDemoPolicyResult(service);
  const receipt = generateDemoReceipt(service);

  dispatch({ type: 'SET_RUNNING', running: true });

  for (const event of events) {
    await new Promise((r) => setTimeout(r, delayMs));
    dispatch({ type: 'ADD_EVENT', event });
    dispatch({ type: 'SET_STATE', state: event.state });

    // Attach policy result at the right time
    if (event.state === 'approved') {
      dispatch({ type: 'SET_POLICY_RESULT', result: policyResult });
    }

    // Attach receipt at confirmed
    if (event.state === 'confirmed') {
      dispatch({ type: 'SET_RECEIPT', receipt });
    }
  }

  dispatch({ type: 'SET_RUNNING', running: false });
}
