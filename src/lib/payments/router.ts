import { executeDirectSettlement } from './direct';
import { executeGatewaySettlement } from './gateway';
import type { PaymentExecutionInput, PaymentExecutionResult, PaymentRailMode, PaymentRuntimeContext } from './types';

export function getActivePaymentRail(context: PaymentRuntimeContext): PaymentRailMode {
  if (!context.liveMode || !context.architectureValid) return 'demo';
  if (!context.forceDirect && context.gatewayEnabled) return 'gateway';
  return 'direct';
}

export async function executePaymentByRail(
  input: PaymentExecutionInput,
  context: PaymentRuntimeContext
): Promise<PaymentExecutionResult> {
  const rail = getActivePaymentRail(context);

  if (rail === 'gateway') {
    return executeGatewaySettlement(input);
  }

  if (rail === 'direct') {
    return executeDirectSettlement(input);
  }

  return {
    rail: 'demo',
    txHash: `demo:${Date.now()}`,
    blockNumber: 'simulated',
    gasUsed: '21000',
    isPending: false,
    isDemo: true,
    legacyDirectTransfer: false,
    buyerFundingSource: 'Demo Gateway Balance',
    sellerSettlementDestination: 'Demo Seller Gateway Balance',
  };
}

export function resolvePaymentRuntimeContext(params: {
  liveMode: boolean;
  architectureValid: boolean;
}): PaymentRuntimeContext {
  const gatewayEnabled = process.env.CIRCLE_GATEWAY_ENABLED !== 'false';
  const forceDirect = process.env.OMNICLAW_FORCE_DIRECT_RAIL === 'true';

  return {
    liveMode: params.liveMode,
    architectureValid: params.architectureValid,
    gatewayEnabled,
    forceDirect,
  };
}
