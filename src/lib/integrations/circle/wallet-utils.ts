import type { WalletActor, WalletBalance, WalletSummary } from '@/types';
import {
  getCircleActorConfig,
  getWalletBalancesForActor,
  getWalletByIdForActor,
  isCircleConfiguredForActor,
  type CircleBalanceInfo,
} from './base-client';
import { getWalletHistoryForActor } from './history';
import { getOnChainGatewayUsdcBalance } from '@/lib/integrations/arc/balances';

const KNOWN_BALANCE_SYMBOLS = ['USDC'];

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
    apiUsdcBalance: 0,
    onChainUsdcBalance: 0,
    usdcBalance: 0,
    gatewayBalanceSource: 'Unavailable',
    gatewayBalanceSyncStatus: 'unavailable',
    recentTxCount: 0,
    lastUpdated: now,
    warnings: [],
  };

  if (!isCircleConfiguredForActor(actor)) {
    return {
      ...base,
      status: 'mock_mode',
      gatewayBalanceSource: 'Unavailable',
      warnings: ['Circle API key is not configured for this actor.'],
    };
  }

  try {
    const wallet = await getWalletByIdForActor(actor);
    const walletId = wallet?.id || cfg.walletId || null;
    const address = wallet?.address || cfg.walletAddress || null;

    const balancesRaw = walletId ? await getWalletBalancesForActor(actor, walletId) : [];
    const balances = mapBalancesBySymbol(balancesRaw);
    const apiUsdcBalance = balances.USDC?.amount || 0;
    const onChainUsdcBalance = address ? await getOnChainGatewayUsdcBalance(address).catch(() => null) : null;
    const hasOnChain = typeof onChainUsdcBalance === 'number';
    const balancesMatch = hasOnChain ? Math.abs(apiUsdcBalance - onChainUsdcBalance) < 0.000001 : true;
    const gatewayBalanceSource: WalletSummary['gatewayBalanceSource'] = hasOnChain
      ? balancesMatch
        ? 'API'
        : 'On-chain Fallback'
      : 'API';
    const gatewayBalanceSyncStatus: WalletSummary['gatewayBalanceSyncStatus'] = hasOnChain
      ? balancesMatch
        ? 'in_sync'
        : 'api_lagging'
      : 'unavailable';
    const history = await getWalletHistoryForActor(actor, 20);
    const warnings = gatewayBalanceSyncStatus === 'api_lagging'
      ? ['Circle Gateway API balance differs from on-chain Gateway balance. Using on-chain fallback.']
      : [];

    return {
      ...base,
      connected: true,
      walletId,
      address,
      addressShort: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
      blockchain: wallet?.blockchain || cfg.blockchain,
      status: wallet?.state || 'connected',
      balances,
      apiUsdcBalance,
      onChainUsdcBalance: onChainUsdcBalance ?? apiUsdcBalance,
      usdcBalance: gatewayBalanceSource === 'On-chain Fallback' && hasOnChain ? onChainUsdcBalance : apiUsdcBalance,
      gatewayBalanceSource,
      gatewayBalanceSyncStatus,
      recentTxCount: history.length,
      lastUpdated: new Date().toISOString(),
      warnings,
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
