import { NextResponse } from 'next/server';
import {
  isOmniClawConfigured,
  isOmniClawSdkConfigured,
  isOmniClawServerConfigured,
  isOmniClawServerAuthEnabled,
  getOmniClawMode,
} from '@/lib/integrations/omniclaw/client';
import { isArcConfigured } from '@/lib/integrations/arc/explorer';
import { isAnyProviderConfigured, getActiveProvider } from '@/lib/ai';
import { getCombinedWalletOverview } from '@/lib/integrations/circle/client';
import { isCircleConfigured, isEntitySecretConfigured } from '@/lib/integrations/circle/client';
import { getActivePaymentRail, resolvePaymentRuntimeContext } from '@/lib/payments/router';
import type { IntegrationHealth } from '@/types';

function getOmniClawDetails(): string {
  const mode = getOmniClawMode();
  switch (mode) {
    case 'both':
      return 'SDK mode + Server mode active';
    case 'sdk':
      return 'SDK mode active (Circle-backed). No remote server.';
    case 'server':
      return `Server mode active${isOmniClawServerAuthEnabled() ? ' (authenticated)' : ' (no auth)'}`;
    case 'none':
    default:
      return 'Not configured - set Circle API key for SDK mode or OMNICLAW_API_URL for server mode';
  }
}

function getOmniClawState(): 'configured' | 'partially_configured' | 'mock_mode' {
  if (isOmniClawSdkConfigured() && isOmniClawServerConfigured()) return 'configured';
  if (isOmniClawConfigured()) return 'configured';
  return 'mock_mode';
}

export async function GET() {
  const overview = await getCombinedWalletOverview();

  const eurcSupported = overview.buyer.balances.EURC?.amount > 0 || overview.seller.balances.EURC?.amount > 0;
  const directTransferConfigured = isCircleConfigured() && isEntitySecretConfigured();
  const gatewayConfigured = directTransferConfigured && overview.architecture.liveArchitectureValid;
  const runtime = resolvePaymentRuntimeContext({
    liveMode: directTransferConfigured && overview.architecture.buyerConfigured && overview.architecture.sellerConfigured,
    architectureValid: overview.architecture.liveArchitectureValid,
  });
  const activePaymentRail = getActivePaymentRail(runtime);
  const warnings = [...overview.architecture.warnings];
  if (activePaymentRail === 'direct') {
    warnings.push('Legacy direct transfer mode is active. Gateway rail should be the primary production path.');
  }

  const health: IntegrationHealth = {
    omniclaw: {
      name: 'OmniClaw',
      state: getOmniClawState(),
      sdkMode: isOmniClawSdkConfigured(),
      serverMode: isOmniClawServerConfigured(),
      serverAuth: isOmniClawServerConfigured()
        ? (isOmniClawServerAuthEnabled() ? 'enabled' : 'disabled')
        : 'not_applicable',
      lastChecked: new Date().toISOString(),
      details: getOmniClawDetails(),
    },
    circle: {
      name: 'Circle Wallets',
      state: overview.buyer.connected || overview.seller.connected ? 'configured' : 'mock_mode',
      lastChecked: new Date().toISOString(),
      details: overview.architecture.liveArchitectureValid
        ? 'Buyer and seller wallets are distinct and live-ready.'
        : 'Legacy or invalid live architecture detected. Configure distinct buyer/seller wallets.',
    },
    arc: {
      name: 'Arc Testnet',
      state: isArcConfigured() ? 'configured' : 'mock_mode',
      lastChecked: new Date().toISOString(),
      details: isArcConfigured()
        ? 'Connected to Arc Testnet RPC'
        : 'Not configured - set ARC_RPC_URL',
    },
    ai: {
      name: 'AI Provider',
      state: isAnyProviderConfigured() ? 'configured' : 'mock_mode',
      lastChecked: new Date().toISOString(),
      details: isAnyProviderConfigured()
        ? `Active provider: ${getActiveProvider()}`
        : 'Not configured - set GEMINI_API_KEY, FEATHERLESS_API_KEY, or AIMLAPI_API_KEY',
    },
    buyerConfigured: overview.architecture.buyerConfigured,
    sellerConfigured: overview.architecture.sellerConfigured,
    buyerWalletAddress: overview.architecture.buyerWalletAddress,
    sellerWalletAddress: overview.architecture.sellerWalletAddress,
    buyerSellerDistinct: overview.architecture.buyerSellerDistinct,
    liveArchitectureValid: overview.architecture.liveArchitectureValid,
    buyerBalancesAvailable: overview.buyer.connected,
    sellerBalancesAvailable: overview.seller.connected,
    buyerHistoryAvailable: overview.buyer.connected,
    sellerHistoryAvailable: overview.seller.connected,
    eurcSupported,
    gatewayConfigured,
    directTransferConfigured,
    activePaymentRail,
    warnings,
  };

  return NextResponse.json({
    success: true,
    data: health,
    timestamp: new Date().toISOString(),
  });
}
