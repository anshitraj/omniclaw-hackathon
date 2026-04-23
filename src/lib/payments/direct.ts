import crypto from 'crypto';
import { CIRCLE_BASE_URL, authHeaders, createTransferFromBuyerToSeller } from '@/lib/integrations/circle/client';
import type { PaymentExecutionInput, PaymentExecutionResult } from './types';

const ARC_TESTNET_USDC = '0x3600000000000000000000000000000000000000';

function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

async function pollTransaction(txId: string): Promise<{ txHash: string; blockNumber: string; gasUsed: string }> {
  const terminalStates = new Set(['COMPLETE', 'CONFIRMED', 'FAILED', 'DENIED', 'CANCELLED']);

  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 3000));

    const statusRes = await fetch(`${CIRCLE_BASE_URL}/v1/w3s/transactions/${txId}`, {
      headers: authHeaders(),
      cache: 'no-store',
    });

    if (!statusRes.ok) continue;

    const statusJson = await statusRes.json();
    const tx = statusJson.data?.transaction;
    const state = tx?.state;

    if (state === 'COMPLETE' || state === 'CONFIRMED') {
      return {
        txHash: tx.txHash || txId,
        blockNumber: tx.blockHeight?.toString() || tx.blockNumber?.toString() || 'confirmed',
        gasUsed: tx.networkFee?.toString() || '21000',
      };
    }

    if (state === 'FAILED' || state === 'DENIED' || state === 'CANCELLED') {
      throw new Error(`Transaction ${state}: ${tx.errorReason || tx.failedReason || 'unknown'}`);
    }

    if (terminalStates.has(state)) break;
  }

  return {
    txHash: `pending:${txId}`,
    blockNumber: 'pending',
    gasUsed: '21000',
  };
}

export async function executeDirectSettlement(input: PaymentExecutionInput): Promise<PaymentExecutionResult> {
  const transferJson = await createTransferFromBuyerToSeller({
    amount: input.amount,
    tokenAddress: ARC_TESTNET_USDC,
    idempotencyKey: generateIdempotencyKey(),
  });

  const txId: string = transferJson.data?.id;
  if (!txId) {
    throw new Error('No transaction ID returned from Circle');
  }

  const { txHash, blockNumber, gasUsed } = await pollTransaction(txId);
  const isPending = txHash.startsWith('pending:');

  return {
    rail: 'direct',
    txHash,
    blockNumber,
    gasUsed,
    isPending,
    legacyDirectTransfer: true,
    buyerFundingSource: 'Circle W3S Direct Wallet Transfer (Legacy)',
    sellerSettlementDestination: 'Seller Wallet Direct Receive (Legacy)',
    gatewayBalanceSource: 'API',
    sellerSettlementMode: 'Legacy Direct Mode',
  };
}
