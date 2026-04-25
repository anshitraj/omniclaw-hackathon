import { NextResponse } from 'next/server';
import {
  getBalanceDetail,
  getOmniClawMode,
  isOmniClawConfigured,
  isOmniClawServerAuthEnabled,
  isOmniClawServerConfigured,
} from '@/lib/integrations/omniclaw/client';
import { getActiveProvider, isAnyProviderConfigured } from '@/lib/ai';
import type { IntegrationHealth } from '@/types';

function getOmniClawDetails(): string {
  const mode = getOmniClawMode();
  if (mode === 'server') {
    return 'Server mode active (authenticated)';
  }
  return 'Not configured - set OMNICLAW_API_TOKEN (URL defaults to localhost)';
}

function getOmniClawState(): 'configured' | 'partially_configured' | 'mock_mode' {
  if (isOmniClawConfigured()) return 'configured';
  if (isOmniClawServerConfigured() || isOmniClawServerAuthEnabled()) return 'partially_configured';
  return 'mock_mode';
}

export async function GET() {
  const omniclawConfigured = isOmniClawConfigured();
  const balanceDetail = omniclawConfigured ? await getBalanceDetail().catch(() => null) : null;

  const warnings = [...(balanceDetail?.warnings || [])];
  if (!isOmniClawConfigured()) {
    warnings.push(
      'OmniClaw execution is not ready. Configure OMNICLAW_API_TOKEN and ensure local server is running.'
    );
  }

  const health: IntegrationHealth = {
    omniclaw: {
      name: 'OmniClaw',
      state: getOmniClawState(),
      sdkMode: false,
      serverMode: isOmniClawServerConfigured(),
      serverAuth: isOmniClawServerConfigured()
        ? isOmniClawServerAuthEnabled()
          ? 'enabled'
          : 'disabled'
        : 'not_applicable',
      lastChecked: new Date().toISOString(),
      details: getOmniClawDetails(),
    },
    ai: {
      name: 'AI Provider',
      state: isAnyProviderConfigured() ? 'configured' : 'mock_mode',
      lastChecked: new Date().toISOString(),
      details: isAnyProviderConfigured()
        ? `Active provider: ${getActiveProvider()}`
        : 'Not configured - set FEATHERLESS_API_KEY',
    },
    buyerWalletAddress: balanceDetail?.address || null,
    omniclawConfigured,
    warnings,
  };

  return NextResponse.json({
    success: true,
    data: health,
    timestamp: new Date().toISOString(),
  });
}
