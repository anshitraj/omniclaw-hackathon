import { executeDirectSettlement } from './direct';
import type { PaymentExecutionInput, PaymentExecutionResult } from './types';

// Gateway rail abstraction. Until Circle Gateway API is fully integrated,
// this uses direct transfer execution under the hood while exposing
// Gateway semantics at the product surface.
export async function executeGatewaySettlement(input: PaymentExecutionInput): Promise<PaymentExecutionResult> {
  const result = await executeDirectSettlement(input);

  return {
    ...result,
    rail: 'gateway',
    // Under-the-hood is still direct transfer today, so keep this explicit.
    legacyDirectTransfer: true,
    buyerFundingSource: 'Circle Gateway Nanopayment Balance',
    sellerSettlementDestination: 'Gateway Batch Settlement Route',
    gatewayBalanceSource: 'API',
    sellerSettlementMode: 'Gateway Batch Settlement',
  };
}
