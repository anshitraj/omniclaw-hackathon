import type { WalletActor, WalletBalance, WalletSummary } from '@/types';
import {
  getCircleActorConfig,
  getWalletBalancesForActor,
  getWalletByIdForActor,
  isCircleConfiguredForActor,
  type CircleBalanceInfo,
} from './base-client';
import { getWalletHistoryForActor } from './history';

const KNOWN_BALANCE_SYMBOLS = ['USDC', 'EURC'];

function normalizeAmount(amount: string): number {
  const parsed = Number.parseFloat(amount);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapBalancesBySymbol(rawBalances: CircleBalanceInfo[]): Record<string, WalletBalance> {
  const mapped: Record<string, WalletBalance> = {};

  for (const balance of rawBalances) {
    const symbol = balance.token.symbol?.toUpperCase?.() || balance.token.name || 'UNKNOWN';
    mapped[symbol] = {
      symbol,
      amount: normalizeAmount(balance.amount),
      rawAmount: balance.amount,
      decimals: balance.token.decimals,
    };
  }

  for (const symbol of KNOWN_BALANCE_SYMBOLS) {
    if (!mapped[symbol]) {
      mapped[symbol] = {
        symbol,
        amount: 0,
        rawAmount: '0',
      };
    }
  }

  return mapped;
}

export async function getWalletSummaryForActor(actor: WalletActor): Promise<WalletSummary> {
  const cfg = getCircleActorConfig(actor);
  const now = new Date().toISOString();

  const base: WalletSummary = {
    actor,
    configured: Boolean(cfg.apiKey && cfg.walletId && cfg.walletAddress),
    connected: false,
    legacyMode: cfg.legacyMode,
    walletId: cfg.walletId || null,
    address: cfg.walletAddress || null,
    addressShort: cfg.walletAddress ? `${cfg.walletAddress.slice(0, 6)}...${cfg.walletAddress.slice(-4)}` : null,
    blockchain: cfg.blockchain,
    status: 'unavailable',
    balances: mapBalancesBySymbol([]),
    usdcBalance: 0,
    eurcBalance: 0,
    recentTxCount: 0,
    lastUpdated: now,
    warnings: [],
  };

  if (!isCircleConfiguredForActor(actor)) {
    return {
      ...base,
      status: 'mock_mode',
      warnings: ['Circle API key is not configured for this actor.'],
    };
  }

  try {
    const wallet = await getWalletByIdForActor(actor);
    const walletId = wallet?.id || cfg.walletId || null;
    const address = wallet?.address || cfg.walletAddress || null;

    const balancesRaw = walletId ? await getWalletBalancesForActor(actor, walletId) : [];
    const balances = mapBalancesBySymbol(balancesRaw);
    const history = await getWalletHistoryForActor(actor, 20);

    return {
      ...base,
      connected: true,
      walletId,
      address,
      addressShort: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
      blockchain: wallet?.blockchain || cfg.blockchain,
      status: wallet?.state || 'connected',
      balances,
      usdcBalance: balances.USDC?.amount || 0,
      eurcBalance: balances.EURC?.amount || 0,
      recentTxCount: history.length,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ...base,
      status: 'error',
      warnings: [`Failed to fetch wallet summary: ${String(error)}`],
      lastUpdated: new Date().toISOString(),
    };
  }
}
