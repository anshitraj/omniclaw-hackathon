import { NextResponse } from 'next/server';
import {
  getBalanceDetail,
  getPolicyBudgetCap,
  isOmniClawConfigured,
} from '@/lib/integrations/omniclaw/client';

export async function GET() {
  if (!isOmniClawConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error:
          'OmniClaw integration not configured. Set OMNICLAW_API_TOKEN and ensure server is running.',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  try {
    const [detail, budgetCap] = await Promise.all([getBalanceDetail(), getPolicyBudgetCap()]);

    return NextResponse.json({
      success: true,
      data: {
        actor: 'buyer',
        address: detail.address,
        walletId: detail.walletId,
        usdcBalance: detail.gatewayBalance,
        gatewayBalance: detail.gatewayBalance,
        gatewayOnchainBalance: detail.gatewayOnchainBalance,
        blockchain: 'OmniClaw',
        status: detail.status,
        recentTxCount: 0,
        configured: true,
        connected: true,
        budgetCap,
        lastUpdated: detail.lastUpdated,
        warnings: detail.warnings,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}
