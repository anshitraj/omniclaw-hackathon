export type PaymentRailMode = 'gateway' | 'direct' | 'demo';

export interface PaymentExecutionInput {
  serviceId: string;
  serviceTitle: string;
  serviceEndpoint: string;
  amount: number;
  currency: string;
}

export interface PaymentExecutionResult {
  rail: PaymentRailMode;
  txHash: string;
  blockNumber: string;
  gasUsed: string;
  isPending: boolean;
  isDemo: boolean;
  legacyDirectTransfer: boolean;
  buyerFundingSource: string;
  sellerSettlementDestination: string;
  gatewayBalanceSource: 'API' | 'On-chain Fallback' | 'Demo';
  sellerSettlementMode: 'Gateway Batch Settlement' | 'Legacy Direct Mode' | 'Demo Settlement';
}

export interface PaymentRuntimeContext {
  liveMode: boolean;
  architectureValid: boolean;
  gatewayEnabled: boolean;
  forceDirect: boolean;
}
