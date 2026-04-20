export type DemoState = 'idle' | 'selected_service' | 'inspecting' | 'policy_check' | 'approved' | 'settling' | 'confirmed' | 'fulfilled';

export interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'active' | 'executing';
  objective: string;
  spendCap: number;
  walletBalance: number;
  network: string;
  policyState: 'enforced' | 'checking' | 'approved';
  currentAction: string;
}

export interface SellerService {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  endpoint: string;
  status: 'available' | 'locked' | 'unlocked' | 'selected' | 'processing';
}

export interface DemoEvent {
  id: string;
  timestamp: string;
  type: 'buyer' | 'seller' | 'system' | 'policy' | 'settlement' | 'success';
  actor: string;
  message: string;
  detail?: string;
}

export interface PolicyCheck {
  id: string;
  label: string;
  status: 'pending' | 'checking' | 'passed' | 'failed';
}

export interface TransactionState {
  hash: string | null;
  recipient: string;
  amount: number;
  network: string;
  rail: string;
  status: 'pending' | 'submitted' | 'confirmed';
  policyOutcome: string;
  metadata: Record<string, string>;
}

export interface TimelineStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
}
