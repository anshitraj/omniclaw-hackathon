import { NextResponse } from 'next/server';
import { SERVICE_CATALOG, generatePolicyResult } from '@/lib/seed/data';
import { executePayment, inspectService } from '@/lib/integrations/omniclaw/client';
import type { DemoEvent, TransactionState } from '@/types';

const DEFAULT_PAY_MAX_ATTEMPTS = 4;
const DEFAULT_PAY_RETRY_DELAYS_MS = [1200, 2200, 3500];

function event(
  state: TransactionState,
  source: DemoEvent['source'],
  title: string,
  description: string,
  metadata?: Record<string, string>
): DemoEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    source,
    title,
    description,
    state,
    metadata,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isWalletInitializingError(error: unknown): boolean {
  const message = String(error).toLowerCase();
  return message.includes('(425)') && message.includes('wallet is currently initializing');
}

function parsePositiveInt(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) {
    return undefined;
  }
  return n;
}

function getPayRetryConfig() {
  const maxAttempts =
    parsePositiveInt(process.env.OMNICLAW_PAY_RETRY_MAX_ATTEMPTS) ?? DEFAULT_PAY_MAX_ATTEMPTS;
  const parsedDelays = (process.env.OMNICLAW_PAY_RETRY_DELAYS_MS || '')
    .split(',')
    .map((v) => parsePositiveInt(v.trim()))
    .filter((v): v is number => typeof v === 'number');

  const delays = parsedDelays.length > 0 ? parsedDelays : DEFAULT_PAY_RETRY_DELAYS_MS;

  return { maxAttempts, delays };
}

export async function POST(req: Request) {
  const body = await req.json();
  const service = SERVICE_CATALOG.find((s) => s.id === body.serviceId);

  if (!service) {
    return NextResponse.json(
      {
        success: false,
        error: 'Service not found',
        stage: 'policy_checking',
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    );
  }

  const events: DemoEvent[] = [];
  const policyResult = generatePolicyResult(service);
  const idempotencyKey = body.idempotencyKey || `oc_${Date.now()}`;
  const { maxAttempts: payMaxAttempts, delays: payRetryDelaysMs } = getPayRetryConfig();

  try {
    events.push(
      event(
        'policy_checking',
        'policy',
        'Policy Engine Check',
        'OmniClaw policy rules evaluated for recipient, amount, and method.',
        { policyId: policyResult.policyId, endpoint: service.endpoint }
      )
    );

    const inspect = await inspectService(service);
    if (!inspect.valid) {
      throw new Error(inspect.reason || 'Inspect failed: service is not payable');
    }

    events.push(
      event(
        'wallet_ready',
        'wallet',
        'Wallet Readiness Check',
        'Signer and gateway readiness verified.',
        {
          buyerReady: String(inspect.buyerReady),
          estimatedCost: inspect.estimatedCost.toString(),
        }
      )
    );

    if (!inspect.buyerReady) {
      throw new Error(inspect.reason || 'Buyer is not ready to pay');
    }

    events.push(
      event(
        'paying',
        'buyer',
        'Payment Execution Started',
        'OmniClaw pay request submitted to the paid API endpoint.',
        { idempotencyKey }
      )
    );

    let receipt;
    let payAttempt = 1;
    while (true) {
      try {
        receipt = await executePayment(
          service,
          policyResult,
          idempotencyKey,
          inspect.estimatedCost
        );
        break;
      } catch (error) {
        const shouldRetry = isWalletInitializingError(error) && payAttempt < payMaxAttempts;
        if (!shouldRetry) {
          throw error;
        }

        const delayMs =
          payRetryDelaysMs[payAttempt - 1] ?? payRetryDelaysMs[payRetryDelaysMs.length - 1];
        events.push(
          event(
            'paying',
            'buyer',
            'Wallet Initializing, Retrying',
            `OmniClaw wallet is initializing. Retrying payment shortly (attempt ${payAttempt + 1}/${payMaxAttempts}).`,
            { retryInMs: String(delayMs) }
          )
        );
        await sleep(delayMs);
        payAttempt += 1;
      }
    }

    events.push(
      event(
        'settling',
        'settlement',
        'Settlement In Progress',
        'Payment accepted and settlement metadata captured.',
        {
          txHash: receipt.txHash,
          route: receipt.route,
        }
      )
    );

    events.push(
      event('confirmed', 'settlement', 'Settlement Confirmed', 'Settlement confirmation received.', {
        txHash: receipt.txHash,
        status: receipt.status,
      })
    );

    events.push(
      event(
        'fulfilled',
        'system',
        'Fulfillment Unlocked',
        `"${service.title}" completed after payment confirmation.`,
        { serviceId: service.id }
      )
    );

    return NextResponse.json({
      success: true,
      data: {
        receipt,
        policyResult,
        events,
        finalState: 'fulfilled',
        mode: 'omniclaw',
        activePaymentRail: 'gateway',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        stage: events.at(-1)?.state || 'policy_checking',
        data: { events },
        timestamp: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}
