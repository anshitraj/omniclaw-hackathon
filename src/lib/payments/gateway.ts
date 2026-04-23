import { executeDirectSettlement } from './direct';
import type { PaymentExecutionInput, PaymentExecutionResult } from './types';

// Nanopayment rail abstraction.
//
// The full OmniClaw backend can execute Circle Nanopayments/x402 directly.
// This standalone hackathon console may also run with only Circle W3S
// credentials. In that local fallback mode we execute an Arc USDC transfer
// and keep the metadata explicit so the UI never disguises a fallback as a
// managed Gateway batch settlement.
export async function executeGatewaySettlement(input: PaymentExecutionInput): Promise<PaymentExecutionResult> {
  const result = await executeDirectSettlement(input);

  return {
    ...result,
    rail: 'gateway',
    // Under-the-hood is still direct transfer in standalone mode.
    legacyDirectTransfer: true,
    buyerFundingSource: 'Circle W3S wallet on Arc',
    sellerSettlementDestination: 'Seller wallet on Arc',
    gatewayBalanceSource: 'API',
    sellerSettlementMode: 'Arc USDC Transfer Fallback',
  };
}
