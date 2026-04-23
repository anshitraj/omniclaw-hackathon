export type PaymentRailMode = 'gateway' | 'direct';

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
  legacyDirectTransfer: boolean;
  buyerFundingSource: string;
  sellerSettlementDestination: string;
  gatewayBalanceSource: 'API' | 'On-chain Fallback';
  sellerSettlementMode: 'Gateway Batch Settlement' | 'Legacy Direct Mode';
}

export interface PaymentRuntimeContext {
  liveMode: boolean;
  architectureValid: boolean;
  gatewayEnabled: boolean;
  forceDirect: boolean;
}
