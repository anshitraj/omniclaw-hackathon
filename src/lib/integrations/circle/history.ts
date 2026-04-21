import type { WalletActor, WalletHistoryItem } from '@/types';
import { circleGet, getCircleActorConfig, getWalletBalancesForActor, isCircleConfiguredForActor } from './base-client';

const ARC_EXPLORER_URL = process.env.ARC_EXPLORER_URL || 'https://testnet.arcscan.app';

function pickTokenSymbol(raw: any, tokenMap: Record<string, string>): string {
  const byDirectSymbol =
    raw?.tokenSymbol ||
    raw?.token?.symbol ||
    raw?.assetSymbol ||
    raw?.tokenName;
  if (byDirectSymbol) return String(byDirectSymbol).toUpperCase();

  const tokenId = raw?.tokenId ? String(raw.tokenId) : '';
  if (tokenId && tokenMap[tokenId]) return tokenMap[tokenId];

  // Keep a stable fallback without exposing full token UUID.
  if (tokenId) return `TOKEN-${tokenId.slice(0, 6).toUpperCase()}`;
  return 'UNKNOWN';
}

function pickAmount(raw: any): string {
  const amount = raw?.amounts?.[0] || raw?.amount || raw?.value || raw?.tokenAmount;
  if (amount === undefined || amount === null) return '0';
  return String(amount);
}

function pickStatus(raw: any): string {
  return String(raw?.state || raw?.status || raw?.transactionState || 'UNKNOWN');
}

function pickTimestamp(raw: any): string {
  return (
    raw?.updateDate ||
    raw?.createDate ||
    raw?.createdAt ||
    raw?.timestamp ||
    new Date().toISOString()
  );
}

function pickTxHash(raw: any): string {
  return raw?.txHash || raw?.transactionHash || raw?.hash || raw?.id || 'unknown';
}

function resolveDirection(raw: any, walletAddress?: string): 'sent' | 'received' | 'unknown' {
  const transactionType = String(raw?.transactionType || '').toUpperCase();
  if (transactionType === 'OUTBOUND') return 'sent';
  if (transactionType === 'INBOUND') return 'received';

  const from = (raw?.sourceAddress || raw?.fromAddress || raw?.from || '').toLowerCase();
  const to = (raw?.destinationAddress || raw?.toAddress || raw?.to || '').toLowerCase();
  const addr = (walletAddress || '').toLowerCase();

  if (!addr) return 'unknown';
  if (from && from === addr) return 'sent';
  if (to && to === addr) return 'received';
  return 'unknown';
}

function toHistoryItems(
  rawItems: any[],
  tokenMap: Record<string, string>,
  walletAddress?: string,
  walletId?: string,
  limit = 20
): WalletHistoryItem[] {
  const addr = (walletAddress || '').toLowerCase();
  const id = (walletId || '').toLowerCase();

  const filtered = rawItems.filter((tx: any) => {
    const txWalletId = String(tx?.walletId || '').toLowerCase();
    const src = String(tx?.sourceAddress || '').toLowerCase();
    const dst = String(tx?.destinationAddress || '').toLowerCase();

    if (id && txWalletId && txWalletId === id) return true;
    if (addr && (src === addr || dst === addr)) return true;
    if (!id && !addr) return true;
    return false;
  });

  return filtered.slice(0, limit).map((tx: any) => {
    const txHash = pickTxHash(tx);
    return {
      id: String(tx?.id || txHash),
      txHash,
      token: pickTokenSymbol(tx, tokenMap),
      amount: pickAmount(tx),
      direction: resolveDirection(tx, walletAddress),
      status: pickStatus(tx),
      timestamp: pickTimestamp(tx),
      explorerUrl: txHash && !txHash.startsWith('pending:') ? `${ARC_EXPLORER_URL}/tx/${txHash}` : null,
    };
  });
}

async function fetchRawTransactions(actor: WalletActor, limit: number): Promise<any[]> {
  const cfg = getCircleActorConfig(actor);
  const paramsCandidates: string[] = [];

  if (cfg.walletId) {
    paramsCandidates.push(`/v1/w3s/transactions?walletIds=${encodeURIComponent(cfg.walletId)}&pageSize=${limit}`);
    paramsCandidates.push(`/v1/w3s/transactions?walletId=${encodeURIComponent(cfg.walletId)}&pageSize=${limit}`);
  }
  if (cfg.walletAddress) {
    paramsCandidates.push(`/v1/w3s/transactions?walletAddress=${encodeURIComponent(cfg.walletAddress)}&pageSize=${limit}`);
  }
  paramsCandidates.push(`/v1/w3s/transactions?pageSize=${limit}`);

  for (const path of paramsCandidates) {
    try {
      const json = await circleGet(actor, path);
      const items = json.data?.transactions || json.data?.items || json.transactions || [];
      if (Array.isArray(items)) {
        return items;
      }
    } catch {
      // Try next shape/end-point variant
    }
  }

  return [];
}

export async function getWalletHistoryForActor(actor: WalletActor, limit = 20): Promise<WalletHistoryItem[]> {
  if (!isCircleConfiguredForActor(actor)) return [];

  const cfg = getCircleActorConfig(actor);
  try {
    const transactions = await fetchRawTransactions(actor, limit);
    const balances = await getWalletBalancesForActor(actor, cfg.walletId);
    const tokenMap = Object.fromEntries(
      balances
        .filter((b) => b?.token?.id && b?.token?.symbol)
        .map((b) => [String(b.token.id), String(b.token.symbol).toUpperCase()])
    );
    return toHistoryItems(transactions, tokenMap, cfg.walletAddress, cfg.walletId, limit);
  } catch {
    return [];
  }
}
