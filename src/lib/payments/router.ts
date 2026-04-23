import { executeDirectSettlement } from './direct';
import { executeGatewaySettlement } from './gateway';
import type {
  PaymentExecutionInput,
  PaymentExecutionResult,
  PaymentRailMode,
  PaymentRuntimeContext,
} from './types';

export function getActivePaymentRail(context: PaymentRuntimeContext): PaymentRailMode {
  if (!context.forceDirect && context.gatewayEnabled) return 'gateway';
  return 'direct';
}

export async function executePaymentByRail(
  input: PaymentExecutionInput,
  context: PaymentRuntimeContext
): Promise<PaymentExecutionResult> {
  if (!context.liveMode || !context.architectureValid) {
    throw new Error('Live payment execution is unavailable.');
  }

  const rail = getActivePaymentRail(context);

  if (rail === 'gateway') {
    return executeGatewaySettlement(input);
  }

  return executeDirectSettlement(input);
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
